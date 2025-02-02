const mongoose = require("mongoose");

const FounderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Founder = mongoose.model("Founder", FounderSchema);
module.exports = Founder;
