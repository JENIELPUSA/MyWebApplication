// src/Controllers/PMS002Controller.js
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");
const CustomError = require("../Utils/CustomError");
const Equipment = require("../Models/Equipment");
const Laboratory = require("../Models/Laboratory");
const PMS002 = require("../Models/PMS002");

// ============================================================
// HELPER — Extract pms002 fields (kasama ang pmsNo)
// ✅ routineInspection = Boolean na
// ============================================================
const extractPMS002 = (pms002Record) => {
    if (!pms002Record) return null;

    return {
        _id: pms002Record._id,
        pmsNo: pms002Record.pmsNo || 0,

        // ✅ 8 boolean fields
        routineInspection: pms002Record.routineInspection ?? false,
        lubrication: pms002Record.lubrication ?? false,
        overhauling: pms002Record.overhauling ?? false,
        minorAdjustment: pms002Record.minorAdjustment ?? false,
        replaceWornOutParts: pms002Record.replaceWornOutParts ?? false,
        repair: pms002Record.repair ?? false,
        generalRecondition: pms002Record.generalRecondition ?? false,
        repairPart: pms002Record.repairPart ?? false,

        remarks: pms002Record.remarks || "",
        createdAt: pms002Record.createdAt,
    };
};

// ============================================================
// HELPER — Build date filter (from / to)
// ============================================================
const buildDateFilter = (from, to) => {
    const dateFilter = {};

    if (from || to) {
        dateFilter.createdAt = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                return { error: "Invalid 'from' date format. Use YYYY-MM-DD." };
            }
            fromDate.setHours(0, 0, 0, 0);
            dateFilter.createdAt.$gte = fromDate;
        }

        if (to) {
            const toDate = new Date(to);
            if (isNaN(toDate.getTime())) {
                return { error: "Invalid 'to' date format. Use YYYY-MM-DD." };
            }
            toDate.setHours(23, 59, 59, 999);
            dateFilter.createdAt.$lte = toDate;
        }
    }

    return { dateFilter };
};

// ============================================================
// HELPER — Normalize 8 boolean fields
// Handles: true, false, "D", "", 1, 0
// ============================================================
const BOOLEAN_FIELDS = [
    "routineInspection",
    "lubrication",
    "overhauling",
    "minorAdjustment",
    "replaceWornOutParts",
    "repair",
    "generalRecondition",
    "repairPart",
];

const normalizeBooleans = (body) => {
    const normalized = { ...body };

    BOOLEAN_FIELDS.forEach((field) => {
        if (field in body) {
            normalized[field] = Boolean(body[field]);
        }
    });

    return normalized;
};

// ============================================================
// src/Controllers/PMS002Controller.js

