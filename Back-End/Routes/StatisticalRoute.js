const express = require('express');
const router = express.Router();//express router
const StatisticalController = require('./../Controller/statisticalController')
const authController = require('./../Controller/authController')


router.route('/')
    .get(authController.protect, StatisticalController.getEquipmentStatistics)

router.route('/technician_statistics')
    .get(authController.protect, StatisticalController.getTechnicianStatistics)

router.route('/supply_statistical')
    .get(authController.protect, StatisticalController.getSupplyStatistical)


module.exports = router