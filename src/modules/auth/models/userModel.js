const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      required: function () {
        return this.googleId;
      },
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false,
    },
    role: {
      type: String,
      enum: ["founder", "investor", "enthusiast"],
    },
    title: {
      type: String,
    },
    about: {
      type: String,
    },
    socialLinks:{
      twitter : {
        type:String,
      },
      linkedin : {
        type:String,
      },
      github : {
        type:String,
      },
      website : {
        type:String,
      },
    },
    profileImg: {
      type:String,
      default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOtu74pEiq7ofeQeTsco0migV16zZoBwSlGg&s"
    },
    coverImg:{
      type:String,
      default:"https://images.unsplash.com/photo-1579547945413-497e1b99dac0?auto=format&fit=crop&w=2000"
    },
    posts: [
      {
        type: String,
        ref: "Post",
      },
    ],
    following: [
      {
        type: String,
        ref: "User",
      },
    ],
    followers: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// generating the token to be saved on the client
userSchema.methods.generateToken = async function () {
  const payload = {
    id: this._id,
    role: this.role,
  };
  return jwt.sign(payload, process.env.SECRET_KEY);
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
