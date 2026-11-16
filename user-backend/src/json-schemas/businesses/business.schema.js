// src/json-schemas/businesses/business.schema.js
// Structural input hygiene only — category-specific attribute rules come from
// the field-definition schema and are enforced in the service handler
// (attribute.validator.js).

const linkSchema = {
  type: 'object',
  required: ['type', 'url', 'title'],
  properties: {
    type: {
      type: 'string',
      enum: ['website', 'whatsapp', 'instagram', 'facebook', 'youtube', 'booking', 'menu', 'map', 'custom']
    },
    url: { type: 'string', maxLength: 500 },
    title: { type: 'string', minLength: 1, maxLength: 255 }
  }
};

const addressSchema = {
  type: 'object',
  properties: {
    line1: { type: 'string', maxLength: 255 },
    city: { type: 'string', maxLength: 100 },
    state: { type: 'string', maxLength: 100 },
    pincode: { type: 'string', pattern: '^[1-9][0-9]{5}$' },
    lat: { type: 'number' },
    lng: { type: 'number' }
  }
};

export const createBusinessSchema = {
  bodySchema: {
    type: 'object',
    required: ['name', 'primaryCategoryId', 'phone'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 255 },
      primaryCategoryId: { type: 'string', format: 'uuid' },
      phone: { type: 'string', maxLength: 13 },
      description: { type: 'string', maxLength: 1500 },
      address: addressSchema,
      hours: { type: 'object' },
      attributes: { type: 'object' },
      links: { type: 'array', maxItems: 20, items: linkSchema }
    }
  }
};

export const updateMyBusinessSchema = {
  bodySchema: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 255 },
      phone: { type: 'string', maxLength: 13 },
      whatsapp: { type: 'string', maxLength: 13, nullable: true },
      websiteUrl: { type: 'string', maxLength: 500, nullable: true },
      description: { type: 'string', maxLength: 1500, nullable: true },
      address: addressSchema,
      hours: { type: 'object' },
      attributes: { type: 'object' }
    }
  }
};

export const createBusinessLinkSchema = {
  bodySchema: linkSchema
};

export const deleteBusinessLinkSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }
};

export const reorderBusinessLinksSchema = {
  bodySchema: {
    type: 'object',
    required: ['ids'],
    properties: {
      ids: {
        type: 'array',
        minItems: 1,
        maxItems: 20,
        items: { type: 'string', format: 'uuid' }
      }
    }
  }
};

const mediaKind = {
  type: 'string',
  enum: ['logo', 'cover', 'photo', 'video']
};

export const createBusinessMediaSchema = {
  bodySchema: {
    type: 'object',
    required: ['url'],
    properties: {
      url: { type: 'string', maxLength: 500 },
      kind: mediaKind,
      altText: { type: 'string', maxLength: 255 }
    }
  }
};

export const updateBusinessMediaSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  },
  bodySchema: {
    type: 'object',
    properties: {
      kind: mediaKind,
      altText: { type: 'string', maxLength: 255, nullable: true }
    }
  }
};

export const deleteBusinessMediaSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }
};
