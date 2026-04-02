const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
} = require('../controllers/resourceController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Demo Mode: Allow all file types (images, pdfs, texts, etc.) to 
    // prevent blocking the user while testing the interface.
    return cb(null, true);
  },
});

router
  .route('/')
  .get(getResources)
  .post(protect, authorize('admin'), upload.single('file'), createResource);

router
  .route('/:id')
  .get(getResource)
  .put(protect, authorize('admin'), upload.single('file'), updateResource)
  .delete(protect, authorize('admin'), deleteResource);

router.get('/:id/download', downloadResource);

module.exports = router;
