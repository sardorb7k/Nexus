const express = require("express");
const app = express();
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const session = require("express-session");
const { isAuthenticated } = require("./middlewares/auth.middleware");
const pgSession = require("connect-pg-simple")(session);
const csrf = require("csrf");
const flash = require("connect-flash");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config(); // Load environment variables

const port = process.env.PORT || 5000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
  session({
    store: new pgSession({
      conObject: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      },
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Flash messages
app.use(flash());

app.set("view engine", "ejs"); // Use EJS for templating
app.use(expressLayouts); // Enable layouts
app.use(express.static("public")); // Serve static files
app.set("layout", "layout");

// Middleware to set up CSRF protection
const tokens = new csrf();

// Set variables in locals
app.use((req, res, next) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync();
  }

  res.locals.isAuthenticated = req.session.userId ? true : false;
  res.locals.csrfToken = tokens.create(req.session.csrfSecret);
  res.locals.alerts = req.flash();
  res.locals.needPagination = req.query.page ? true : false;

  next();
});

// Routes
app.use("/posts", isAuthenticated, postRoutes);
app.use("/auth", authRoutes);
app.use("/profiles", isAuthenticated, profileRoutes);
app.get("/", (req, res) => {
  res.redirect("/posts");
});
app.get("*", (req, res) => {
  res.status(404).render("notFound", { title: "Page Not Found" });
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
