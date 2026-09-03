const express = require("express");
const router = express.Router(); //express router
const EquipmentController = require("./../Controller/EquipmentController");
const authController = require("./../Controller/authController");
router
  .route("/getEquipment")
  .get(authController.protect, EquipmentController.getSpecificEquipment);
router
  .route("/")
  .post(authController.protect, EquipmentController.createtool)
  .get(authController.protect, EquipmentController.Displaytool);
router
  .route("/:id")
  .patch(authController.protect, EquipmentController.Updatetool)
  .delete(authController.protect, EquipmentController.deletetool)
  .get(authController.protect, EquipmentController.Getidequip);

router.route("/delete/:equipmentID").delete(
  authController.protect,
  EquipmentController.deleteEquipmentAndRelated, // This is the new method
);

router.route("/Releted/:equipmentID").delete(
  authController.protect,
  EquipmentController.RemoverelatedData, // This is the new method
);

module.exports = router;
