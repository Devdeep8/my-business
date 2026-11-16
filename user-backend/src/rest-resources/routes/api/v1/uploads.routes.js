// src/rest-resources/routes/api/v1/uploads.routes.js
import { Router } from 'express';
import { UploadsController, uploadImageFile } from '@controllers/uploads.controller.js';
import asyncHandler from '@src/utils/async-handler.js';
import contextMiddleware from '@src/rest-resources/middlewares/context.middleware.js';
import isUserAuthenticated from '@src/rest-resources/middlewares/isUserAuthenticated.middleware.js';

const router = Router();

/**
 * @route   POST /api/v1/uploads/images
 * @desc    Upload an image to Cloudinary (multipart "file", max 5MB, jpg/png/webp)
 * @access  Private (signed-in business owner)
 */
router.post(
  '/images',
  contextMiddleware(false),
  isUserAuthenticated(),
  uploadImageFile,
  asyncHandler(UploadsController.uploadImage)
);

export default router;
