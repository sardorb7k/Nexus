const multer = require("multer");
const path = require("path");

//Creating and set storage
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});

//Initilaize upload func
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

//Check file for image format
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|gif|webp|avif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("You can only upload image files");
  }
}

module.exports = { upload };
