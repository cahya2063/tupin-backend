import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photos") {
      cb(null, "uploads/jobs");
    } else if (file.fieldname === "avatar") {
      cb(null, "uploads/profile");
    } else {
      cb(null, "uploads/others");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    files: 10, // maksimal 10 file
  },
});

export default upload;