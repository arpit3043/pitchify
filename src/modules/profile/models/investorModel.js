// const mongoose = require("mongoose");

// const InvestorSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     experience: { type: String },
//     sectorsOfInterest: [{ type: String }], // Array of sectors like tech, healthcare, etc.
//     preferredInvestmentStages: [{ type: String }], // E.g., 'seed', 'series A'
//     investmentPreferences: {
//       industries: [{ type: String }], // Array of industries the investor prefers
//       fundingRange: { type: String }, // E.g., '50K-500K'
//       geographicalFocus: [{ type: String }], // Array of regions or countries
//     },
//     //Use for the analytics dashboard
//     // investmentDashboard: [
//     //   {
//     //     startupId: { type: mongoose.Schema.Types.ObjectId, ref: "Startup" },
//     //     notes: { type: String },
//     //     savedPitches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pitch" }],
//     //   },
//     // ],
//     // portfolioShowcases: [
//     //   {
//     //     startupId: { type: mongoose.Schema.Types.ObjectId, ref: "Startup" },
//     //     description: { type: String },
//     //   },
//     // ],
//   },
//   {
//     timestamps: true,
//   }
// );

// // FounderSchema.pre("save", async function (next) {
// //   if (this.isModified("password")) {
// //     this.password = await bcrypt.hash(this.password, 10);
// //   }
// //   next();
// // });

// // // generating the token to be saved on the client
// // FounderSchema.methods.generateToken = async function () {
// //   return jwt.sign({ id: this._id }, process.env.SECRET_KEY);
// // };

// // FounderSchema.methods.matchPassword = async function (enteredPassword) {
// //   return bcrypt.compare(enteredPassword, this.password);
// // };

// const Investor = mongoose.model("Investor", InvestorSchema);

// module.exports = { Investor };
