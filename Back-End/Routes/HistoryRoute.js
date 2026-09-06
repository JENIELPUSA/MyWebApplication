const express = require('express');
const router = express.Router();//express router
const HistoryController = require('./../Controller/HistoryController')
const authController = require('./../Controller/authController')


router.route('/')
    .get(authController.protect, HistoryController.displayHistory)
router.route('/:id')
    .patch(authController.protect, HistoryController.updateHistory)
    .delete(authController.protect, HistoryController.deleteHistory)

module.exports = router