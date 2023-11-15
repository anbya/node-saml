const moment = require("moment");
const multer = require("multer");

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.includes("image/svg")) {
    cb(null, true);
  } else {
    cb("Invalid file type. SVG files are not allowed", false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/");
  },
  filename: (req, file, cb) => {
    const uploadDateTime = moment(new Date()).format("YYYYMMDDHHmmss");
    cb(null, uploadDateTime + "_" + file.originalname.replace(/\s/g, "_"));
  },
  limits: {
    fileSize: 7340032,
  },
});

const upload = multer({
  storage:storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 7340032,
  },
})

module.exports = upload;
