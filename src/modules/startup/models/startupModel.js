const mongoose = require("mongoose");

const StartUpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    startupName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    industry: {
        type: String,
        index: true, // Indexed for search
    },
    stage: {
        type: String,
        enum: ["seed", "series A", "growth"],
        required: true,
    },
    websiteUrl: {
        type: String,
    },
    location: {
        type: String,
    },
    fundingNeeds: {
        amount: { type: Number },
        usagePlan: { type: String }
    },
    trendingScores: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

//creating a text index on name & industry for searching
StartUpSchema.index({startupName: 'text', industry: 'text'});

module.exports = mongoose.model('Startup', StartUpSchema);