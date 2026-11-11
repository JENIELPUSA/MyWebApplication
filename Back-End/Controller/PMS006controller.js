// src/Controllers/PMS006Controller.js
import AsyncErrorHandler from "../Utils/AsyncErrorHandler.js";
import mongoose from "mongoose";
import CustomError from "../Utils/CustomError.js";
import PMS006 from "../Models/PMS006.js";
import Equipment from "../Models/Equipment.js";
import Laboratory from "../Models/Laboratory.js";

// ============================================================
// HELPER — validate ObjectId
// ============================================================
const validateObjectId = (id, fieldName) => {
    if (!id) throw new CustomError(`${fieldName} is required`, 400);
    if (!mongoose.Types.ObjectId.isValid(id))
        throw new CustomError(`Invalid ${fieldName} format`, 400);
};

// ============================================================
// HELPER — resolve laboratory scope from role
// Returns { laboratoryId, laboratory, performedBy } or throws CustomError
// ============================================================
const resolveLaboratoryScope = async (req) => {
    const userID = req.user?._id;
    const role = req.user?.role;

    if (!userID) throw new CustomError("Unauthorized", 401);

    let laboratoryId = null;

    if (role === "User") {
        const lab = await Laboratory.findOne({ Encharge: userID })
            .select("_id LaboratoryName Encharge")
            .lean();

        if (!lab) {
            throw new CustomError(
                "You are not assigned as Encharge to any laboratory.",
                404
            );
        }
        laboratoryId = lab._id;
    } else if (role === "Admin") {
        const { laboratoryId: queryLabId } = req.query;

        if (!queryLabId) {
            throw new CustomError(
                "laboratoryId is required for Admin role.",
                400
            );
        }
        if (!mongoose.Types.ObjectId.isValid(queryLabId)) {
            throw new CustomError("Invalid laboratoryId format.", 400);
        }
        laboratoryId = new mongoose.Types.ObjectId(queryLabId);
    } else {
        throw new CustomError(
            `Role "${role}" is not allowed to access this resource.`,
            403
        );
    }

    const laboratory = await Laboratory.findById(laboratoryId)
        .select("_id LaboratoryName Encharge")
        .lean();

    if (!laboratory) throw new CustomError("No laboratory found.", 404);

    return {
        laboratoryId,
        laboratory,
        performedBy: laboratory.Encharge || null,
    };
};

// ============================================================
// FindByEquipment — returns lab info + PMS006 records for the encharge's lab
// GET /api/v1/Pms006/FindByEquipment?from=&to=&all=
// ============================================================
export const FindByEquipment = AsyncErrorHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({
            status: "fail",
            message: "User ID not found in request.",
        });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const laboratory = await Laboratory.aggregate([
        { $match: { Encharge: userObjectId } },
        {
            $lookup: {
                from: "users",
                localField: "Encharge",
                foreignField: "_id",
                as: "Encharge",
            },
        },
        {
            $unwind: {
                path: "$Encharge",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                LaboratoryName: { $ifNull: ["$LaboratoryName", "N/A"] },
                performedBy: {
                    _id: "$Encharge._id",
                    username: { $ifNull: ["$Encharge.username", ""] },
                    FirstName: { $ifNull: ["$Encharge.FirstName", ""] },
                    Middle: { $ifNull: ["$Encharge.Middle", ""] },
                    LastName: { $ifNull: ["$Encharge.LastName", ""] },
                    role: { $ifNull: ["$Encharge.role", ""] },
                },
            },
        },
        { $limit: 1 },
    ]);

    if (!laboratory || laboratory.length === 0) {
        return res.status(404).json({
            status: "fail",
            message: "No laboratory found for this user.",
        });
    }

    const laboratoryId = laboratory[0]._id;
    const performedBy = laboratory[0].performedBy || null;

    const { from, to, all } = req.query;
    const showAll = all === "true" || all === "1";

    if (!showAll && !from && !to) {
        return res.status(200).json({
            status: "success",
            pmsRecord: [],
            data: {
                _id: laboratoryId,
                LaboratoryName: laboratory[0].LaboratoryName,
                performedBy,
            },
        });
    }

    const dateFilter = {};

    if (!showAll && (from || to)) {
        dateFilter.maintenanceDate = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid 'from' date format. Use YYYY-MM-DD.",
                });
            }
            fromDate.setHours(0, 0, 0, 0);
            dateFilter.maintenanceDate.$gte = fromDate;
        }

        if (to) {
            const toDate = new Date(to);
            if (isNaN(toDate.getTime())) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid 'to' date format. Use YYYY-MM-DD.",
                });
            }
            toDate.setHours(23, 59, 59, 999);
            dateFilter.maintenanceDate.$lte = toDate;
        }
    }

    const pmsRecord = await PMS006.find({
        laboratoryId,
        ...dateFilter,
    })
        .populate("equipmentId")
        .populate("performedBy", "FirstName Middle LastName username role")
        .sort({ maintenanceDate: -1, createdAt: -1 });

    res.status(200).json({
        status: "success",
        totalRecords: pmsRecord.length,
        pmsRecord,
        data: {
            _id: laboratoryId,
            LaboratoryName: laboratory[0].LaboratoryName,
            performedBy,
        },
    });
});

