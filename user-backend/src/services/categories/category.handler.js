// src/services/categories/category.handler.js
import db from '@src/db/models/index.js';
import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';

const { Category, FieldDefinition, Sequelize } = db;

// Collect the category's ancestor chain from root to the category itself.
// Guarded against cycles; a corrupt tree surfaces as INVALID_INPUT.
const ancestorChain = async (categoryId, traceId, transaction) => {
  const chain = [];
  const seen = new Set();
  let currentId = categoryId;

  while (currentId) {
    if (seen.has(currentId)) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId,
        message: 'Category tree contains a cycle'
      });
    }
    seen.add(currentId);

    const category = await Category.findByPk(currentId, {
      attributes: ['id', 'name_en', 'name_hi', 'slug', 'parentId', 'isLeaf'],
      transaction
    });
    if (!category) break;
    chain.unshift(category);
    currentId = category.parentId;
  }
  return chain;
};

export class ListCategoriesHandler extends BaseHandler {
  /**
   * Active category tree for the onboarding picker. `leavesOnly=true`
   * returns the flat list of pickable leaf categories instead.
   */
  async run () {
    const { leavesOnly } = this.args;

    const where = { isActive: true };
    if (leavesOnly) {
      where.isLeaf = true;
    }

    const categories = await Category.findAll({
      where,
      attributes: ['id', 'name_en', 'name_hi', 'slug', 'parentId', 'displayOrder', 'isLeaf'],
      order: [['displayOrder', 'ASC'], ['name_en', 'ASC']],
      transaction: this.dbTransaction
    });

    if (leavesOnly) {
      return { items: categories };
    }

    // Nest children under parents (two levels is enough for the MVP picker)
    const byId = new Map(categories.map((c) => [c.id, { ...c.toJSON(), children: [] }]));
    const roots = [];
    for (const node of byId.values()) {
      const parent = node.parentId && byId.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    return { items: roots };
  }
}

export class GetCategoryFormHandler extends BaseHandler {
  /**
   * The category's resolved onboarding form: universal fields (null
   * category_id) + fields inherited down the ancestor chain, nearest
   * definition winning on key conflicts (child overrides parent). Everything
   * the frontend needs to render — no field is hardcoded client-side.
   */
  async run () {
    const { id } = this.args;

    const category = await Category.findByPk(id, {
      attributes: ['id', 'name_en', 'name_hi', 'slug', 'parentId', 'isLeaf', 'isActive'],
      transaction: this.dbTransaction
    });
    if (!category || !category.isActive) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Category not found' });
    }

    const chain = await ancestorChain(id, this.traceId, this.dbTransaction);
    const categoryIds = chain.map((c) => c.id);

    // Universal fields plus every definition along the chain
    const definitions = await FieldDefinition.findAll({
      where: {
        isActive: true,
        [Sequelize.Op.or]: [
          { category_id: null },
          { category_id: categoryIds }
        ]
      },
      order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']],
      transaction: this.dbTransaction
    });

    // Resolve key conflicts: the definition closest to the leaf category wins
    // (the category itself, then its parent, ... then universal).
    const rank = (categoryId) => (categoryId === null ? -1 : categoryIds.indexOf(categoryId));
    const resolved = new Map();
    for (const definition of definitions) {
      const existing = resolved.get(definition.key);
      if (existing && rank(existing.category_id) >= rank(definition.category_id)) continue;
      resolved.set(definition.key, definition);
    }

    const fields = [...resolved.values()]
      .map((definition) => ({
        key: definition.key,
        label: { en: definition.label_en, hi: definition.label_hi },
        help_text: { en: definition.help_text_en, hi: definition.help_text_hi },
        type: definition.type,
        options: definition.options?.options || null,
        validation: definition.validation || { required: false },
        show_on_profile: definition.show_on_profile,
        visible_if: definition.visible_if || null,
        inherited: definition.category_id !== id // from a parent or universal
      }));

    return {
      category: {
        id: category.id,
        name: { en: category.name_en, hi: category.name_hi },
        slug: category.slug
      },
      fields
    };
  }
}
