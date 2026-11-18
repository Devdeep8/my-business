import { sendResponse } from '@src/helpers/response.helpers.js';
import {
  CreateCategoryHandler,
  ListCategoriesHandler,
  ListCategoryFieldsHandler,
  CreateCategoryFieldHandler,
  UpdateCategoryFieldHandler,
  DeleteCategoryFieldHandler
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

  static async listFields(req, res, next) {
    const result = await ListCategoryFieldsHandler.execute({ categoryId: req.params.id }, req.context);
    sendResponse({ req, res, next }, result, 'Category fields retrieved successfully');
  }

  static async createField(req, res, next) {
    const result = await CreateCategoryFieldHandler.execute({ categoryId: req.params.id, ...req.body }, req.context);
    sendResponse({ req, res, next }, result, 'Category field created successfully');
  }

  static async updateField(req, res, next) {
    const result = await UpdateCategoryFieldHandler.execute({ id: req.params.id, ...req.body }, req.context);
    sendResponse({ req, res, next }, result, 'Category field updated successfully');
  }

  static async deleteField(req, res, next) {
    const result = await DeleteCategoryFieldHandler.execute({ id: req.params.id }, req.context);
    sendResponse({ req, res, next }, result, 'Category field deleted successfully');
  }
}

export default CategoriesController;
