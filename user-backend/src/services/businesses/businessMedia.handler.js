// src/services/businesses/businessMedia.handler.js
// Owner-scoped CRUD for business_media (logo / cover / photos). Images are
// uploaded separately via /uploads/images (Cloudinary); these handlers only
// attach the resulting URL to the signed-in owner's business.
import db from '@src/db/models/index.js';
import { BaseHandler } from '@src/libs/base.handler.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';
import cloudinaryService, { CloudinaryService, IMAGE_RULES } from '@src/utils/cloudinary.service.js';

const { Business, BusinessMedia, Sequelize } = db;

const MAX_MEDIA_PER_BUSINESS = 20;

// The owner's business row (id only) or a clean NOT_FOUND.
const myBusiness = async (handler) => {
  const business = await Business.findOne({
    where: { ownerUserId: handler.context.userId },
    attributes: ['id'],
    transaction: handler.dbTransaction
  });
  if (!business) {
    throw new AppError(Errors.NOT_FOUND, {
      traceId: handler.traceId, message: 'No business profile yet — create one first'
    });
  }
  return business;
};

export class ListMyBusinessMediaHandler extends BaseHandler {
  /** My media items, cover/logo first then photos, each group by sortOrder. */
  async run () {
    const business = await myBusiness(this);

    const media = await BusinessMedia.findAll({
      where: { businessId: business.id },
      order: [
        // covers/logos surface first; within a kind, explicit order wins
        [Sequelize.literal(`case when kind in ('cover','logo') then 0 else 1 end`), 'ASC'],
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC']
      ],
      transaction: this.dbTransaction
    });
    return { items: media };
  }
}

export class CreateBusinessMediaHandler extends BaseHandler {
  /**
   * Attach an already-uploaded image URL to my business. `kind` defaults to
   * photo; setting a second cover/logo demotes the previous one to photo so
   * each kind stays unique on the public profile.
   */
  async run () {
    const { url, kind = 'photo', altText } = this.args;
    const business = await myBusiness(this);
    const folder = `${IMAGE_RULES.DEFAULT_FOLDER}/${this.context.userId}`;
    if (!CloudinaryService.publicIdFromUrl(url, cloudinaryService.cloudName, folder)) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId,
        field: 'url',
        message: 'Choose an image uploaded from this account'
      });
    }

    const { count } = await BusinessMedia.findAndCountAll({
      where: { businessId: business.id },
      transaction: this.dbTransaction
    });
    if (count >= MAX_MEDIA_PER_BUSINESS) {
      throw new AppError(Errors.INVALID_INPUT, {
        traceId: this.traceId,
        message: `A business can have at most ${MAX_MEDIA_PER_BUSINESS} media items`
      });
    }

    if (kind === 'cover' || kind === 'logo') {
      // Demote any existing cover/logo — one of each on the profile
      await BusinessMedia.update(
        { kind: 'photo' },
        { where: { businessId: business.id, kind }, transaction: this.dbTransaction }
      );
    }

    const [{ max }] = await BusinessMedia.findAll({
      attributes: [[Sequelize.fn('MAX', Sequelize.col('sort_order')), 'max']],
      where: { businessId: business.id },
      transaction: this.dbTransaction,
      raw: true
    });

    return BusinessMedia.create({
      businessId: business.id,
      url,
      kind,
      altText: altText || null,
      sortOrder: (max || 0) + 1
    }, { transaction: this.dbTransaction });
  }
}

export class UpdateBusinessMediaHandler extends BaseHandler {
  /** Change an item's kind (e.g. "set as cover") and/or its alt text. */
  async run () {
    const { id, kind, altText } = this.args;
    const business = await myBusiness(this);

    const media = await BusinessMedia.findOne({
      where: { id, businessId: business.id },
      transaction: this.dbTransaction
    });
    if (!media) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Media not found' });
    }

    if ((kind === 'cover' || kind === 'logo') && kind !== media.kind) {
      await BusinessMedia.update(
        { kind: 'photo' },
        { where: { businessId: business.id, kind }, transaction: this.dbTransaction }
      );
    }

    await media.update({
      kind: kind ?? media.kind,
      altText: altText === undefined ? media.altText : altText
    }, { transaction: this.dbTransaction });

    return media.reload({ transaction: this.dbTransaction });
  }
}

export class DeleteBusinessMediaHandler extends BaseHandler {
  /**
   * Detach a media item. The Cloudinary asset is destroyed best-effort
   * (public id derived from the stored URL); failure to delete the remote
   * asset never blocks the row delete.
   */
  async run () {
    const { id } = this.args;
    const business = await myBusiness(this);

    const media = await BusinessMedia.findOne({
      where: { id, businessId: business.id },
      transaction: this.dbTransaction
    });
    if (!media) {
      throw new AppError(Errors.NOT_FOUND, { traceId: this.traceId, message: 'Media not found' });
    }

    await media.destroy({ transaction: this.dbTransaction });

    const publicId = CloudinaryService.publicIdFromUrl(
      media.url,
      cloudinaryService.cloudName,
      `${IMAGE_RULES.DEFAULT_FOLDER}/${this.context.userId}`
    );
    if (publicId) {
      try {
        await cloudinaryService.deleteImage(publicId);
      } catch {
        // Best-effort only — the row is already gone; orphaned assets are
        // acceptable and can be swept later.
      }
    }
    return { id };
  }
}
