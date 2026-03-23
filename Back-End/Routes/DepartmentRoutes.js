const express = require('express');
const router = express.Router();//express router
const departmentsController = require('./../Controller/departmentController')
const authController = require('./../Controller/authController')

router.route('/')
<<<<<<< HEAD
    .post(authController.protect,departmentsController.createdepartment)
    .get(authController.protect,departmentsController.DisplayDepartment)

router.route('/:id')
    .patch(authController.protect,departmentsController.Updatedepartment)
    .delete(authController.protect,departmentsController.deletedepartment)
    .get(authController.protect,departmentsController.getDepartment)
=======
    .post(authController.protect,authController.restrict('Admin'),departmentsController.createdepartment)
    .get(authController.protect,departmentsController.DisplayDepartment)

router.route('/:id')
    .patch(authController.protect,authController.restrict('Admin'),departmentsController.Updatedepartment)
    .delete(authController.protect,authController.restrict('Admin'),departmentsController.deletedepartment)
    .get(authController.protect,authController.restrict('Admin'),departmentsController.getDepartment)
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

module.exports=router