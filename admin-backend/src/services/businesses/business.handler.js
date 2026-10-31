// src/services/businesses/business.handler.js
// Admin-side management of business profiles: the submissions queue
// (list/filter), full detail view, and the approve / reject actions that
// gate every public profile. Every write emits an audit event.
import { Op } from 'sequelize';
import db from '@src/db/models/index.js';
import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';
import { emitEvent } from '@src/events/event.bus.js';
import { EVENTS } from '@src/events/event.types.js';

const { Business, Category, BusinessLink, User } = db;

const auditActor = (context) => ({
  actorId: context?.adminId ?? null,
  actorType: context?.admin ? 'admin_user' : null,
  actorEmail: context?.admin?.email ?? null
});

const findBusinessOr404 = async (id, transaction) => {
  const business = await Business.findByPk(id, {
    include: [
      { model: Category, as: 'primaryCategory', attributes: ['id', 'name_en', 'name_hi', 'slug'] },
      { model: BusinessLink, as: 'links' },
      { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
    ],
    transaction
  });
  if (!business) {
    throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Business not found' });
  }
  return business;
};

export class ListBusinessesHandler extends BaseHandler {
  /**
   * Submissions queue + business index: paginated, filterable by status,
   * category (id) and free-text search on name/slug/owner email.
   */
  async run () {
    const { page = 1, limit = 20, status, categoryId, q } = this.args;

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.primaryCategoryId = categoryId;

    const term = String(q ?? '').trim();
    if (term) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${term}%` } },
        { slug: { [Op.iLike]: `%${term}%` } }
      ];
    }

    const { rows, count } = await Business.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'primaryCategory', attributes: ['id', 'name_en', 'name_hi', 'slug'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ],
      order: [['updated_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      transaction: this.dbTransaction
    });

    return {
      items: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }
}

export class GetBusinessHandler extends BaseHandler {
  /** Full submission detail for the review screen. */
  async run () {
    const business = await Business.findByPk(this.args.id, {
      include: [
        { model: Category, as: 'primaryCategory', attributes: ['id', 'name_en', 'name_hi', 'slug'] },
        { model: BusinessLink, as: 'links' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ],
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Business not found' });
    }
    return business;
  }
}

export class ApproveBusinessHandler extends BaseHandler {
  /** pending_review/rejected -> published. Audit-logged. */
  async run () {
    const { id } = this.args;
    const business = await findBusinessOr404.call(this, id, this.dbTransaction);

    if (business.status === 'published') return business;

    await business.update(
      { status: 'published', rejection_reason: null },
      { transaction: this.dbTransaction }
    );

    emitEvent(EVENTS.ADMIN_GENERIC_ACTION ?? 'admin.business.approved', {
      ...auditActor(this.context),
      action: 'business.approved',
      entity: 'business',
      entityId: business.id,
      meta: { name: business.name, slug: business.slug }
    }, this.context);

    return business.reload({ transaction: this.dbTransaction });
  }
}

export class RejectBusinessHandler extends BaseHandler {
  /** pending_review -> rejected with a reason shown to the owner. Audit-logged. */
  async run () {
    const { id, reason } = this.args;

    const cleanReason = String(reason ?? '').trim();
    if (cleanReason.length < 5) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId,
        field: 'reason',
        message: 'Please give the owner a short reason (at least 5 characters)'
      });
    }

    const business = await findBusinessOr404.call(this, id, this.dbTransaction);
    if (business.status === 'published') {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId,
        message: 'This business is already published — unpublish it instead of rejecting'
      });
    }

    await business.update(
      { status: 'rejected', rejection_reason: cleanReason },
      { transaction: this.dbTransaction }
    );

    emitEvent(EVENTS.ADMIN_GENERIC_ACTION ?? 'admin.business.rejected', {
      ...auditActor(this.context),
      action: 'business.rejected',
      entity: 'business',
      entityId: business.id,
      meta: { name: business.name, reason: cleanReason }
    }, this.context);

    return business.reload({ transaction: this.dbTransaction });
  }
}
