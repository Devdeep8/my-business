// src/services/public/publicBusiness.handler.js
// Read-only directory access: published businesses only, no owner ids and no
// review metadata. Powers the public /browse page and /b/[slug] profiles.
import db from '@src/db/models/index.js';
import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';
import { GetCategoryFormHandler } from '@src/services/categories/category.handler.js';

const { Business, Category, BusinessLink, BusinessMedia, Sequelize } = db;

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

// Empty/null-ish attribute values stay off the public profile.
const hasValue = (value) =>
  value !== null && value !== undefined && value !== '' &&
  !(Array.isArray(value) && value.length === 0);

// Shape returned to public consumers — no owner ids, no review metadata,
// no internal scoring metrics.
const publicView = (business, links = []) => ({
  id: business.id,
  name: business.name,
  slug: business.slug,
  description: business.description,
  phone: business.phone,
  whatsapp: business.whatsapp,
  website_url: business.websiteUrl,
  city: business.address?.city || null,
  address: business.address,
  hours: business.hours,
  verification_status: business.verificationStatus,
  category: business.primaryCategory
    ? {
        id: business.primaryCategory.id,
        slug: business.primaryCategory.slug,
        name: { en: business.primaryCategory.name_en, hi: business.primaryCategory.name_hi }
      }
    : null,
  links
});

// First cover (else first photo) and first logo for card rendering.
const cardMedia = (media = []) => {
  const pick = (kind, fallbackKind) =>
    media.find((m) => m.kind === kind) || (fallbackKind ? media.find((m) => m.kind === fallbackKind) : null);
  const cover = pick('cover', 'photo');
  const logo = pick('logo');
  return {
    cover: cover ? { url: cover.url, alt_text: cover.altText } : null,
    logo: logo ? { url: logo.url } : null
  };
};

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
        'websiteUrl', 'address', 'hours', 'verificationStatus',
        'primaryCategoryId'
      ],
      include: [
        {
          model: Category,
          as: 'primaryCategory',
          where: categoryWhere,
          attributes: ['id', 'name_en', 'name_hi', 'slug'],
          required: true
        },
        {
          model: BusinessMedia,
          as: 'media',
          attributes: ['url', 'altText', 'kind', 'sortOrder'],
          separate: true,
          order: [['sortOrder', 'ASC']],
          required: false
        }
      ],
      order: [['name', 'ASC'], ['id', 'ASC']],
      limit,
      offset: (page - 1) * limit,
      transaction: this.dbTransaction,
      distinct: true
    });

    return {
      items: rows.map((business) => ({
        ...publicView(business),
        ...cardMedia(business.media || [])
      })),
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
  /**
   * One published business by slug with everything the public profile page
   * renders: ordered links, media (cover/logo first), category fields
   * resolved with bilingual labels (show_on_profile only), service area and
   * opening date.
   */
  async run () {
    const { slug } = this.args;

    const business = await Business.findOne({
      where: { slug, status: 'published' },
      include: [
        { model: Category, as: 'primaryCategory', attributes: ['id', 'name_en', 'name_hi', 'slug'] },
        { model: BusinessLink, as: 'links', separate: true, order: [['displayOrder', 'ASC']] },
        { model: BusinessMedia, as: 'media', separate: true, order: [['sortOrder', 'ASC']] }
      ],
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Business not found' });
    }

    // Category-specific answers with their bilingual labels, filtered to the
    // fields admins flagged for the public profile.
    const form = await this.callHandler(
      GetCategoryFormHandler, { id: business.primaryCategoryId }
    );
    const answers = business.attributes || {};
    const profileFields = form.fields
      .filter((field) => field.show_on_profile !== false)
      .map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        value: answers[field.key] ?? null
      }))
      .filter((field) => hasValue(field.value));

    const view = publicView(business, (business.links || []).map((link) => ({
      type: link.type,
      url: link.url,
      title: link.title
    })));

    return {
      ...view,
      service_area: business.serviceArea,
      opening_date: business.openingDate,
      profile_fields: profileFields,
      media: (business.media || []).map((item) => ({
        url: item.url,
        alt_text: item.altText,
        kind: item.kind
      }))
    };
  }
}

export class ListPublicCategoriesHandler extends BaseHandler {
  /**
   * Active category tree (two levels) for the public directory's filter
   * chips — public-safe fields only (no ids, no admin metadata).
   */
  async run () {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name_en', 'name_hi', 'slug', 'parentId', 'displayOrder', 'isLeaf'],
      order: [['displayOrder', 'ASC'], ['name_en', 'ASC']],
      transaction: this.dbTransaction
    });

    const shape = (category) => ({
      slug: category.slug,
      name: { en: category.name_en, hi: category.name_hi },
      is_leaf: category.isLeaf
    });

    const byId = new Map(categories.map((c) => [c.id, { ...c.toJSON(), children: [] }]));
    const roots = [];
    for (const node of byId.values()) {
      const parent = node.parentId && byId.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }

    return {
      items: roots.map((root) => ({
        ...shape(root),
        children: root.children.map(shape)
      }))
    };
  }
}
