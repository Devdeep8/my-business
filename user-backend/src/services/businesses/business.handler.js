// src/services/businesses/business.handler.js
import db from '@src/db/models/index.js';
import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';
import { GetCategoryFormHandler } from '@src/services/categories/category.handler.js';
import { validateAttributes, computeCompleteness } from './attribute.validator.js';

const { Business, Category, BusinessLink, Sequelize } = db;

const PHONE_PATTERN = /^\+91[0-9]{10}$/;

// Unique URL slug from the business name: "Sharma Dhaba!" -> "sharma-dhaba",
// falling back to -2, -3... on conflicts.
const generateSlug = async (name, transaction) => {
  const base = String(name).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'business';

  let candidate = base;
  let suffix = 1;
  while (await Business.findOne({ where: { slug: candidate }, transaction })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
};

// The business's resolved category form, reused for validation and
// completeness scoring (schema-driven, never hardcoded). Call via a handler's
// this.callHandler so the request transaction is shared.
const resolvedForm = (handler, categoryId) =>
  handler.callHandler(GetCategoryFormHandler, { id: categoryId });

// Core (non-category) profile columns that feed the completeness score
const coreProfile = (business) => ({
  description: business.description,
  address: business.address,
  hours: business.hours,
  phone: business.phone,
  website_url: business.website_url
});

export class CreateBusinessHandler extends BaseHandler {
  /**
   * Onboarding step: create the owner's business under a category. Base
   * columns are validated here; category-specific `attributes` are validated
   * against the resolved form. Starts as a draft — publishing goes through
   * admin review.
   */
  async run () {
    const { name, primaryCategoryId, phone, description, address, hours, attributes, links } = this.args;
    const userId = this.context.userId;

    if (!PHONE_PATTERN.test(phone || '')) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId, field: 'phone', message: 'Phone must be a +91 Indian mobile number'
      });
    }

    const category = await Category.findByPk(primaryCategoryId, {
      attributes: ['id', 'isLeaf', 'isActive'],
      transaction: this.dbTransaction
    });
    if (!category || !category.isActive || !category.isLeaf) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId, field: 'primaryCategoryId', message: 'Pick a valid (leaf) business category'
      });
    }

    const existing = await Business.findOne({ where: { ownerUserId: userId }, transaction: this.dbTransaction });
    if (existing) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId, message: 'You already have a business profile'
      });
    }

    // Validate category-specific answers against the resolved schema
    const form = await resolvedForm(this, primaryCategoryId);
    const cleanedAttributes = validateAttributes(this.traceId, form.fields, attributes);

    const draft = {
      description, address, hours,
      phone,
      whatsapp: phone,
      attributes: cleanedAttributes
    };
    const core = coreProfile(draft);
    const completeness = computeCompleteness({
      coreAnswered: Object.values(core).filter(Boolean).length,
      coreTotal: Object.keys(core).length,
      attributes: cleanedAttributes,
      fields: form.fields
    });

    const business = await Business.create({
      name,
      slug: await generateSlug(name, this.dbTransaction),
      ownerUserId: userId,
      primaryCategoryId,
      ...draft,
      status: 'draft',
      verificationStatus: 'unverified',
      completenessScore: completeness,
      formVersion: 1
    }, { transaction: this.dbTransaction });

    if (Array.isArray(links) && links.length > 0) {
      await BusinessLink.bulkCreate(
        links.map((link, index) => ({
          businessId: business.id,
          type: link.type,
          url: link.url,
          title: link.title,
          displayOrder: index
        })),
        { transaction: this.dbTransaction }
      );
    }

    return business.reload({ transaction: this.dbTransaction });
  }
}

export class GetMyBusinessHandler extends BaseHandler {
  /** The signed-in owner's business profile with links and category. */
  async run () {
    const business = await Business.findOne({
      where: { ownerUserId: this.context.userId },
      include: [
        { model: BusinessLink, as: 'links' },
        { model: Category, as: 'primaryCategory', attributes: ['id', 'name_en', 'name_hi', 'slug'] }
      ],
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, {
        traceId: this.traceId, message: 'No business profile yet — create one first'
      });
    }
    return business;
  }
}

