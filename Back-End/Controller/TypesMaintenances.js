const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const TypesofMaintenances = require("../Models/TypesOfMaintenace");
const Apifeatures = require("../Utils/ApiFeatures");
<<<<<<< HEAD
const MaintenanceActivity = require("../Models/MaintenanceActivity");
const MaintenanceLogs = require("../Models/MaintenanceLogs");
const AssignEquipment = require("../Models/AssigningEquipment");

exports.Pmscreate = AsyncErrorHandler(async (req, res, next) => {
  try {
    const data = req.body;
    console.log("data received:", data);

    // 1. HANAPIN ANG ASSIGNED EQUIPMENT ID
    // Ginagamit ang 'Equipments' field base sa iyong Schema
    const assignedDoc = await AssignEquipment.findOne({
      Equipment: data.equipmentId,
    });

    // Validation: Siguraduhin na may nahanap na assignment
    if (!assignedDoc) {
      return res.status(404).json({
        status: "error",
        message: `Walang nahanap na assignment para sa Equipment ID: ${data.equipmentId}. Siguraduhing naka-assign muna ang equipment sa laboratory.`,
      });
    }

    // Ang ID ng 'AssigningEquipment' document ang gagamitin nating reference
    const assignmentId = assignedDoc._id;

    let createdLog = null;

    // 2. CREATE MAINTENANCE LOG
    if (
      data.AnalysisOfTrouble ||
      data.AdjustmentSetting ||
      data.ManHoursUsed ||
      data.CounterMeasures
    ) {
      createdLog = await MaintenanceLogs.create({
        Request: assignmentId, // Dito na-save ang ID ng assignment
        AnalysisOfTrouble: data.AnalysisOfTrouble,
        AdjustmentSetting: data.AdjustmentSetting,
        ManHoursUsed: data.ManHoursUsed,
        CounterMeasures: data.CounterMeasures,
        ImprovementInRepairProcedure: data.ImprovementInRepairProcedure,
        SparePartsMaterialsUsed: data.SparePartsMaterialsUsed,
        TechnicalLaboratoryInCharge: req.user._id,
        RepairDate: data.RepairDate || Date.now(),
      });
    }

    // 3. CREATE MAINTENANCE ACTIVITY
    const hasActivityData = [
      "RoutineInspectionCleaning",
      "Lubrication",
      "Overhauling",
      "MinorAdjustment",
      "ReplaceWornOutParts",
      "Repair",
      "GeneralRecondition",
    ].some((field) => data[field] === true);

    let createdActivity = null;
    if (hasActivityData || data.FrequencyCode) {
      createdActivity = await MaintenanceActivity.create({
        Request: assignmentId, // Dito na-save ang ID ng assignment
        RoutineInspectionCleaning: data.RoutineInspectionCleaning,
        Lubrication: data.Lubrication,
        Overhauling: data.Overhauling,
        MinorAdjustment: data.MinorAdjustment,
        ReplaceWornOutParts: data.ReplaceWornOutParts,
        Repair: data.Repair,
        GeneralRecondition: data.GeneralRecondition,
        RepairPart: data.RepairPart,
        FrequencyCode: data.FrequencyCode,
        PerformedBy: req.user._id,
      });
    }

    res.status(201).json({
      status: "success",
      assignmentFound: assignmentId,
      maintenanceLog: createdLog,
      maintenanceActivity: createdActivity,
    });
  } catch (error) {
    console.error("Error in Pmscreate:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create PMS data",
      error: error.message,
    });
  }
});

exports.TypesRequest = AsyncErrorHandler(async (req, res) => {
  const technicianId = req.user._id;

  const dataToSave = {
    ...req.body,
    assignedTechnician: technicianId,
  };

  const typesofMaintenances = await TypesofMaintenances.create(dataToSave);
=======

exports.TypesRequest = AsyncErrorHandler(async (req, res) => {
  const typesofMaintenances = await TypesofMaintenances.create(req.body);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  res.status(200).json({
    status: "success",
    data: typesofMaintenances,
  });
});

<<<<<<< HEAD
=======

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
exports.DisplaySched = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(TypesofMaintenances.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  displaySched = await features.query;

  res.status(200).json({
    status: "success",
    data: displaySched,
  });
});

<<<<<<< HEAD
exports.UpdateSched = AsyncErrorHandler(async (req, res, next) => {
  const updateSchedule = await TypesofMaintenances.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.status(200).json({
    status: "success",
    data: updateSchedule,
  });
});

exports.deleteSched = AsyncErrorHandler(async (req, res, next) => {
  await TypesofMaintenances.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});
=======

exports.UpdateSched =AsyncErrorHandler(async (req,res,next) =>{
    const updateSchedule=await TypesofMaintenances.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
        updateSchedule
        
     }); 
  })

    exports.deleteSched = AsyncErrorHandler(async(req,res,next)=>{
      await TypesofMaintenances.findByIdAndDelete(req.params.id)
  
      res.status(200).json({
          status:'success',
          data:null
       });
    })

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
