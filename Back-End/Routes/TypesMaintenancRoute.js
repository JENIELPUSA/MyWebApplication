const express = require("express");
const router = express.Router(); //express router
const TypesofMaintenances = require("../Controller/TypesMaintenances");
<<<<<<< HEAD
const authController = require("../Controller/authController");
router
  .route("/")
  .post(authController.protect, TypesofMaintenances.TypesRequest)
  .get(authController.protect, TypesofMaintenances.DisplaySched);

router
  .route("/Pmscreate")
  .post(authController.protect, TypesofMaintenances.Pmscreate);

router
  .route("/:id")
  .patch(authController.protect, TypesofMaintenances.UpdateSched)
  .delete(authController.protect, TypesofMaintenances.deleteSched);
=======
const authController = require("../Controller/authController")
router
  .route("/")
  .post(authController.protect,TypesofMaintenances.TypesRequest)
  .get(authController.protect,TypesofMaintenances.DisplaySched)
router.route("/:id")
.patch(authController.protect,TypesofMaintenances.UpdateSched)
.delete(authController.protect,TypesofMaintenances.deleteSched)
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

module.exports = router;
