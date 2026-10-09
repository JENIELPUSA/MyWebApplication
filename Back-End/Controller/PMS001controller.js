// src/Controllers/PMS001Controller.js

const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");
const CustomError = require("../Utils/CustomError");
const PMSMaintenanceController = require("../Models/PMS001");
const Equipment = require("../Models/Equipment");

// ============================================================
// CREATE — Add new PMS001 record
// ============================================================
exports.createPMS001 = AsyncErrorHandler(async (req, res, next) => {
    const { equipmentId } = req.body;

    console.log("BODY",req.body)

    // Validate equipmentId
    if (!equipmentId) {
        return next(new CustomError("Equipment ID is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
        return next(new CustomError("Invalid Equipment ID format", 400));
    }

    // Check kung existing ang Equipment
    const equipmentExists = await Equipment.findById(equipmentId);
    if (!equipmentExists) {
        return next(new CustomError("Equipment not found", 404));
    }

    // Create record
    const newRecord = await PMSMaintenanceController.create(req.body);

    if (!newRecord) {
        return next(new CustomError("Failed to create PMS record", 400));
    }

    // Populate equipment details
    const populated = await newRecord.populate("equipmentId");

    res.status(201).json({
        status: "success",
        data: populated,
    });
});

// ============================================================
// GET ALL — List all PMS001 records
// ============================================================
exports.getAllPMS001 = AsyncErrorHandler(async (req, res, next) => {
    const records = await PMSMaintenanceController.find()
        .populate("equipmentId")
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        totalRecords: records.length,
        data: records,
    });
});

// ============================================================
// GET BY ID — Single PMS001 record
// ============================================================
exports.getPMS001ById = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const record = await PMSMaintenanceController.findById(
        req.params.id
    ).populate("equipmentId");

    if (!record) {
        return next(new CustomError("PMS record not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: record,
    });
});

// ============================================================
// GET BY EQUIPMENT ID — Lahat ng PMS history ng isang equipment
// ============================================================
exports.getPMS001ByEquipmentId = AsyncErrorHandler(
    async (req, res, next) => {
        const { equipmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
            return next(new CustomError("Invalid Equipment ID format", 400));
        }

        const records = await PMSMaintenanceController.find({ equipmentId })
            .populate("equipmentId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            totalRecords: records.length,
            data: records,
        });
    }
);

// ============================================================
// UPDATE — Update existing PMS001 record
// ============================================================
exports.updatePMS001 = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    // Filter out empty values — huwag i-update ang fields na walang value
    const filteredBody = {};
    Object.keys(req.body).forEach((key) => {
        const value = req.body[key];
        if (value !== "" && value !== null && value !== undefined) {
            filteredBody[key] = value;
        }
    });

    // Validate equipmentId kung binago
    if (
        filteredBody.equipmentId &&
        !mongoose.Types.ObjectId.isValid(filteredBody.equipmentId)
    ) {
        return next(new CustomError("Invalid Equipment ID format", 400));
    }

    const updated = await PMSMaintenanceController.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    ).populate("equipmentId");

    if (!updated) {
        return next(new CustomError("PMS record not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: updated,
    });
});

// ============================================================
// DELETE — Remove PMS001 record
// ============================================================
exports.deletePMS001 = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const deleted = await PMSMaintenanceController.findByIdAndDelete(
        req.params.id
    );

    if (!deleted) {
        return next(new CustomError("PMS record not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: null,
    });
});