const express = require('express');
const router = express.Router();//express router
const MaintenanceRoute = require('./../Controller/RequestMaintenanceController')



router.route('/')
    .post(MaintenanceRoute.RequestMaintenance)
    .get(MaintenanceRoute.DisplayRequest)

    router.route('/:id')
        .delete(MaintenanceRoute.DeleteRequest)
        .patch(MaintenanceRoute.UpdateSenData)
router.route('/unreadnotification')
        .get(MaintenanceRoute.DisplayNotifictaionRequest)
router.route('/getbyId/:id')
       .get(MaintenanceRoute.getRequest)
router.route('/getSpecificMaintenances')
       .get(MaintenanceRoute.getSpecificMaintenance)


module.exports=router