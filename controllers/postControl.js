const { Posts, Comments, Users } = require("../models");
const formatDate = require("../utils/formateDate");

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Number of posts per page
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Posts.findAndCountAll({
      include: [{ model: Users, as: "user" }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    // Create a list of page numbers to display (show a range around the current page)
    const pageNumbers = [];
    const range = 2; // Range of pages to show around the current page

    for (
      let i = Math.max(1, page - range);
      i <= Math.min(totalPages, page + range);
      i++
    ) {
      pageNumbers.push(i);
    }

    res.render("posts/posts", {
      title: "Posts",
      posts,
      activeRoute: "/posts",
      isMyPosts: false,
      currentPage: page,
      totalPages,
      pageNumbers, // Pass the range of pages
    });
  } catch (err) {
    console.log(err);
  }
};

// Get my posts
const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Number of posts per page
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Posts.findAndCountAll({
      where: { userId: req.session.userId },
      include: [{ model: Users, as: "user" }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    // Create a list of page numbers to display (show a range around the current page)
    const pageNumbers = [];
    const range = 2; // Range of pages to show around the current page

    for (
      let i = Math.max(1, page - range);
      i <= Math.min(totalPages, page + range);
      i++
    ) {
      pageNumbers.push(i);
    }

    res.render("posts/posts", {
      title: "My posts",
      posts: posts || [], // Ensure posts is always an array
      activeRoute: "/posts/me",
      isMyPosts: true,
      currentPage: page,
      totalPages,
      pageNumbers,
    });
  } catch (err) {
    console.log(err);
  }
};

// post adding page
const addPostPage = (req, res) => {
  res.render("posts/addPost", {
    title: "Add new post",
    activeRoute: "/posts/add",
  });
};

// post adding
const addPost = async (req, res) => {
  const { title, content } = req.body;

  const userId = req.session.userId;
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    await Posts.create({ title, content, imageUrl, userId });
    res.redirect("/posts/me");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error adding post");
    req.flash("oldTitle", title);
    req.flash("oldContent", content);
    res.redirect("/posts/add");
  }
};

// Get single post
const getSinglePost = async (req, res) => {
  try {
    const post = await Posts.findByPk(req.params.id, {
      include: [
        {
          model: Comments,
          as: "comments",
          include: [{ model: Users, as: "user" }],
        },
        { model: Users, as: "user" },
      ],
    });

    if (!post)
      return res.status(404).render("notFound", { title: "Post not found" });

    post.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.render("posts/dynamicPost", {
      title: post.title,
      post: post.toJSON(),
      formatDate,
      isMyPosts: req.session.userId == post.userId,
    });
  } catch (err) {
    console.error(err);
    res.status(404).render("notFound", { title: "Post not found" });
  }
};

// Post editing page
const editPostPage = async (req, res) => {
  try {
    const post = await Posts.findByPk(req.params.id);
    if (!post)
      return res.status(404).render("notFound", { title: "Post not found" });

    res.render("posts/editPost", { title: "Edit post", post });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
};

// edit post
const editPost = async (req, res) => {
  const { title, content } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const post = await Posts.findByPk(req.params.id);

    if (!post) {
      return res.status(404).render("notFound", { title: "Post not found" });
    }

    await Posts.update(
      { title, content, imageUrl },
      { where: { id: req.params.id } }
    );

    res.redirect("/posts/me");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error editing post");
    req.flash("oldTitle", title);
    req.flash("oldContent", content);
    req.flash("oldImageUrl", imageUrl);
    res.redirect(`/posts/edit/${req.params.id}`);
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    await Posts.destroy({ where: { id: req.params.id } });
    res.redirect("/posts/me");
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error deleting post" });
  }
};

// Comment post
const commentPost = async (req, res) => {
  try {
    await Comments.create({
      comment: req.body.comment,
      postId: req.params.id,
      userId: req.session.userId,
    });
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error commenting post" });
  }
};

module.exports = {
  getMyPosts,
  addPostPage,
  addPost,
  getSinglePost,
  editPostPage,
  editPost,
  deletePost,
  commentPost,
  getAllPosts,
};
