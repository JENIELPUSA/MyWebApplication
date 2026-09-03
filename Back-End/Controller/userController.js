const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const user = require("../Models/usermodel");
const Apifeatures = require("./../Utils/ApiFeatures");

exports.createUser = AsyncErrorHandler(async (req, res) => {
  console.log("req.body", req.body);
  const { FirstName, LastName, email, password } = req.body;

  // Check for required fields
  if (!FirstName || !LastName || !email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please fill in all required fields.",
    });
  }

  // Validate email format
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a valid email address.",
    });
  }

  // Create user
  const newUser = await user.create(req.body);

  res.status(201).json({
    status: "success",
    data: newUser,
  });
});

exports.DisplayAll = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(user.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let displayuser = await features.query;

  if (!displayuser || displayuser.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No users found"
    });
  }

  res.status(200).json({
    status: "success",
    totalUser: displayuser.length,
    data: displayuser,
  });
});


exports.deleteUser = AsyncErrorHandler(async (req, res) => {
  await user.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});


exports.Updateuser = AsyncErrorHandler(async (req, res, next) => {
  const { FirstName, LastName, email, role } = req.body;

  if (!FirstName || !LastName || !email || !role) {
    return res.status(400).json({
      status: "fail",
      message: "Please fill in all required fields.",
    });
  }

  const updateuser = await user.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: updateuser,
  });
});

exports.Getiduser = AsyncErrorHandler(async (req, res, next) => {
  const foundUser = await user.findById(req.params.id);

  if (!foundUser) {
    const error = new CustomError("User with the ID is not found", 404);
    return next(error);
  }

  res.status(200).json({
    status: "Success",
    data: foundUser,
  });
});

exports.updatePassword = AsyncErrorHandler(async (req, res, next) => {
  // GET CURRENT USER DATA FROM DATABASE (using req.user._id from auth middleware)
  const foundUser = await user.findById(req.user._id).select("+password");

  // CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
  if (!(await foundUser.comparePasswordInDb(req.body.currentPassword, foundUser.password))) {
    return next(new CustomError("The current password you provided is wrong", 401));
  }

  // UPDATE PASSWORD
  foundUser.password = req.body.password;
  foundUser.confirmPassword = req.body.confirmPassword;
  await foundUser.save();

  // Note: authController must be imported at the top if you use createSendResponse
  authController.createSendResponse(foundUser, 200, res);
});


exports.signup = AsyncErrorHandler(async (req, res, next) => {
  const { FirstName, Middle, LastName, email, password, role } = req.body;

  const existingUser = await user.findOne({ email });

  if (existingUser) {
    return res.status(400).json("Already Have an Account!");
  }

  const result = await user.create({
    FirstName,
    Middle,
    LastName,
    email,
    password,
    role
  });

  res.status(201).json(result);
});

exports.DisplayAllTechnician = AsyncErrorHandler(async (req, res) => {
  req.query.role = "Technician";

  const features = new Apifeatures(user.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let displayuser = await features.query;

  if (!displayuser || displayuser.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No technicians found"
    });
  }

  res.status(200).json({
    status: "success",
    totalUser: displayuser.length,
    data: displayuser,
  });
});