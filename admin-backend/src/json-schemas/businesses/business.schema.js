// src/json-schemas/businesses/business.schema.js

export const listBusinessesSchema = {
  querySchema: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      status: { type: 'string', enum: ['draft', 'pending_review', 'published', 'rejected'] },
      categoryId: { type: 'string', format: 'uuid' },
      q: { type: 'string', maxLength: 100 }
    }
  }
};

export const getBusinessSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }
};

export const rejectBusinessSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  },
  bodySchema: {
    type: 'object',
    required: ['reason'],
    properties: {
      reason: { type: 'string', minLength: 5, maxLength: 1000 }
    }
  }
};
