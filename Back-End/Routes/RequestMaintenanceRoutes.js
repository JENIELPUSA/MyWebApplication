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

module.exports=router