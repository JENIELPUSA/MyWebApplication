const express = require('express');
const router = express.Router();//express router
const userController = require('./../Controller/userController')
const authController = require('./../Controller/authController')

router.route('/')
    .get(authController.protect,userController.DisplayAll)
    .post(authController.protect,userController.createUser)
    

router.route('/:id')
<<<<<<< HEAD
    .delete(authController.protect,userController.deleteUser)
    .patch(authController.protect,userController.Updateuser)
    .get(authController.protect,userController.Getiduser)
router.route('/updatePassword').patch(
        authController.protect,
=======
    .delete(authController.protect,authController.restrict('Admin'),userController.deleteUser)
    .patch(authController.protect,authController.restrict('Admin'),userController.Updateuser)
    .get(authController.protect,authController.restrict('Admin'),userController.Getiduser)
router.route('/updatePassword').patch(
        authController.protect,authController.restrict('Admin'),
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        userController.updatePassword
)
    
module.exports=router
