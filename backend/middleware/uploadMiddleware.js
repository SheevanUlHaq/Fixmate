import multer from "multer";

const storage = multer.memoryStorage();

const allowed = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG and WebP images are allowed"));
  }
  cb(null, true);
};

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single("image");
