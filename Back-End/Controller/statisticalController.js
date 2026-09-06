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

        // ======================================================
        // MAINTENANCE REQUESTS WITH TECHNICIAN ASSIGNED
        // Technician is now a single ObjectId, not an array
        // ======================================================
        const requestsWithTechnician = await RequestMaintenance.countDocuments({
            Technician: { $ne: null, $exists: true }
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
                    satisfiedCount: satisfiedCount,
                    dissatisfiedCount: dissatisfiedCount,
                },

                // ==================================================
                // PIE CHART DATA
                // ==================================================
                pieCharts: {
                    equipmentAvailability: equipmentAvailabilityStatus,
                    equipmentAssignment: equipmentAssignmentStatus,
                    equipmentByCategory: equipmentByCategory,
                    maintenanceByScheduleType: maintenanceByScheduleType,
                    maintenanceTechnicianStatus: technicianAssignmentStatus,
                    requestsByStatus: requestsByStatus,
                    requestTechnicianStatus: technicianAssignmentRequests,
                    requestFeedbackStatus: feedbackStatus,
                    requestReadStatus: readStatus,
                    feedbackTypeDistribution: feedbackTypeDistribution,
                },

                // ==================================================
                // LINE GRAPH DATA
                // ==================================================
                lineGraphs: {
                    equipmentByYear: equipmentByYear,
                    equipmentByMonth: equipmentByMonth,
                    requestsByYear: requestsByYear,
                    requestsByMonth: requestsByMonth,
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
                    assignedByLaboratory: assignedByLaboratory,
                    maintenanceByLaboratory: maintenanceByLaboratory,
                    maintenanceByDepartment: maintenanceByDepartment,
                    requestsByLaboratory: requestsByLaboratory,
                    requestsByDepartment: requestsByDepartment,
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

        // Technician is now a single ObjectId, not an array
        const requestFilter = role === "Technician"
            ? { Technician: userId }
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

        // ======================================================
        // MAINTENANCE REQUESTS WITH TECHNICIAN ASSIGNED
        // Technician is now a single ObjectId, not an array
        // ======================================================
        const requestsWithTechnician = await RequestMaintenance.countDocuments({
            ...requestFilter,
            Technician: { $ne: null, $exists: true }
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

exports.getSupplyStatistical = AsyncErrorHandler(
    async (req, res, next) => {
        try {
            // =============================================
            // 1. BASIC COUNTS
            // =============================================
            const totalEquipment = await Equipment.countDocuments();
            const availableEquipment = await Equipment.countDocuments({ status: "Available" });
            const notAvailableEquipment = await Equipment.countDocuments({ status: "Not Available" });

            // =============================================
            // 2. PIE CHART - STATUS DISTRIBUTION
            // =============================================
            const statusPie = [
                { 
                    id: "Available", 
                    label: "Available", 
                    value: availableEquipment, 
                    color: "#10B981" 
                },
                { 
                    id: "Not Available", 
                    label: "Not Available", 
                    value: notAvailableEquipment, 
                    color: "#EF4444" 
                }
            ];

            // =============================================
            // 3. PIE CHART - CATEGORY DISTRIBUTION
            // =============================================
            const categoryData = await Equipment.aggregate([
                {
                    $lookup: {
                        from: "categories",
                        localField: "Category",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$categoryDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$Category",
                        name: { $first: "$categoryDetails.CategoryName" },
                        count: { $sum: 1 },
                        available: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Available"] }, 1, 0]
                            }
                        },
                        notAvailable: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Not Available"] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ]);

            const chartColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"];
            
            const categoryPie = categoryData.map((item, index) => ({
                id: item.name || "Uncategorized",
                label: item.name || "Uncategorized",
                value: item.count,
                available: item.available,
                notAvailable: item.notAvailable,
                color: chartColors[index % chartColors.length]
            }));

            // =============================================
            // 4. LINE CHART - MONTHLY TREND (Last 6 months)
            // =============================================
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyData = await Equipment.aggregate([
                {
                    $match: {
                        DateTime: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$DateTime" },
                            year: { $year: "$DateTime" }
                        },
                        count: { $sum: 1 },
                        available: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Available"] }, 1, 0]
                            }
                        },
                        notAvailable: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Not Available"] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 }
                }
            ]);

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            const lineChart = {
                labels: monthlyData.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`),
                datasets: [
                    {
                        label: "Total Equipment",
                        data: monthlyData.map(item => item.count),
                        borderColor: "#3B82F6",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        fill: true
                    },
                    {
                        label: "Available",
                        data: monthlyData.map(item => item.available),
                        borderColor: "#10B981",
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        fill: true
                    },
                    {
                        label: "Not Available",
                        data: monthlyData.map(item => item.notAvailable),
                        borderColor: "#EF4444",
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        fill: true
                    }
                ]
            };

            // =============================================
            // 5. BRAND DISTRIBUTION
            // =============================================
            const brandData = await Equipment.aggregate([
                {
                    $group: {
                        _id: "$Brand",
                        count: { $sum: 1 },
                        available: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Available"] }, 1, 0]
                            }
                        },
                        notAvailable: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Not Available"] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ]);

            const brandColors = ["#6366F1", "#EC4899", "#14B8A6", "#F97316", "#8B5CF6", "#06B6D4", "#D946EF", "#84CC16", "#F43F5E", "#0EA5E9"];
            
            const brandPie = brandData.map((item, index) => ({
                id: item._id || "Unknown",
                label: item._id || "Unknown",
                value: item.count,
                available: item.available,
                notAvailable: item.notAvailable,
                color: brandColors[index % brandColors.length]
            }));

            // =============================================
            // 6. EQUIPMENT WITH REMARKS (Issues)
            // =============================================
            const equipmentWithRemarks = await Equipment.countDocuments({
                remarks: { $ne: null, $ne: "", $ne: "N/A" }
            });

            // =============================================
            // 7. RECENTLY ADDED EQUIPMENT
            // =============================================
            const recentlyAdded = await Equipment.find()
                .populate("Category", "CategoryName")
                .sort({ DateTime: -1 })
                .limit(5)
                .lean();

            // =============================================
            // 8. SUMMARY CARDS (WITHOUT ICONS)
            // =============================================
            const cards = [
                {
                    title: "Total Equipment",
                    value: totalEquipment,
                    color: "blue",
                    subtitle: "All registered equipment"
                },
                {
                    title: "Available",
                    value: availableEquipment,
                    color: "green",
                    subtitle: `${totalEquipment > 0 ? ((availableEquipment / totalEquipment) * 100).toFixed(1) : 0}% of total`
                },
                {
                    title: "Not Available",
                    value: notAvailableEquipment,
                    color: "red",
                    subtitle: `${totalEquipment > 0 ? ((notAvailableEquipment / totalEquipment) * 100).toFixed(1) : 0}% of total`
                },
                {
                    title: "With Issues",
                    value: equipmentWithRemarks,
                    color: "yellow",
                    subtitle: `${totalEquipment > 0 ? ((equipmentWithRemarks / totalEquipment) * 100).toFixed(1) : 0}% have remarks`
                }
            ];

            // =============================================
            // 9. RESPONSE
            // =============================================
            res.status(200).json({
                success: true,
                data: {
                    cards,
                    charts: {
                        statusPie,
                        categoryPie,
                        brandPie,
                        lineChart
                    },
                    recentlyAdded: recentlyAdded.map(item => ({
                        id: item._id,
                        brand: item.Brand,
                        brandName: item.BrandName || item.Brand,
                        serialNumber: item.SerialNumber,
                        specification: item.Specification,
                        status: item.status,
                        category: item.Category?.CategoryName || "Uncategorized",
                        remarks: item.remarks || "N/A",
                        dateAdded: item.DateTime || item.createdAt
                    })),
                    summary: {
                        totalEquipment,
                        availableEquipment,
                        notAvailableEquipment,
                        equipmentWithRemarks,
                        totalCategories: categoryPie.length,
                        availablePercentage: totalEquipment > 0 
                            ? ((availableEquipment / totalEquipment) * 100).toFixed(1) 
                            : 0,
                        notAvailablePercentage: totalEquipment > 0 
                            ? ((notAvailableEquipment / totalEquipment) * 100).toFixed(1) 
                            : 0
                    }
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error("Error in getSupplyStatistical:", error);
            return res.status(500).json({
                success: false,
                message: "Error fetching equipment statistics",
                error: error.message
            });
        }
    }
);