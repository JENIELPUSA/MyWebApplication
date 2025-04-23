const express = require("express");
const router = express.Router(); //express router
const TypesofMaintenances = require("../Controller/TypesMaintenances");

router
  .route("/")
  .post(TypesofMaintenances.TypesRequest)
  .get(TypesofMaintenances.DisplaySched)
router.route("/:id")
.patch(TypesofMaintenances.UpdateSched)
.delete(TypesofMaintenances.deleteSched)

module.exports = router;
