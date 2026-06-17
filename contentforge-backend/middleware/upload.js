// backend/middleware/upload.js
// ─────────────────────────────────────────────────────────────────────────────
// Multer configuration for handling image uploads in the Poster Generator
// ─────────────────────────────────────────────────────────────────────────────

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Ensure upload directory exists (works on all OS) ─────────────────────────
const uploadDir = path.join(__dirname, "..", "uploads", "posters");

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`[Upload] Created directory: ${dirPath}`);
  }
}

// Create directory on module load
ensureDirExists(uploadDir);

// ── Storage configuration ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Double-check directory exists before each upload (safety net)
    ensureDirExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `poster-${uniqueSuffix}${ext}`);
  },
});

// ── File filter — images only ───────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      ),
      false,
    );
  }
};

// ── Multer instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1, // Only 1 image per request
  },
});

// ── Error handling wrapper ──────────────────────────────────────────────────
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field name. Use 'image' as the field name.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
}

module.exports = { upload, handleUploadError };