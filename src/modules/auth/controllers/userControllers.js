const { User } = require("../models/userModel");
const {validateUserCredentials} = require("../../../utils/validations"); 

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
  
      // Remove password from response
      user.password = undefined;
  
      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "Logged in successfully",
        token,
        user
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
          password
        });
        
        const token = await user.generateToken();
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        };
        user.password = undefined;
    
        res.status(201).cookie("token", token, options).json({
          success: true,
          message: "User registered successfully",
          token,
          user
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}   

  module.exports = {loginUser , logoutUser , registerUser}

  