// ============================================================
// CREATE
// ============================================================
export const createPMS006 = AsyncErrorHandler(async (req, res) => {
    if (process.env.NODE_ENV !== "production") {
        console.log("🔍 req.body keys:", Object.keys(req.body || {}));
    }

    const {
        equipmentId,
        laboratoryId,
        analysisTrouble,
        adjustmentSetting,
        manHourUse,
        counterMeasures,
        improvementRepairProcedure,
        sparePartsMaterialsUsed,
        incharge,
        maintenanceDate,
        performedByFullName,
    } = req.body;

    validateObjectId(equipmentId, "Equipment ID");
    validateObjectId(laboratoryId, "Laboratory ID");

    if (maintenanceDate && isNaN(new Date(maintenanceDate).getTime())) {
        throw new CustomError("Invalid maintenance date format", 400);
    }

    const equipmentExists = await Equipment.findById(equipmentId);
    if (!equipmentExists) throw new CustomError("Equipment not found", 404);

    const laboratoryExists = await Laboratory.findById(laboratoryId);
    if (!laboratoryExists) throw new CustomError("Laboratory not found", 404);

    const newRecord = await PMS006.create({
        equipmentId,
        laboratoryId,
        analysisTrouble: analysisTrouble || "",
        adjustmentSetting: adjustmentSetting || "",
        manHourUse: manHourUse || "",
        counterMeasures: counterMeasures || "",
        improvementRepairProcedure: improvementRepairProcedure || "",
        sparePartsMaterialsUsed: sparePartsMaterialsUsed || "",
        incharge: incharge || "",
        maintenanceDate: maintenanceDate || Date.now(),
        performedByFullName: performedByFullName || "",
        performedBy: req.user?._id || null,
    });

    if (!newRecord) throw new CustomError("Failed to create PMS006 record", 400);

    const populated = await newRecord.populate([
        { path: "equipmentId" },
        { path: "laboratoryId" },
        {
            path: "performedBy",
            select: "FirstName Middle LastName username role",
        },
    ]);

    res.status(201).json({
        status: "success",
        data: populated,
    });
});

// src/Controllers/PMS006Controller.js

