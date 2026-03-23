const express = require('express');
const authController = require('../Controller/authController');
const router = express.Router();
<<<<<<< HEAD
=======
const Dash = require('../Controller/Dashboard')

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
router.route('/signup')
.post(authController.signup);

router.route('/login')
.post(authController.login);

router.route('/forgotPassword').post(
    authController.forgotPassword
);
router.route('/resetPassword/:token')
.patch(authController.resetPassword)

<<<<<<< HEAD

module.exports = router;
=======
router.route('/dashboard')
.get(Dash.dashboard)



module.exports = router;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
