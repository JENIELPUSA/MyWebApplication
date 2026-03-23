const express = require('express');
const router = express.Router();//express router
const CategoryController = require('../Controller/CategoryController')
const authController = require('../Controller/authController')


router.route('/')
    .post(authController.protect,CategoryController.createcategory)
    .get(authController.protect,CategoryController.displayCategory)

router.route('/:id')
    .patch(authController.protect,CategoryController.UpdateCategory)
    .delete(authController.protect,CategoryController.deleteCategory)





module.exports=router