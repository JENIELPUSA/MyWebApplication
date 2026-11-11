// src/Controllers/PMS007Controller.js
import AsyncErrorHandler from "../Utils/AsyncErrorHandler.js";
import mongoose from "mongoose";
import CustomError from "../Utils/CustomError.js";
import PMS007 from "../Models/PMS007.js";
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
// FindByEquipment
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
        dateFilter.date = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid 'from' date format. Use YYYY-MM-DD.",
                });
            }
            fromDate.setHours(0, 0, 0, 0);
            dateFilter.date.$gte = fromDate;
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
            dateFilter.date.$lte = toDate;
        }
    }

    const pmsRecord = await PMS007.find({
        laboratoryId,
        ...dateFilter,
    })
        .populate("equipmentId")
        .populate("performedBy", "FirstName Middle LastName username role")
        .sort({ date: -1, createdAt: -1 });

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
export const createPMS007 = AsyncErrorHandler(async (req, res) => {
    if (process.env.NODE_ENV !== "production") {
        console.log("🔍 req.body keys:", Object.keys(req.body || {}));
    }

    const {
        equipmentId,
        laboratoryId,
        codeNo,
        instrumentName,
        instrumentType,
        accuracy,
        errorObserved,
        errorCorrected,
        calibratedBy,
        date,
        remarks,
        performedByFullName,
    } = req.body;

    // `equipmentId` is optional for PMS007 (manual calibration entries)
    if (equipmentId) validateObjectId(equipmentId, "Equipment ID");
    validateObjectId(laboratoryId, "Laboratory ID");

    if (date && isNaN(new Date(date).getTime())) {
        throw new CustomError("Invalid date format", 400);
    }

    if (equipmentId) {
        const equipmentExists = await Equipment.findById(equipmentId);
        if (!equipmentExists) throw new CustomError("Equipment not found", 404);
    }

    const laboratoryExists = await Laboratory.findById(laboratoryId);
    if (!laboratoryExists) throw new CustomError("Laboratory not found", 404);

    const newRecord = await PMS007.create({
        equipmentId: equipmentId || null,
        laboratoryId,
        codeNo: codeNo || "",
        instrumentName: instrumentName || "",
        instrumentType: instrumentType || "",
        accuracy: accuracy || "",
        errorObserved: errorObserved || "",
        errorCorrected: errorCorrected || "",
        calibratedBy: calibratedBy || "",
        date: date || Date.now(),
        remarks: remarks || "",
        performedByFullName: performedByFullName || "",
        performedBy: req.user?._id || null,
    });

    if (!newRecord) throw new CustomError("Failed to create PMS007 record", 400);

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

// ============================================================
// GET ALL — gaya ng getAllPMS006 (role-scoped, lab-strict, backward-compat)
// GET /api/v1/Pms007?laboratoryId=...   (Admin)
// GET /api/v1/Pms007?equipmentId=...    (any)
// ============================================================
export const getAllPMS007 = AsyncErrorHandler(async (req, res, next) => {
    try {
        const userID = req.user._id;
        const role = req.user.role;

        console.log("triggerrr____ getAllPMS007");
        console.log("role:", role);

        // ============================================================
        // STEP 1: Resolve laboratoryId base sa role
        // ============================================================
        let laboratoryId = null;

        if (role === "User") {
            const laboratory = await Laboratory.findOne({
                Encharge: userID,
            })
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
        // STEP 3: Query — strict lab
        // ============================================================
        const pms007Query = {
            laboratoryId,
        };

        // Optional ?equipmentId= filter
        const { equipmentId: queryEqId } = req.query;
        if (queryEqId) {
            if (!mongoose.Types.ObjectId.isValid(queryEqId)) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid equipmentId format.",
                });
            }
            pms007Query.equipmentId = new mongoose.Types.ObjectId(queryEqId);
        }

        console.log("🔍 [getAllPMS007]");
        console.log("  - role:", role);
        console.log("  - laboratoryId:", laboratoryId);
        console.log("  - query:", JSON.stringify(pms007Query));

        const rawRecords = await PMS007.find(pms007Query)
            .populate({
                path: "equipmentId",
                select:
                    "code Brand DateAcquired SerialNumber Specification status remarks Category laboratory laboratoryId lab",
            })
            .populate(
                "performedBy",
                "FirstName Middle LastName username role"
            )
            .sort({ date: -1, createdAt: -1 })
            .lean();

        console.log("🔍 rawRecords count:", rawRecords.length);

        // ============================================================
        // STEP 4: Manual filter — valid equipment only (backward compat)
        // PMS007 supports equipmentId = null (manual calibration entries)
        // ============================================================
        const validRecords = rawRecords.filter((r) => {
            const eq = r.equipmentId;

            // ✅ PMS007 allows null equipmentId (manual entries) — keep them
            if (!eq) return true;

            const eqLab = eq.laboratory || eq.laboratoryId || eq.lab;

            if (!eqLab) {
                console.warn(
                    `⚠️ Equipment ${eq._id} (${eq.code || "no-code"}) has no lab field`
                );
                return true; // ← backward compat (same as PMS005)
            }

            return String(eqLab) === String(laboratoryId);
        });

        const invalidCount = rawRecords.length - validRecords.length;
        console.log("🔍 PMS007 raw count:", rawRecords.length);
        console.log("🔍 PMS007 valid count:", validRecords.length);
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
        console.error("💥 getAllPMS007 CRASHED");
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
export const getPMS007ById = AsyncErrorHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new CustomError("Invalid ID format", 400);
    }

    const record = await PMS007.findById(req.params.id)
        .populate("equipmentId")
        .populate("laboratoryId")
        .populate("performedBy", "FirstName Middle LastName username role");

    if (!record) throw new CustomError("PMS007 record not found", 404);

    res.status(200).json({
        status: "success",
        data: record,
    });
});

