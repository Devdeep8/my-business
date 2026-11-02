// src/json-schemas/public/publicBusiness.schema.js
// Query schemas for the public (unauthenticated) businesses directory API.

export const listPublicBusinessesSchema = {
  querySchema: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string', maxLength: 255 },
      category: { type: 'string', maxLength: 255 },
      // Business type = any category slug (parent like "food-dining" or leaf
      // like "restaurant"); matches businesses in that category or its subtree
      businessType: { type: 'string', maxLength: 255 }
    }
  }
};

export const getPublicBusinessSchema = {
  paramsSchema: {
    type: 'object',
    required: ['slug'],
    properties: {
      slug: { type: 'string', minLength: 1, maxLength: 255, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }
    }
  }
};
