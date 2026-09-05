const multer = require("multer");
const path = require("path");
const convertHeic = require("heic-convert");

const heicMimeTypes = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];
const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", ...heicMimeTypes];
const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isSupported = supportedMimeTypes.includes(file.mimetype)
    || supportedExtensions.includes(extension);

  if (isSupported) {
    cb(null, true);
  } else {
    const error = new Error("Only JPG, JPEG, PNG, WEBP, HEIC and HEIF images are allowed");
    error.code = "UNSUPPORTED_IMAGE_TYPE";
    cb(error);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const isHeicFile = (file) =>
  heicMimeTypes.includes(file.mimetype) || [".heic", ".heif"].includes(path.extname(file.originalname).toLowerCase());

const prepareImageBuffer = async (file) => {
  if (!isHeicFile(file)) {
    return file.buffer;
  }

  try {
    return await convertHeic({
      buffer: file.buffer,
      format: "JPEG",
      quality: 0.9,
    });
  } catch (error) {
    const conversionError = new Error("The HEIC/HEIF image could not be processed. Please choose a valid image.");
    conversionError.code = "IMAGE_CONVERSION_FAILED";
    throw conversionError;
  }
};

module.exports = upload;
module.exports.prepareImageBuffer = prepareImageBuffer;