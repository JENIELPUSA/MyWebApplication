const express = require('express');
const router = express.Router();//express router
const departmentsController = require('./../Controller/departmentController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,departmentsController.createdepartment)
    .get(authController.protect,departmentsController.DisplayDepartment)

router.route('/:id')
    .patch(authController.protect,departmentsController.Updatedepartment)
    .delete(authController.protect,departmentsController.deletedepartment)
    .get(authController.protect,departmentsController.getDepartment)

module.exports=router