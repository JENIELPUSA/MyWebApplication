const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");
const CustomError = require("../Utils/CustomError");
const PMS004 = require("../Models/PMS004");
const Equipment = require("../Models/Equipment");
const Laboratory = require("../Models/Laboratory");
// src/Controllers/PMS004Controller.js

// ============================================================
// 🔧 Helper — Convert incoming values to strict boolean
// ============================================================
const toBool = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
        const v = val.trim().toLowerCase();
        return v === "true" || v === "1" || v === "yes" || v === "on";
    }
    if (typeof val === "number") return val === 1;
    return false;
};

// Listahan ng boolean fields sa schema (4 na lang)
const BOOLEAN_FIELDS = [
    "routineInspection",
    "lubrication",
    "minorAdjustment",
    "repair",
];

// I-convert lahat ng boolean fields sa isang object
const normalizeBooleans = (obj) => {
    const normalized = { ...obj };
    BOOLEAN_FIELDS.forEach((field) => {
        if (normalized[field] !== undefined) {
            normalized[field] = toBool(normalized[field]);
        }
    });
    return normalized;
};

// ============================================================
// FindByEquipment — para sa Encharge user (PMS004)
// ============================================================
exports.FindByEquipment = AsyncErrorHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({
            status: "fail",
            message: "User ID not found in request.",
        });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ============================================================
    // 1️⃣ Hanapin ang Laboratory ng user + i-populate ang Encharge
    // ============================================================
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

    // ============================================================
    // 2️⃣ Query flags
    // ============================================================
    const { from, to, all } = req.query;
    const showAll = all === "true" || all === "1";

    if (!showAll && !from && !to) {
        return res.status(200).json({
            status: "success",
            total: 0,
            pmsRecord: [],
            data: {
                _id: laboratoryId,
                LaboratoryName: laboratory[0].LaboratoryName,
                performedBy,
            },
        });
    }

    // ============================================================
    // 3️⃣ Date filter
    // ============================================================
    const dateFilter = {};

    if (!showAll && (from || to)) {
        dateFilter.createdAt = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid 'from' date format. Use YYYY-MM-DD.",
                });
            }
            fromDate.setHours(0, 0, 0, 0);
            dateFilter.createdAt.$gte = fromDate;
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
            dateFilter.createdAt.$lte = toDate;
        }
    }

    // ============================================================
    // 4️⃣ Kunin ang PMS004 records
    // ============================================================
    const pmsRecord = await PMS004.find({
        laboratoryId,
        ...dateFilter,
    })
        .populate("equipmentId")
        .sort({ createdAt: -1 })
        .lean();

    console.log("pmsRecord", pmsRecord);
    console.log("performedBy", performedBy);

    // ============================================================
    // 5️⃣ Response
    // ============================================================
    res.status(200).json({
        status: "success",
        total: pmsRecord.length,
        pmsRecord,
        data: {
            _id: laboratoryId,
            LaboratoryName: laboratory[0].LaboratoryName,
            performedBy,
        },
    });
});

