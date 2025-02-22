const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const session = require("express-session");
const lusca = require("lusca");
dotenv.config();

const postRoutes=require("../modules/activityFeed/routes/postRoutes.js")
// Load .env vars - move this to top


const { connectToDB } = require("../utils/db.js");
const routes = require("./routes.js");
const passport = require("passport");
// require("../utils/passportGoogle.js");

const port = process.env.PORT || 8000;

connectToDB();
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set true in production (HTTPS required)
      httpOnly: true,
      sameSite: "lax", // Adjust for frontend/backend communication
    },
  })
);
// app.use(lusca.csrf());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api", routes);


// app.use(notFound);
// app.use(errorHandler);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => console.log(`server running on ${port}`));