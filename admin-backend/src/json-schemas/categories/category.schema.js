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

export const categoryIdParamSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
    additionalProperties: false
  }
};

const fieldBodyProperties = {
  key: { type: 'string', pattern: '^[a-z][a-z0-9_]*$', maxLength: 100 },
  labelEn: { type: 'string', minLength: 1, maxLength: 255 },
  labelHi: { type: 'string', minLength: 1, maxLength: 255 },
  type: { type: 'string', enum: ['text', 'number', 'select', 'multi_select', 'boolean', 'time_range', 'address', 'phone', 'url', 'image', 'repeater'] },
  options: { type: 'array', items: { type: 'string' }, default: [] },
  validation: { type: 'object', additionalProperties: true, default: { required: false } },
  helpTextEn: { type: ['string', 'null'] },
  helpTextHi: { type: ['string', 'null'] },
  displayOrder: { type: 'integer', minimum: 0, default: 0 },
  showOnProfile: { type: 'boolean', default: true },
  visibleIf: { type: ['object', 'null'], additionalProperties: true },
  isActive: { type: 'boolean', default: true }
};

export const createCategoryFieldSchema = {
  paramsSchema: categoryIdParamSchema.paramsSchema,
  bodySchema: {
    type: 'object',
    required: ['key', 'labelEn', 'labelHi', 'type'],
    properties: fieldBodyProperties,
    additionalProperties: false
  }
};

export const updateCategoryFieldSchema = {
  paramsSchema: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
    additionalProperties: false
  },
  bodySchema: {
    type: 'object',
    properties: fieldBodyProperties,
    additionalProperties: false,
    minProperties: 1
  }
};