export const getAllPMS006 = AsyncErrorHandler(async (req, res, next) => {
    try {
        const userID = req.user._id;
        const role = req.user.role;

        console.log("triggerrr____ getAllPMS006");
        console.log("role:", role);

        // ============================================================
        // STEP 1: Resolve laboratoryId base sa role
        // ============================================================
        let laboratoryId = null;

        if (role === "User") {
            const laboratory = await Laboratory.findOne({ Encharge: userID })
                .select("_id LaboratoryName")
                .lean();

            console.log("laboratory (User):", laboratory);

            if (!laboratory) {
                return res.status(404).json({
                    status: "fail",
                    message:
                        "You are not assigned as Encharge to any laboratory.",
                });
            }

            laboratoryId = laboratory._id;
        } else if (role === "Admin") {
            const { laboratoryId: queryLabId } = req.query;

            console.log("queryLabId (Admin):", queryLabId);

            if (!queryLabId) {
                return res.status(400).json({
                    status: "fail",
                    message: "laboratoryId is required for Admin role.",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(queryLabId)) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid laboratoryId format.",
                });
            }

            laboratoryId = new mongoose.Types.ObjectId(queryLabId);
        } else {
            return res.status(403).json({
                status: "fail",
                message: `Role "${role}" is not allowed to access this resource.`,
            });
        }

        // ============================================================
        // STEP 2: Laboratory details
        // ============================================================
        const laboratory = await Laboratory.findById(laboratoryId)
            .select("_id LaboratoryName")
            .lean();

        if (!laboratory) {
            return res.status(404).json({
                status: "fail",
                message: "No laboratory found.",
            });
        }

        // ============================================================
        // STEP 3: Query — strict lab, may equipment lang
        // ============================================================
        const pms006Query = {
            laboratoryId,
            equipmentId: { $ne: null, $exists: true },
        };

        console.log("🔍 [getAllPMS006]");
        console.log("  - role:", role);
        console.log("  - laboratoryId:", laboratoryId);
        console.log("  - query:", JSON.stringify(pms006Query));

        const rawRecords = await PMS006.find(pms006Query)
            .populate({
                path: "equipmentId",
                select:
                    "code Brand DateAcquired SerialNumber Specification status remarks Category laboratory laboratoryId lab",
            })
            .sort({ maintenanceDate: -1, createdAt: -1 })
            .lean();

        console.log("🔍 rawRecords count:", rawRecords.length);

        // ============================================================
        // STEP 4: Manual filter — valid equipment only
        // ============================================================
        const validRecords = rawRecords.filter((r) => {
            const eq = r.equipmentId;
            if (!eq || !eq._id) return false;

            // ✅ Try lahat ng possible lab field names
            const eqLab = eq.laboratory || eq.laboratoryId || eq.lab;

            if (!eqLab) {
                console.warn(
                    `⚠️ Equipment ${eq._id} (${eq.code || "no-code"}) has no lab field`
                );
                return true; // ← tanggapin muna (backward compat)
            }

            return String(eqLab) === String(laboratoryId);
        });

        const invalidCount = rawRecords.length - validRecords.length;
        console.log("🔍 PMS006 raw count:", rawRecords.length);
        console.log("🔍 PMS006 valid count:", validRecords.length);
        console.log("🔍 Filtered out (mismatched lab):", invalidCount);

        // ============================================================
        // STEP 5: Response
        // ============================================================
        res.status(200).json({
            status: "success",
            role: role,
            totalRecords: validRecords.length,
            data: validRecords,
            laboratory: {
                _id: laboratory._id,
                LaboratoryName: laboratory.LaboratoryName || "N/A",
            },
        });
    } catch (err) {
        console.error("💥 getAllPMS006 CRASHED");
        console.error("Message:", err.message);
        console.error("Name:", err.name);
        console.error("Stack:", err.stack);

        return res.status(500).json({
            status: "fail",
            message: "Internal server error",
            error: {
                name: err.name,
                message: err.message,
            },
        });
    }
});
// ============================================================
// GET BY ID
// ============================================================
export const getPMS006ById = AsyncErrorHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new CustomError("Invalid ID format", 400);
    }

    const record = await PMS006.findById(req.params.id)
        .populate("equipmentId")
        .populate("laboratoryId")
        .populate("performedBy", "FirstName Middle LastName username role");

    if (!record) throw new CustomError("PMS006 record not found", 404);

    res.status(200).json({
        status: "success",
        data: record,
    });
});

// ============================================================
// GET BY EQUIPMENT ID
// ============================================================
export const getPMS006ByEquipmentId = AsyncErrorHandler(async (req, res) => {
    const { equipmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
        throw new CustomError("Invalid Equipment ID format", 400);
    }

    const records = await PMS006.find({ equipmentId })
        .populate("equipmentId")
        .populate("laboratoryId")
        .populate("performedBy", "FirstName Middle LastName username role")
        .sort({ maintenanceDate: -1, createdAt: -1 });

    res.status(200).json({
        status: "success",
        totalRecords: records.length,
        data: records,
    });
});

