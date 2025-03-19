const express = require('express');
const router = express.Router();//express router
const departmentsController = require('./../Controller/departmentController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,authController.restrict('admin'),departmentsController.createdepartment)
    .get(authController.protect,departmentsController.DisplayDepartment)

router.route('/:id')
    .patch(authController.protect,authController.restrict('admin'),departmentsController.Updatedepartment)
    .delete(authController.protect,authController.restrict('admin'),departmentsController.deletedepartment)
    .get(authController.protect,authController.restrict('admin'),departmentsController.getDepartment)

module.exports=router