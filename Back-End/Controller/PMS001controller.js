const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");
const CustomError = require("../Utils/CustomError");
const PMS001 = require("../Models/PMS001");
const Equipment = require("../Models/Equipment");
const Laboratory = require("../Models/Laboratory");
const PMS002 = require("../Models/PMS002");
const PMS003 = require("../Models/PMS003");
const PMS004 = require("../Models/PMS004");
const PMS005 = require("../Models/PMS005");
const PMS006 = require("../Models/PMS006");
const PMS007 = require("../Models/PMS007");
const Department = require("../Models/Departmentmodel")

function resolveModel(mod, name) {
    if (!mod) {
        throw new Error(`${name}: module is undefined/null.`);
    }
    // 1) Direktang model (module.exports = Model)
    if (typeof mod.create === "function") return mod;

    // 2) ES module default export (export default Model)
    if (mod.default && typeof mod.default.create === "function") {
        return mod.default;
    }

    // 3) Named export na model (module.exports = { PMS003 })
    for (const key of Object.keys(mod)) {
        const candidate = mod[key];
        if (candidate && typeof candidate.create === "function") {
            return candidate;
        }
    }

    throw new Error(
        `${name}: Cannot resolve model. Got: ${typeof mod}, keys: ${Object.keys(
            mod || {}
        ).join(",")}`
    );
}

// ✅ Resolve lahat ng PMS models
const PMS002Model = resolveModel(PMS002, "PMS002");
const PMS003Model = resolveModel(PMS003, "PMS003");
const PMS004Model = resolveModel(PMS004, "PMS004");
const PMS005Model = resolveModel(PMS005, "PMS005");
const PMS006Model = resolveModel(PMS006, "PMS006");
const PMS007Model = resolveModel(PMS007, "PMS007");

// ✅ DEBUG — alisin pag okay na
console.log("=== IMPORT CHECK ===");
[
    ["PMS002", PMS002Model],
    ["PMS003", PMS003Model],
    ["PMS004", PMS004Model],
    ["PMS005", PMS005Model],
    ["PMS006", PMS006Model],
    ["PMS007", PMS007Model],
].forEach(([name, m]) => {
    console.log(`${name}: ${m.modelName} ✅`);
});
console.log("====================");

