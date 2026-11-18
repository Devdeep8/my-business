import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import { emitEvent } from '@src/events/event.bus.js';
import { EVENTS } from '@src/events/event.types.js';
import db from '@src/db/models/index.js';

const { FieldDefinition } = db;

const CATEGORY_ATTRIBUTES = [
  'id',
  'name_en',
  'name_hi',
  'slug',
  'parentId',
  'displayOrder',
  'isActive',
  'isLeaf'
];

const auditActor = (context) => ({
  actorId: context?.adminId ?? null,
  actorType: context?.admin ? 'admin_user' : null,
  actorEmail: context?.admin?.email ?? null
});

export class ListCategoriesHandler extends BaseHandler {
  async run() {
    const { Category } = this.context.models;
    const items = await Category.findAll({
      attributes: CATEGORY_ATTRIBUTES,
      order: [['displayOrder', 'ASC'], ['name_en', 'ASC']],
      transaction: this.dbTransaction
    });

    return { items };
  }
}

export class CreateCategoryHandler extends BaseHandler {
  static sanitizeArgs(args) {
    return {
      name_en: args.name_en,
      name_hi: args.name_hi,
      slug: args.slug,
      parentId: args.parentId,
      displayOrder: args.displayOrder,
      isActive: args.isActive,
      isLeaf: args.isLeaf
    };
  }

  async run() {
    const { Category } = this.context.models;
    const name_en = String(this.args.name_en ?? '').trim();
    const name_hi = String(this.args.name_hi ?? '').trim();
    const slug = String(this.args.slug ?? '').trim();
    const parentId = this.args.parentId || null;
    let parent = null;

    if (!name_en || !name_hi || !slug) {
      throw AppError.validation('English name, Hindi name, and slug are required');
    }

    if (parentId) {
      parent = await Category.findByPk(parentId, { transaction: this.dbTransaction });
      if (!parent) {
        throw AppError.validation('Selected parent category does not exist');
      }
    }

    const existing = await Category.findOne({
      where: { slug },
      transaction: this.dbTransaction
    });
    if (existing) {
      throw AppError.conflict('A category with this slug already exists', {
        meta: { slug }
      });
    }

    let category;
    let parentBeforeUpdate = null;
    try {
      if (parent?.isLeaf) {
        parentBeforeUpdate = parent.toJSON();
        await parent.update({ isLeaf: false }, { transaction: this.dbTransaction });
      }

      category = await Category.create({
        name_en,
        name_hi,
        slug,
        parentId,
        displayOrder: this.args.displayOrder,
        isActive: this.args.isActive,
        isLeaf: parentId ? true : this.args.isLeaf
      }, { transaction: this.dbTransaction });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw AppError.conflict('A category with this slug already exists', {
          meta: { slug }
        });
      }
      throw error;
    }

    if (parentBeforeUpdate) {
      emitEvent(EVENTS.ENTITY_UPDATED, {
        ...auditActor(this.context),
        entity: 'category',
        entityId: parent.id,
        before: parentBeforeUpdate,
        after: parent.toJSON()
      }, this.context);
    }

    emitEvent(EVENTS.ENTITY_CREATED, {
      ...auditActor(this.context),
      entity: 'category',
      entityId: category.id,
      after: category.toJSON()
    }, this.context);

    return category;
  }
}

const serializeField = (field) => ({
  id: field.id,
  categoryId: field.categoryId,
  key: field.key,
  labelEn: field.label_en,
  labelHi: field.label_hi,
  type: field.type,
  options: field.options?.options || null,
  validation: field.validation || { required: false },
  helpTextEn: field.help_text_en,
  helpTextHi: field.help_text_hi,
  displayOrder: field.display_order,
  showOnProfile: field.show_on_profile,
  visibleIf: field.visible_if,
  isActive: field.is_active
});

export class ListCategoryFieldsHandler extends BaseHandler {
  async run() {
    const fields = await FieldDefinition.findAll({
      where: { categoryId: this.args.categoryId },
      order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']],
      transaction: this.dbTransaction
    });
    return { items: fields.map(serializeField) };
  }
}

export class CreateCategoryFieldHandler extends BaseHandler {
  async run() {
    const { categoryId } = this.args;
    const category = await db.Category.findByPk(categoryId, { transaction: this.dbTransaction });
    if (!category) throw AppError.validation('Category does not exist');

    const key = String(this.args.key ?? '').trim();
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      throw AppError.validation('Field key must start with a letter and use only lowercase letters, numbers, and underscores');
    }

    try {
      const field = await FieldDefinition.create({
        categoryId,
        key,
        label_en: this.args.labelEn,
        label_hi: this.args.labelHi,
        type: this.args.type,
        options: this.args.options?.length ? { options: this.args.options } : null,
        validation: this.args.validation || { required: false },
        help_text_en: this.args.helpTextEn || null,
        help_text_hi: this.args.helpTextHi || null,
        display_order: this.args.displayOrder ?? 0,
        show_on_profile: this.args.showOnProfile !== false,
        visible_if: this.args.visibleIf || null,
        is_active: this.args.isActive !== false
      }, { transaction: this.dbTransaction });
      return serializeField(field);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw AppError.conflict('A field with this key already exists in the category');
      }
      throw error;
    }
  }
}

export class UpdateCategoryFieldHandler extends BaseHandler {
  async run() {
    const field = await FieldDefinition.findByPk(this.args.id, { transaction: this.dbTransaction });
    if (!field) throw AppError.notFound('Field not found');

    await field.update({
      ...(this.args.labelEn !== undefined && { label_en: this.args.labelEn }),
      ...(this.args.labelHi !== undefined && { label_hi: this.args.labelHi }),
      ...(this.args.type !== undefined && { type: this.args.type }),
      ...(this.args.options !== undefined && { options: this.args.options?.length ? { options: this.args.options } : null }),
      ...(this.args.validation !== undefined && { validation: this.args.validation }),
      ...(this.args.helpTextEn !== undefined && { help_text_en: this.args.helpTextEn || null }),
      ...(this.args.helpTextHi !== undefined && { help_text_hi: this.args.helpTextHi || null }),
      ...(this.args.displayOrder !== undefined && { display_order: this.args.displayOrder }),
      ...(this.args.showOnProfile !== undefined && { show_on_profile: this.args.showOnProfile }),
      ...(this.args.visibleIf !== undefined && { visible_if: this.args.visibleIf || null }),
      ...(this.args.isActive !== undefined && { is_active: this.args.isActive })
    }, { transaction: this.dbTransaction });

    return serializeField(field);
  }
}

export class DeleteCategoryFieldHandler extends BaseHandler {
  async run() {
    const field = await FieldDefinition.findByPk(this.args.id, { transaction: this.dbTransaction });
    if (!field) throw AppError.notFound('Field not found');
    await field.destroy({ transaction: this.dbTransaction });
    return { id: this.args.id };
  }
}
