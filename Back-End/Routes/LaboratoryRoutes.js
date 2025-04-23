const express = require("express");
const router = express.Router(); //express router
const LaboratoryController = require("./../Controller/Laboratory");
const authController = require("./../Controller/authController");
router
  .route("/")
  .post(
    authController.protect,
    authController.restrict("admin"),
    LaboratoryController.createLaboratory
  )
  .get(authController.protect, LaboratoryController.DisplayLaboratory);

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.restrict("admin"),
    LaboratoryController.deleteLaboratory
  )
  .patch(
    authController.protect,
    authController.restrict("admin"),
    LaboratoryController.UpdateLab
  );
router
//Kapag req.query ang gamit wag lagyan ng :id
  .route("/getSpecificDepartments")
  .get(
    authController.protect,
   
    LaboratoryController.getSpecificDepartment
  );
module.exports = router;
