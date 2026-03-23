const express = require('express');
const router = express.Router();//express router
const AssignController = require('./../Controller/AssigningController')
const authController = require('./../Controller/authController')


router.route('/')
<<<<<<< HEAD
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
=======
    .post(authController.protect,authController.restrict('Admin'),AssignController.AssignEquipment)
    .get(authController.protect,AssignController.displayAssign)

router.route('/:id')
    .patch(authController.protect,authController.restrict('Admin'),AssignController.UpdateEquipments)
    .delete(authController.protect,authController.restrict('Admin'),AssignController.deleteAssign)
    .get(authController.protect,authController.restrict('Admin'),AssignController.GetidAssign)
    
 router.route('/laboratory/:LaboratoryName') // Siguraduhing may leading slash
    .get(authController.protect,authController.restrict('Admin'),AssignController.getAssignmentsByLaboratoryName)
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    
module.exports=router