// ============================================================
// CREATE — Add new PMS001 record + auto-create PMS002–PMS007
// ============================================================
exports.createPMS001 = AsyncErrorHandler(async (req, res, next) => {
    try {
        const { equipmentId, laboratoryId } = req.body;

        console.log("📥 BODY:", req.body);

        // ---------- VALIDATION ----------
        if (!equipmentId) {
            return next(new CustomError("Equipment ID is required", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
            return next(
                new CustomError("Invalid Equipment ID format", 400)
            );
        }

        // ---------- EQUIPMENT CHECK ----------
        let equipmentExists;
        try {
            equipmentExists = await Equipment.findById(equipmentId);
        } catch (err) {
            console.error("💥 Equipment lookup failed:", err);
            return next(
                new CustomError(
                    `Equipment lookup failed: ${err.message}`,
                    500
                )
            );
        }

        if (!equipmentExists) {
            return next(new CustomError("Equipment not found", 404));
        }

        // ---------- LABORATORY RESOLVE ----------
        const resolvedLaboratoryId =
            laboratoryId || equipmentExists.laboratoryId || null;

        if (!resolvedLaboratoryId) {
            return next(
                new CustomError(
                    "Laboratory ID is required (not found in body or equipment)",
                    400
                )
            );
        }

        // ---------- 1. CREATE PMS001 ----------
        let newRecord;
        try {
            newRecord = await PMS001.create(req.body);
        } catch (err) {
            console.error("💥 PMS001 create failed:", err);
            return next(
                new CustomError(
                    `Failed to create PMS001: ${err.message}`,
                    400
                )
            );
        }

        if (!newRecord) {
            return next(
                new CustomError("Failed to create PMS record", 400)
            );
        }

        console.log("✅ PMS001 created:", newRecord._id);

        // ---------- 2. CREATE PMS002–PMS007 ----------
        const pmsModels = [
            { name: "PMS002", model: PMS002Model, extra: {} },
            {
                name: "PMS003",
                model: PMS003Model,
                extra: { date: newRecord.createdAt || new Date() },
            },
            { name: "PMS004", model: PMS004Model, extra: {} },
            { name: "PMS005", model: PMS005Model, extra: {} },
            { name: "PMS006", model: PMS006Model, extra: {} },
            { name: "PMS007", model: PMS007Model, extra: {} },
        ];

        const pmsResults = await Promise.allSettled(
            pmsModels.map(({ name, model, extra }) =>
                model
                    .create({
                        pms001Id: newRecord._id,
                        equipmentId: newRecord.equipmentId,
                        laboratoryId: resolvedLaboratoryId,
                        ...extra,
                    })
                    .then((doc) => ({ name, doc }))
            )
        );

        // ---------- 3. COLLECT RESULTS ----------
        const pmsRecords = {};
        const pmsErrors = {};

        pmsResults.forEach((result, index) => {
            const { name } = pmsModels[index];

            if (result.status === "fulfilled") {
                pmsRecords[name] = result.value.doc;
                console.log(`✅ ${name} created:`, result.value.doc._id);
            } else {
                const err = result.reason;
                const errDetail = {
                    name: err?.name,
                    message: err?.message,
                    validation: err?.errors
                        ? Object.keys(err.errors).reduce((acc, k) => {
                            acc[k] = err.errors[k].message;
                            return acc;
                        }, {})
                        : undefined,
                };
                console.error(`💥 ${name} create failed:`, errDetail);
                pmsRecords[name] = null;
                pmsErrors[name] = errDetail;
            }
        });

        // ---------- 4. POPULATE PMS001 ----------
        let populated;
        try {
            populated = await newRecord.populate("equipmentId");
        } catch (err) {
            console.error("💥 Populate failed:", err);
            populated = newRecord;
        }

        // ---------- 5. RESPONSE ----------
        const hasErrors = Object.keys(pmsErrors).length > 0;

        return res.status(hasErrors ? 207 : 201).json({
            status: hasErrors ? "partial" : "success",
            data: populated,
            linkedRecords: pmsRecords,
            linkedErrors: hasErrors ? pmsErrors : undefined,
        });
    } catch (err) {
        // ---------- GLOBAL CATCH ----------
        console.error("💥 createPMS001 CRASHED:");
        console.error("Message:", err.message);
        console.error("Name:", err.name);
        console.error("Stack:", err.stack);

        return next(
            new CustomError(
                `Internal server error: ${err.message}`,
                500
            )
        );
    }
});

exports.getAllPMS001 = AsyncErrorHandler(async (req, res, next) => {
    try {
        const userID = req.user._id;
        const role = req.user.role;
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
        const pms001Query = {
            laboratoryId,
            equipmentId: { $ne: null, $exists: true },
        };

        console.log("🔍 [getAllPMS001]");
        console.log("  - role:", role);
        console.log("  - laboratoryId:", laboratoryId);
        console.log("  - query:", JSON.stringify(pms001Query));

        // ✅ WALANG `match` — manual filter sa JS
        const rawRecords = await PMS001.find(pms001Query)
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
                return true;  // ← tanggapin muna (backward compat)
            }

            return String(eqLab) === String(laboratoryId);
        });

        const invalidCount = rawRecords.length - validRecords.length;
        console.log("🔍 PMS001 raw count:", rawRecords.length);
        console.log("🔍 PMS001 valid count:", validRecords.length);
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
        console.error("💥 getAllPMS001 CRASHED");
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
// GET BY ID — Single PMS001 record
// ============================================================
exports.getPMS001ById = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const record = await PMS001.findById(
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

        const records = await PMS001.find({ equipmentId })
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

    // Filter out empty values
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

    const updated = await PMS001.findByIdAndUpdate(
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
// DELETE — Remove PMS001 record + auto-delete linked PMS002–PMS007
// ============================================================
exports.deletePMS001 = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new CustomError("Invalid ID format", 400));
    }

    const { id } = req.params;

    const deleted = await PMS001.findByIdAndDelete(id);

    if (!deleted) {
        return next(new CustomError("PMS record not found", 404));
    }

    // ✅ Auto-delete lahat ng linked PMS002–PMS007
    const cascadeModels = [
        { name: "PMS002", model: PMS002Model },
        { name: "PMS003", model: PMS003Model },
        { name: "PMS004", model: PMS004Model },
        { name: "PMS005", model: PMS005Model },
        { name: "PMS006", model: PMS006Model },
        { name: "PMS007", model: PMS007Model },
    ];

    const cascadeResults = await Promise.allSettled(
        cascadeModels.map(({ name, model }) =>
            model
                .deleteMany({ pms001Id: id })
                .then((result) => ({
                    name,
                    deletedCount: result.deletedCount,
                }))
        )
    );

    const cascadeDeleted = {};
    cascadeResults.forEach((result, index) => {
        const { name } = cascadeModels[index];
        if (result.status === "fulfilled") {
            cascadeDeleted[name] = result.value.deletedCount;
        } else {
            console.error(
                `💥 ${name} cascade delete failed:`,
                result.reason?.message
            );
            cascadeDeleted[name] = 0;
        }
    });

    res.status(200).json({
        status: "success",
        data: null,
        cascadeDeleted,   // ✅ ilang records bawat PMS00X na-delete
    });
});

