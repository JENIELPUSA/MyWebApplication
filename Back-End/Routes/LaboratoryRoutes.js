const express = require("express");
<<<<<<< HEAD
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
=======
const router = express.Router(); //express router
const LaboratoryController = require("./../Controller/Laboratory");
const authController = require("./../Controller/authController");
router
  .route("/")
  .post(
    authController.protect,
    authController.restrict("Admin"),
    LaboratoryController.createLaboratory
  )
  .get(authController.protect, LaboratoryController.DisplayLaboratory);

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.restrict("Admin"),
    LaboratoryController.deleteLaboratory
  )
  .patch(
    authController.protect,
    authController.restrict("Admin"),
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
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
