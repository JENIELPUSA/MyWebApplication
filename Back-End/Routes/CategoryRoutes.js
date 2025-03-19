const express = require('express');
const router = express.Router();//express router
const CategoryController = require('../Controller/CategoryController')
const authController = require('../Controller/authController')


router.route('/')
    .post(authController.protect,authController.restrict('admin'),CategoryController.createcategory)
    .get(authController.protect,CategoryController.displayCategory)

router.route('/:id')
    .patch(authController.protect,authController.restrict('admin'),CategoryController.UpdateCategory)
    .delete(authController.protect,authController.restrict('admin'),CategoryController.deleteCategory)





module.exports=router