const { Router } = require("express");
const {
  profilePage,
  updateProfile,
  myProfile,
} = require("../controllers/profileControl");
const { upload } = require("../utils/multer");

const router = Router();

// Route single profile
router.get("/me", myProfile);
router.get("/:id", profilePage);
router.post("/:id", upload.single("profilePicture"), updateProfile);

module.exports = router;
