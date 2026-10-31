// src/rest-resources/routes/api/v1/categories.routes.js
import { Router } from 'express';
import CategoriesController from '@controllers/categories.controller.js';
import asyncHandler from '@src/utils/async-handler.js';
import contextMiddleware from '@src/rest-resources/middlewares/context.middleware.js';
import isUserAuthenticated from '@src/rest-resources/middlewares/isUserAuthenticated.middleware.js';
import requestValidationMiddleware from '@src/rest-resources/middlewares/requestValidation.middleware.js';
import {
  listCategoriesSchema,
  getCategoryFormSchema
} from '@src/json-schemas/categories/category.schema.js';

const router = Router();

/**
 * @route   GET /api/v1/categories?leavesOnly=true
 * @desc    Category tree for pickers (leaf list when leavesOnly=true)
 * @access  Private (read — no transaction)
 */
router.get(
  '/',
  contextMiddleware(false),
  isUserAuthenticated(),
  requestValidationMiddleware(listCategoriesSchema),
  asyncHandler(CategoriesController.list)
);

/**
 * @route   GET /api/v1/categories/:id/form
 * @desc    Resolved schema-driven form for the category (universal + inherited + own)
 * @access  Private (read — no transaction)
 */
router.get(
  '/:id/form',
  contextMiddleware(false),
  isUserAuthenticated(),
  requestValidationMiddleware(getCategoryFormSchema),
  asyncHandler(CategoriesController.getForm)
);

export default router;
