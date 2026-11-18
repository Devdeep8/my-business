import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import { emitEvent } from '@src/events/event.bus.js';
import { EVENTS } from '@src/events/event.types.js';

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
      parentId: args.parentId
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
