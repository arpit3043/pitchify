const { Investor } = require("../models/investorModel");
const { User } = require("../../auth/models/userModel");


const { validateInvestorProfile } = require("../../../utils/validations");

const registerInvestor = async (req, res) => {
  console.log("registerInvestor");
  try {
    const validation = validateInvestorProfile(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }
    
    const { experience, minAmount, maxAmount, sectors, preferredInvestmentStages, geographicalFocus , portfolio} = req.body;
    
    let existingInvestor = await Investor.findOne({ userId: req.user._id });
    if (existingInvestor) {
      return res.status(400).json({
        success: false,
        message: "Investor profile already exists for this user",
        id: existingInvestor._id
      });
    }
    
    // Update user role
    await User.findByIdAndUpdate(
      req.user._id,
      { role: "investor" }
    );
    
    // Initialize with proper structure for file uploads
    const InvestorProfile = await Investor.create({
      userId: req.user._id,
      experience,
      investmentPreferences : {
        minAmount,
        maxAmount,
        sectors,
        preferredInvestmentStages
      },
      geographicalFocus,
      porfolio
    });
    
    res.status(201).json({
      success: true,
      message: "Investor profile created successfully",
      investor: InvestorProfile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getInvestorProfile = async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();
      
    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "Investor profile not found"
      });
    }
    // Transform the data to include only necessary fields
    const investorProfile = {
      id: investor._id,
      experience: investor.experience,
      investmentPreferences: investor.investmentPreferences,
      geographicalFocus: investor.geographicalFocus,
      portfolio: investor.portfolio,
      userId: investor.userId._id,
      userName: investor.userId.name,
      userEmail: investor.userId.email
    };

    res.status(200).json({
      success: true,
      data: investorProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateInvestorProfile = async (req, res) => {
  try {
    let investor = await Investor.findById(req.params.id)
      .populate('userId', 'name email');

    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "Investor profile not found"
      });
    }

    // Check if user owns this profile
    if (investor.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
      });
    }

    // Validate only the fields being updated
    const validation = validateInvestorProfile(req.body, true); // true flag for partial update
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }

    // Update only the provided fields
    investor = await Investor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Using $set to update only specified fields
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
        omitUndefined: true // Ignore undefined values
      }
    ).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: investor._id,
        startUpName: investor.startUpName,
        businessIdea: investor.businessIdea,
        traction: investor.traction,
        fundingNeeds: investor.fundingNeeds,
        projectPortfolio: investor.projectPortfolio,
        milestoneTracker: investor.milestoneTracker,
        userId: investor.userId._id,
        userName: investor.userId.name,
        userEmail: investor.userId.email,
        updatedAt: investor.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteInvestorProfile = async (req, res) => {
  try {
    const { deleteAccount } = req.body;
    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "Investor profile not found"
      });
    }

    // Check if user owns this profile
    if (investor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own profile"
      });
    }

    // Delete the investor profile
    await investor.deleteOne();

    // If user wants to delete their account too
    if (deleteAccount) {
      await User.findByIdAndDelete(investor.userId);
      // Clear auth cookie since account is deleted
      res.clearCookie("token");
      
      return res.status(200).json({
        success: true,
        message: "Profile and account deleted successfully"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Investor profile deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {registerInvestor, updateInvestorProfile, deleteInvestorProfile, getInvestorProfile}
