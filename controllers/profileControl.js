const { Users } = require("../models");
const formatDate = require("../utils/formateDate");
const path = require("path");
const fs = require("fs");

const myProfile = async (req, res) => {
  const user = await Users.findOne({ where: { id: req.session.userId } });

  if (!user) {
    return res.status(404).render("notFound", { title: "User Not Found" });
  }

  res.render("profiles/profile", {
    title: `${user.username}'s Profile`,
    user,
    formatDate,
    isMe: true,
  });
};

// Profile page with user data
const profilePage = async (req, res) => {
  const user = await Users.findOne({ where: { id: req.params.id } });

  if (!user) {
    return res.status(404).render("notFound", { title: "User Not Found" });
  }

  res.render("profiles/profile", {
    title: `${user.username}'s Profile`,
    user,
    formatDate,
    isMe: user.id === req.session.userId,
  });
};

// Update profile logic
const updateProfile = async (req, res) => {
  const user = await Users.findOne({ where: { id: req.params.id } });

  const { username } = req.body;
  let profilePicture = user.profilePicture;

  if (user.username != username) {
    const isUsernameAvailable = await Users.findOne({
      where: { username: username },
    });
    if (isUsernameAvailable) {
      req.flash("error", "There is already an account with this username");
      return res.redirect(`/profiles/${user.id}`);
    }
  }

  if (req.file) {
    if (profilePicture && profilePicture !== "/images/default-avatar.png") {
      const oldPicPath = path.join(__dirname, "..", "public", profilePicture);
      fs.unlinkSync(oldPicPath); // Delete the old profile picture from the server
    }

    profilePicture = `/uploads/${req.file.filename}`; // Save the new profile picture path
  }

  try {
    await Users.update(
      { username, profilePicture },
      { where: { id: user.id } }
    );

    res.redirect(`/profiles/${user.id}`); // Redirect to the updated profile page
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile.");
  }
};

module.exports = { profilePage, updateProfile, myProfile };
