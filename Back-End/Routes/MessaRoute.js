const express = require('express');
const router = express.Router();//express router
const MsgController = require('../Controller/MessageController')
const authController = require('./../Controller/authController')


router.route('/')
    .post(authController.protect,MsgController.AddMessage)
    .get(authController.protect,MsgController.DisplayMessage)
   router.route('/:id')
        .patch(MsgController.UpdateSendMSG) 
module.exports=router