export class UpdateMyBusinessHandler extends BaseHandler {
  /**
   * Edit base columns and/or merge `attributes` (partial: only sent keys are
   * revalidated). Recomputes the completeness score. Rejected businesses move
   * back to draft on edit so the review queue sees the change.
   */
  async run () {
    const { name, description, address, hours, phone, websiteUrl, whatsapp, attributes } = this.args;

    const business = await Business.findOne({
      where: { ownerUserId: this.context.userId },
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, {
        traceId: this.traceId, message: 'No business profile yet — create one first'
      });
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId, field: 'phone', message: 'Phone must be a +91 Indian mobile number'
      });
    }

    let mergedAttributes = business.attributes || {};
    if (attributes) {
      const form = await resolvedForm(this, business.primaryCategoryId);
      // Merge onto existing answers so owners can submit one field at a time
      mergedAttributes = {
        ...mergedAttributes,
        ...validateAttributes(this.traceId, form.fields, { ...mergedAttributes, ...attributes }, { partial: true })
      };
    }

    const draft = {
      name: name ?? business.name,
      description: description ?? business.description,
      address: address ?? business.address,
      hours: hours ?? business.hours,
      phone: phone ?? business.phone,
      whatsapp: whatsapp ?? business.whatsapp,
      website_url: websiteUrl ?? business.website_url
    };

    const form = await resolvedForm(this, business.primaryCategoryId);
    const core = coreProfile(draft);
    const completeness = computeCompleteness({
      coreAnswered: Object.values(core).filter(Boolean).length,
      coreTotal: Object.keys(core).length,
      attributes: mergedAttributes,
      fields: form.fields
    });

    await business.update({
      ...draft,
      attributes: mergedAttributes,
      completeness_score: completeness,
      status: business.status === 'rejected' ? 'draft' : business.status
    }, { transaction: this.dbTransaction });

    return business.reload({ transaction: this.dbTransaction });
  }
}

export class SubmitMyBusinessHandler extends BaseHandler {
  /**
   * Move a ready draft into the admin review queue. Blocks on missing
   * required fields (full validation, not partial) so the queue only ever
   * sees complete submissions.
   */
  async run () {
    const business = await Business.findOne({
      where: { ownerUserId: this.context.userId },
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, {
        traceId: this.traceId, message: 'No business profile yet — create one first'
      });
    }
    if (business.status !== 'draft' && business.status !== 'rejected') {
      return business.reload({ transaction: this.dbTransaction }); // already in review/published
    }

    const form = await resolvedForm(this, business.primaryCategoryId);
    validateAttributes(this.traceId, form.fields, business.attributes || {});

    await business.update({ status: 'pending_review', rejection_reason: null }, { transaction: this.dbTransaction });
    return business.reload({ transaction: this.dbTransaction });
  }
}

export class ListMyBusinessLinksHandler extends BaseHandler {
  async run () {
    const business = await Business.findOne({
      where: { ownerUserId: this.context.userId },
      attributes: ['id'],
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'No business profile yet' });
    }

    const links = await BusinessLink.findAll({
      where: { businessId: business.id },
      order: [['displayOrder', 'ASC']],
      transaction: this.dbTransaction
    });
    return { items: links };
  }
}

export class CreateBusinessLinkHandler extends BaseHandler {
  async run () {
    const { type, url, title } = this.args;
    const business = await Business.findOne({
      where: { ownerUserId: this.context.userId },
      attributes: ['id'],
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'No business profile yet' });
    }

    const [{ max }] = await BusinessLink.findAll({
      attributes: [[Sequelize.fn('MAX', Sequelize.col('display_order')), 'max']],
      where: { businessId: business.id },
      transaction: this.dbTransaction,
      raw: true
    });

    return BusinessLink.create({
      businessId: business.id,
      type, url, title,
      displayOrder: (max || 0) + 1
    }, { transaction: this.dbTransaction });
  }
}

export class DeleteBusinessLinkHandler extends BaseHandler {
  async run () {
    const { id } = this.args;
    const business = await Business.findOne({
      where: { ownerUserId: this.context.userId },
      attributes: ['id'],
      transaction: this.dbTransaction
    });
    if (!business) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'No business profile yet' });
    }

    const deleted = await BusinessLink.destroy({
      where: { id, businessId: business.id },
      transaction: this.dbTransaction
    });
    if (!deleted) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Link not found' });
    }
    return { id };
  }
}
