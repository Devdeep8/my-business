// BusinessesController: admin business-profile endpoints (submissions queue)
import { sendResponse } from '@src/helpers/response.helpers.js';
import {
  ListBusinessesHandler,
  GetBusinessHandler,
  ApproveBusinessHandler,
  RejectBusinessHandler
} from '@src/services/businesses/business.handler.js';

class BusinessesController {
  /** GET /api/v1/businesses?status=&categoryId=&q= — queue + index */
  static async list(req, res, next) {
    const result = await ListBusinessesHandler.execute({ ...req.query }, req.context);
    sendResponse({ req, res, next }, result, 'Businesses retrieved successfully');
  }

  /** GET /api/v1/businesses/:id — full review detail */
  static async getOne(req, res, next) {
    const result = await GetBusinessHandler.execute({ ...req.params }, req.context);
    sendResponse({ req, res, next }, result, 'Business retrieved successfully');
  }

  /** POST /api/v1/businesses/:id/approve — publish */
  static async approve(req, res, next) {
    const result = await ApproveBusinessHandler.execute({ ...req.params }, req.context);
    sendResponse({ req, res, next }, result, 'Business approved and published');
  }

  /** POST /api/v1/businesses/:id/reject — reject with a reason for the owner */
  static async reject(req, res, next) {
    const result = await RejectBusinessHandler.execute({ ...req.params, ...req.body }, req.context);
    sendResponse({ req, res, next }, result, 'Business rejected');
  }
}

export default BusinessesController;
