const { Router } = require("express");
const {
  getMyPosts,
  addPostPage,
  addPost,
  getSinglePost,
  editPostPage,
  editPost,
  deletePost,
  commentPost,
  getAllPosts,
} = require("../controllers/postControl");
const { upload } = require("../utils/multer");

const router = Router();

// Route user posts
router.get("/", getAllPosts);
router.get("/me", getMyPosts);

// Route adding post
router.get("/add", addPostPage);
router.post("/add", upload.single("imageUrl"), addPost);

// Route single post
router.get("/:id", getSinglePost);

// Route editing post
router.get("/edit/:id", editPostPage);
router.post("/edit/:id", upload.single("imageUrl"), editPost);

// Route deleting post
router.post("/delete/:id", deletePost);

// Route commenting post
router.post("/comment/:id", commentPost);

module.exports = router;
