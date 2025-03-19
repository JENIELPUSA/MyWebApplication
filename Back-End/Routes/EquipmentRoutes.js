const express = require('express');
const router = express.Router();//express router
const EquipmentController = require('./../Controller/EquipmentController')
const authController = require('./../Controller/authController')

router.route('/')
    .post(authController.protect,authController.restrict('admin'),EquipmentController.createtool)
    .get(authController.protect,EquipmentController.Displaytool)
router.route('/:id')
    .patch(authController.protect,authController.restrict('admin'),EquipmentController.Updatetool)
    .delete(authController.protect,authController.restrict('admin'),EquipmentController.deletetool)
    .get(authController.protect,authController.restrict('admin'),EquipmentController.Getidequip)
    

module.exports=router