export const createCategorySchema = {
  bodySchema: {
    type: 'object',
    required: ['name_en', 'name_hi', 'slug'],
    properties: {
      name_en: { type: 'string', minLength: 1, maxLength: 255 },
      name_hi: { type: 'string', minLength: 1, maxLength: 255 },
      slug: { type: 'string', minLength: 1, maxLength: 255, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
      parentId: {
        anyOf: [
          { type: 'string', format: 'uuid' },
          { type: 'null' }
        ],
        default: null
      },
      displayOrder: { type: 'integer', minimum: 0, default: 0 },
      isActive: { type: 'boolean', default: true },
      isLeaf: { type: 'boolean', default: true }
    },
    additionalProperties: false
  }
};