// ============================================================
// GET BY EQUIPMENT ID
// ============================================================
export const getPMS007ByEquipmentId = AsyncErrorHandler(async (req, res) => {
    const { equipmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
        throw new CustomError("Invalid Equipment ID format", 400);
    }

    const records = await PMS007.find({ equipmentId })
        .populate("equipmentId")
        .populate("laboratoryId")
        .populate("performedBy", "FirstName Middle LastName username role")
        .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
        status: "success",
        totalRecords: records.length,
        data: records,
    });
});

// ============================================================
// UPDATE
// ============================================================
export const updatePMS007 = AsyncErrorHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new CustomError("Invalid ID format", 400);
    }

    const ALLOWED_FIELDS = [
        "equipmentId",
        "laboratoryId",
        "codeNo",
        "instrumentName",
        "instrumentType",
        "accuracy",
        "errorObserved",
        "errorCorrected",
        "calibratedBy",
        "date",
        "remarks",
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

    if (filteredBody.date) {
        if (isNaN(new Date(filteredBody.date).getTime())) {
            throw new CustomError("Invalid date format", 400);
        }
    }

    const updated = await PMS007.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        { new: true, runValidators: true }
    )
        .populate("equipmentId")
        .populate("laboratoryId")
        .populate("performedBy", "FirstName Middle LastName username role");

    if (!updated) throw new CustomError("PMS007 record not found", 404);

    res.status(200).json({
        status: "success",
        data: updated,
    });
});

// ============================================================
// DELETE
// ============================================================
export const deletePMS007 = AsyncErrorHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new CustomError("Invalid ID format", 400);
    }

    const deleted = await PMS007.findByIdAndDelete(req.params.id);

    if (!deleted) throw new CustomError("PMS007 record not found", 404);

    res.status(200).json({
        status: "success",
        data: null,
    });
});

// ============================================================
// DISPLAY ALL PMS007 — gaya ng DisplayAllPMS006 (role-scoped via helper)
// GET /api/v1/Pms007/DisplayAll?from=&to=&laboratoryId=
// ============================================================
export const DisplayAllPMS007 = AsyncErrorHandler(async (req, res) => {
    const userID = req.user._id;
    const role = req.user.role;

    console.log("triggerrr____ DisplayAllPMS007");
    console.log("role:", role);

    // ============================================================
    // STEP 1: Resolve laboratoryId base sa role
    // ============================================================
    let laboratoryId = null;

    if (role === "User") {
        const laboratory = await Laboratory.findOne({ Encharge: userID })
            .select("_id LaboratoryName")
            .lean();

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
    // STEP 2: Laboratory + Encharge (via $lookup)
    // ============================================================
    const laboratory = await Laboratory.aggregate([
        { $match: { _id: laboratoryId } },
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
            message: "No laboratory found.",
        });
    }

    const performedBy = laboratory[0].performedBy || null;

    // ============================================================
    // STEP 3: Date filter (base sa `date` field)
    // ============================================================
    const { from, to } = req.query;
    const dateFilter = {};

    if (from || to) {
        dateFilter.date = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid 'from' date format. Use YYYY-MM-DD.",
                });
            }
            fromDate.setHours(0, 0, 0, 0);
            dateFilter.date.$gte = fromDate;
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
            dateFilter.date.$lte = toDate;
        }
    }

    // ============================================================
    // STEP 4: Kunin ang PMS007 records — matching + date filter
    // ============================================================
    const pmsRecord = await PMS007.find({
        laboratoryId,
        ...dateFilter,
    })
        .populate("equipmentId")
        .populate("performedBy", "FirstName Middle LastName username role")
        .sort({ date: -1, createdAt: -1 });

    // ============================================================
    // STEP 5: Response
    // ============================================================
    res.status(200).json({
        status: "success",
        role,
        totalRecords: pmsRecord.length,
        pmsRecord,
        performedBy,
        laboratory: {
            _id: laboratoryId,
            LaboratoryName: laboratory[0].LaboratoryName || "N/A",
            performedBy,
        },
    });
});