// PublicController: unauthenticated directory endpoints for external apps.
import { sendResponse } from '@src/helpers/response.helpers.js';
import {
  ListPublicBusinessesHandler,
  GetPublicBusinessHandler
} from '@src/services/public/publicBusiness.handler.js';

class PublicController {
  /** GET /api/v1/public/businesses — paginated published business directory */
  static async listBusinesses(req, res, next) {
    const result = await ListPublicBusinessesHandler.execute({ ...req.query }, req.context);
    sendResponse({ req, res, next }, result, 'Businesses retrieved successfully');
  }

  /** GET /api/v1/public/businesses/:slug — one published business with links */
  static async getBusiness(req, res, next) {
    const result = await GetPublicBusinessHandler.execute({ ...req.params }, req.context);
    sendResponse({ req, res, next }, result, 'Business retrieved successfully');
  }
}

export default PublicController;
