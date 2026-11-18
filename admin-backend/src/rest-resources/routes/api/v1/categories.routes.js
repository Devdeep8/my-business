import { Router } from 'express';
import CategoriesController from '@controllers/categories.controller.js';
import asyncHandler from '@src/utils/async-handler.js';
import contextMiddleware from '@src/rest-resources/middlewares/context.middleware.js';
import isAdminAuthenticated from '@src/rest-resources/middlewares/isAdminAuthenticated.middleware.js';
import requestValidationMiddleware from '@src/rest-resources/middlewares/requestValidation.middleware.js';
import { createCategorySchema } from '@src/json-schemas/categories/category.schema.js';

const router = Router();

router.get(
  '/',
  contextMiddleware(),
  isAdminAuthenticated(),
  asyncHandler(CategoriesController.list)
);

router.post(
  '/',
  contextMiddleware(true),
  isAdminAuthenticated(),
  requestValidationMiddleware(createCategorySchema),
  asyncHandler(CategoriesController.create)
);

export default router;
