const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
const { connectToDB } = require("../utils/db.js");
const routes = require("./routes.js");
// import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
const cron = require("node-cron");

const port = process.env.PORT || 8000;

connectToDB();
const app = express();

// console.log('MONGO_URI:', process.env.MONGO_URI);

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "backend/config/config.env" });
}

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

// app.use(notFound);
// app.use(errorHandler);

const task = cron.schedule("32 0 * * 1", () => {
  console.log("task is running...")
}, {scheduled: false})

task.start();


app.listen(port, () => console.log(`server running on ${port}`));
