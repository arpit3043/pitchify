const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  employmentType: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  locationType: {
    type: String,
    enum: ["Remote", "On-site", "Hybrid"],
    required: true,
  },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
});

// Automatically set `isCurrent` based on `endDate`
experienceSchema.pre("save", function (next) {
  this.isCurrent = !this.endDate || this.endDate > new Date();
  next();
});

// Ensure `endDate` is after `startDate`
experienceSchema.path("endDate").validate(function (value) {
  return !value || value > this.startDate;
}, "End date must be after start date.");

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  organization: { type: String },
  isAward: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      required: function () {
        return !this.password;
      },
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false,
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    userType: {
      type: String,
      enum: ["founder", "investor", "enthusiast"],
      default: "enthusiast",
    },
    title: { type: String, maxLength: 220, trim: true },
    about: { type: String, maxLength: 1200, trim: true },
    interests: { type: [String], default: [] },
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
      website: String,
    },
    status: {
      type: String,
      enum: ["active", "deactivated", "banned"],
      default: "active",
    },
    profileImg: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOtu74pEiq7ofeQeTsco0migV16zZoBwSlGg&s",
    },
    coverImg: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&w=2000",
    },
    experience: [experienceSchema],
    achievements: [achievementSchema],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
      //list of accepted connections
      connections: [{
        type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      }]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Generate JWT token
userSchema.methods.generateToken = async function () {
  const payload = { id: this._id, role: this.role };
  return jwt.sign(payload, process.env.SECRET_KEY || "fallback_secret");
};

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
