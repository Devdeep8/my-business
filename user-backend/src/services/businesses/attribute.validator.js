// src/services/businesses/attribute.validator.js
// Validates a business's category-specific answers (`attributes`) against the
// category's resolved field definitions — the server-side twin of the dynamic
// form renderer. No category-specific rule lives here; everything comes from
// the field-definition schema.
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';

const URL_PATTERN = /^https?:\/\/.+/;
const PHONE_PATTERN = /^\+91[0-9]{10}$/;

const invalid = (traceId, field, message) =>
  new AppError(Errors.INVALID_INPUT, { traceId, field, message });

// Check one answer against one field definition
const checkValue = (traceId, definition, value) => {
  const { key, type, options, validation = {} } = definition;

  if (value === null || value === undefined || value === '') {
    if (validation.required) {
      throw invalid(traceId, key, 'This field is required');
    }
    return;
  }

  switch (type) {
    case 'text':
      if (typeof value !== 'string') throw invalid(traceId, key, 'Must be text');
      if (validation.maxLength && value.length > validation.maxLength) {
        throw invalid(traceId, key, `Must be at most ${validation.maxLength} characters`);
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        throw invalid(traceId, key, validation.message || 'Invalid format');
      }
      break;

    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw invalid(traceId, key, 'Must be a number');
      }
      if (validation.min !== undefined && value < validation.min) {
        throw invalid(traceId, key, `Must be at least ${validation.min}`);
      }
      if (validation.max !== undefined && value > validation.max) {
        throw invalid(traceId, key, `Must be at most ${validation.max}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') throw invalid(traceId, key, 'Must be true or false');
      break;

    case 'url':
      if (typeof value !== 'string' || !URL_PATTERN.test(value)) {
        throw invalid(traceId, key, 'Must be a valid http(s) URL');
      }
      break;

    case 'phone':
      if (typeof value !== 'string' || !PHONE_PATTERN.test(value)) {
        throw invalid(traceId, key, 'Must be a +91 Indian mobile number');
      }
      break;

    case 'select':
      if (typeof value !== 'string' || !options?.includes(value)) {
        throw invalid(traceId, key, `Must be one of: ${options?.join(', ')}`);
      }
      break;

    case 'multi_select':
      if (!Array.isArray(value)) throw invalid(traceId, key, 'Must be a list');
      if (validation.minItems && value.length < validation.minItems) {
        throw invalid(traceId, key, `Select at least ${validation.minItems}`);
      }
      if (validation.maxItems && value.length > validation.maxItems) {
        throw invalid(traceId, key, `Select at most ${validation.maxItems}`);
      }
      for (const item of value) {
        if (!options?.includes(item)) {
          throw invalid(traceId, key, `Invalid selection: ${item}`);
        }
      }
      break;

    // time_range / address / image / repeater are structured values rendered
    // by dedicated form components; MVP stores them shape-checked loosely.
    case 'time_range':
    case 'address':
    case 'image':
    case 'repeater':
      if (typeof value !== 'object') throw invalid(traceId, key, 'Invalid value');
      break;

    default:
      throw invalid(traceId, key, `Unsupported field type: ${type}`);
  }
};

/**
 * Validate `attributes` against resolved field definitions. Returns only the
 * known keys (unknown keys are rejected so stale form data can't slip in).
 * Skips fields whose `visible_if` condition is not met (they may stay empty).
 */
export const validateAttributes = (traceId, fields, attributes, { partial = false } = {}) => {
  const input = attributes || {};

  const isVisible = (field) => {
    const cond = field.visible_if;
    if (!cond) return true;
    const answer = input[cond.field];
    return cond.equals !== undefined ? answer === cond.equals : true;
  };

  const cleaned = {};
  for (const field of fields) {
    if (!(field.key in input)) {
      if (!partial && field.validation?.required && isVisible(field)) {
        throw invalid(traceId, field.key, 'This field is required');
      }
      continue;
    }
    checkValue(traceId, field, input[field.key]);
    cleaned[field.key] = input[field.key];
  }

  const knownKeys = new Set(fields.map((f) => f.key));
  const unknown = Object.keys(input).filter((k) => !knownKeys.has(k));
  if (unknown.length > 0) {
    throw invalid(traceId, 'attributes', `Unknown fields for this category: ${unknown.join(', ')}`);
  }

  return cleaned;
};

// Completeness: percent of the category form's fields (visible ones first)
// plus core profile columns the business has answered. Mirrors Google's
// "complete your profile" meter.
export const computeCompleteness = ({ coreAnswered, coreTotal, attributes, fields }) => {
  const answeredFields = fields.filter((f) => {
    const value = attributes?.[f.key];
    return value !== null && value !== undefined && value !== '' &&
      !(Array.isArray(value) && value.length === 0);
  }).length;

  const total = coreTotal + fields.length;
  const done = coreAnswered + answeredFields;
  return Math.round((done / Math.max(total, 1)) * 100);
};
