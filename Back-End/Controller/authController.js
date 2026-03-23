const UserLogin = require("../Models/usermodel");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const axios = require("axios");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");
const util = require("util");
const fs = require("fs");
const FormData = require("form-data");
const crypto = require("crypto");
const sendEmail = require("./../Utils/email");
// --- HELPER: SIGN TOKEN ---
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.SECRET_STR, {
    expiresIn: "12h",
  });
};

exports.signup = AsyncErrorHandler(async (req, res, next) => {
  try {
    const { FirstName, LastName, Middle, email, role } = req.body;

    console.log("req.body", req.body);

    // 1️⃣ Validation
    if (!FirstName || !LastName || !email || !role) {
      return res.status(400).json({
        status: "Fail",
        message: "Please fill in all required fields.",
      });
    }

    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
      return res.status(400).json({
        status: "Fail",
        message: "Please provide a valid email address.",
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await UserLogin.findOne({ username: email });
    if (existingUser) {
      return res.status(400).json({
        status: "Fail",
        message: "User already exists!",
      });
    }

    // 3️⃣ Create user (NO MANUAL HASHING)
    const newUser = await UserLogin.create({
      username: email,
      FirstName,
      Middle: Middle || "",
      LastName,
      password: "123456789", // plain password → auto hashed by pre-save
      role,
    });

    res.status(201).json({
      status: "Success",
      message: "User successfully created.",
      user: {
        userId: newUser._id,
        role: newUser.role,
        username: newUser.username,
        FirstName: newUser.FirstName,
        LastName: newUser.LastName,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return next(error);
  }
});

// --- PROTECT MIDDLEWARE ---
exports.protect = AsyncErrorHandler(async (req, res, next) => {
  // 1. Check session
  if (req.session && req.session.isLoggedIn && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // 2. Check JWT
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new CustomError("You are not logged in!", 401));
  }

  // 3. Verify Token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR,
  );

  const user = await UserLogin.findById(decoded.id);
  if (!user) {
    return next(new CustomError("User no longer exists", 401));
  }

  // 4. Check password change
  if (user.passwordChangedAt) {
    const isPasswordChanged = await user.isPasswordChanged(decoded.iat);
    if (isPasswordChanged) {
      return next(
        new CustomError("Password changed recently. Please login again.", 401),
      );
    }
  }

  // 5. Flat user object para sa request
  req.user = {
    _id: user._id,
    email: user.username,
    role: user.role,
    FirstName: user.FirstName,
    LastName: user.LastName,
  };

  next();
});

// --- LOGIN LOGIC ---
exports.login = AsyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }

  const user = await UserLogin.findOne({ username: email }).select("+password");

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    return next(new CustomError("Incorrect email or password", 400));
  }

  const token = signToken(user._id, user.role);

  // Set Session
  req.session.isLoggedIn = true;
  req.session.user = {
    _id: user._id,
    email: user.username,
    role: user.role,
    firstName: user.FirstName,
    lastName: user.LastName,
  };

  // FLAT RESPONSE: Direkta mong makukuha ang role sa root ng JSON
  res.status(200).json({
    status: "Success",
    token,
    userId: user._id,
    role: user.role,
    username: user.username,
    firstName: user.FirstName,
    lastName: user.LastName,
  });
});

// --- FORGOT PASSWORD ---
exports.forgotPassword = AsyncErrorHandler(async (req, res, next) => {
  const user = await UserLogin.findOne({ username: req.body.email });
  if (!user) return next(new CustomError("User not found", 404));

  const resetToken = user.createResetTokenPassword();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.username,
      subject: "Password Reset Request",
      text: `Click here to reset your password: ${resetUrl}`,
    });
    res
      .status(200)
      .json({ status: "Success", message: "Reset token sent to email!" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new CustomError(
        "There was an error sending the email. Try again later.",
        500,
      ),
    );
  }
});

// --- RESET PASSWORD ---
exports.resetPassword = AsyncErrorHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserLogin.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(new CustomError("Token is invalid or has expired.", 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  res
    .status(200)
    .json({ status: "Success", message: "Password updated successfully!" });
});

// --- LOGOUT ---
exports.logout = AsyncErrorHandler((req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Could not log out.");
    res.clearCookie("connect.sid");
    res.status(200).json({ status: "Success", message: "Logged out." });
  });
});
