const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Equipment = require("../Models/Equipment");
const Assign = require("../Models/AssigningEquipment");
const MaintenanceSchedule = require("../Models/TypesOfMaintenace");
const RequestMaintenance = require("../Models/RequestMaintenance");

exports.getEquipmentStatistics = AsyncErrorHandler(
    async (req, res, next) => {

        const role = req.user.role;
        const userId = req.user._id;

        console.log("role", role)
        console.log("userId", userId)

        // ======================================================
        // 1. TOTAL EQUIPMENT
        // ======================================================
        const totalEquipment = await Equipment.countDocuments();

        // ======================================================
        // 2. AVAILABLE EQUIPMENT
        // ======================================================
        const availableEquipment = await Equipment.countDocuments({
            status: "Available",
        });

        // ======================================================
        // 3. NOT AVAILABLE EQUIPMENT
        // ======================================================
        const notAvailableEquipment = await Equipment.countDocuments({
            status: "Not Available",
        });

        // ======================================================
        // 4. EQUIPMENT BY STATUS - PIE CHART DATA
        // ======================================================
        const equipmentByStatus = await Equipment.aggregate([
            {
                $group: {
                    _id: {
                        $ifNull: ["$status", "Unknown"],
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ["$count", totalEquipment] },
                            100
                        ]
                    }
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // ======================================================
        // 5. EQUIPMENT BY CATEGORY - PIE CHART DATA
        // ======================================================
        const equipmentByCategory = await Equipment.aggregate([
            {
                $group: {
                    _id: "$Category",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    categoryId: "$_id",
                    category: {
                        $ifNull: ["$category.CategoryName", "Unknown Category"],
                    },
                    count: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ["$count", totalEquipment] },
                            100
                        ]
                    }
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // ======================================================
        // 6. TOTAL ASSIGNMENTS
        // ======================================================
        const totalAssignments = await Assign.countDocuments();

        // ======================================================
        // 7. UNIQUE ASSIGNED EQUIPMENT
        // ======================================================
        const assignedEquipment = await Assign.distinct("Equipments");
        const validAssignedEquipment = assignedEquipment.filter(
            (equipment) => equipment !== null
        );
        const totalUniqueAssignedEquipment = validAssignedEquipment.length;

        // ======================================================
        // 8. ASSIGNED EQUIPMENT PER LABORATORY - BAR CHART DATA
        // ======================================================
        const assignedByLaboratory = await Assign.aggregate([
            {
                $group: {
                    _id: "$Laboratory",
                    totalEquipment: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: "laboratories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "laboratory",
                },
            },
            {
                $unwind: {
                    path: "$laboratory",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    laboratoryId: "$_id",
                    laboratory: {
                        $ifNull: ["$laboratory.LaboratoryName", "Unknown Laboratory"],
                    },
                    totalEquipment: 1,
                },
            },
            {
                $sort: {
                    totalEquipment: -1,
                },
            },
        ]);

        // ======================================================
        // 9. EQUIPMENT CREATED PER YEAR - LINE GRAPH DATA
        // ======================================================
        const equipmentByYear = await Equipment.aggregate([
            {
                $match: {
                    createdAt: {
                        $exists: true,
                        $ne: null,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $year: "$createdAt",
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    count: 1,
                },
            },
            {
                $sort: {
                    year: 1,
                },
            },
        ]);

        // ======================================================
        // 10. EQUIPMENT CREATED PER MONTH - LINE GRAPH DATA
        // ======================================================
        const equipmentByMonth = await Equipment.aggregate([
            {
                $match: {
                    createdAt: {
                        $exists: true,
                        $ne: null,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$createdAt",
                        },
                        month: {
                            $month: "$createdAt",
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    monthName: {
                        $let: {
                            vars: {
                                months: [
                                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                ]
                            },
                            in: {
                                $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                            }
                        }
                    }
                },
            },
            {
                $sort: {
                    year: 1,
                    month: 1,
                },
            },
        ]);

        // ======================================================
        // 11. EQUIPMENT NOT ASSIGNED
        // ======================================================
        const assignedEquipmentIds = validAssignedEquipment;
        const totalUnassignedEquipment = await Equipment.countDocuments({
            _id: {
                $nin: assignedEquipmentIds,
            },
        });

        // ======================================================
        // 12. PERCENTAGES
        // ======================================================
        const availablePercentage =
            totalEquipment > 0
                ? Number(
                    ((availableEquipment / totalEquipment) * 100).toFixed(2)
                )
                : 0;

        const notAvailablePercentage =
            totalEquipment > 0
                ? Number(
                    ((notAvailableEquipment / totalEquipment) * 100).toFixed(2)
                )
                : 0;

        const assignedPercentage =
            totalEquipment > 0
                ? Number(
                    ((totalUniqueAssignedEquipment / totalEquipment) * 100).toFixed(2)
                )
                : 0;

        const unassignedPercentage =
            totalEquipment > 0
                ? Number(
                    ((totalUnassignedEquipment / totalEquipment) * 100).toFixed(2)
                )
                : 0;

        // ======================================================
        // 13. MAINTENANCE SCHEDULE STATISTICS - PIE CHART DATA
        // ======================================================

        const totalMaintenanceSchedules = await MaintenanceSchedule.countDocuments();

        // Maintenance schedules by schedule type - PIE CHART
        const maintenanceByScheduleType = await MaintenanceSchedule.aggregate([
            {
                $group: {
                    _id: "$scheduleType",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    scheduleType: {
                        $ifNull: ["$_id", "Not Set"],
                    },
                    count: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ["$count", totalMaintenanceSchedules] },
                            100
                        ]
                    }
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // Maintenance schedules by laboratory - BAR CHART
        const maintenanceByLaboratory = await MaintenanceSchedule.aggregate([
            {
                $group: {
                    _id: "$Laboratory",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: "laboratories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "laboratory",
                },
            },
            {
                $unwind: {
                    path: "$laboratory",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    laboratoryId: "$_id",
                    laboratory: {
                        $ifNull: ["$laboratory.LaboratoryName", "Unknown Laboratory"],
                    },
                    count: 1,
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // Maintenance schedules by department - BAR CHART
        const maintenanceByDepartment = await MaintenanceSchedule.aggregate([
            {
                $group: {
                    _id: "$Department",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "_id",
                    foreignField: "_id",
                    as: "department",
                },
            },
            {
                $unwind: {
                    path: "$department",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    departmentId: "$_id",
                    department: {
                        $ifNull: ["$department.DepartmentName", "Unknown Department"],
                    },
                    count: 1,
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // Overdue maintenance schedules
        const allSchedules = await MaintenanceSchedule.find().lean();
        const overdueSchedules = allSchedules.filter(
            schedule => schedule.nextMaintenanceDate && new Date() > new Date(schedule.nextMaintenanceDate)
        );
        const totalOverdueSchedules = overdueSchedules.length;

        // Schedules with technician assigned vs not assigned - PIE CHART
        const withTechnician = await MaintenanceSchedule.countDocuments({
            assignedTechnician: { $ne: null }
        });
        const withoutTechnician = totalMaintenanceSchedules - withTechnician;

        const technicianAssignmentStatus = [
            {
                status: "With Technician",
                count: withTechnician,
                percentage: totalMaintenanceSchedules > 0
                    ? Number(((withTechnician / totalMaintenanceSchedules) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Without Technician",
                count: withoutTechnician,
                percentage: totalMaintenanceSchedules > 0
                    ? Number(((withoutTechnician / totalMaintenanceSchedules) * 100).toFixed(2))
                    : 0
            }
        ];

        // Equipment with maintenance schedule
        const equipmentWithSchedule = await MaintenanceSchedule.distinct("equipmentType");
        const totalEquipmentWithSchedule = equipmentWithSchedule.length;

        // ======================================================
        // 14. REQUEST MAINTENANCE STATISTICS
        // ======================================================

        const totalMaintenanceRequests = await RequestMaintenance.countDocuments();

        // Maintenance requests by status - PIE CHART
        const requestsByStatus = await RequestMaintenance.aggregate([
            {
                $group: {
                    _id: {
                        $ifNull: ["$Status", "Unknown"],
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ["$count", totalMaintenanceRequests] },
                            100
                        ]
                    }
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // Maintenance requests by laboratory - BAR CHART
        const requestsByLaboratory = await RequestMaintenance.aggregate([
            {
                $group: {
                    _id: "$Laboratory",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: "laboratories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "laboratory",
                },
            },
            {
                $unwind: {
                    path: "$laboratory",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    laboratoryId: "$_id",
                    laboratory: {
                        $ifNull: ["$laboratory.LaboratoryName", "Unknown Laboratory"],
                    },
                    count: 1,
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // Maintenance requests by department - BAR CHART
        const requestsByDepartment = await RequestMaintenance.aggregate([
            {
                $group: {
                    _id: "$Department",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "_id",
                    foreignField: "_id",
                    as: "department",
                },
            },
            {
                $unwind: {
                    path: "$department",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    departmentId: "$_id",
                    department: {
                        $ifNull: ["$department.DepartmentName", "Unknown Department"],
                    },
                    count: 1,
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);

        // Maintenance requests with technician assigned - PIE CHART
        const requestsWithTechnician = await RequestMaintenance.countDocuments({
            Technician: { $ne: [], $exists: true }
        });
        const requestsWithoutTechnician = totalMaintenanceRequests - requestsWithTechnician;

        const technicianAssignmentRequests = [
            {
                status: "With Technician",
                count: requestsWithTechnician,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithTechnician / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Without Technician",
                count: requestsWithoutTechnician,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithoutTechnician / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            }
        ];

        // Maintenance requests with feedback - PIE CHART
        const requestsWithFeedback = await RequestMaintenance.countDocuments({
            "feedback.message": { $ne: "", $exists: true }
        });
        const requestsWithoutFeedback = totalMaintenanceRequests - requestsWithFeedback;

        const feedbackStatus = [
            {
                status: "With Feedback",
                count: requestsWithFeedback,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithFeedback / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Without Feedback",
                count: requestsWithoutFeedback,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithoutFeedback / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            }
        ];

        // ======================================================
        // 15. MAINTENANCE REQUESTS BY FEEDBACK TYPE - BAR CHART
        // ======================================================
        const requestsByFeedbackType = await RequestMaintenance.aggregate([
            {
                $match: {
                    "feedback.type": { 
                        $in: ["Satisfied", "Dissatisfied"] 
                    }
                }
            },
            {
                $group: {
                    _id: "$feedback.type",
                    count: {
                        $sum: 1,
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    feedbackType: "$_id",
                    count: 1,
                }
            },
            {
                $sort: {
                    feedbackType: 1,
                }
            },
        ]);

        // Get counts for satisfied and dissatisfied
        const satisfiedCount = requestsByFeedbackType.find(item => item.feedbackType === "Satisfied")?.count || 0;
        const dissatisfiedCount = requestsByFeedbackType.find(item => item.feedbackType === "Dissatisfied")?.count || 0;

        // Unread maintenance requests - PIE CHART
        const unreadRequests = await RequestMaintenance.countDocuments({
            read: false
        });
        const readRequests = totalMaintenanceRequests - unreadRequests;

        const readStatus = [
            {
                status: "Read",
                count: readRequests,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((readRequests / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Unread",
                count: unreadRequests,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((unreadRequests / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            }
        ];

        // Maintenance requests created by year - LINE GRAPH
        const requestsByYear = await RequestMaintenance.aggregate([
            {
                $match: {
                    createdAt: {
                        $exists: true,
                        $ne: null,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $year: "$createdAt",
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    count: 1,
                },
            },
            {
                $sort: {
                    year: 1,
                },
            },
        ]);

        // Maintenance requests created by month - LINE GRAPH
        const requestsByMonth = await RequestMaintenance.aggregate([
            {
                $match: {
                    createdAt: {
                        $exists: true,
                        $ne: null,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$createdAt",
                        },
                        month: {
                            $month: "$createdAt",
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    monthName: {
                        $let: {
                            vars: {
                                months: [
                                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                ]
                            },
                            in: {
                                $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                            }
                        }
                    }
                },
            },
            {
                $sort: {
                    year: 1,
                    month: 1,
                },
            },
        ]);

        // ======================================================
        // 16. EQUIPMENT ASSIGNMENT STATUS - PIE CHART
        // ======================================================
        const equipmentAssignmentStatus = [
            {
                status: "Assigned",
                count: totalUniqueAssignedEquipment,
                percentage: assignedPercentage
            },
            {
                status: "Unassigned",
                count: totalUnassignedEquipment,
                percentage: unassignedPercentage
            }
        ];

        // ======================================================
        // 17. EQUIPMENT AVAILABILITY STATUS - PIE CHART
        // ======================================================
        const equipmentAvailabilityStatus = [
            {
                status: "Available",
                count: availableEquipment,
                percentage: availablePercentage
            },
            {
                status: "Not Available",
                count: notAvailableEquipment,
                percentage: notAvailablePercentage
            }
        ];

        // ======================================================
        // 18. FEEDBACK TYPE DISTRIBUTION - PIE CHART
        // ======================================================
        const feedbackTypeDistribution = [
            {
                status: "Satisfied",
                count: satisfiedCount,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((satisfiedCount / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Dissatisfied",
                count: dissatisfiedCount,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((dissatisfiedCount / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            },
            {
                status: "No Feedback",
                count: requestsWithoutFeedback,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithoutFeedback / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            }
        ];

        // ======================================================
        // FINAL RESPONSE WITH CHART DATA
        // ======================================================
        res.status(200).json({
            status: "success",
            data: {
                // ==================================================
                // SUMMARY
                // ==================================================
                summary: {
                    totalEquipment,
                    availableEquipment,
                    notAvailableEquipment,
                    totalAssignedEquipment: totalUniqueAssignedEquipment,
                    totalUnassignedEquipment,
                    totalAssignments,
                    totalMaintenanceSchedules,
                    totalOverdueSchedules,
                    totalEquipmentWithSchedule,
                    totalMaintenanceRequests,
                    withTechnician,
                    withoutTechnician,
                    requestsWithTechnician,
                    requestsWithoutTechnician,
                    requestsWithFeedback,
                    requestsWithoutFeedback,
                    unreadRequests,
                    // ✅ Feedback type counts
                    satisfiedCount: satisfiedCount,
                    dissatisfiedCount: dissatisfiedCount,
                },

                // ==================================================
                // PIE CHART DATA
                // ==================================================
                pieCharts: {
                    // Equipment Status Distribution
                    equipmentAvailability: equipmentAvailabilityStatus,

                    // Equipment Assignment Status
                    equipmentAssignment: equipmentAssignmentStatus,

                    // Equipment by Category
                    equipmentByCategory: equipmentByCategory,

                    // Maintenance Schedule by Type
                    maintenanceByScheduleType: maintenanceByScheduleType,

                    // Maintenance Technician Assignment
                    maintenanceTechnicianStatus: technicianAssignmentStatus,

                    // Maintenance Request Status
                    requestsByStatus: requestsByStatus,

                    // Request Technician Assignment
                    requestTechnicianStatus: technicianAssignmentRequests,

                    // Request Feedback Status
                    requestFeedbackStatus: feedbackStatus,

                    // Request Read Status
                    requestReadStatus: readStatus,

                    // ✅ Feedback Type Distribution (Satisfied/Dissatisfied/No Feedback)
                    feedbackTypeDistribution: feedbackTypeDistribution,
                },

                // ==================================================
                // LINE GRAPH DATA
                // ==================================================
                lineGraphs: {
                    // Equipment Created by Year
                    equipmentByYear: equipmentByYear,

                    // Equipment Created by Month
                    equipmentByMonth: equipmentByMonth,

                    // Maintenance Requests by Year
                    requestsByYear: requestsByYear,

                    // Maintenance Requests by Month
                    requestsByMonth: requestsByMonth,

                    // Combined Equipment & Requests by Year
                    equipmentAndRequestsByYear: {
                        labels: equipmentByYear.map(item => item.year.toString()),
                        datasets: [
                            {
                                label: "Equipment",
                                data: equipmentByYear.map(item => item.count),
                            },
                            {
                                label: "Maintenance Requests",
                                data: requestsByYear.map(item => item.count),
                            }
                        ]
                    }
                },

                // ==================================================
                // BAR CHART DATA
                // ==================================================
                barCharts: {
                    // Assigned Equipment by Laboratory
                    assignedByLaboratory: assignedByLaboratory,

                    // Maintenance Schedule by Laboratory
                    maintenanceByLaboratory: maintenanceByLaboratory,

                    // Maintenance Schedule by Department
                    maintenanceByDepartment: maintenanceByDepartment,

                    // Maintenance Requests by Laboratory
                    requestsByLaboratory: requestsByLaboratory,

                    // Maintenance Requests by Department
                    requestsByDepartment: requestsByDepartment,

                    // ✅ MAINTENANCE REQUESTS BY FEEDBACK TYPE (SATISFIED/DISSATISFIED) - BAR CHART
                    requestsByFeedbackType: requestsByFeedbackType,
                },

                // ==================================================
                // RAW DATA (for additional calculations if needed)
                // ==================================================
                rawData: {
                    equipmentByStatus: equipmentByStatus,
                }
            },
        });
    }
);

exports.getTechnicianStatistics = AsyncErrorHandler(
    async (req, res, next) => {

        const role = req.user.role;
        const userId = req.user._id;

        console.log("==========================================");
        console.log("TECHNICIAN STATISTICS CONTROLLER");
        console.log("Role:", role);
        console.log("User ID:", userId);
        console.log("==========================================");

        // ======================================================
        // FILTERS FOR TECHNICIAN ROLE ONLY
        // ======================================================
        const maintenanceFilter = role === "Technician" 
            ? { assignedTechnician: userId } 
            : {};

        const requestFilter = role === "Technician" 
            ? { Technician: { $in: [userId] } } 
            : {};

        console.log("Maintenance Filter:", JSON.stringify(maintenanceFilter));
        console.log("Request Filter:", JSON.stringify(requestFilter));

        // ======================================================
        // CHECK IF THERE IS DATA
        // ======================================================
        const maintenanceCount = await MaintenanceSchedule.countDocuments(maintenanceFilter);
        console.log("Maintenance count with filter:", maintenanceCount);
        
        const requestCount = await RequestMaintenance.countDocuments(requestFilter);
        console.log("Request count with filter:", requestCount);

        // ======================================================
        // 1. MAINTENANCE SCHEDULE STATISTICS
        // ======================================================

        const totalMaintenanceSchedules = maintenanceCount;

        // Maintenance schedules by schedule type - PIE CHART
        const maintenanceByScheduleType = await MaintenanceSchedule.aggregate([
            { $match: maintenanceFilter },
            {
                $group: {
                    _id: "$scheduleType",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    scheduleType: { $ifNull: ["$_id", "Not Set"] },
                    count: 1,
                    percentage: {
                        $cond: {
                            if: { $eq: [totalMaintenanceSchedules, 0] },
                            then: 0,
                            else: {
                                $multiply: [
                                    { $divide: ["$count", totalMaintenanceSchedules] },
                                    100
                                ]
                            }
                        }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Overdue maintenance schedules
        const allSchedules = await MaintenanceSchedule.find(maintenanceFilter).lean();
        const overdueSchedules = allSchedules.filter(
            schedule => schedule.nextMaintenanceDate && new Date() > new Date(schedule.nextMaintenanceDate)
        );
        const totalOverdueSchedules = overdueSchedules.length;

        // Upcoming maintenance schedules (next 7 days)
        const upcomingSchedules = allSchedules.filter(
            schedule => {
                if (!schedule.nextMaintenanceDate) return false;
                const now = new Date();
                const nextDate = new Date(schedule.nextMaintenanceDate);
                const diffTime = nextDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 7;
            }
        );
        const totalUpcomingSchedules = upcomingSchedules.length;

        // Schedules with technician assigned vs not assigned - PIE CHART
        const withTechnician = await MaintenanceSchedule.countDocuments({
            ...maintenanceFilter,
            assignedTechnician: { $ne: null }
        });
        const withoutTechnician = Math.max(totalMaintenanceSchedules - withTechnician, 0);

        const technicianAssignmentStatus = [
            {
                status: "With Technician",
                count: withTechnician,
                percentage: totalMaintenanceSchedules > 0
                    ? Number(((withTechnician / totalMaintenanceSchedules) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Without Technician",
                count: withoutTechnician,
                percentage: totalMaintenanceSchedules > 0
                    ? Number(((withoutTechnician / totalMaintenanceSchedules) * 100).toFixed(2))
                    : 0
            }
        ];

        // Equipment with maintenance schedule
        const equipmentWithSchedule = await MaintenanceSchedule.distinct(
            "equipmentType",
            maintenanceFilter
        );
        const totalEquipmentWithSchedule = equipmentWithSchedule.length;

        // Get list of equipment assigned to this technician
        const technicianEquipment = await MaintenanceSchedule.find(maintenanceFilter)
            .populate('equipmentType')
            .lean();
        
        const technicianEquipmentList = technicianEquipment
            .filter(item => item.equipmentType)
            .map(item => ({
                equipmentId: item.equipmentType._id,
                equipmentName: item.equipmentType.name || item.equipmentType.EquipmentName || 'Unknown',
                scheduleType: item.scheduleType,
                nextMaintenanceDate: item.nextMaintenanceDate,
                status: item.nextMaintenanceDate && new Date() > new Date(item.nextMaintenanceDate) 
                    ? 'Overdue' 
                    : 'Upcoming'
            }));

        // ======================================================
        // 2. REQUEST MAINTENANCE STATISTICS
        // ======================================================

        const totalMaintenanceRequests = requestCount;

        // Maintenance requests by status - PIE CHART
        const requestsByStatus = await RequestMaintenance.aggregate([
            { $match: requestFilter },
            {
                $group: {
                    _id: { $ifNull: ["$Status", "Unknown"] },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1,
                    percentage: {
                        $cond: {
                            if: { $eq: [totalMaintenanceRequests, 0] },
                            then: 0,
                            else: {
                                $multiply: [
                                    { $divide: ["$count", totalMaintenanceRequests] },
                                    100
                                ]
                            }
                        }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Maintenance requests with technician assigned - PIE CHART
        const requestsWithTechnician = await RequestMaintenance.countDocuments({
            ...requestFilter,
            Technician: { $ne: [], $exists: true }
        });
        const requestsWithoutTechnician = Math.max(totalMaintenanceRequests - requestsWithTechnician, 0);

        const technicianAssignmentRequests = [
            {
                status: "With Technician",
                count: requestsWithTechnician,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithTechnician / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Without Technician",
                count: requestsWithoutTechnician,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithoutTechnician / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            }
        ];

        // Maintenance requests with feedback - PIE CHART
        const requestsWithFeedback = await RequestMaintenance.countDocuments({
            ...requestFilter,
            "feedback.message": { $ne: "", $exists: true }
        });
        const requestsWithoutFeedback = Math.max(totalMaintenanceRequests - requestsWithFeedback, 0);

        const feedbackStatus = [
            {
                status: "With Feedback",
                count: requestsWithFeedback,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithFeedback / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            },
            {
                status: "Without Feedback",
                count: requestsWithoutFeedback,
                percentage: totalMaintenanceRequests > 0
                    ? Number(((requestsWithoutFeedback / totalMaintenanceRequests) * 100).toFixed(2))
                    : 0
            }
        ];

        // ======================================================
        // 3. TECHNICIAN PERFORMANCE METRICS
        // ======================================================
        
        // Get all requests for this technician
        const allRequests = await RequestMaintenance.find(requestFilter).lean();
        
        // Count by status
        const completedRequests = allRequests.filter(req => req.Status === "Completed");
        const completedRequestsCount = completedRequests.length;
        
        // Count "Not Accomplish" - all status that are NOT "Completed"
        const notAccomplishRequests = allRequests.filter(req => 
            req.Status !== "Completed"
        );
        const notAccomplishCount = notAccomplishRequests.length;

        // Calculate completion rate (based on Status = "Completed")
        const completionRate = totalMaintenanceRequests > 0
            ? Number(((completedRequestsCount / totalMaintenanceRequests) * 100).toFixed(2))
            : 0;

        // Calculate not accomplish rate (based on Status != "Completed")
        const notAccomplishRate = totalMaintenanceRequests > 0
            ? Number(((notAccomplishCount / totalMaintenanceRequests) * 100).toFixed(2))
            : 0;

        // ======================================================
        // 4. MAINTENANCE SCHEDULE CREATED BY YEAR - LINE GRAPH
        // ======================================================
        const maintenanceByYear = await MaintenanceSchedule.aggregate([
            {
                $match: {
                    ...maintenanceFilter,
                    createdAt: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    count: 1
                }
            },
            { $sort: { year: 1 } }
        ]);

        // ======================================================
        // 5. MAINTENANCE SCHEDULE CREATED BY MONTH - LINE GRAPH
        // ======================================================
        const maintenanceByMonth = await MaintenanceSchedule.aggregate([
            {
                $match: {
                    ...maintenanceFilter,
                    createdAt: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    monthName: {
                        $let: {
                            vars: {
                                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                            },
                            in: {
                                $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                            }
                        }
                    }
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);

        // ======================================================
        // 6. REQUESTS CREATED BY YEAR - LINE GRAPH
        // ======================================================
        const requestsByYear = await RequestMaintenance.aggregate([
            {
                $match: {
                    ...requestFilter,
                    createdAt: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    count: 1
                }
            },
            { $sort: { year: 1 } }
        ]);

        // ======================================================
        // 7. REQUESTS CREATED BY MONTH - LINE GRAPH
        // ======================================================
        const requestsByMonth = await RequestMaintenance.aggregate([
            {
                $match: {
                    ...requestFilter,
                    createdAt: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    monthName: {
                        $let: {
                            vars: {
                                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                            },
                            in: {
                                $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                            }
                        }
                    }
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);

        // ======================================================
        // 8. COMBINED YEARLY DATA - LINE GRAPH
        // ======================================================
        const maintenanceYears = maintenanceByYear.map(item => item.year);
        const requestYears = requestsByYear.map(item => item.year);
        
        const allYears = [...maintenanceYears, ...requestYears];
        const uniqueYears = allYears.length > 0 
            ? [...new Set(allYears)].sort((a, b) => a - b)
            : [new Date().getFullYear()];

        const maintenanceAndRequestsByYear = uniqueYears.map(year => {
            const maintenance = maintenanceByYear.find(item => item.year === year);
            const request = requestsByYear.find(item => item.year === year);
            return {
                year: year,
                maintenanceSchedules: maintenance ? maintenance.count : 0,
                maintenanceRequests: request ? request.count : 0
            };
        });

        // ======================================================
        // 9. COMBINED MONTHLY DATA - LINE GRAPH
        // ======================================================
        const maintenanceMonthKeys = maintenanceByMonth.map(item => 
            `${item.year}-${String(item.month).padStart(2, '0')}`
        );
        const requestMonthKeys = requestsByMonth.map(item => 
            `${item.year}-${String(item.month).padStart(2, '0')}`
        );
        const allMonthKeys = [...maintenanceMonthKeys, ...requestMonthKeys];
        
        let maintenanceAndRequestsByMonth = [];
        
        if (allMonthKeys.length > 0) {
            const uniqueMonthKeys = [...new Set(allMonthKeys)].sort();
            
            maintenanceAndRequestsByMonth = uniqueMonthKeys.map(key => {
                const [year, month] = key.split('-').map(Number);
                const maintenance = maintenanceByMonth.find(
                    item => item.year === year && item.month === month
                );
                const request = requestsByMonth.find(
                    item => item.year === year && item.month === month
                );
                
                const monthName = maintenance ? maintenance.monthName : 
                                 (request ? request.monthName : 
                                 ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]);
                
                return {
                    year,
                    month,
                    monthName,
                    maintenanceSchedules: maintenance ? maintenance.count : 0,
                    maintenanceRequests: request ? request.count : 0
                };
            }).sort((a, b) => a.year - b.year || a.month - b.month);
        } else {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentMonth - 1];
            
            maintenanceAndRequestsByMonth = [{
                year: currentYear,
                month: currentMonth,
                monthName: monthName,
                maintenanceSchedules: 0,
                maintenanceRequests: 0
            }];
        }

        // ======================================================
        // FINAL RESPONSE WITH CHART DATA
        // ======================================================
        res.status(200).json({
            status: "success",
            data: {
                // ==================================================
                // SCOPE INFORMATION
                // ==================================================
                scope: {
                    role,
                    userId: role === "Technician" ? userId : null,
                    filterApplied: role === "Technician" 
                        ? "Filtered by assigned technician" 
                        : "No filter applied (all data)"
                },
                // ==================================================
                // DASHBOARD CARDS
                // ==================================================
                dashboardCards: {
                    totalMaintenanceSchedules,
                    totalOverdueSchedules,
                    totalUpcomingSchedules,
                    totalMaintenanceRequests,
                    completedRequests: completedRequestsCount,
                    notAccomplish: notAccomplishCount,
                    completionRate,
                    notAccomplishRate,
                    withTechnician,
                    withoutTechnician,
                    requestsWithTechnician,
                    requestsWithoutTechnician,
                    requestsWithFeedback,
                    requestsWithoutFeedback
                },
                // ==================================================
                // TECHNICIAN EQUIPMENT LIST
                // ==================================================
                technicianEquipment: {
                    total: technicianEquipmentList.length,
                    list: technicianEquipmentList
                },
                // ==================================================
                // PIE CHARTS
                // ==================================================
                pieCharts: {
                    maintenanceByScheduleType,
                    maintenanceTechnicianStatus: technicianAssignmentStatus,
                    requestsByStatus,
                    requestTechnicianStatus: technicianAssignmentRequests,
                    requestFeedbackStatus: feedbackStatus
                },
                // ==================================================
                // LINE GRAPHS
                // ==================================================
                lineGraphs: {
                    maintenanceByYear,
                    maintenanceByMonth,
                    requestsByYear,
                    requestsByMonth,
                    maintenanceAndRequestsByYear,
                    maintenanceAndRequestsByMonth
                }
            }
        });
    }
);