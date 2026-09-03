const express = require("express");
const router = express.Router();
const LaboratoryController = require("./../Controller/Laboratory");
const authController = require("./../Controller/authController");

// 1. Static Routes (Eto muna dapat)
router
  .route("/")
  .post(authController.protect, LaboratoryController.createLaboratory)
  .get(authController.protect, LaboratoryController.DisplayLaboratory);

router
  .route("/GetLaboratoriesByDepartment")
  .get(authController.protect, LaboratoryController.GetLaboratoriesByDepartment);

router
  .route("/getSpecificDepartments") // Inilipat ko ito sa itaas ng /:id
  .get(authController.protect, LaboratoryController.getSpecificDepartment);

// 2. Dynamic Routes (Dapat laging huli ang may /:id)
router
  .route("/:id")
  .delete(authController.protect, LaboratoryController.deleteLaboratory)
  .patch(authController.protect, LaboratoryController.UpdateLab);

module.exports = router;