// ============================================================
// FIND BY EQUIPMENT — PMS records ng user's assigned laboratory
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

    // Hanapin ang Laboratory ng user
    const laboratory = await Laboratory.aggregate([
        { $match: { Encharge: userObjectId } },
        {
            $project: {
                _id: 1,
                LaboratoryName: { $ifNull: ["$LaboratoryName", "N/A"] },
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

    // 2️⃣ Query flags
    const { from, to, all } = req.query;
    const showAll = all === "true" || all === "1";

    // ✅ Kung walang from, walang to, at hindi 'all' → empty
    if (!showAll && !from && !to) {
        return res.status(200).json({
            status: "success",
            pmsRecord: [],
            data: {
                _id: laboratoryId,
                LaboratoryName: laboratory[0].LaboratoryName,
            },
        });
    }

    // 3️⃣ Buuin ang date filter
    const dateFilter = {};

    if (!showAll && (from || to)) {
        dateFilter.createdAt = {};

        if (from) {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    status: "fail",
                    message:
                        "Invalid 'from' date format. Use YYYY-MM-DD.",
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
                    message:
                        "Invalid 'to' date format. Use YYYY-MM-DD.",
                });
            }
            toDate.setHours(23, 59, 59, 999);
            dateFilter.createdAt.$lte = toDate;
        }
    }

    // 4️⃣ Kunin ang PMS records
    const pmsRecord = await PMS001.find({
        laboratoryId,
        ...dateFilter,
    })
        .populate("equipmentId")
        .sort({ createdAt: -1 });

    // 5️⃣ Response
    res.status(200).json({
        status: "success",
        pmsRecord,
        data: {
            _id: laboratoryId,
            LaboratoryName: laboratory[0].LaboratoryName,
        },
    });
});

