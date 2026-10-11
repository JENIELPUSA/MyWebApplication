const History = require('../Models/HistorySchema');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Apifeatures = require('../Utils/ApiFeatures');
const CustomError = require('../Utils/CustomError');

// ==========================================
// DISPLAY - Ipakita ang lahat ng history records
// ==========================================
exports.displayHistory = AsyncErrorHandler(async (req, res) => {
    const {
        search = "",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        action,        // filter by action type (optional)
        userId,        // filter by user (optional)
        equipmentId,   // filter by equipment (optional)
        from,          // date range start (optional)
        to,            // date range end (optional)
    } = req.query;

    // ─── Pagination setup ────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // ─── Build $match (search + filters) ─────────────────────────────
    const matchStage = {};

    // Search across multiple fields
    if (search.trim()) {
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        matchStage.$or = [
            { action: { $regex: escaped, $options: "i" } },
            { description: { $regex: escaped, $options: "i" } },
            { performedBy: { $regex: escaped, $options: "i" } },
            { targetName: { $regex: escaped, $options: "i" } },
        ];
    }

    // Filter by action type
    if (action && action !== "All") {
        matchStage.action = action;
    }

    // Filter by user
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        matchStage.userId = new mongoose.Types.ObjectId(userId);
    }

    // Filter by equipment
    if (equipmentId && mongoose.Types.ObjectId.isValid(equipmentId)) {
        matchStage.equipmentId = new mongoose.Types.ObjectId(equipmentId);
    }

    // Date range filter
    if (from || to) {
        matchStage.createdAt = {};

        if (from) {
            const fromDate = new Date(from);
            if (!isNaN(fromDate.getTime())) {
                fromDate.setHours(0, 0, 0, 0);
                matchStage.createdAt.$gte = fromDate;
            }
        }

        if (to) {
            const toDate = new Date(to);
            if (!isNaN(toDate.getTime())) {
                toDate.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = toDate;
            }
        }

        // Kung empty ang date range object, tanggalin
        if (Object.keys(matchStage.createdAt).length === 0) {
            delete matchStage.createdAt;
        }
    }

    // ─── Build $sort (whitelist) ─────────────────────────────────────
    const allowedSortFields = [
        "createdAt",
        "action",
        "performedBy",
        "targetName",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;

    // ─── Shared pipeline ─────────────────────────────────────────────
    const basePipeline = [
        { $match: matchStage },
    ];

    // ─── Execute in parallel (data + count) ──────────────────────────
    const [dataResult, countResult] = await Promise.all([
        // Data pipeline
        History.aggregate([
            ...basePipeline,
            { $sort: { [sortField]: sortDir } },
            { $skip: skip },
            { $limit: limitNum },
        ]),
        // Count pipeline
        History.aggregate([
            ...basePipeline,
            { $count: "total" },
        ]),
    ]);

    const totalRecords = countResult[0]?.total || 0;

    // ─── Response ────────────────────────────────────────────────────
    res.status(200).json({
        status: "success",
        totalRecords,
        totalHistories: totalRecords, // backwards compat sa lumang frontend
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        limit: limitNum,
        count: dataResult.length,
        data: dataResult,
    });
});
// ==========================================
// DISPLAY ONE - Ipakita ang isang history record
// ==========================================
exports.displayOneHistory = AsyncErrorHandler(async (req, res, next) => {
    const history = await History.findById(req.params.id);

    if (!history) {
        const error = new CustomError('History record not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: history
    });
});

// ==========================================
// UPDATE - I-update ang isang history record
// ==========================================
exports.updateHistory = AsyncErrorHandler(async (req, res, next) => {
    const updatedHistory = await History.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedHistory) {
        const error = new CustomError('History record not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: updatedHistory
    });
});

// ==========================================
// DELETE - Burahin ang isang history record
// ==========================================
exports.deleteHistory = AsyncErrorHandler(async (req, res, next) => {
    const deletedHistory = await History.findByIdAndDelete(req.params.id);

    if (!deletedHistory) {
        const error = new CustomError('History record not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});