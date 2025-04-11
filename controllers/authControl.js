const { Users } = require("../models");
const bcrypt = require("bcryptjs");

// sign in page
const getSignInPage = async (req, res) => {
  try {
    res.render("auth/signin", { title: "Sign in" });
  } catch (err) {
    console.log(err);
  }
};

// sign in
const signIn = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const isEmail = emailOrUsername.includes("@");

    const user = await Users.findOne({
      where: isEmail
        ? { email: emailOrUsername }
        : { username: emailOrUsername },
    });

    if (!user) {
      req.flash("error", "Invalid credentials");
      req.flash("oldEmailOrUsername", emailOrUsername);
      return res.redirect("/auth/signin");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      req.flash("oldEmailOrUsername", emailOrUsername);
      return res.redirect("/auth/signin");
    }

    req.session.userId = user.id;
    res.redirect("/posts");
  } catch (err) {
    console.log(err);
    req.flash("error", "Server error");
    res.redirect("/auth/signin");
  }
};

// sign up page
const getSignUpPage = async (req, res) => {
  try {
    res.render("auth/signup", { title: "Sign up" });
  } catch (err) {
    console.log(err);
  }
};

// sign up
const signUp = async (req, res) => {
  try {
    const { email, password, username, password2 } = req.body;

    const isEmailAvailable = await Users.findOne({
      where: { email: email },
    });
    const isUsernameAvailable = await Users.findOne({
      where: { username: username },
    });

    if (isEmailAvailable || isUsernameAvailable) {
      req.flash(
        "error",
        "There is already an account with this email or username"
      );
      req.flash("oldEmail", email);
      req.flash("oldUsername", username);
      return res.redirect("/auth/signup");
    }

    if (password !== password2) {
      req.flash("error", "Passwords didn't match, make sure they are!");
      req.flash("oldEmail", email);
      req.flash("oldUsername", username);
      return res.redirect("/auth/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      email,
      password: hashedPassword,
      username,
    });

    res.redirect("/auth/signin");
  } catch (err) {
    console.log(err);
    req.flash("error", "Server error!");
    res.redirect("/auth/signup");
  }
};

// sign out
const signOut = (async = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/auth/signin");
  });
});

module.exports = { getSignInPage, signIn, getSignUpPage, signUp, signOut };
