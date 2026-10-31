// src/services/public/publicBusiness.handler.js
// Read-only directory access for external apps: published businesses only.
import db from '@src/db/models/index.js';
import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';

const { Business, Category, BusinessLink, Sequelize } = db;

// Shape returned to external consumers — no owner ids, no review metadata.
const publicView = (business, links = []) => ({
  id: business.id,
  name: business.name,
  slug: business.slug,
  description: business.description,
  phone: business.phone,
  whatsapp: business.whatsapp,
  website_url: business.website_url,
  address: business.address,
  hours: business.hours,
  verification_status: business.verification_status,
  completeness_score: business.completeness_score,
  category: business.primaryCategory
    ? {
        id: business.primaryCategory.id,
        slug: business.primaryCategory.slug,
        name: { en: business.primaryCategory.name_en, hi: business.primaryCategory.name_hi }
      }
    : null,
  links
});

export class ListPublicBusinessesHandler extends BaseHandler {
  /**
   * Published businesses with pagination, free-text search (name /
   * description) and category filter (leaf category slug). Ordered by name
   * for stable pagination.
   */
  async run () {
    const { page = 1, limit = 10, search, category } = this.args;

    const where = { status: 'published' };
    const term = String(search ?? '').trim();
    if (term) {
      where[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.iLike]: `%${term}%` } },
        { description: { [Sequelize.Op.iLike]: `%${term}%` } }
      ];
    }

    const categoryWhere = { isActive: true };
    if (category) {
      categoryWhere.slug = String(category).trim();
    }

    const { rows, count } = await Business.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'slug', 'description', 'phone', 'whatsapp',
        'website_url', 'address', 'hours', 'verification_status', 'completeness_score',
        'primary_category_id'
      ],
      include: [{
        model: Category,
        as: 'primaryCategory',
        where: categoryWhere,
        attributes: ['id', 'name_en', 'name_hi', 'slug'],
        required: true
      }],
      order: [['name', 'ASC'], ['id', 'ASC']],
      limit,
      offset: (page - 1) * limit,
      transaction: this.dbTransaction,
      distinct: true
    });

    return {
      items: rows.map((business) => publicView(business)),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }
}

export class GetPublicBusinessHandler extends BaseHandler {
  /** One published business by slug, with its public links. */
  async run () {
    const { slug } = this.args;

    const business = await Business.findOne({
      where: { slug, status: 'published' },
      include: [
        { model: Category, as: 'primaryCategory', attributes: ['id', 'name_en', 'name_hi', 'slug'] },
        { model: BusinessLink, as: 'links', separate: true, order: [['displayOrder', 'ASC']] }
      ],
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Business not found' });
    }

    return publicView(business, (business.links || []).map((link) => ({
      type: link.type,
      url: link.url,
      title: link.title
    })));
  }
}