// ============================================================
// FIND BY EQUIPMENT — Isang row PER PMS002 RECORD
// ✅ WALANG MERGE — bawat PMS002 record = sariling row
// ============================================================
exports.FindByEquipment = AsyncErrorHandler(async (req, res) => {
    try {
        // 1️⃣ User → Laboratory
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

        // 2️⃣ Query flags
        const { from, to, all } = req.query;
        const showAll = all === "true" || all === "1";

        if (!showAll && !from && !to) {
            return res.status(200).json({
                status: "success",
                pmsRecord: [],
                totalPMS002: 0,
                totalPMS001: 0,
                totalMergedRecords: 0,
                data: {
                    _id: laboratoryId,
                    LaboratoryName: laboratory[0].LaboratoryName,
                    performedBy,
                },
            });
        }

        // 3️⃣ Date filter
        const { dateFilter, error: dateError } = buildDateFilter(
            showAll ? null : from,
            showAll ? null : to
        );

        if (dateError) {
            return res.status(400).json({
                status: "fail",
                message: dateError,
            });
        }

        // 4️⃣ PMS002 records — LAHAT
        const pmsRecords = await PMS002.find({
            laboratoryId,
            ...dateFilter,
        })
            .populate(
                "equipmentId",
                "code Brand DateAcquired SerialNumber Specification status remarks Category"
            )
            .sort({ createdAt: -1 })
            .lean();

        // 5️⃣ PMS001 records — para sa equipment metadata
        const pms001Records = await PMS001.find({
            laboratoryId,
            ...(showAll ? {} : dateFilter),
        })
            .populate(
                "equipmentId",
                "code Brand DateAcquired Specification"
            )
            .sort({ createdAt: -1 })
            .lean();

        console.log("🔍 PMS002 count:", pmsRecords.length);
        console.log("🔍 PMS001 count:", pms001Records.length);

        // 6️⃣ Map PMS001 by equipmentId
        const pms001ByEquipment = new Map();
        pms001Records.forEach((p1) => {
            if (!p1.equipmentId) return;
            const eqId = p1.equipmentId._id
                ? p1.equipmentId._id.toString()
                : p1.equipmentId.toString();
            if (!pms001ByEquipment.has(eqId)) {
                pms001ByEquipment.set(eqId, p1);
            }
        });

        // ============================================================
        // ✅ 7️⃣ BUILD MERGED — ISANG ROW PER PMS002 RECORD
        // WALANG GROUP BY EQUIPMENT — bawat PMS002 = sariling row
        // ============================================================
        const merged = pmsRecords.map((pms002Record) => {
            const eq = pms002Record.equipmentId || {};

            const eqId = eq._id
                ? eq._id.toString()
                : pms002Record.equipmentId?.toString() || null;

            const matchingPMS001 = eqId
                ? pms001ByEquipment.get(eqId)
                : null;

            return {
                // ✅ Unique PMS002 ID — ito ang gagamitin sa frontend
                pms002Id: pms002Record._id,
                pmsNo: pms002Record.pmsNo || 0,

                // Equipment info
                equipment: eq._id
                    ? {
                        _id: eq._id,
                        code: eq.code || "N/A",
                        Brand: eq.Brand || "N/A",
                        DateAcquired: eq.DateAcquired || null,
                        SerialNumber: eq.SerialNumber || "N/A",
                        Specification: eq.Specification || "N/A",
                        status: eq.status || "N/A",
                        remarks: eq.remarks || "",
                        Category: eq.Category || null,
                    }
                    : null,

                // PMS001 info (kung may match)
                pms001: matchingPMS001
                    ? {
                        _id: matchingPMS001._id,
                        code:
                            matchingPMS001.equipmentId?.code || "N/A",
                        equipmentName: matchingPMS001.equipmentId
                            ? `${matchingPMS001.equipmentId.Brand ||
                                ""
                                } ${matchingPMS001.equipmentId
                                    .Specification || ""
                                }`.trim() || "N/A"
                            : "N/A",
                        DateAcquired:
                            matchingPMS001.equipmentId?.DateAcquired ||
                            null,
                        serviceable:
                            matchingPMS001.serviceable ?? false,
                        nonServiceable:
                            matchingPMS001.nonServiceable ?? false,
                        type: matchingPMS001.type || "N/A",
                        breakdownNo:
                            matchingPMS001.breakdownNo || "0",
                        breakdownDuration:
                            matchingPMS001.breakdownDuration || "N/A",
                        availYes: matchingPMS001.availYes ?? false,
                        availNo: matchingPMS001.availNo ?? false,
                        remarks: matchingPMS001.remarks || "",
                        createdAt: matchingPMS001.createdAt,
                    }
                    : null,

                // ✅ PMS002 fields — DIRECT
                pms002: {
                    _id: pms002Record._id,
                    pmsNo: pms002Record.pmsNo || 0,
                    routineInspection:
                        pms002Record.routineInspection ?? false,
                    lubrication: pms002Record.lubrication ?? false,
                    overhauling: pms002Record.overhauling ?? false,
                    minorAdjustment:
                        pms002Record.minorAdjustment ?? false,
                    replaceWornOutParts:
                        pms002Record.replaceWornOutParts ?? false,
                    repair: pms002Record.repair ?? false,
                    generalRecondition:
                        pms002Record.generalRecondition ?? false,
                    repairPart: pms002Record.repairPart ?? false,
                    remarks: pms002Record.remarks || "",
                    createdAt: pms002Record.createdAt,
                },

                hasPMS001: !!matchingPMS001,
                hasPMS002: true,
                pms002Count: 1,
                latestActivityAt: pms002Record.createdAt,
            };
        });

        // 8️⃣ Sort by createdAt desc
        merged.sort((a, b) => {
            const aDate = a.pms002?.createdAt || 0;
            const bDate = b.pms002?.createdAt || 0;
            return new Date(bDate) - new Date(aDate);
        });

        console.log("🔍 merged.length:", merged.length);

        // 9️⃣ Response
        return res.status(200).json({
            status: "success",
            pmsRecord: merged,
            totalPMS002: pmsRecords.length,
            totalPMS001: pms001Records.length,
            totalMergedRecords: merged.length,
            data: {
                _id: laboratoryId,
                LaboratoryName: laboratory[0].LaboratoryName,
                performedBy,
            },
        });
    } catch (err) {
        console.error("💥 FindByEquipment CRASHED");
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
// CREATE — Add new PMS002 record (pmsNo auto-increment)
// ✅ Normalize booleans (routineInspection included)
// ============================================================
exports.createPMS002 = AsyncErrorHandler(async (req, res, next) => {
    const { equipmentId, laboratoryId } = req.body;

    console.log("BODY", req.body);

    // Validate equipmentId
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

    // Validate laboratoryId (optional — kung provided)
    if (laboratoryId) {
        if (!mongoose.Types.ObjectId.isValid(laboratoryId)) {
            return next(
                new CustomError("Invalid Laboratory ID format", 400)
            );
        }

        const laboratoryExists = await Laboratory.findById(laboratoryId);
        if (!laboratoryExists) {
            return next(new CustomError("Laboratory not found", 404));
        }
    }

    // ✅ Normalize booleans bago i-save
    const normalizedBody = normalizeBooleans(req.body);

    // pmsNo ay auto-generated sa pre("save") hook
    const newRecord = await PMS002.create(normalizedBody);

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
// GET ALL PMS002 — with Encharge matching + optional date filter
// + Admin: filter by laboratoryId from Frontend
// ============================================================
exports.getAllPMS002 = AsyncErrorHandler(async (req, res, next) => {
    try {
        const userID = req.user._id;
        const role = req.user.role;

        // Kunin ang laboratoryId + date filter mula sa frontend
        const {
            from,
            to,
            laboratoryId: frontendLaboratoryId,
        } = req.query;

        console.log("triggerrr____ getAllPMS002");
        console.log("role:", role);
        console.log("frontendLaboratoryId:", frontendLaboratoryId);

        // ============================================================
        // STEP 1: Role-based logic — kunin ang laboratoryId
        // ============================================================
        let laboratoryId = null;

        if (role === "User") {
            // ✅ User — auto-match sa Encharge lab
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
            // ✅ Admin — gamitin ang laboratoryId from query
            if (!frontendLaboratoryId) {
                return res.status(400).json({
                    status: "fail",
                    message: "laboratoryId is required for Admin role.",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(frontendLaboratoryId)) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid laboratoryId format.",
                });
            }

            laboratoryId = new mongoose.Types.ObjectId(frontendLaboratoryId);
        } else {
            // ❌ Other roles — hindi allowed
            return res.status(403).json({
                status: "fail",
                message: `Role "${role}" is not allowed to access this resource.`,
            });
        }

        // ============================================================
        // STEP 2: Kunin ang Laboratory details
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
        // STEP 3: Optional date filter
        // ============================================================
        const { dateFilter, error: dateError } = buildDateFilter(from, to);

        if (dateError) {
            return res.status(400).json({
                status: "fail",
                message: dateError,
            });
        }

        // ✅ Extra check: from > to
        if (
            dateFilter?.createdAt?.$gte &&
            dateFilter?.createdAt?.$lte &&
            dateFilter.createdAt.$gte > dateFilter.createdAt.$lte
        ) {
            return res.status(400).json({
                status: "fail",
                message: "'from' date cannot be after 'to' date.",
            });
        }

        // ============================================================
        // STEP 4: Query — strict lab + valid equipment only
        // ============================================================
        const pms002Query = {
            laboratoryId,
            // ✅ Filter sa DB level — walang equipment, walang record
            equipmentId: { $ne: null, $exists: true },
            ...dateFilter,
        };

        console.log("🔍 [getAllPMS002]");
        console.log("  - role:", role);
        console.log("  - laboratoryId:", laboratoryId);
        console.log("  - query:", JSON.stringify(pms002Query));

        // ✅ Populate with match — equipment ng target lab lang
        const rawRecords = await PMS002.find(pms002Query)
            .populate({
                path: "equipmentId",
                match: { laboratory: laboratoryId }, // ← i-adjust kung iba ang field name
                select:
                    "code Brand DateAcquired SerialNumber Specification status remarks Category laboratory",
            })
            .sort({ pmsNo: -1, createdAt: -1 })
            .lean();

        // ============================================================
        // STEP 5: Filter out null (ibang lab o deleted equipment)
        // ============================================================
        const validRecords = rawRecords.filter(
            (r) => r.equipmentId && r.equipmentId._id
        );

        const invalidCount = rawRecords.length - validRecords.length;

        console.log("🔍 PMS002 raw count:", rawRecords.length);
        console.log("🔍 PMS002 valid count:", validRecords.length);
        console.log("🔍 Filtered out (walang match):", invalidCount);

        // ============================================================
        // STEP 6: Response
        // ============================================================
        return res.status(200).json({
            status: "success",
            role: role,
            totalRecords: validRecords.length,
            data: validRecords.map((rec) => ({
                ...rec,
                pmsNo: rec.pmsNo || 0,
                routineInspection: rec.routineInspection ?? false,
            })),
            laboratory: {
                _id: laboratory._id,
                LaboratoryName: laboratory.LaboratoryName || "N/A",
            },
        });
    } catch (err) {
        console.error("💥 getAllPMS002 CRASHED");
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
// GET BY ID — Single PMS002 record
// ============================================================
exports.getPMS002ById = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const record = await PMS002.findById(req.params.id).populate(
        "equipmentId"
    );

    if (!record) {
        return next(new CustomError("PMS record not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            ...record.toObject(),
            pmsNo: record.pmsNo || 0,
            routineInspection: record.routineInspection ?? false,
        },
    });
});

// ============================================================
// GET BY EQUIPMENT ID — Lahat ng PMS history ng isang equipment
// ============================================================
exports.getPMS002ByEquipmentId = AsyncErrorHandler(
    async (req, res, next) => {
        const { equipmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
            return next(
                new CustomError("Invalid Equipment ID format", 400)
            );
        }

        const records = await PMS002.find({ equipmentId })
            .populate("equipmentId")
            .populate("laboratoryId")
            .sort({ pmsNo: -1 })
            .lean();

        res.status(200).json({
            status: "success",
            totalRecords: records.length,
            data: records.map((rec) => ({
                ...rec,
                pmsNo: rec.pmsNo || 0,
                routineInspection: rec.routineInspection ?? false,
            })),
        });
    }
);

// ============================================================
// UPDATE — Update existing PMS002 record
// ✅ Normalize booleans (routineInspection included)
// ✅ Keep `false` values (huwag i-filter)
// ============================================================
exports.updatePMS002 = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    // Iwasan ma-update ang pmsNo
    // ✅ BOOLEAN fields — keep false values (huwag i-filter)
    // ✅ String fields — filter empty values
    const filteredBody = {};
    Object.keys(req.body).forEach((key) => {
        if (key === "pmsNo") return;

        const value = req.body[key];

        // ✅ Boolean fields — always include (kahit false)
        if (BOOLEAN_FIELDS.includes(key)) {
            filteredBody[key] = Boolean(value);
            return;
        }

        // String fields — filter empty values
        if (value !== "" && value !== null && value !== undefined) {
            filteredBody[key] = value;
        }
    });

    // Validate equipmentId kung binago
    if (
        filteredBody.equipmentId &&
        !mongoose.Types.ObjectId.isValid(filteredBody.equipmentId)
    ) {
        return next(
            new CustomError("Invalid Equipment ID format", 400)
        );
    }

    // Validate laboratoryId kung binago
    if (
        filteredBody.laboratoryId &&
        !mongoose.Types.ObjectId.isValid(filteredBody.laboratoryId)
    ) {
        return next(
            new CustomError("Invalid Laboratory ID format", 400)
        );
    }

    const updated = await PMS002.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("equipmentId")
        .populate("laboratoryId");

    if (!updated) {
        return next(new CustomError("PMS record not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            ...updated.toObject(),
            pmsNo: updated.pmsNo || 0,
            routineInspection: updated.routineInspection ?? false,
        },
    });
});

// ============================================================
// DELETE — Remove PMS002 record
// ============================================================
exports.deletePMS002 = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const deleted = await PMS002.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return next(new CustomError("PMS record not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: null,
    });
});

// ============================================================
// DISPLAY ALL PMS002 — STRICT MATCH
// Kung walang match (laboratory or equipment), walang return
// ============================================================
exports.DisplayAllPMS002 = AsyncErrorHandler(async (req, res) => {
    try {
        const userID = req.user._id;
        const role = req.user.role;

        const { from, to, laboratoryId: frontendLaboratoryId } = req.query;

        // Iwas 304 / stale cache sa browser
        res.set("Cache-Control", "no-store");

        console.log("triggerrr____ DisplayAllPMS002");
        console.log("role:", role);
        console.log("frontendLaboratoryId:", frontendLaboratoryId);

        // ============================================================
        // STEP 1: Role-based — resolve laboratoryId
        // ============================================================
        let laboratoryId = null;

        if (role === "User") {
            const laboratory = await Laboratory.findOne({ Encharge: userID });

            if (!laboratory) {
                return res.status(404).json({
                    status: "fail",
                    message: "You are not assigned as Encharge to any laboratory.",
                });
            }

            laboratoryId = laboratory._id;
        } else if (role === "Admin") {
            if (!frontendLaboratoryId) {
                return res.status(400).json({
                    status: "fail",
                    message: "laboratoryId is required for Admin role.",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(frontendLaboratoryId)) {
                return res.status(400).json({
                    status: "fail",
                    message: "Invalid laboratoryId format.",
                });
            }

            laboratoryId = new mongoose.Types.ObjectId(frontendLaboratoryId);
        } else {
            return res.status(403).json({
                status: "fail",
                message: `Role "${role}" is not allowed to access this resource.`,
            });
        }

        // ============================================================
        // STEP 2: Laboratory details + Encharge
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

        const resolvedLaboratoryId = laboratory[0]._id;
        const performedBy = laboratory[0].performedBy || null;

        // ============================================================
        // STEP 3: Date filter
        // ============================================================
        const { dateFilter, error: dateError } = buildDateFilter(from, to);

        if (dateError) {
            return res.status(400).json({
                status: "fail",
                message: dateError,
            });
        }

        if (
            dateFilter?.createdAt?.$gte &&
            dateFilter?.createdAt?.$lte &&
            dateFilter.createdAt.$gte > dateFilter.createdAt.$lte
        ) {
            return res.status(400).json({
                status: "fail",
                message: "'from' date cannot be after 'to' date.",
            });
        }

        // ============================================================
        // STEP 4: Safety check — dapat existing ang field sa schema
        // (kung wala, hindi mapagkakatiwalaan ang filter)
        // ============================================================
        if (!PMS002.schema.path("laboratoryId")) {
            console.error("❌ PMS002 schema has NO 'laboratoryId' field!");
            return res.status(500).json({
                status: "fail",
                message: "PMS002 schema is missing 'laboratoryId' field.",
            });
        }

        // ============================================================
        // STEP 5: Aggregate — STRICT lab match + valid equipment only
        // ============================================================
        const labIdStr = resolvedLaboratoryId.toString();

        const pipeline = [
            {
                // Type-safe: gumagana kahit ObjectId o String ang naka-save
                $match: {
                    $expr: {
                        $eq: [{ $toString: "$laboratoryId" }, labIdStr],
                    },
                    ...dateFilter,
                },
            },
            {
                $lookup: {
                    from: Equipment.collection.name, // awtomatikong tamang collection name
                    let: { eqId: "$equipmentId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$eqId"] },
                                        {
                                            $eq: [
                                                { $toString: "$laboratory" },
                                                labIdStr,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                code: 1,
                                Brand: 1,
                                DateAcquired: 1,
                                SerialNumber: 1,
                                Specification: 1,
                                status: 1,
                                remarks: 1,
                                Category: 1,
                                laboratory: 1,
                            },
                        },
                    ],
                    as: "equipmentId",
                },
            },
            // Walang equipment sa lab = tanggal ang record
            { $unwind: "$equipmentId" },
            { $sort: { pmsNo: -1, createdAt: -1 } },
        ];

        const validRecords = await PMS002.aggregate(pipeline);

        // Para sa debugging lang
        const totalInLab = await PMS002.countDocuments({
            $expr: { $eq: [{ $toString: "$laboratoryId" }, labIdStr] },
        });

        console.log("🔍 Lab:", labIdStr);
        console.log("🔍 PMS002 in lab (walang date/equipment filter):", totalInLab);
        console.log("🔍 PMS002 valid count:", validRecords.length);

        // ============================================================
        // STEP 6: Response — walang match, walang laman
        // ============================================================
        return res.status(200).json({
            status: "success",
            role,
            pmsRecord002: validRecords.map((rec) => ({
                ...rec,
                routineInspection: rec.routineInspection ?? false,
            })),
            totalPMS002: validRecords.length,
            data: {
                _id: resolvedLaboratoryId,
                LaboratoryName: laboratory[0].LaboratoryName,
                performedBy,
            },
        });
    } catch (err) {
        console.error("💥 DisplayAllPMS002 CRASHED");
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