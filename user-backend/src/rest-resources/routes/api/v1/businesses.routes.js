// src/rest-resources/routes/api/v1/businesses.routes.js
import { Router } from 'express';
import BusinessesController from '@controllers/businesses.controller.js';
import asyncHandler from '@src/utils/async-handler.js';
import contextMiddleware from '@src/rest-resources/middlewares/context.middleware.js';
import isUserAuthenticated from '@src/rest-resources/middlewares/isUserAuthenticated.middleware.js';
import requestValidationMiddleware from '@src/rest-resources/middlewares/requestValidation.middleware.js';
import {
  createBusinessSchema,
  updateMyBusinessSchema,
  createBusinessLinkSchema,
  deleteBusinessLinkSchema
} from '@src/json-schemas/businesses/business.schema.js';

const router = Router();

/**
 * @route   POST /api/v1/businesses
 * @desc    Create my business profile (onboarding) — attributes validated
 *          against the category's resolved form
 * @access  Private (write — transaction)
 */
router.post(
  '/',
  contextMiddleware(true),
  isUserAuthenticated(),
  requestValidationMiddleware(createBusinessSchema),
  asyncHandler(BusinessesController.create)
);

/**
 * @route   GET /api/v1/businesses/me
 * @desc    My business profile with links and category
 * @access  Private (read — no transaction)
 */
router.get(
  '/me',
  contextMiddleware(false),
  isUserAuthenticated(),
  asyncHandler(BusinessesController.getMine)
);

/**
 * @route   PATCH /api/v1/businesses/me
 * @desc    Update base columns and/or merge category attributes
 * @access  Private (write — transaction)
 */
router.patch(
  '/me',
  contextMiddleware(true),
  isUserAuthenticated(),
  requestValidationMiddleware(updateMyBusinessSchema),
  asyncHandler(BusinessesController.updateMine)
);

/**
 * @route   POST /api/v1/businesses/me/submit
 * @desc    Submit my draft for admin review (full validation enforced)
 * @access  Private (write — transaction)
 */
router.post(
  '/me/submit',
  contextMiddleware(true),
  isUserAuthenticated(),
  asyncHandler(BusinessesController.submitMine)
);

/**
 * @route   GET /api/v1/businesses/me/links
 * @desc    My linktree-style links, ordered
 * @access  Private (read — no transaction)
 */
router.get(
  '/me/links',
  contextMiddleware(false),
  isUserAuthenticated(),
  asyncHandler(BusinessesController.listMyLinks)
);

/**
 * @route   POST /api/v1/businesses/me/links
 * @desc    Add a link to my profile
 * @access  Private (write — transaction)
 */
router.post(
  '/me/links',
  contextMiddleware(true),
  isUserAuthenticated(),
  requestValidationMiddleware(createBusinessLinkSchema),
  asyncHandler(BusinessesController.createLink)
);

/**
 * @route   DELETE /api/v1/businesses/me/links/:id
 * @desc    Remove one of my links
 * @access  Private (write — transaction)
 */
router.delete(
  '/me/links/:id',
  contextMiddleware(true),
  isUserAuthenticated(),
  requestValidationMiddleware(deleteBusinessLinkSchema),
  asyncHandler(BusinessesController.deleteLink)
);

export default router;
