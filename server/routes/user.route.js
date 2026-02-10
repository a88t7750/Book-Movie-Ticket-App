const express = require("express");
const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const isAuth = require("../middlewares/authMiddleware.js");
const { sendPasswordResetEmail } = require("../services/emailService.js");
const isProd = process.env.NODE_ENV === 'production';

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  try {
    const userexist = await User.findOne({ email: req.body.email });
    if (userexist) {
      res.send({
        success: false,
        message: "User Already Exists with the Email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPwd = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hashPwd;

    const newUser = new User(req.body);
    const saveduser = await newUser.save();
    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user: saveduser,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.send({
        success: false,
        message: "User does not exist. Please register first.",
      });
    }
    const checkPwd = await bcrypt.compare(req.body.password, user.password);
    if (!checkPwd) {
      res.send({
        success: false,
        message: "Sorry,invalid password entered!",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' })


    res.cookie('jwtToken', token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd, // true on Render (HTTPS), false locally
    });
    res.send({
      success: true,
      message: "You have successfully logged in !",
      user: user
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

userRouter.get('/current-user', isAuth, async (req, res) => {
  const userId = req.userId
  if (userId === undefined) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }
  try {
    const verifiedUser = await User.findById(userId).select("-password");
    if (!verifiedUser) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(verifiedUser)
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }

})
userRouter.post("/logout", isAuth, async (req, res) => {
  try {
    res.clearCookie('jwtToken');
    res.send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out"
    });
  }
});

// Forgot Password Route
userRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // For security, don't reveal if user exists or not
    if (!user) {
      return res.send({
        success: true,
        message: "If an account with that email exists, we have sent a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    // Save token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

    if (!emailResult.success) {
      // If email fails, clear the token
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(500).send({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }

    res.send({
      success: true,
      message: "If an account with that email exists, we have sent a password reset link.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

// Reset Password Route
userRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).send({
        success: false,
        message: "Token and password are required",
      });
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashPwd = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    user.password = hashPwd;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.send({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = userRouter;
