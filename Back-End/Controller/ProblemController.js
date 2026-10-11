const Problem = require('../Models/ProblemEquipmet');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Apifeatures = require('../Utils/ApiFeatures');
const CustomError = require('../Utils/CustomError');

// CREATE - Gumawa ng bagong problema
exports.createProblem = AsyncErrorHandler(async (req, res) => {
    const problem = await Problem.create(req.body);
    res.status(201).json({
        status: 'success',
        data: problem
    });
});

// ==========================================
// DISPLAY - Ipakita ang lahat ng problema
// ==========================================
exports.displayProblem = AsyncErrorHandler(async (req, res) => {
    const {
        search = "",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        status,        // filter by status (optional)
        priority,      // filter by priority (optional)
        category,      // filter by category (optional)
        reportedBy,    // filter by user (optional)
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
            { title: { $regex: escaped, $options: "i" } },
            { description: { $regex: escaped, $options: "i" } },
            { category: { $regex: escaped, $options: "i" } },
            { reportedBy: { $regex: escaped, $options: "i" } },
            { location: { $regex: escaped, $options: "i" } },
        ];
    }

    // Filter by status
    if (status && status !== "All") {
        matchStage.status = status;
    }

    // Filter by priority
    if (priority && priority !== "All") {
        matchStage.priority = priority;
    }

    // Filter by category
    if (category && category !== "All") {
        matchStage.category = category;
    }

    // Filter by user (kung ObjectId ang reference)
    if (reportedBy && mongoose.Types.ObjectId.isValid(reportedBy)) {
        matchStage.reportedBy = new mongoose.Types.ObjectId(reportedBy);
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
        "title",
        "status",
        "priority",
        "category",
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
        Problem.aggregate([
            ...basePipeline,
            { $sort: { [sortField]: sortDir } },
            { $skip: skip },
            { $limit: limitNum },
        ]),
        // Count pipeline
        Problem.aggregate([
            ...basePipeline,
            { $count: "total" },
        ]),
    ]);

    const totalRecords = countResult[0]?.total || 0;

    // ─── Response ────────────────────────────────────────────────────
    res.status(200).json({
        status: "success",
        totalRecords,
        totalProblems: totalRecords, // backwards compat sa lumang frontend
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        limit: limitNum,
        count: dataResult.length,
        data: dataResult,
    });
});

// UPDATE - I-update ang isang problema
exports.updateProblem = AsyncErrorHandler(async (req, res, next) => {
    const updatedProblem = await Problem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedProblem) {
        const error = new CustomError('Problem with the ID is not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: updatedProblem
    });
});

// DELETE - Burahin ang isang problema
exports.deleteProblem = AsyncErrorHandler(async (req, res, next) => {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);

    if (!deletedProblem) {
        const error = new CustomError('Problem with the ID is not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});