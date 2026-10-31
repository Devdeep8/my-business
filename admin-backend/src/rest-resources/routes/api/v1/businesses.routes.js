// src/rest-resources/routes/api/v1/businesses.routes.js
import { Router } from 'express';
import BusinessesController from '@controllers/businesses.controller.js';
import asyncHandler from '@src/utils/async-handler.js';
import contextMiddleware from '@src/rest-resources/middlewares/context.middleware.js';
import isAdminAuthenticated from '@src/rest-resources/middlewares/isAdminAuthenticated.middleware.js';
import requestValidationMiddleware from '@src/rest-resources/middlewares/requestValidation.middleware.js';
import {
  listBusinessesSchema,
  getBusinessSchema,
  rejectBusinessSchema
} from '@src/json-schemas/businesses/business.schema.js';

const router = Router();

/**
 * @route   GET /api/v1/businesses?status=pending_review
 * @desc    Submissions queue / business index (filter by status, category, search)
 * @access  Private (Admin)
 */
router.get(
  '/',
  contextMiddleware(),
  isAdminAuthenticated(),
  requestValidationMiddleware(listBusinessesSchema),
  asyncHandler(BusinessesController.list)
);

/**
 * @route   GET /api/v1/businesses/:id
 * @desc    Full submission detail for the review screen
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  contextMiddleware(),
  isAdminAuthenticated(),
  requestValidationMiddleware(getBusinessSchema),
  asyncHandler(BusinessesController.getOne)
);

/**
 * @route   POST /api/v1/businesses/:id/approve
 * @desc    Approve a submission and publish the profile
 * @access  Private (Admin)
 */
router.post(
  '/:id/approve',
  contextMiddleware(true),
  isAdminAuthenticated(),
  requestValidationMiddleware(getBusinessSchema),
  asyncHandler(BusinessesController.approve)
);

/**
 * @route   POST /api/v1/businesses/:id/reject
 * @desc    Reject a submission with a reason shown to the owner
 * @access  Private (Admin)
 */
router.post(
  '/:id/reject',
  contextMiddleware(true),
  isAdminAuthenticated(),
  requestValidationMiddleware(rejectBusinessSchema),
  asyncHandler(BusinessesController.reject)
);

export default router;
