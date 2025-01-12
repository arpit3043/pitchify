const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const postRoutes=require("../modules/activityFeed/routes/postRoutes.js")
// Load env vars - move this to top
dotenv.config({ path: "./.env" });

const { connectToDB } = require("../utils/db.js");
const routes = require("./routes.js");

const port = process.env.PORT || 8000;

// Verify MONGO_URI is loaded
console.log('MONGO_URI:', process.env.MONGO_URI); // For debugging

connectToDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);
app.use("/api/", postRoutes);

// app.use(notFound);
// app.use(errorHandler);

app.listen(port, () => console.log(`server running on ${port}`));
