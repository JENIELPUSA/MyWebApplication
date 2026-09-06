const express = require('express');
const router = express.Router();//express router
const ProblemController = require('./../Controller/ProblemController')
const authController = require('./../Controller/authController')


router.route('/')
    .post(authController.protect,ProblemController.createProblem)
    .get(authController.protect,ProblemController.displayProblem)


router.route('/:id')
    .patch(authController.protect,ProblemController.updateProblem)
    .delete(authController.protect,ProblemController.deleteProblem)
    
module.exports=router