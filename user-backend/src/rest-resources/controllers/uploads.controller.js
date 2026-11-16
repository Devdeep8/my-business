// src/rest-resources/controllers/uploads.controller.js
// UploadsController: owner-facing image upload endpoint, delegates to the
// Cloudinary service. Mirrors admin-backend's uploads controller.
import multer from 'multer';
import { sendResponse } from '@src/helpers/response.helpers.js';
import { AppError } from '@src/errors/app.error.js';
import cloudinaryService, { IMAGE_RULES } from '@src/utils/cloudinary.service.js';

// In-memory storage — the buffer goes straight to Cloudinary, nothing on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMAGE_RULES.MAX_SIZE_BYTES,
    files: 1
  },
  fileFilter: (_, file, cb) => {
    if (IMAGE_RULES.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(AppError.badRequest('Only JPG, PNG and WebP images are allowed'));
  }
});

/**
 * Multer wrapper that converts MulterErrors into clean AppErrors
 * (e.g. "Image must be 5MB or smaller" instead of a 500).
 */
const uploadImageFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5MB or smaller'
        : `Upload failed: ${error.message}`;
      return next(AppError.badRequest(message));
    }
    next(error);
  });
};

class UploadsController {
  /**
   * POST /api/v1/uploads/images
   * Multipart "file" field. Any signed-in business owner.
   */
  static async uploadImage(req, res, next) {
    if (!req.file) {
      return next(AppError.badRequest('No image file provided (use field "file")'));
    }

    const result = await cloudinaryService.uploadImage({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
      folder: `${IMAGE_RULES.DEFAULT_FOLDER}/${req.context.userId}`
    });

    sendResponse({ req, res, next }, result, 'Image uploaded successfully');
  }
}

export { UploadsController, uploadImageFile };
export default UploadsController;
