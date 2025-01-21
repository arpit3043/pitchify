const mongoose = require("mongoose");

const InvestorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    experience: { type: String },
    investmentPreferences: { 
        minAmount : {type : Number},// E.g., 50K-500K
        maxAmount : {type : Number},
        sectors: [{ type: String }],// Array of industries the investor prefers
        preferredInvestmentStages: {
          type: String,
          enum: ["Bootstrapping", "Pre-Seed", "Seed", "Series A" , "Series B", "Series C", "IPO"]
        }
    }, 
    geographicalFocus: [{ type: String }], // Array of regions or countries
    portfolio : {
     type: mongoose.Schema.Types.ObjectId,
      ref : "Porfolio"
    },
  },
  {
    timestamps: true,
  }
);

const Investor = mongoose.model("Investor", InvestorSchema);

module.exports = { Investor };
