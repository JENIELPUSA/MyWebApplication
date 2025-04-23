const User = require('../Models/usermodel');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');
const sendEmail = require('../Utils/email');
const crypto = require('crypto');

//function for secret code
const signToken =id=>{
    return jwt.sign({id},process.env.SECRET_STR,{
         expiresIn:process.env.LOGIN_EXPR
     })
 }

 const createSendResponse =(user, statusCode, res)=>{
    const token = signToken(user._id);

    const options = {
        maxAge : process.env.LOGIN_EXPR,
        secure: true,
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production')
        options.secure = true;

    res.cookie('jwt', token, options);
//para hindi masama ang password fields sa Output
//ma save sa databased but not view for in Output
    user.password =undefined;

    res.status(statusCode).json({
        status:'success',
        token,
       
        data:{ 
            user
        }  
    });

}
exports.signup = AsyncErrorHandler(async (req, res, next) => {
    const { FirstName, Middle, LastName, email, password } = req.body;

    try {
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            // If user already exists, send an appropriate response
            return res.status(400).json({ message: "User with this email already exists!" });
        }

        // If no user exists, create a new user
        const newUser = await User.create({
            FirstName,
            Middle,
            LastName,
            email,
            password
        });

        // Send the newly created user as the response
        return res.send({
            status: 'Success'
        });
    } catch (error) {
        // Handle any errors during user creation or email check
        console.error(error);
        res.status(500).json({ message: "An error occurred during signup." });
    }
});


exports.login = AsyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    // Find user by email and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
  
    // Check if the user exists
    if (!user) {
      return next(new CustomError('Incorrect email or password', 400));
    }
  
    // Verify password
    const isPasswordCorrect = await user.comparePasswordInDb(password, user.password);
    if (!isPasswordCorrect) {
      return next(new CustomError('Incorrect email or password', 400));
    }
  
    // Generate JWT token after ensuring user and password are correct
    const token = signToken(user._id);
  
    // Save user info in session
    req.session.userId = user._id;
    req.session.isLoggedIn = true;
    req.session.user = {
      email: user.email,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Middle: user.Middle,
      role: user.role,
    };
  
    return res.status(200).send({
      status: 'Success',
      userId: user._id,  // Include User ID
      role: user.role,
      token,
      email
    });
  });
  


exports.logout =AsyncErrorHandler(async(req,res,next)=>{
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to log out!');
        }
        res.clearCookie('connect.sid'); // Clearing the session cookie
        res.send('Logged out successfully!');
      });
})

exports.protect = AsyncErrorHandler(async (req, res, next) => {
    // 1. Check for session first
    if (req.session && req.session.isLoggedIn) {
        // If the session is active, attach user from session to req object
        req.user = req.session.user;
        return next(); // User is logged in, proceed to the next middleware or route handler
    }

    // 2. If no session, fall back to token authentication
    const testToken = req.headers.authorization;
    let token;

    // Check if the token starts with 'Bearer' and extract the token
    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1];
    }

    // If no token, throw an error that the user is not logged in
    if (!token) {
        return next(new CustomError('You are not logged in!', 401));
    }

    // 3. Validate the token
    // Ensure the token is valid using the secret from the environment variables
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

    // Find the user by the decoded token ID
    const user = await User.findById(decodedToken.id);

    // If no user with that ID exists, throw an error
    if (!user) {
        return next(new CustomError('The user with the given token does not exist', 401));
    }

    // Check if the user changed the password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    
    // If the password has been changed, throw an error
    if (isPasswordChanged) {
        return next(new CustomError('The password has been changed recently. Please log in again.', 401));
    }

    // 4. Save the user in the session
    req.session.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Middle: user.Middle,
    };
    req.session.isLoggedIn = true;

    // Attach the user to the request object to use in the next middleware
    req.user = user;

    // Proceed to the next middleware or route
    next();
});


// Restrict access based on role
exports.restrict = (role) => {
    return (req, res, next) => {
        if (!req.session || !req.session.isLoggedIn) {
            return res.status(401).json({ message: 'You are not logged in. Please log in to access this resource.' });
        }

        if (req.session.user.role !== role) {
            return res.status(403).json({ message: `You do not have permission to access this resource. Required role: ${role}` });
        }

        next();
    };
};


exports.forgotPassword = AsyncErrorHandler(async (req, res, next) => {

    const { email }=req.body;

    // Find the user based on email
    const user = await User.findOne({email});

    // If user doesn't exist, trigger an error and return
    if (!user) {
        return next(new CustomError('We could not find the user with given email', 404));
    }

    // Generate the reset token and save it in the user's document
    const resetToken = user.createResetTokenPassword();
    await user.save({ validateBeforeSave: false });

    // Generate the reset URL
    const resetUrl = `http://localhost:5173/reset_password/${resetToken}`;
    const message = `We have received a password reset request. Please use the below link to reset your password:\n\n${resetUrl} \n\nThis reset password link will be available for 10 minutes.`;

    try {
        // Send the email with the reset link
        await sendEmail({
            email: user.email,
            subject: 'Password change request received',
            text: message
        });

        res.status(200).json({
            status: 'Success',
            message: 'Password reset link sent to the user email'
        });

    } catch (err) {
        // Reset the password reset token and expiry fields on error
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        
        await user.save({ validateBeforeSave: false });

        return next(new CustomError('There was an error sending password reset email. Please try again later', 500));
    }
});

exports.resetPassword = AsyncErrorHandler(async (req, res, next) => {
    const { token,password } = req.params; // Get the token from the request parameters

    // Hash the token to compare with the stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user with the matching hashed token and not expired
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: { $gt: Date.now() } // Ensure the token is not expired
    });

    // Check if the user exists
    if (!user) {
        return next(new CustomError('Token is Invalid or Expired', 400)); // Use next to pass error to error handler
    }

    // Set the new password based on input from the request body
    user.password = req.body.password; // Assuming password validation is handled in the User model
    user.passwordResetToken = undefined; // Clear the reset token
    user.passwordResetTokenExpires = undefined; // Clear the token expiry
    user.passwordChangedAt = Date.now(); // Update the timestamp for when the password was changed

    // Save the updated user object
    await user.save(); // Await this to catch any potential errors


    return res.status(200).json({
        status: 'Success'
    });
});
