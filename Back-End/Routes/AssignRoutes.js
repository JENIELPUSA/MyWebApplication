const express = require('express');
const router = express.Router();//express router
const AssignController = require('./../Controller/AssigningController')
const authController = require('./../Controller/authController')


router.route('/')
    .post(authController.protect,AssignController.AssignEquipment)
    .get(authController.protect,AssignController.displayAssign)


    
 router.route('/laboratory/:LaboratoryName') 
    .get(authController.protect,AssignController.getAssignmentsByLaboratoryName)

 router.route('/displayAssignHistory') 
    .get(authController.protect,AssignController.displayAssignHistory)

router.route('/:id')
    .patch(authController.protect,AssignController.UpdateEquipments)
    .delete(authController.protect,AssignController.deleteAssign)
    .get(authController.protect,AssignController.GetidAssign)
    
module.exports=router