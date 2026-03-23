const express = require('express');
const router = express.Router();//express router
const CategoryController = require('../Controller/CategoryController')
const authController = require('../Controller/authController')


router.route('/')
<<<<<<< HEAD
    .post(authController.protect,CategoryController.createcategory)
    .get(authController.protect,CategoryController.displayCategory)

router.route('/:id')
    .patch(authController.protect,CategoryController.UpdateCategory)
    .delete(authController.protect,CategoryController.deleteCategory)
=======
    .post(authController.protect,authController.restrict('Admin'),CategoryController.createcategory)
    .get(authController.protect,CategoryController.displayCategory)

router.route('/:id')
    .patch(authController.protect,authController.restrict('Admin'),CategoryController.UpdateCategory)
    .delete(authController.protect,authController.restrict('Admin'),CategoryController.deleteCategory)
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae





module.exports=router