// ============================================================
// DISPLAY ALL PMS001 — with Encharge matching + optional date filter
// + Admin: filter by laboratoryId from Frontend
// ============================================================
exports.DisplayAllPMS001 = AsyncErrorHandler(async (req, res) => {
    const userID = req.user._id;
    const role = req.user.role;

    // Kunin ang laboratoryId mula sa frontend (query o body)
    const { from, to, laboratoryId: frontendLaboratoryId } = req.query;

    console.log("laboratoryId",laboratoryId)

    // ============================================================
    // STEP 1: Base match stage
    // ============================================================
    let matchStage = {};
    let laboratoryId = null;

    // ============================================================
    // STEP 2: Role-based logic
    // ============================================================
    if (role === "User") {
        // ✅ User: hanapin ang laboratory kung saan siya ang Encharge
        const laboratory = await Laboratory.findOne({ Encharge: userID });

        console.log("laboratory (User):", laboratory);

        if (!laboratory) {
            return res.status(404).json({
                status: "fail",
                message: "You are not assigned as Encharge to any laboratory.",
            });
        }

        laboratoryId = laboratory._id;
    } else if (role === "Admin") {
        // ✅ Admin: gamitin ang laboratoryId na galing sa frontend
        if (!frontendLaboratoryId) {
            return res.status(400).json({
                status: "fail",
                message: "laboratoryId is required for Admin role.",
            });
        }

        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(frontendLaboratoryId)) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid laboratoryId format.",
            });
        }

        laboratoryId = new mongoose.Types.ObjectId(frontendLaboratoryId);
    } else {
        // ❌ Other roles (Technician, Supply) — hindi allowed
        return res.status(403).json({
            status: "fail",
            message: `Role "${role}" is not allowed to access this resource.`,
        });
    }

    // ============================================================
    // STEP 3: Kunin ang Laboratory details
    // ============================================================
    const laboratory = await Laboratory.aggregate([
        { $match: { _id: laboratoryId } },
        {
            $project: {
                _id: 1,
                LaboratoryName: { $ifNull: ["$LaboratoryName", "N/A"] },
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

    // ============================================================
    // STEP 4: Optional date filter
    // ============================================================
    const dateFilter = {};

    if (from || to) {
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
    // STEP 5: Kunin ang PMS records — matching + date filter
    // ============================================================
    const pmsQuery = {
        laboratoryId: laboratoryId,
        ...dateFilter,
    };

    const pmsRecord = await PMS001.find(pmsQuery)
        .populate("equipmentId")
        .sort({ createdAt: -1 });

    // ============================================================
    // STEP 6: Response
    // ============================================================
    res.status(200).json({
        status: "success",
        role: role,
        pmsRecord,
        data: {
            _id: laboratoryId,
            LaboratoryName: laboratory[0].LaboratoryName,
        },
    });
});
exports.getDepartmentsWithLabEquipments = AsyncErrorHandler(
    async (req, res, next) => {
        const result = await Department.aggregate([
            // 1) Join Laboratories
            {
                $lookup: {
                    from: "laboratories",
                    localField: "_id",
                    foreignField: "department",
                    as: "laboratories",
                },
            },

            // 2) ❌ Tanggalin ang departments na walang laboratories
            {
                $match: {
                    "laboratories.0": { $exists: true },
                },
            },

            // 3) Join PMS001 records
            {
                $lookup: {
                    from: "pms001s",
                    localField: "laboratories._id",
                    foreignField: "laboratoryId",
                    as: "pmsRecords",
                },
            },

            // 4) ✅ Join Users (Encharge) — para makuha ang FirstName/Middle/LastName
            {
                $lookup: {
                    from: "users",
                    localField: "laboratories.Encharge",
                    foreignField: "_id",
                    as: "enchargeUsers",
                },
            },

            // 5) Buuin per lab — PMS001 details + Encharge name
            {
                $project: {
                    _id: 1,
                    DepartmentName: { $ifNull: ["$DepartmentName", "N/A"] },
                    laboratoryCount: { $size: "$laboratories" },
                    laboratories: {
                        $map: {
                            input: {
                                $sortArray: {
                                    input: "$laboratories",
                                    sortBy: { LaboratoryName: 1 },
                                },
                            },
                            as: "lab",
                            in: {
                                _id: "$$lab._id",
                                // ✅ Idinagdag ang laboratoryId (explicit)
                                laboratoryId: "$$lab._id",
                                LaboratoryName: {
                                    $ifNull: ["$$lab.LaboratoryName", "N/A"],
                                },
                                // ✅ Encharge: _id + full name
                                Encharge: {
                                    _id: "$$lab.Encharge",
                                    FullName: {
                                        $let: {
                                            vars: {
                                                u: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: "$enchargeUsers",
                                                                as: "user",
                                                                cond: { $eq: ["$$user._id", "$$lab.Encharge"] },
                                                            },
                                                        },
                                                        0,
                                                    ],
                                                },
                                            },
                                            in: {
                                                $cond: [
                                                    { $ifNull: ["$$u", false] },
                                                    {
                                                        $trim: {
                                                            input: {
                                                                $concat: [
                                                                    { $ifNull: ["$$u.FirstName", ""] },
                                                                    " ",
                                                                    { $ifNull: ["$$u.Middle", ""] },
                                                                    " ",
                                                                    { $ifNull: ["$$u.LastName", ""] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    "N/A",
                                                ],
                                            },
                                        },
                                    },
                                    username: {
                                        $let: {
                                            vars: {
                                                u: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: "$enchargeUsers",
                                                                as: "user",
                                                                cond: { $eq: ["$$user._id", "$$lab.Encharge"] },
                                                            },
                                                        },
                                                        0,
                                                    ],
                                                },
                                            },
                                            in: { $ifNull: ["$$u.username", "N/A"] },
                                        },
                                    },
                                },
                                // ✅ PMS records
                                pmsRecords: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$pmsRecords",
                                                as: "pms",
                                                cond: {
                                                    $eq: ["$$pms.laboratoryId", "$$lab._id"],
                                                },
                                            },
                                        },
                                        as: "pms",
                                        in: {
                                            _id: "$$pms._id",
                                            laboratoryId: "$$pms.laboratoryId",
                                            equipmentId: "$$pms.equipmentId",
                                            serviceable: "$$pms.serviceable",
                                            nonServiceable: "$$pms.nonServiceable",
                                            type: "$$pms.type",
                                            breakdownNo: "$$pms.breakdownNo",
                                            breakdownDuration: "$$pms.breakdownDuration",
                                            availYes: "$$pms.availYes",
                                            availNo: "$$pms.availNo",
                                            remarks: "$$pms.remarks",
                                            createdAt: "$$pms.createdAt",
                                            updatedAt: "$$pms.updatedAt",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            { $sort: { DepartmentName: 1 } },
        ]);

        res.status(200).json({
            status: "success",
            totalDepartments: result.length,
            data: result,
        });
    },
);