// ============================================================
// UPDATE
// ============================================================
export const updatePMS006 = AsyncErrorHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new CustomError("Invalid ID format", 400);
    }

    const ALLOWED_FIELDS = [
        "equipmentId",
        "laboratoryId",
        "analysisTrouble",
        "adjustmentSetting",
        "manHourUse",
        "counterMeasures",
        "improvementRepairProcedure",
        "sparePartsMaterialsUsed",
        "incharge",
        "maintenanceDate",
        "performedByFullName",
    ];

    const filteredBody = {};
    ALLOWED_FIELDS.forEach((key) => {
        const value = req.body[key];
        if (value !== "" && value !== null && value !== undefined) {
            filteredBody[key] = value;
        }
    });

    if (filteredBody.equipmentId) {
        if (!mongoose.Types.ObjectId.isValid(filteredBody.equipmentId)) {
            throw new CustomError("Invalid Equipment ID format", 400);
        }
        const exists = await Equipment.findById(filteredBody.equipmentId);
        if (!exists) throw new CustomError("Equipment not found", 404);
    }

    if (filteredBody.laboratoryId) {
        if (!mongoose.Types.ObjectId.isValid(filteredBody.laboratoryId)) {
            throw new CustomError("Invalid Laboratory ID format", 400);
        }
        const exists = await Laboratory.findById(filteredBody.laboratoryId);
        if (!exists) throw new CustomError("Laboratory not found", 404);
    }

    if (filteredBody.maintenanceDate) {
        if (isNaN(new Date(filteredBody.maintenanceDate).getTime())) {
            throw new CustomError("Invalid maintenance date format", 400);
        }
    }

    const updated = await PMS006.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        { new: true, runValidators: true }
    )
        .populate("equipmentId")
        .populate("laboratoryId")
        .populate("performedBy", "FirstName Middle LastName username role");

    if (!updated) throw new CustomError("PMS006 record not found", 404);

    res.status(200).json({
        status: "success",
        data: updated,
    });
});

// ============================================================
// DELETE
// ============================================================
export const deletePMS006 = AsyncErrorHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new CustomError("Invalid ID format", 400);
    }

    const deleted = await PMS006.findByIdAndDelete(req.params.id);

    if (!deleted) throw new CustomError("PMS006 record not found", 404);

    res.status(200).json({
        status: "success",
        data: null,
    });
});

// ============================================================
// DISPLAY ALL PMS006 — with Encharge matching + optional date filter
// GET /api/v1/Pms006/DisplayAll?from=&to=&laboratoryId=
// ============================================================
export const DisplayAllPMS006 = AsyncErrorHandler(async (req, res) => {
    const { laboratoryId, laboratory, performedBy } =
        await resolveLaboratoryScope(req);

    const { from, to } = req.query;

    // ============================================================
    // Date filter (based on `createdAt`)
    // ============================================================
    const dateFilter = {};

    if (from || to) {
        dateFilter.createdAt = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                throw new CustomError(
                    "Invalid 'from' date format. Use YYYY-MM-DD.",
                    400
                );
            }
            fromDate.setHours(0, 0, 0, 0);
            dateFilter.createdAt.$gte = fromDate;
        }

        if (to) {
            const toDate = new Date(to);
            if (isNaN(toDate.getTime())) {
                throw new CustomError(
                    "Invalid 'to' date format. Use YYYY-MM-DD.",
                    400
                );
            }
            toDate.setHours(23, 59, 59, 999);
            dateFilter.createdAt.$lte = toDate;
        }
    }

    // ============================================================
    // PMS006 records for this lab only
    // ============================================================
    const pmsRecord = await PMS006.find({
        laboratoryId,
        ...dateFilter,
    })
        .populate("equipmentId")
        .populate(
            "performedBy",
            "FirstName Middle LastName username role"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        role: req.user.role,
        totalRecords: pmsRecord.length,
        pmsRecord,
        performedBy,
        laboratory: {
            _id: laboratoryId,
            LaboratoryName: laboratory.LaboratoryName || "N/A",
            performedBy,
        },
    });
});