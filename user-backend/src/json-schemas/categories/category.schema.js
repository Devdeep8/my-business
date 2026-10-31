// src/json-schemas/categories/category.schema.js

export const listCategoriesSchema = {
  querySchema: {
    type: 'object',
    properties: {
      leavesOnly: { type: 'boolean', default: false }
    }
  }
};

export const getCategoryFormSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }
};
