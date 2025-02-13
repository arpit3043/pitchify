const { Founder } = require("../models/founderModel");
const { User } = require("../../auth/models/userModel");
const { validateFounderProfile } = require("../../../utils/validations");
const { cloudinary } = require('../../../utils/uploadConfig');
const {validationMessage} = require("../../../utils/messages");

const registerFounder = async (req, res) => {
  try {
    const validation = validateFounderProfile(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
        errors: validation.errors
      });
    }
    
    const { startUpName, businessIdea, traction, fundingNeeds } = req.body;
    
    let existingFounder = await Founder.findOne({ userId: req.user._id });
    if (existingFounder) {
      return res.status(400).json({
        success: false,
        message: "Founder profile already exists for this user",
        id: existingFounder._id
      });
    }
    
    // Update user role
    await User.findByIdAndUpdate(
      req.user._id,
      { role: "founder" }
    );
    const updatedUser = await User.findById(req.user.id);
    const newToken = updatedUser.generateToken();
    
    // Upload files to Cloudinary
    let pitchDeck, productDemos, multimedia;
    try {
      pitchDeck = req.files.pitchDeck ? await cloudinary.uploader.upload(req.files.pitchDeck[0].path) : null;
      productDemos = req.files.productDemos ? await Promise.all(req.files.productDemos.map(file => cloudinary.uploader.upload(file.path))) : [];
      multimedia = req.files.multimedia ? await Promise.all(req.files.multimedia.map(file => cloudinary.uploader.upload(file.path))) : [];
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: uploadError.message
      });
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
    // Initialize with proper structure for file uploads
    const founderProfile = await Founder.create({
      userId: req.user._id,
      startUpName,
      businessIdea,
      traction,
      fundingNeeds,
      projectPortfolio: {
        pitchDeck: pitchDeck ? { url: pitchDeck.secure_url, publicId: pitchDeck.public_id, fileType: pitchDeck.format } : null,
        productDemos: productDemos.map(demo => ({ url: demo.secure_url, publicId: demo.public_id, fileType: demo.format })),
        multimedia: multimedia.map(media => ({ url: media.secure_url, publicId: media.public_id, fileType: media.format }))
      }
    });
    
    res.status(201).cookie("token", newToken, options).json({
        success: true,
        message: "Founder profile created successfully",
        token: newToken,
        founder: founderProfile
      });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const followUser = async (req, res) => {
  try {
    //find user that needs to be followed
    const userToFollow = await User.findById(req.params.id);
    // find user that is following the user
    const loggedInUser = await User.findById(req.user._id);

  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  //unfollow condition
  if (loggedInUser.following.includes(userToFollow._id)) {
    const userToFollowIndexInFollowingList = loggedInUser.following.indexOf(
      userToFollow._id
    );
    const loggedInUserIndexInFollowersList = userToFollow.followers.indexOf(
      loggedInUser._id
    );

    userToFollow.followers.splice(loggedInUserIndexInFollowersList, 1);
    loggedInUser.following.splice(userToFollowIndexInFollowingList, 1);

      await Promise.all([userToFollow.save(), loggedInUser.save()]);

    res.status(200).json({
      success: true,
      message: "User unfollowed",
    });
  } else {
    //follow condition
    userToFollow.followers.push(loggedInUser._id);
    loggedInUser.following.push(userToFollow._id);

      await Promise.all([userToFollow.save(), loggedInUser.save()]);

      res.status(200).json({
        success: true,
        message: "User followed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getFounderProfile = async (req, res) => {
  try {
    const founder = await Founder.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();
      
    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder profile not found"
      });
    }
    // Transform the data to include only necessary fields
    const founderProfile = {
      id: founder._id,
      startUpName: founder.startUpName,
      businessIdea: founder.businessIdea,
      traction: founder.traction,
      fundingNeeds: founder.fundingNeeds,
      projectPortfolio: founder.projectPortfolio,
      location: founder.location,
      industry: founder.industry,
      milestoneTracker: founder.milestoneTracker,
      userId: founder.userId._id,
      userName: founder.userId.name,
      userEmail: founder.userId.email
    };

    res.status(200).json({
      success: true,
      data: founderProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateFounderProfile = async (req, res) => {
  try {
    let founder = await Founder.findById(req.params.id)
      .populate('userId', 'name email');

    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder profile not found"
      });
    }

    // Check if user owns this profile
    if (founder.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
      });
    }

    // Validate only the fields being updated
    const validation = validateFounderProfile(req.body, true); // true flag for partial update
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }

    // Update only the provided fields
    founder = await Founder.findByIdAndUpdate(
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
        id: founder._id,
        startUpName: founder.startUpName,
        businessIdea: founder.businessIdea,
        traction: founder.traction,
        fundingNeeds: founder.fundingNeeds,
        projectPortfolio: founder.projectPortfolio,
        milestoneTracker: founder.milestoneTracker,
        userId: founder.userId._id,
        userName: founder.userId.name,
        userEmail: founder.userId.email,
        updatedAt: founder.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteFounderProfile = async (req, res) => {
  try {
    const { deleteAccount } = req.body;
    const founder = await Founder.findById(req.params.id);

    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder profile not found"
      });
    }

    // Check if user owns this profile
    if (founder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own profile"
      });
    }

    // Delete the founder profile
    await founder.deleteOne();

    // If user wants to delete their account too
    if (deleteAccount) {
      await User.findByIdAndDelete(founder.userId);
      // Clear auth cookie since account is deleted
      res.clearCookie("token");
      
      return res.status(200).json({
        success: true,
        message: "Profile and account deleted successfully"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Founder profile deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const uploadPitchDeck = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No pitch deck file provided"
      });
    }

    const founder = await Founder.findById(req.params.id);
    if (!founder) {
      // Delete uploaded file if founder not found
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(404).json({
        success: false,
        message: "Founder profile not found"
      });
    }

    // Delete old pitch deck if it exists
    if (founder.projectPortfolio.pitchDeck?.publicId) {
      await cloudinary.uploader.destroy(founder.projectPortfolio.pitchDeck.publicId);
    }

    founder.projectPortfolio.pitchDeck = {
      url: req.file.path,
      publicId: req.file.filename,
      fileType: req.file.mimetype
    };

    await founder.save();

    res.status(200).json({
      success: true,
      message: "Pitch deck uploaded successfully",
      data: founder.projectPortfolio.pitchDeck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const uploadProductDemos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No product demo files provided"
      });
    }

    // Validate files
    const validation = validateFiles(req.files, 'productDemos');
    if (!validation.isValid) {
      // Clean up uploaded files
      await Promise.all(req.files.map(file => cloudinary.uploader.destroy(file.filename)));
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: validation.errors
      });
    }

    const founder = await Founder.findById(req.params.id);
    if (!founder) {
      // Delete uploaded files if founder not found
      await Promise.all(req.files.map(file => cloudinary.uploader.destroy(file.filename)));
      return res.status(404).json({
        success: false,
        message: "Founder profile not found"
      });
    }

    // Check if user owns this profile
    if (founder.userId.toString() !== req.user._id.toString()) {
      await Promise.all(req.files.map(file => cloudinary.uploader.destroy(file.filename)));
      return res.status(403).json({
        success: false,
        message: "Unauthorized to upload files to this profile"
      });
    }

    // Delete old files if they exist
    if (founder.projectPortfolio.productDemos.length > 0) {
      await Promise.all(
        founder.projectPortfolio.productDemos.map(demo => 
          cloudinary.uploader.destroy(demo.publicId)
        )
      );
    }

    // Process new files
    founder.projectPortfolio.productDemos = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      fileType: file.mimetype
    }));

    await founder.save();

    res.status(200).json({
      success: true,
      message: "Product demos uploaded successfully",
      data: founder.projectPortfolio.productDemos
    });
  } catch (error) {
    // Cleanup uploaded files in case of error
    if (req.files) {
      await Promise.all(req.files.map(file => cloudinary.uploader.destroy(file.filename)));
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const uploadMultimedia = async (req, res) => {
  try {
    console.log('User ID:', req.user._id);
    console.log('Founder ID:', req.params.id);
    
    const founder = await Founder.findById(req.params.id);
    console.log('Found founder:', founder);
    
    if (!founder) {
      return res.status(404).json({
        success: false,
        message: "Founder profile not found"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No multimedia files provided"
      });
    }

    // Validate files
    const validation = validateFiles(req.files, 'multimedia');
    if (!validation.isValid) {
      await Promise.all(req.files.map(file => cloudinary.uploader.destroy(file.filename)));
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: validation.errors
      });
    }

    // Check if user owns this profile
    if (founder.userId.toString() !== req.user._id.toString()) {
      await Promise.all(req.files.map(file => cloudinary.uploader.destroy(file.filename)));
      return res.status(403).json({
        success: false,
        message: "Unauthorized to upload files to this profile"
      });
    }

    // Delete old files if they exist
    if (founder.projectPortfolio.multimedia.length > 0) {
      await Promise.all(
        founder.projectPortfolio.multimedia.map(media => 
          cloudinary.uploader.destroy(media.publicId)
        )
      );
    }

    // Process new files
    founder.projectPortfolio.multimedia = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      fileType: file.mimetype
    }));

    await founder.save();

    res.status(200).json({
      success: true,
      message: "Multimedia files uploaded successfully",
      data: founder.projectPortfolio.multimedia
    });
  } catch (error) {
    if (req.files) {
      await Promise.all(req.files.map(file => cloudinary.uploader.destroy(file.filename)));
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { registerFounder, getFounderProfile, updateFounderProfile, deleteFounderProfile, followUser, uploadPitchDeck, uploadProductDemos, uploadMultimedia };
