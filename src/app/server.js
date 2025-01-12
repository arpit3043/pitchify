const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
const { connectToDB } = require("../utils/db.js");
const routes = require("./routes.js");
const postRoutes=require("../modules/activityFeed/routes/postRoutes.js")
// import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const port = process.env.PORT || 8000;

connectToDB();
const app = express();

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "backend/config/config.env" });
}

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);
app.use("/api/", postRoutes);

// app.use(notFound);
// app.use(errorHandler);

app.listen(port, () => console.log(`server running on ${port}`));
