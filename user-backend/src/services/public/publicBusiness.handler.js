// src/services/public/publicBusiness.handler.js
// Read-only directory access for external apps: published businesses only.
import db from '@src/db/models/index.js';
import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';

const { Business, Category, BusinessLink, Sequelize } = db;

// Resolve a category slug (parent or leaf) to itself plus every descendant
// category id, so a "business type" like food-dining matches all its leaves.
const categorySubtreeIds = async (slug, traceId, transaction) => {
  const root = await Category.findOne({
    where: { slug, isActive: true },
    attributes: ['id'],
    transaction
  });
  if (!root) {
    throw new AppError(Errors.NOT_FOUND, {
      traceId, message: `Business type '${slug}' not found`
    });
  }

  const ids = [root.id];
  let frontier = [root.id];
  while (frontier.length > 0) {
    const children = await Category.findAll({
      where: { parentId: frontier, isActive: true },
      attributes: ['id'],
      transaction
    });
    frontier = children.map((c) => c.id);
    ids.push(...frontier);
  }
  return ids;
};

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
   * description), category filter (leaf category slug) and business-type
   * filter (any category slug — parent or leaf — matching its subtree).
   * Ordered by name for stable pagination.
   */
  async run () {
    const { page = 1, limit = 10, search, category, businessType } = this.args;

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
    } else if (businessType) {
      // Subtree filter on the business's primary category
      const subtreeIds = await categorySubtreeIds(
        String(businessType).trim(), this.traceId, this.dbTransaction
      );
      categoryWhere.id = { [Sequelize.Op.in]: subtreeIds };
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
