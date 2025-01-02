const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const FounderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startUpName: { trpe: String },
    businessIdea: {
      problemStatement: { type: String },
      uniqueValueProposition: { type: String },
      businessModel: { type: String },
      marketPotential: { type: String },
      growthProjections: { type: String },
    },
    traction: {
      userBase: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      partnerships: { type: String },
      testimonials: [{ type: String }],
    },
    fundingNeeds: {
      amount: { type: Number },
      usagePlan: { type: String },
    },
    projectPortfolio: {
      pitchDeck: { type: String }, // URL to pitch deck file
      productDemos: [{ type: String }], // URLs to product demo videos or files
      multimedia: [{ type: String }], // Other media such as images, videos, etc.
    },
    milestoneTracker: [
      {
        milestoneName: { type: String },
        dateAchieved: { type: Date },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// FounderSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // generating the token to be saved on the client
// FounderSchema.methods.generateToken = async function () {
//   return jwt.sign({ id: this._id }, process.env.SECRET_KEY);
// };

// FounderSchema.methods.matchPassword = async function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

const Founder = mongoose.model("Founder", FounderSchema);

module.exports = { Founder };
