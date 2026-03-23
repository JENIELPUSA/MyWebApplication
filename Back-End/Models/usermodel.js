<<<<<<< HEAD
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "please fill out the Textbox"]
  },
  FirstName: String,
  Middle: String,
  LastName: String,
  role: {
    type: String,
    enum: ['User', 'Admin', 'Technician'],
    required: [true, "Please Select a Role"]
=======
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    required:[true,"please fill out the Textbox"]
  },
  FirstName: {
    type: String,
  },
  Middle: {
    type: String
  },
  LastName: {
    type: String,
  },
  role: {
    type: String,
    enum: ['User', 'Admin', 'Technician'],
    required:[true,"Please Select a Role"]
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  },
  password: {
    type: String,
    required: [true, 'Please enter a password.'],
    minlength: [8, 'Password must be at least 8 characters long.'],
<<<<<<< HEAD
    select: false, 
=======
    select: false, // Prevents password from being returned in queries by default
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date
});
<<<<<<< HEAD
// Mongoose pre-save middleware to hash the password and remove confirmPassword
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
=======

// Mongoose pre-save middleware to hash the password and remove confirmPassword
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  // Hash the new password with a cost factor of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Method to compare passwords
userSchema.methods.comparePasswordInDb = async function (pswd, pswdDB) {
  return await bcrypt.compare(pswd, pswdDB);
};

// Method to check if the password was changed after the token was issued
userSchema.methods.isPasswordChanged = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
<<<<<<< HEAD
    const pswdChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
=======
    const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    return JWTTimestamp < pswdChangedTimestamp;
  }
  return false;
};

// Method to create a password reset token
userSchema.methods.createResetTokenPassword = function () {
<<<<<<< HEAD
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

  return resetToken;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
=======
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
