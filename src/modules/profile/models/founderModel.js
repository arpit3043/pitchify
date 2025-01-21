const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  url: { type: String },
  publicId: { type: String },
  fileType: { type: String }
});

const FounderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startUpName: { type: String, required: true },
    businessIdea: {
      problemStatement: { type: String },
      uniqueValueProposition: { type: String },
      businessModel: { type: String },
      marketPotential: { type: String },
      growthProjections: { type: String }
    },
    traction: {
      userBase: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      partnerships: { type: String },
      testimonials: [{ type: String }]
    },
    fundingNeeds: {
      amount: { type: Number },
      usagePlan: { type: String }
    },
    location: {type : String},
    industry: { type : String},
    projectPortfolio: {
      pitchDeck: FileSchema,
      productDemos: [FileSchema],
      multimedia: [FileSchema]
    },
    milestoneTracker: [
      {
        milestoneName: { type: String },
        dateAchieved: { type: Date },
        description: { type: String }
      }
    ]
  },
  { timestamps: true }
);

const Founder = mongoose.model("Founder", FounderSchema);

module.exports = { Founder };
