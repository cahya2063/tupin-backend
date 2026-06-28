import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photos") {
      cb(null, "uploads/jobs");
    } else if (file.fieldname === "avatar") {
      cb(null, "uploads/profile");
    }else if(file.fieldname === 'evidence'){
      cb(null, "uploads/evidence");
    }else if(file.fieldname === 'reports'){
      cb(null, "uploads/reports");
    }else if(file.fieldname === 'images' || file.fieldname === 'chat'){
      cb(null, "uploads/chat");
    }else if(file.fieldname == 'ktp'){
      cb(null, 'uploads/technician-documents/identity-card')
    }else if(file.fieldname == 'selfie'){
      cb(null, 'uploads/technician-documents/selfie-with-identity-card')
    }else if(file.fieldname == 'cv'){
      cb(null, 'uploads/technician-documents/cv')
    }
    else {
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