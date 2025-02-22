const passport = require("passport");
const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { validateUserCredentials } = require("../../../utils/validations");
const {ConnectionRequest} = require("../models/connectionRequestModel");


const userData = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded Token:", decoded); // Log decoded data

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("JWT Error:", error.message); // Log JWT error
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};


const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password"
        });
      }
  
      const user = await User.findOne({ email }).select('+password');
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      const isPasswordMatch = await user.matchPassword(password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      const token = await user.generateToken();
  
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      };
      const { password: _, ...userWithOutPassword } = user.toObject();

      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "Logged in successfully",
        token,
        user: userWithOutPassword,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

const logoutUser = async (req, res) => {
    try {
      const { token } = req.cookies;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not logged in",
        });
      }

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      };

      res.clearCookie("token", options);
      res.status(200).json({
        success: true,
        message: "Founder logged out successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate user input
        const validation = validateUserCredentials({ name, email, password });
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validation.errors
          });
        }
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
          return res.status(404).json({
            success: false,
            message: "Email already in use for a founder or an investor",
          });
        }
        
        // Create user with validated data
        user = await User.create({
          name,
          email,
          password,
          role : "enthusiast"
        });
        await user.save();

        const token = await user.generateToken();
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        };
        const userResponse = user.toObject();
        delete userResponse.password;
    
        res.status(201).cookie("token", token, options).json({
          success: true,
          message: "User registered successfully",
          token,
          user: userResponse
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}   

// Google OAuth Routes
// Route - /api/auth/google?redirect=/xyz

/*

for frontend 
const loginWithGoogle = () => {
  const currentURL = window.location.pathname;
  window.location.href = `/api/auth/google/login?redirect=${encodeURIComponent(currentURL)}`;
};

*/

const googleOAuthLogin = async (req, res, next) => {
  const redirectTo = req.query.redirect || "/"; // Default to home page if no redirect is provided

  // Store the redirect URL in the session
  req.session.redirectTo = redirectTo;
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

const googleOAuthCallback = async (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login", session: false },
    async (err, user) => {
      try {
        if (err || !user) {
          return res.status(401).json({
            success: false,
            message: "Authentication failed",
          });
        }

        const token = await user.generateToken();
        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        };

        const { password: _, ...userWithoutPassword } = user.toObject();
        
        // Get redirect URL from session
        const redirectTo = req.session.redirectTo || "/";

        // Clear session variable
        delete req.session.redirectTo;
        res
          .status(200)
          .cookie("token", token, options)
          .redirect(process.env.FRONTEND_URL + redirectTo);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
  )(req, res, next);
};

//SEND CONNECTION REQUEST
const sendConnectionRequest = async (req, res, next) => {
  try{
    const {senderId, receiverId} = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender ID and Receiver ID are required' });
    }

    //self request
    if (senderId === receiverId) {
      res.status(401).json({
        success: false,
        message: "User cannot send a connection request to self",
      })
    }

    // Check if users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if users are already connected
    if (sender.connections.includes(receiverId)){
      return res.status(400).json({ message: 'Users are already connected' });
    }

    if(req.user.id !== senderId){
      res.status(401).json({
        success: false,
        message: "cannot send connection request",
      })
    }

    // Check if a request already exists
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingConnectionRequest) {
      return res.status(400).json({
        success: false,
        message: "Connection Request already sent",
      })
    }

    const newConnectionRequest = new ConnectionRequest({
      sender: senderId,
      receiver: receiverId,
    })
    await newConnectionRequest.save();

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      request: newConnectionRequest
    })
  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//ACCEPT CONNECTION REQUEST
const acceptConnectionRequest = async (req, res, next) => {
  try{
    const {requestId} = req.body;
    if(!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request does not exist",
      })
    }

    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      })
    }

    if(req.user.id !== connectionRequest.receiver.toString()){
      return res.status(401).json({
        success: false,
        message: "User cannot accept the connection request",
      })
    }

    if(connectionRequest.requestStatus !== "accepted"){
      return res.status(400).json({
        success: false,
        message: "Connection Request already processed",
      })
    }
    connectionRequest.requestStatus =  "accepted";
    await connectionRequest.save();

    const sender = await User.findById(connectionRequest.sender);
    const receiver = await User.findById(connectionRequest.receiver);

    if(!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    sender.connections.push(receiver._id);
    receiver.connections.push(sender._id);

    await sender.save();
    await receiver.save();

    res.status(200).json({
      success: true,
      message: "Connection request accepted"
    })

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//reject a connection request

const rejectConnectionRequest = async (req, res, next) => {
  try{
    const {requestId} = req.body;
    if(!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request does not exist",
      })
    }
    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      })
    }

    // Check if the receiver is authorized to reject the request
    if (connectionRequest.receiver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to reject this request' });
    }

    //check if request has already been accepted or rejected
    if(connectionRequest.requestStatus !== 'pending'){
      return res.status(400).json({
        success: false,
        message: "Connection Request already processed",
      })
    }
    connectionRequest.requestStatus = "rejected";
    await connectionRequest.save();

    res.status(200).json({
      success: true,
      message: "Connection request rejected"
    })

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//get pending requests for a user

const getPendingRequestsForAUser = async (req, res, next) => {
  try{
    const {userId} = req.params;

    if(!userId) {
      return res.status(404).json({
        success: false,
        message: "Provide a valid user id",
      })
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const connectionRequests = await ConnectionRequest.find({receiver: userId, requestStatus: "pending"})
        .populate('sender', 'name email');

    if(!connectionRequests || !connectionRequests.length) {
      return res.status(404).json({
        success: false,
        message: "No connection requests found for user",
      })
    }

    res.status(200).json({
      success: true,
      connectionRequests: connectionRequests
    })

  }catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
  }
}

// Remove a connection
const removeConnection = async (req, res, next) => {
  const { userId, connectionId } = req.body;

  try {
    // Input validation
    if (!userId || !connectionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Connection ID are required'
      });
    }

    // Check if users exist
    const user = await User.findById(userId);
    const connection = await User.findById(connectionId);
    if (!user || !connection) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if(req.user.id !== user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised to remove the connection"
      })
    }

    // Check if the connection exists
    if (!user.connections.includes(connectionId)) {
      return res.status(400).json({
        success: false,
        message: 'Connection does not exist'
      });
    }

    // Remove the connection
    user.connections = user.connections.filter((id) => id.toString() !== connectionId);
    connection.connections = connection.connections.filter((id) => id.toString() !== userId);

    await user.save();
    await connection.save();

    res.status(200).json({
      success: true,
      message: 'Connection removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  userData,
  loginUser,
  logoutUser,
  registerUser,
  googleOAuthLogin,
  googleOAuthCallback,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getPendingRequestsForAUser,
  removeConnection
};