// ============================================================
// CREATE — Add new PMS004 record
// ============================================================
exports.createPMS004 = AsyncErrorHandler(async (req, res, next) => {
    const { equipmentId } = req.body;

    console.log("BODY", req.body);

    if (!equipmentId) {
        return next(new CustomError("Equipment ID is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
        return next(new CustomError("Invalid Equipment ID format", 400));
    }

    const equipmentExists = await Equipment.findById(equipmentId);
    if (!equipmentExists) {
        return next(new CustomError("Equipment not found", 404));
    }

    const { Remarks, ...bodyWithoutRemarks } = req.body;
    const normalizedBody = normalizeBooleans(bodyWithoutRemarks);

    const newRecord = await PMS004.create(normalizedBody);

    if (!newRecord) {
        return next(new CustomError("Failed to create PMS record", 400));
    }

    const populated = await newRecord.populate("equipmentId");

    res.status(201).json({
        status: "success",
        data: populated,
    });
});

// ============================================================
// GET ALL PMS004 — strict lab, may equipment lang
// ============================================================
exports.getAllPMS004 = AsyncErrorHandler(async (req, res, next) => {
    try {
        const userID = req.user._id;
        const role = req.user.role;

        console.log("triggerrr____ getAllPMS004");
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
        const pms004Query = {
            laboratoryId,
            equipmentId: { $ne: null, $exists: true },
        };

        console.log("🔍 [getAllPMS004]");
        console.log("  - role:", role);
        console.log("  - laboratoryId:", laboratoryId);
        console.log("  - query:", JSON.stringify(pms004Query));

        // ✅ WALANG `match` — manual filter sa JS
        const rawRecords = await PMS004.find(pms004Query)
            .populate({
                path: "equipmentId",
                select:
                    "code Brand DateAcquired SerialNumber Specification status remarks Category laboratory laboratoryId lab",
            })
            .sort({ createdAt: -1 })
            .lean();

        console.log("🔍 rawRecords count:", rawRecords.length);

        // ============================================================
        // STEP 4: Manual filter — try lahat ng possible field names
        // ============================================================
        const validRecords = rawRecords.filter((r) => {
            const eq = r.equipmentId;
            if (!eq || !eq._id) return false;

            // ✅ Try lahat ng possible lab field names
            const eqLab = eq.laboratory || eq.laboratoryId || eq.lab;

            if (!eqLab) {
                // Kung walang lab field sa equipment, i-log at tanggapin
                // (o return false kung gusto mong i-exclude)
                console.warn(
                    `⚠️ Equipment ${eq._id} (${eq.code || "no-code"}) has no lab field`
                );
                return true; // ← tanggapin muna (backward compat)
            }

            return String(eqLab) === String(laboratoryId);
        });

        const invalidCount = rawRecords.length - validRecords.length;
        console.log("🔍 PMS004 raw count:", rawRecords.length);
        console.log("🔍 PMS004 valid count:", validRecords.length);
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
        console.error("💥 getAllPMS004 CRASHED");
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
// GET BY ID — Single PMS004 record
// ============================================================
exports.getPMS004ById = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const record = await PMS004.findById(req.params.id).populate(
        "equipmentId"
    );

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
exports.getPMS004ByEquipmentId = AsyncErrorHandler(
    async (req, res, next) => {
        const { equipmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
            return next(new CustomError("Invalid Equipment ID format", 400));
        }

        const records = await PMS004.find({ equipmentId })
            .populate("equipmentId")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            status: "success",
            totalRecords: records.length,
            data: records,
        });
    }
);

// ============================================================
// UPDATE — Update existing PMS004 record
// ============================================================
exports.updatePMS004 = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const filteredBody = {};
    Object.keys(req.body).forEach((key) => {
        const value = req.body[key];
        if (
            key !== "Remarks" &&
            value !== "" &&
            value !== null &&
            value !== undefined
        ) {
            filteredBody[key] = value;
        }
    });

    if (
        filteredBody.equipmentId &&
        !mongoose.Types.ObjectId.isValid(filteredBody.equipmentId)
    ) {
        return next(new CustomError("Invalid Equipment ID format", 400));
    }

    const normalizedBody = normalizeBooleans(filteredBody);

    const updated = await PMS004.findByIdAndUpdate(
        req.params.id,
        normalizedBody,
        { new: true, runValidators: true }
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
// DELETE — Remove PMS004 record
// ============================================================
exports.deletePMS004 = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const deleted = await PMS004.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return next(new CustomError("PMS record not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: null,
    });
});

exports.FindByEquipment = AsyncErrorHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({
            status: "fail",
            message: "User ID not found in request.",
        });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // STEP 1: Laboratory + Encharge
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
            total: 0,
            pmsRecord: [],
            data: {
                _id: laboratoryId,
                LaboratoryName: laboratory[0].LaboratoryName,
                performedBy,
            },
        });
    }

    // STEP 3: Date filter
    const dateFilter = {};

    if (!showAll && (from || to)) {
        dateFilter.createdAt = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid 'from' date format. Use YYYY-MM-DD.",
                });
            }
            fromDate.setHours(0, 0, 0, 0);
            dateFilter.createdAt.$gte = fromDate;
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
            dateFilter.createdAt.$lte = toDate;
        }
    }

    // ✅ STEP 4: Query — lab match + MAY EQUIPMENT LANG
    const pmsRecord = await PMS004.find({
        laboratoryId,
        ...dateFilter,
        equipmentId: { $ne: null, $exists: true },  // ✅ Filter sa DB
    })
        .populate("equipmentId")
        .sort({ createdAt: -1 })
        .lean();

    // ✅ Filter out orphaned (deleted equipment)
    const validRecords = pmsRecord.filter(
        (r) => r.equipmentId && r.equipmentId._id
    );

    console.log("pmsRecord (raw):", pmsRecord.length);
    console.log("validRecords (may equipment):", validRecords.length);
    console.log("performedBy:", performedBy);

    res.status(200).json({
        status: "success",
        total: validRecords.length,
        pmsRecord: validRecords,
        data: {
            _id: laboratoryId,
            LaboratoryName: laboratory[0].LaboratoryName,
            performedBy,
        },
    });
});