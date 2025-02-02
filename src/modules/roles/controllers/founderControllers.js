const Founder = require("../models/founderModel");

// Create a new Founder
exports.createFounder = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newFounder = new Founder({ name, email, password });
        await newFounder.save();
        res.status(201).json({ message: "Founder created successfully!", founder: newFounder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all Founders
exports.getFounders = async (req, res) => {
    try {
        const founders = await Founder.find();
        res.status(200).json(founders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Founder by ID
exports.getFounderById = async (req, res) => {
    try {
        const founder = await Founder.findById(req.params.id);
        if (!founder) return res.status(404).json({ message: "Founder not found" });
        res.status(200).json(founder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Founder
exports.deleteFounder = async (req, res) => {
    try {
        await Founder.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Founder deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
