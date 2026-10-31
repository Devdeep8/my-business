// BusinessesController: business profile endpoints for the signed-in owner
import { sendResponse } from '@src/helpers/response.helpers.js';
import {
  CreateBusinessHandler,
  GetMyBusinessHandler,
  UpdateMyBusinessHandler,
  SubmitMyBusinessHandler,
  ListMyBusinessLinksHandler,
  CreateBusinessLinkHandler,
  DeleteBusinessLinkHandler
} from '@src/services/businesses/business.handler.js';

class BusinessesController {
  /** POST /api/v1/businesses — create my business (onboarding) */
  static async create(req, res, next) {
    const result = await CreateBusinessHandler.execute({ ...req.body }, req.context);
    sendResponse({ req, res, next }, result, 'Business created successfully');
  }

  /** GET /api/v1/businesses/me — my business profile with links and category */
  static async getMine(req, res, next) {
    const result = await GetMyBusinessHandler.execute({}, req.context);
    sendResponse({ req, res, next }, result, 'Business retrieved successfully');
  }

  /** PATCH /api/v1/businesses/me — update base columns and/or merge attributes */
  static async updateMine(req, res, next) {
    const result = await UpdateMyBusinessHandler.execute({ ...req.body }, req.context);
    sendResponse({ req, res, next }, result, 'Business updated successfully');
  }

  /** POST /api/v1/businesses/me/submit — send draft to admin review */
  static async submitMine(req, res, next) {
    const result = await SubmitMyBusinessHandler.execute({}, req.context);
    sendResponse({ req, res, next }, result, 'Business submitted for review');
  }

  /** GET /api/v1/businesses/me/links — my linktree-style links */
  static async listMyLinks(req, res, next) {
    const result = await ListMyBusinessLinksHandler.execute({}, req.context);
    sendResponse({ req, res, next }, result, 'Links retrieved successfully');
  }

  /** POST /api/v1/businesses/me/links — add a link */
  static async createLink(req, res, next) {
    const result = await CreateBusinessLinkHandler.execute({ ...req.body }, req.context);
    sendResponse({ req, res, next }, result, 'Link added successfully');
  }

  /** DELETE /api/v1/businesses/me/links/:id — remove a link */
  static async deleteLink(req, res, next) {
    const result = await DeleteBusinessLinkHandler.execute({ ...req.params }, req.context);
    sendResponse({ req, res, next }, result, 'Link deleted successfully');
  }
}

export default BusinessesController;
