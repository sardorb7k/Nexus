const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const {
  getSignInPage,
  signIn,
  getSignUpPage,
  signUp,
  signOut,
} = require("../controllers/authControl");
const {
  isAuthenticated,
  isNotAuthenticated,
} = require("../middlewares/auth.middleware");

const router = Router();

// Sign-in validation
const signInValidation = [
  check("emailOrUsername")
    .notEmpty()
    .withMessage("Email or Username is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

// Sign-up validation
const signUpValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check("password2")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords don't match"),
  check("username").notEmpty().withMessage("Username is required"),
];

// Error handling middleware for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "error",
      errors
        .array()
        .map((err) => err.msg)
        .join(", ")
    );
    return res.redirect(req.originalUrl);
  }
  next();
};

// Sign-in routes with validation
router.get("/signin", isNotAuthenticated, getSignInPage);
router.post(
  "/signin",
  isNotAuthenticated,
  signInValidation,
  handleValidationErrors,
  signIn
);

// Sign-up routes with validation
router.get("/signup", isNotAuthenticated, getSignUpPage);
router.post(
  "/signup",
  isNotAuthenticated,
  signUpValidation,
  handleValidationErrors,
  signUp
);

// Sign-out route
router.post("/signout", isAuthenticated, signOut);

module.exports = router;
