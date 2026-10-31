// CategoriesController: category endpoints, delegates business logic to handlers
import { sendResponse } from '@src/helpers/response.helpers.js';
import {
  ListCategoriesHandler,
  GetCategoryFormHandler
} from '@src/services/categories/category.handler.js';

class CategoriesController {
  /** GET /api/v1/categories?leavesOnly= — tree (or flat leaf list) for the picker */
  static async list(req, res, next) {
    const result = await ListCategoriesHandler.execute({ ...req.query }, req.context);
    sendResponse({ req, res, next }, result, 'Categories retrieved successfully');
  }

  /** GET /api/v1/categories/:id/form — resolved schema-driven form for onboarding */
  static async getForm(req, res, next) {
    const result = await GetCategoryFormHandler.execute({ ...req.params }, req.context);
    sendResponse({ req, res, next }, result, 'Category form retrieved successfully');
  }
}

export default CategoriesController;
