const express = require("express");
const router = express.Router(); //express router
const MaintenanceRoute = require("./../Controller/RequestMaintenanceController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, MaintenanceRoute.RequestMaintenance)
  .get(authController.protect, MaintenanceRoute.DisplayRequest);

router
  .route("/DisplayRequestMaintenanceActvity")
  .get(
    authController.protect,
    MaintenanceRoute.DisplayRequestMaintenanceActvity,
  );

router
  .route("/DisplayToolsandMaintenance")
  .get(
    authController.protect,
    MaintenanceRoute.DisplayToolsandMaintenance,
  );

router
  .route("/DisplayMaintenanceLogs")
  .get(
    authController.protect,
    MaintenanceRoute.DisplayMaintenanceLogs,
  );

router
  .route("/DisplayMaintenanceHistory")
  .get(
    authController.protect,
    MaintenanceRoute.DisplayMaintenanceHistory,
  );

router
  .route("/DisplayUnscheduledRepair")
  .get(
    authController.protect,
    MaintenanceRoute.DisplayUnscheduledRepair,
  );

router
  .route("/:id")
  .delete(authController.protect, MaintenanceRoute.DeleteRequest)
  .patch(authController.protect, MaintenanceRoute.UpdateSenData);
router
  .route("/unreadnotification")
  .get(authController.protect, MaintenanceRoute.DisplayNotifictaionRequest);
router.route("/getbyId/:id").get(MaintenanceRoute.getRequest);
router
  .route("/getSpecificMaintenances")
  .get(authController.protect, MaintenanceRoute.getSpecificMaintenance);

router
  .route("/monthly-requests")
  .get(authController.protect, MaintenanceRoute.getMonthlyMaintenanceGraph);

module.exports = router;
