// src/rest-resources/routes/api/v1/public.routes.js
// Public (unauthenticated) directory API for other apps to browse published
// businesses. Mounted only outside production (see api/v1/index.js).
import { Router } from 'express';
import PublicController from '@controllers/public.controller.js';
import asyncHandler from '@src/utils/async-handler.js';
import contextMiddleware from '@src/rest-resources/middlewares/context.middleware.js';
import rateLimitMiddleware from '@src/rest-resources/middlewares/rateLimit.middleware.js';
import requestValidationMiddleware from '@src/rest-resources/middlewares/requestValidation.middleware.js';
import {
  listPublicBusinessesSchema,
  getPublicBusinessSchema
} from '@src/json-schemas/public/publicBusiness.schema.js';

const router = Router();

/**
 * @route   GET /api/v1/public/businesses
 * @desc    Published businesses — pagination + search + category filter
 * @query   page, limit, search (name/description), category (leaf slug)
 * @access  Public (no auth; rate limited)
 */
router.get(
  '/businesses',
  contextMiddleware(false),
  rateLimitMiddleware({ points: 60, duration: 60, keyPrefix: 'public_businesses' }),
  requestValidationMiddleware(listPublicBusinessesSchema),
  asyncHandler(PublicController.listBusinesses)
);

/**
 * @route   GET /api/v1/public/businesses/:slug
 * @desc    One published business with its public links
 * @access  Public (no auth; rate limited)
 */
router.get(
  '/businesses/:slug',
  contextMiddleware(false),
  rateLimitMiddleware({ points: 60, duration: 60, keyPrefix: 'public_business_detail' }),
  requestValidationMiddleware(getPublicBusinessSchema),
  asyncHandler(PublicController.getBusiness)
);

export default router;
