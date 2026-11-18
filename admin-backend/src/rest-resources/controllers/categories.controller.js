import { sendResponse } from '@src/helpers/response.helpers.js';
import {
  CreateCategoryHandler,
  ListCategoriesHandler
} from '@src/services/categories/category.handler.js';

class CategoriesController {
  static async list(req, res, next) {
    const result = await ListCategoriesHandler.execute({}, req.context);
    sendResponse({ req, res, next }, result, 'Categories retrieved successfully');
  }

  static async create(req, res, next) {
    const result = await CreateCategoryHandler.execute({ ...req.body }, req.context);
    sendResponse({ req, res, next }, result, 'Category created successfully');
  }
}

export default CategoriesController;
