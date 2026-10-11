const { findById } = require('../Models/usermodel');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const department = require('./../Models/Departmentmodel');
const Apifeatures = require('./../Utils/ApiFeatures');


exports.createdepartment = AsyncErrorHandler(async (req, res) => {
    const departments = await department.create(req.body);
    res.status(201).json({
        status: 'success',
        data:
            departments

    })

})

exports.DisplayDepartment = AsyncErrorHandler(async (req, res) => {
    const {
        search = "",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        status,
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
            { DepartmentName: { $regex: escaped, $options: "i" } },
            { DepartmentCode: { $regex: escaped, $options: "i" } },
            { Description: { $regex: escaped, $options: "i" } },
        ];
    }

    // Filter by status (kung provided)
    if (status && status !== "All") {
        matchStage.status = status;
    }

    // ─── Build $sort (whitelist) ─────────────────────────────────────
    const allowedSortFields = [
        "createdAt",
        "DepartmentName",
        "DepartmentCode",
        "status",
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
        department.aggregate([
            ...basePipeline,
            { $sort: { [sortField]: sortDir } },
            { $skip: skip },
            { $limit: limitNum },
        ]),
        // Count pipeline
        department.aggregate([
            ...basePipeline,
            { $count: "total" },
        ]),
    ]);

    const totalRecords = countResult[0]?.total || 0;

    // ─── Response ────────────────────────────────────────────────────
    res.status(200).json({
        status: "success",
        totalRecords,
        totalDepartment: totalRecords, // backwards compat sa lumang frontend
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        limit: limitNum,
        count: dataResult.length,
        data: dataResult,
    });
});
exports.Updatedepartment = AsyncErrorHandler(async (req, res, next) => {
    const updatedepartment = await department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
        status: 'success',
        data:
            updatedepartment

    });
})

exports.deletedepartment = AsyncErrorHandler(async (req, res, next) => {
    await department.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status: 'success',
        data:
            null

    });
})

exports.getDepartment = AsyncErrorHandler(async (req, res, next) => {
    const dep = await department.findById(req.params.id)

    if (!dep) {
        const error = new CustomError('User with the ID is not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            dep
        }
    });

})
