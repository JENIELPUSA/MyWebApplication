const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const user = require("../Models/usermodel");
const Apifeatures = require("./../Utils/ApiFeatures");

exports.createUser = AsyncErrorHandler(async (req, res) => {
  console.log("req.body", req.body);
  const { FirstName, LastName, email, password } = req.body;

  // Check for required fields
  if (!FirstName || !LastName || !email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please fill in all required fields.",
    });
  }

  // Validate email format
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a valid email address.",
    });
  }

  // Create user
  const newUser = await user.create(req.body);

  res.status(201).json({
    status: "success",
    data: newUser,
  });
});



exports.DisplayAll = AsyncErrorHandler(async (req, res) => {
  const {
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    role,
    status,
  } = req.query;

  // 1. Pagination setup
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // 2. Build match stage
  const matchStage = {};

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    matchStage.$or = [
      { FirstName: { $regex: escaped, $options: "i" } },
      { Middle: { $regex: escaped, $options: "i" } },
      { LastName: { $regex: escaped, $options: "i" } },
      { Email: { $regex: escaped, $options: "i" } },
      { Username: { $regex: escaped, $options: "i" } },
    ];
  }

  if (role && role !== "All") {
    matchStage.role = role;
  }

  if (status && status !== "All") {
    matchStage.status = status;
  }

  // 3. Allowed sorting fields
  const allowedSortFields = [
    "createdAt",
    "FirstName",
    "LastName",
    "Email",
    "Username",
    "role",
    "status",
  ];

  const sortField = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const sortDir = sortOrder === "asc" ? 1 : -1;

  // 4. Base pipeline
  const basePipeline = [
    { $match: matchStage },
    {
      $project: {
        password: 0,
        passwordConfirm: 0,
        passwordChangedAt: 0,
        passwordResetToken: 0,
        passwordResetExpires: 0,
      },
    },
  ];

  // 5. Execute data and count
  const [dataResult, countResult] = await Promise.all([
    user.aggregate([
      ...basePipeline,

      // Latest registered user first
      {
        $sort: {
          [sortField]: sortDir,
          _id: -1,
        },
      },

      { $skip: skip },
      { $limit: limitNum },
    ]),

    user.aggregate([
      ...basePipeline,
      { $count: "total" },
    ]),
  ]);

  const totalRecords = countResult[0]?.total || 0;

  // 6. Response
  res.status(200).json({
    status: "success",
    totalRecords,
    totalUser: totalRecords,
    currentPage: pageNum,
    totalPages: Math.ceil(totalRecords / limitNum) || 1,
    limit: limitNum,
    count: dataResult.length,
    data: dataResult,
  });
});



// ==========================================
// 🥈 2. UPDATE DATA / ASSIGN TECHNICIAN
// ==========================================
exports.updateDataAssignTechnician = AsyncErrorHandler(
  async (req, res, next) => {
    try {
      const { RequestId } = req.params;
      const {
        technicianId,
        MessageId,
        status,
        remarks,
        LaboratoryEnchargeId,
        feedback,
        action,
        SetSchedule,
      } = req.body;

      console.log("action", action);

      if (!RequestId) {
        return next(new CustomError("RequestId is required in URL", 400));
      }

      // Get the request
      const request = await requestmaintenance.findById(RequestId)
        .populate("Equipments")
        .populate("Department")
        .populate("Laboratory")
        .populate("Technician");

      if (!request) {
        return next(new CustomError("Maintenance request not found", 404));
      }

      // ==========================================
      // HELPER FUNCTIONS
      // ==========================================
      const getFeedbackText = (feedbackData) => {
        if (!feedbackData) return null;
        if (typeof feedbackData === "string") return feedbackData.trim() || null;
        if (typeof feedbackData === "object") {
          if (feedbackData.message) return typeof feedbackData.message === "string" ? feedbackData.message.trim() : null;
          if (feedbackData.remarks) return typeof feedbackData.remarks === "string" ? feedbackData.remarks.trim() : null;
          return JSON.stringify(feedbackData);
        }
        return null;
      };

      const getFeedbackType = (feedbackData) => {
        if (!feedbackData || typeof feedbackData !== "object") return null;
        return feedbackData.type || null;
      };

      const getFeedbackSubmittedBy = (feedbackData) => {
        if (!feedbackData || typeof feedbackData !== "object") return null;
        return feedbackData.submittedBy || null;
      };

      const parseSetSchedule = (value) => {
        if (value === undefined || value === null || value === "") return null;
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      const applySetSchedule = (updateData, { required = false } = {}) => {
        const parsed = parseSetSchedule(SetSchedule);
        if (required) {
          if (!parsed) throw new CustomError("SetSchedule is required when approving a request. Please provide a valid date.", 400);
          updateData.$set.SetSchedule = parsed;
          return updateData;
        }
        if (SetSchedule !== undefined && SetSchedule !== null && SetSchedule !== "") {
          updateData.$set.SetSchedule = parsed;
        }
        return updateData;
      };

      // Get existing message data
      let existingMessage = null;
      let inchargeId = null;
      let laboratoryData = [];

      if (RequestId) {
        existingMessage = await Message.findOne({ RequestID: RequestId });
        if (existingMessage) {
          if (existingMessage.Laboratory && existingMessage.Laboratory.length > 0) {
            laboratoryData = existingMessage.Laboratory;
          }
          if (existingMessage.Encharge) {
            inchargeId = existingMessage.Encharge;
          }
        }
      }

      if (laboratoryData.length === 0 && request.Laboratory) {
        laboratoryData = [request.Laboratory._id || request.Laboratory];
      }
      if (!inchargeId && request.Encharge) {
        inchargeId = request.Encharge;
      }

      const feedbackText = getFeedbackText(feedback);
      const feedbackType = getFeedbackType(feedback);
      const feedbackSubmittedBy = getFeedbackSubmittedBy(feedback);

      // Lookup Helper
      const getRequestWithLookup = async (requestId) => {
        const result = await requestmaintenance.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(requestId) } },
          { $lookup: { from: "users", localField: "Technician", foreignField: "_id", as: "TechnicianDetails" } },
          { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "departments", localField: "Department", foreignField: "_id", as: "DepartmentInfo" } },
          { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "laboratories", localField: "Laboratory", foreignField: "_id", as: "LaboratoryInfo" } },
          { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "equipment", localField: "Equipments", foreignField: "_id", as: "EquipmentInfo" } }, // I-adjust kung 'equipments' ang collection name
          { $unwind: { path: "$EquipmentInfo", preserveNullAndEmptyArrays: true } },
          { $lookup: { from: "categories", localField: "EquipmentInfo.Category", foreignField: "_id", as: "CategoryInfo" } },
          { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1, id: 1, DateTime: 1, Ref: 1, read: 1, Status: 1, feedback: 1,
              feedbackread: 1, Description: 1, Remarks: 1, remarksread: 1, SetSchedule: 1,
              EquipmentId: { $ifNull: ["$EquipmentInfo._id", "N/A"] },
              EquipmentName: { $ifNull: ["$EquipmentInfo.Brand", "N/A"] },
              EquipmentSerial: { $ifNull: ["$EquipmentInfo.Serial", "N/A"] },
              EquipmentSpecification: { $ifNull: ["$EquipmentInfo.Specification", "N/A"] },
              CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
              DepartmentId: "$DepartmentInfo._id",
              Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
              LaboratoryId: "$LaboratoryInfo._id",
              laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
              EnchargeId: "$LaboratoryInfo.Encharge",
              TechnicianId: "$TechnicianDetails._id",
              Technician: { $concat: ["$TechnicianDetails.FirstName", " ", { $ifNull: ["$TechnicianDetails.Middle", ""] }, " ", "$TechnicianDetails.LastName"] },
              TechnicianEmail: "$TechnicianDetails.Email",
              DateTimeAccomplish: 1, createdAt: 1, updatedAt: 1
            }
          }
        ]);
        return result[0] || null;
      };

      // History Helper
      const saveToHistory = async (lookupData, actionType) => {
        if (!lookupData) return null;
        const historyData = {
          equipment: lookupData.EquipmentName || "N/A",
          ref: lookupData.Ref || lookupData._id,
          category: lookupData.CategoryName || "N/A",
          department: lookupData.Department || "N/A",
          lab: lookupData.laboratoryName || "N/A",
          description: lookupData.Description || "N/A",
          remarks: lookupData.Remarks || "",
          status: lookupData.Status || "Pending",
          technician: lookupData.Technician || "N/A",
          date: lookupData.DateTime || new Date(),
          schedule: lookupData.SetSchedule || null,
          feedback: typeof lookupData.feedback === "object" ? lookupData.feedback.message || "" : lookupData.feedback || ""
        };
        const history = new History(historyData);
        await history.save();
        return history;
      };

      // Socket Helper
      const emitSocketUpdate = (actionType, data) => {
        const io = req.app.get("io");
        if (io) {
          io.emit("requestmaintenance:created", {
            status: "success",
            action: actionType,
            data: data,
            timestamp: new Date(),
          });
          console.log(`📡 [Socket] Broadcasted 'requestmaintenance:created' - Action: ${actionType}`);
        }
      };

      // ==========================================
      // FLOW 1: RE-ASSIGN
      // ==========================================
      if (action === "Re-assign") {
        console.log("🔄 RE-ASSIGN FLOW DETECTED");
        if (!technicianId) return next(new CustomError("technicianId is required for reassignment", 400));

        const currentTechnicianId = request.Technician?._id || request.Technician;
        let oldTechnician = currentTechnicianId ? await user.findById(currentTechnicianId) : null;
        let newTechnician = technicianId ? await user.findById(technicianId) : null;

        const getTechnicianName = (tech) => {
          if (!tech) return 'Unknown Technician';
          if (tech.FirstName && tech.LastName) return `${tech.FirstName} ${tech.LastName}`;
          return tech.username || tech.email || 'Technician';
        };

        const updateData = { $set: { Technician: technicianId } };
        if (request.Status === "Assigned" || request.Status === "In Progress") updateData.$set.Status = "Assigned";
        applySetSchedule(updateData);

        const updatedRequest = await requestmaintenance.findByIdAndUpdate(RequestId, updateData, { new: true, runValidators: true })
          .populate("Equipments").populate("Department").populate("Laboratory").populate("Technician");

        const lookupData = await getRequestWithLookup(updatedRequest._id);
        const history = await saveToHistory(lookupData, "Re-assign");
        emitSocketUpdate("Re-assign", lookupData || updatedRequest);

        const oldMessage = await Message.findOne({ RequestID: RequestId, isReassign: false });
        let updatedMessage = null;
        if (oldMessage) {
          await Message.updateOne({ _id: oldMessage._id }, { $set: { isReassign: true } }, { runValidators: false });
          updatedMessage = await Message.findById(oldMessage._id);
        }

        const equipmentBrand = request.Equipments ? (request.Equipments.EquipmentBrand || request.Equipments.name || "N/A") : "N/A";
        const oldTechName = oldTechnician ? getTechnicianName(oldTechnician) : "Unknown Technician";
        const newTechName = newTechnician ? getTechnicianName(newTechnician) : "Unknown Technician";
        const reassignDate = new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
        const targetInchargeId = LaboratoryEnchargeId || inchargeId;
        const equipLabel = equipmentBrand !== "N/A" ? `${equipmentBrand} (${request.Ref || request._id})` : `${request.Ref || request._id}`;

        // New Tech Notification
        const newTechnicianNotification = await Message.create({
          message: `Re-assigned task: ${equipLabel}. Previous technician was ${oldTechName}. ${reassignDate}.${remarks ? ` Remarks: ${remarks}` : ""}`,
          equipmentId: request.Equipments?._id || null,
          typesNotification: "AssignedTechnician",
          Status: "Re-Assigned",
          Laboratory: laboratoryData,
          Department: request.Department?._id || null,
          To: "Technician",
          Encharge: technicianId,
          role: "Technician",
          RequestID: request._id,
          read: false,
          viewers: [{ user: technicianId, isRead: false }],
          parentMessageId: oldMessage?._id || MessageId || null,
          reassignedFrom: currentTechnicianId,
          reassignedTo: technicianId,
          reassignedAt: new Date(),
        });

        // Old Tech Notification
        let oldTechnicianNotification = null;
        if (currentTechnicianId) {
          oldTechnicianNotification = await Message.create({
            message: `Task ${equipLabel} is no longer assigned to you. Reassigned to ${newTechName}. ${reassignDate}.`,
            equipmentId: request.Equipments?._id || null,
            typesNotification: "AssignedTechnician",
            Status: "Re-Assigned",
            Laboratory: laboratoryData,
            Department: request.Department?._id || null,
            To: "Technician",
            Encharge: currentTechnicianId,
            role: "Technician",
            RequestID: request._id,
            read: false,
            viewers: [{ user: currentTechnicianId, isRead: false }],
            parentMessageId: oldMessage?._id || MessageId || null,
            reassignedFrom: currentTechnicianId,
            reassignedTo: technicianId,
            reassignedAt: new Date(),
            isReassignFrom: true,
            isReassign: true,
          });
        }

        // Incharge Notification
        let inchargeNotification = null;
        if (targetInchargeId) {
          const inchargeUser = await user.findById(targetInchargeId).catch(() => null);
          inchargeNotification = await Message.create({
            message: `Task ${equipLabel} reassigned from ${oldTechName} to ${newTechName}. ${reassignDate}.${remarks ? ` Remarks: ${remarks}` : ""}`,
            equipmentId: request.Equipments?._id || null,
            typesNotification: "AssignedTechnician",
            Status: "Re-Assigned",
            Laboratory: laboratoryData,
            Department: request.Department?._id || null,
            To: "Incharge",
            Encharge: targetInchargeId,
            role: inchargeUser?.role || "Incharge",
            RequestID: request._id,
            read: false,
            viewers: [{ user: targetInchargeId, isRead: false }],
            parentMessageId: oldMessage?._id || MessageId || null,
            reassignedFrom: currentTechnicianId,
            reassignedTo: technicianId,
            reassignedAt: new Date(),
            isReassign: true,
          });
        }

        // Admin Notification
        let adminNotification = null;
        const adminUsers = await user.find({ role: { $in: ["Admin", "SuperAdmin"] } });
        if (adminUsers.length > 0) {
          const viewers = adminUsers.map((adminUser) => ({ user: adminUser._id, isRead: false }));
          adminNotification = await Message.create({
            message: `Task ${equipLabel} reassigned from ${oldTechName} to ${newTechName}. ${reassignDate}.`,
            equipmentId: request.Equipments?._id || null,
            typesNotification: "AssignedTechnician",
            Status: "Re-Assigned",
            Laboratory: laboratoryData,
            Department: request.Department?._id || null,
            To: "Admin",
            Encharge: adminUsers[0]._id,
            role: "Admin",
            RequestID: request._id,
            read: false,
            viewers: viewers,
            parentMessageId: oldMessage?._id || MessageId || null,
            reassignedFrom: currentTechnicianId,
            reassignedTo: technicianId,
            reassignedAt: new Date(),
            isReassign: true,
          });
        }

        return res.status(200).json({
          success: true, message: "Task re-assigned successfully",
          data: lookupData || updatedRequest, history, messageData: updatedMessage,
          newTechnicianNotification, oldTechnicianNotification, inchargeNotification, adminNotification,
          newTechnicianNotified: !!newTechnicianNotification, oldTechnicianNotified: !!oldTechnicianNotification,
          inchargeNotified: !!inchargeNotification, adminNotified: !!adminNotification,
          reassignedFrom: currentTechnicianId, reassignedTo: technicianId,
        });
      }

      // ==========================================
      // FLOW 2: COMPLETED
      // ==========================================
      else if (status === "Completed") {
        const updateData = { $set: { Status: "Completed" } };
        if (remarks && typeof remarks === "string" && remarks.trim() !== "") {
          updateData.$set.Remarks = remarks.trim();
          updateData.$set.remarksread = false;
        }
        if (feedbackText) {
          updateData.$set.feedback = typeof feedback === "object" && feedback !== null ? feedback : {
            type: feedbackType || "", message: feedbackText, submittedBy: feedbackSubmittedBy || "User", submittedAt: new Date()
          };
          updateData.$set.feedbackread = false;
        }
        applySetSchedule(updateData);

        const updatedRequest = await requestmaintenance.findByIdAndUpdate(RequestId, updateData, { new: true, runValidators: true })
          .populate("Equipments").populate("Department").populate("Laboratory").populate("Technician");

        const lookupData = await getRequestWithLookup(updatedRequest._id);
        const history = await saveToHistory(lookupData, "Completed");
        emitSocketUpdate("Completed", lookupData || updatedRequest);

        const existingCompletedMessages = await Message.find({ RequestID: request._id, typesNotification: "TaskCompleted" });
        if (existingCompletedMessages.length > 0) {
          return res.status(200).json({
            success: true, message: "Task is already completed. Notification already exists.",
            data: lookupData || updatedRequest, history, adminNotifications: existingCompletedMessages,
            adminNotified: true, adminCount: existingCompletedMessages.length, duplicatePrevented: true, feedbackUpdated: !!feedbackText, feedbackData: feedback,
          });
        }

        const adminUsers = await user.find({ role: "Admin" });
        const adminNotifications = [];

        if (adminUsers.length > 0) {
          const tech = request.Technician;
          const technicianName = (tech && tech.FirstName && tech.LastName) ? `${tech.FirstName} ${tech.LastName}` : (tech ? (tech.username || tech.email) : "Unknown Technician");
          const equipmentBrand = request.Equipments ? (request.Equipments.EquipmentBrand || request.Equipments.name || "N/A") : "N/A";
          const departmentId = request.Department ? (request.Department._id || request.Department) : null;
          const laboratoryId = request.Laboratory ? (request.Laboratory._id || request.Laboratory) : null;
          const completedDate = new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
          const equipLabel = equipmentBrand !== "N/A" ? `${equipmentBrand} (${request.Ref || request._id})` : `${request.Ref || request._id}`;
          const completionMessage = `Task ${equipLabel} completed by ${technicianName}. ${completedDate}.${remarks && typeof remarks === "string" ? ` Remarks: ${remarks.trim()}` : ""}${feedbackText ? ` Feedback: ${feedbackText}` : ""}`;

          let feedbackToStore = null;
          if (feedbackText) {
            feedbackToStore = typeof feedback === "object" && feedback !== null ? feedback : { type: feedbackType || "", message: feedbackText, submittedBy: feedbackSubmittedBy || "User", submittedAt: new Date() };
          }

          for (const adminUser of adminUsers) {
            const notif = await Message.create({
              message: completionMessage,
              equipmentId: request.Equipments?._id || null,
              typesNotification: "TaskCompleted",
              Status: "Completed",
              Laboratory: laboratoryId ? [laboratoryId] : laboratoryData,
              Department: departmentId || null,
              To: "Admin",
              Encharge: adminUser._id,
              role: adminUser.role || "Admin",
              RequestID: request._id,
              read: false,
              viewers: [{ user: adminUser._id, isRead: false }],
              feedback: feedbackToStore,
              feedbackType: feedbackType,
              feedbackSubmittedBy: feedbackSubmittedBy,
              parentMessageId: MessageId || null,
            });
            adminNotifications.push(notif);
          }
        }

        return res.status(200).json({
          success: true, message: "Task marked as completed successfully. All admins have been notified.",
          data: lookupData || updatedRequest, history, adminNotifications,
          adminNotified: adminNotifications.length > 0, adminCount: adminNotifications.length,
          duplicatePrevented: false, feedbackUpdated: !!feedbackText, feedbackData: feedback,
        });
      }

      // ==========================================
      // FLOW 3: APPROVED (🆕 MAY LABORATORY ENCHARGE LOGIC)
      // ==========================================
      else if (status === "Approved") {
        const parsedSchedule = parseSetSchedule(SetSchedule);
        if (!parsedSchedule) {
          return next(new CustomError("SetSchedule is required when approving a request. Please provide a valid date.", 400));
        }

        const updateData = { $set: { Status: "Approved" } };
        if (remarks && typeof remarks === "string" && remarks.trim() !== "") {
          updateData.$set.Remarks = remarks.trim();
          updateData.$set.remarksread = false;
        }
        if (feedbackText) {
          updateData.$set.feedback = typeof feedback === "object" && feedback !== null ? feedback : {
            type: feedbackType || "", message: feedbackText, submittedBy: feedbackSubmittedBy || "User", submittedAt: new Date()
          };
          updateData.$set.feedbackread = false;
        }
        applySetSchedule(updateData, { required: true });

        const updatedRequest = await requestmaintenance.findByIdAndUpdate(RequestId, updateData, { new: true, runValidators: true })
          .populate("Equipments").populate("Department").populate("Laboratory").populate("Technician");

        const lookupData = await getRequestWithLookup(updatedRequest._id);
        const history = await saveToHistory(lookupData, "Approved");
        emitSocketUpdate("Approved", lookupData || updatedRequest);

        const existingApprovedMessage = await Message.findOne({ RequestID: request._id, typesNotification: "TechnicianConfirmed" });
        if (existingApprovedMessage) {
          return res.status(200).json({
            success: true, message: "Request is already approved. Notification already exists.",
            data: lookupData || updatedRequest, history, adminNotifications: [existingApprovedMessage],
            adminNotified: true, adminCount: 1, duplicatePrevented: true, feedbackUpdated: !!feedbackText, feedbackData: feedback,
          });
        }

        // 🆕 NEW: GET LABORATORY ENCHARGE FROM DATABASE
        const rawLabId = request.Laboratory ? (request.Laboratory._id || request.Laboratory) : null;
        let enchargeUserId = null;

        if (rawLabId) {
          const laboratoryRecord = await Laboratory.findById(rawLabId);
          if (laboratoryRecord && laboratoryRecord.Encharge) {
            enchargeUserId = laboratoryRecord.Encharge; // Exact field name from your schema
          }
        }

        const adminUsers = await user.find({ role: { $in: ["Admin", "SuperAdmin"] } });
        let adminNotification = null;
        let enchargeNotification = null; // 🆕 NEW: Variable for Encharge Notification

        if (adminUsers.length > 0 || enchargeUserId) {
          const tech = request.Technician;
          const technicianName = (tech && tech.FirstName && tech.LastName) ? `${tech.FirstName} ${tech.LastName}` : (tech ? (tech.username || tech.email) : "Unknown Technician");
          const equipmentBrand = request.Equipments ? (request.Equipments.EquipmentBrand || request.Equipments.name || "N/A") : "N/A";
          const departmentId = request.Department ? (request.Department._id || request.Department) : null;
          const laboratoryId = request.Laboratory ? (request.Laboratory._id || request.Laboratory) : null;

          const scheduleDate = parsedSchedule ? new Date(parsedSchedule).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "Not specified";
          const equipLabel = equipmentBrand !== "N/A" ? `${equipmentBrand} (${request.Ref || request._id})` : `${request.Ref || request._id}`;

          let feedbackToStore = null;
          if (feedbackText) {
            feedbackToStore = typeof feedback === "object" && feedback !== null ? feedback : { type: feedbackType || "", message: feedbackText, submittedBy: feedbackSubmittedBy || "User", submittedAt: new Date() };
          }

          // 1. CREATE NOTIFICATION FOR ADMINS
          if (adminUsers.length > 0) {
            const professionalMessage = `Task ${equipLabel} confirmed by ${technicianName}. Scheduled on: ${scheduleDate}.${remarks && typeof remarks === "string" ? ` Remarks: ${remarks.trim()}` : ""}${feedbackText ? ` Feedback: ${feedbackText}` : ""}`;
            const viewers = adminUsers.map((adminUser) => ({ user: adminUser._id, isRead: false }));

            adminNotification = await Message.create({
              message: professionalMessage,
              equipmentId: request.Equipments?._id || null,
              typesNotification: "TechnicianConfirmed",
              Status: "Approved",
              Laboratory: laboratoryId ? [laboratoryId] : laboratoryData,
              Department: departmentId || null,
              To: "Admin",
              Encharge: adminUsers[0]._id,
              role: adminUsers[0].role || "Admin",
              RequestID: request._id,
              read: false,
              viewers: viewers,
              feedback: feedbackToStore,
              feedbackType: feedbackType,
              feedbackSubmittedBy: feedbackSubmittedBy,
              parentMessageId: MessageId || null,
            });
          }

          // 🆕 2. CREATE NOTIFICATION FOR LABORATORY ENCHARGE
          if (enchargeUserId) {
            const enchargeUserDetails = await user.findById(enchargeUserId);
            const enchargeMessage = `Good news! The maintenance request for ${equipLabel} has been APPROVED. Technician ${technicianName} is scheduled to work on it at: ${scheduleDate}.`;

            enchargeNotification = await Message.create({
              message: enchargeMessage,
              equipmentId: request.Equipments?._id || null,
              typesNotification: "RequestApproved",
              Status: "Approved",
              Laboratory: laboratoryId ? [laboratoryId] : laboratoryData,
              Department: departmentId || null,
              To: "Incharge",
              Encharge: enchargeUserId,
              role: enchargeUserDetails?.role || "Incharge",
              RequestID: request._id,
              read: false,
              viewers: [
                {
                  user: enchargeUserId, // 🎯 Dito na-save ang Encharge sa viewers para makita niya ang notification
                  isRead: false,
                },
              ],
              feedback: feedbackToStore,
              parentMessageId: MessageId || null,
            });
          }
        }

        return res.status(200).json({
          success: true,
          message: "Request approved successfully. Admins and Laboratory In-charge have been notified.",
          data: lookupData || updatedRequest,
          history: history,
          adminNotifications: adminNotification ? [adminNotification] : [],
          enchargeNotification: enchargeNotification, // 🆕 Return this in response
          adminNotified: !!adminNotification,
          enchargeNotified: !!enchargeNotification, // 🆕 Return this in response
          adminCount: adminNotification ? 1 : 0,
          feedbackUpdated: !!feedbackText,
          feedbackData: feedback,
          duplicatePrevented: false,
        });
      }

      // ==========================================
      // FLOW 4: INCHARGE CONFIRMED
      // ==========================================
      else if (status === "InchargedConfirmed" && remarks && typeof remarks === "string" && remarks.trim() !== "") {
        const updateData = { $set: { Status: "InchargedConfirmed", Remarks: remarks.trim(), remarksread: false } };
        if (feedbackText) {
          updateData.$set.feedback = typeof feedback === "object" && feedback !== null ? feedback : {
            type: feedbackType || "", message: feedbackText, submittedBy: feedbackSubmittedBy || "User", submittedAt: new Date()
          };
          updateData.$set.feedbackread = false;
        }
        applySetSchedule(updateData);

        const updatedRequest = await requestmaintenance.findByIdAndUpdate(RequestId, updateData, { new: true, runValidators: true })
          .populate("Equipments").populate("Department").populate("Laboratory").populate("Technician");

        const lookupData = await getRequestWithLookup(updatedRequest._id);
        const history = await saveToHistory(lookupData, "InchargedConfirmed");
        emitSocketUpdate("InchargedConfirmed", lookupData || updatedRequest);

        let updatedMessage = null;
        if (MessageId) {
          const messageUpdateData = { $set: { remarks: remarks.trim(), read: true } };
          if (feedbackText) {
            messageUpdateData.$set.feedback = typeof feedback === "object" && feedback !== null ? feedback : {
              type: feedbackType || "", message: feedbackText, submittedBy: feedbackSubmittedBy || "User", submittedAt: new Date()
            };
          }
          updatedMessage = await Message.findByIdAndUpdate(MessageId, messageUpdateData, { new: true, runValidators: true });
        }

        let inchargeNotification = null;
        const targetInchargeId = LaboratoryEnchargeId || inchargeId;
        if (targetInchargeId) {
          const tech = request.Technician;
          const technicianName = (tech && tech.FirstName && tech.LastName) ? `${tech.FirstName} ${tech.LastName}` : (tech ? (tech.username || tech.email) : "Unknown Technician");
          const equipmentBrand = request.Equipments ? (request.Equipments.EquipmentBrand || request.Equipments.name || "N/A") : "N/A";
          const equipLabel = equipmentBrand !== "N/A" ? `${equipmentBrand} (${request.Ref || request._id})` : `${request.Ref || request._id}`;
          const inchargeMessage = `Task ${equipLabel} completed by ${technicianName} and awaiting your confirmation. ${new Date().toLocaleString()}.${remarks ? ` Remarks: ${remarks.trim()}` : ""}`;

          const inchargeUser = await user.findById(targetInchargeId).catch(() => null);
          inchargeNotification = await Message.create({
            message: inchargeMessage,
            equipmentId: request.Equipments?._id || null,
            typesNotification: "InchargeConfirmation",
            Status: "Waiting_Feedback_Incharge",
            Laboratory: laboratoryData,
            To: "Incharge",
            Encharge: targetInchargeId,
            role: inchargeUser?.role || "Incharge",
            RequestID: request._id,
            read: false,
            viewers: [{ user: targetInchargeId, isRead: false }],
            parentMessageId: MessageId || null
          });
        }

        return res.status(200).json({
          success: true, message: "Request confirmed successfully. In-charge has been notified.",
          data: lookupData || updatedRequest, history, messageData: updatedMessage,
          inchargeNotification, inchargeNotified: !!inchargeNotification,
        });
      }

      // ==========================================
      // FLOW 5: REMARKS ONLY
      // ==========================================
      else if (remarks && typeof remarks === "string" && remarks.trim() !== "") {
        const updateData = { $set: { Remarks: remarks.trim(), remarksread: false } };
        applySetSchedule(updateData);

        const updatedRequest = await requestmaintenance.findByIdAndUpdate(RequestId, updateData, { new: true, runValidators: true })
          .populate("Equipments").populate("Department").populate("Laboratory").populate("Technician");

        const lookupData = await getRequestWithLookup(updatedRequest._id);
        const history = await saveToHistory(lookupData, "Remarks Only");
        emitSocketUpdate("Remarks Only", lookupData || updatedRequest);

        let updatedMessage = null;
        if (MessageId) {
          updatedMessage = await Message.findByIdAndUpdate(MessageId, { $set: { remarks: remarks.trim(), read: true } }, { new: true, runValidators: true });
        }

        return res.status(200).json({
          success: true, message: "Remarks submitted successfully.",
          data: lookupData || updatedRequest, history, messageData: updatedMessage, adminNotified: false
        });
      }

      // ==========================================
      // FLOW 6: DEFAULT ASSIGN TECHNICIAN
      // ==========================================
      else {
        if (!technicianId) {
          return next(new CustomError("technicianId is required for assignment", 400));
        }

        const updateData = { $set: { Technician: technicianId } };
        if (request.Status === "Pending" || !request.Status) {
          updateData.$set.Status = "Assigned";
        }
        applySetSchedule(updateData);

        const updatedRequest = await requestmaintenance.findByIdAndUpdate(RequestId, updateData, { new: true, runValidators: true })
          .populate("Equipments").populate("Department").populate("Laboratory").populate("Technician");

        const lookupData = await getRequestWithLookup(updatedRequest._id);
        const history = await saveToHistory(lookupData, "Assign Technician");
        emitSocketUpdate("Assign Technician", lookupData || updatedRequest);

        let updatedMessage = null;
        if (MessageId) {
          updatedMessage = await Message.findByIdAndUpdate(MessageId, {
            $set: { Status: status || "Assigned", read: true, technicianId: technicianId },
            $addToSet: { viewers: { user: technicianId, isRead: false } }
          }, { new: true, runValidators: true });

          if (!updatedMessage) {
            return next(new CustomError("Message not found", 404));
          }
        }

        const assignedEquipmentBrand = request.Equipments ? (request.Equipments.EquipmentBrand || request.Equipments.name || "N/A") : "N/A";
        const equipLabel = assignedEquipmentBrand !== "N/A" ? `${assignedEquipmentBrand} (${request.Ref || request._id})` : `${request.Ref || request._id}`;

        const newMessage = await Message.create({
          message: `New task assigned to you: ${equipLabel}.`,
          equipmentId: request.Equipments?._id || null,
          typesNotification: status || "AssignedTechnician",
          Status: status || "Assigned",
          Laboratory: request.Laboratory ? [request.Laboratory] : [],
          To: "Technician",
          Encharge: technicianId,
          role: "Technician",
          RequestID: request._id,
          viewers: [{ user: technicianId, isRead: false }],
        });

        return res.status(200).json({
          success: true, message: "Technician assigned successfully",
          data: lookupData || updatedRequest, history, messageData: updatedMessage,
          newMessage, adminNotified: false
        });
      }

    } catch (error) {
      console.error("❌ Error in updateDataAssignTechnician:", error);
      console.error("❌ Stack:", error.stack);
      return next(new CustomError(error.message || "Server error", 500));
    }
  }
);

exports.deleteUser = AsyncErrorHandler(async (req, res) => {
  await user.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});


exports.Updateuser = AsyncErrorHandler(async (req, res, next) => {
  const { FirstName, LastName, email, role } = req.body;

  if (!FirstName || !LastName || !role) {
    return res.status(400).json({
      status: "fail",
      message: "Please fill in all required fields.",
    });
  }

  const updateuser = await user.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: updateuser,
  });
});

exports.Getiduser = AsyncErrorHandler(async (req, res, next) => {
  const foundUser = await user.findById(req.params.id);

  if (!foundUser) {
    const error = new CustomError("User with the ID is not found", 404);
    return next(error);
  }

  res.status(200).json({
    status: "Success",
    data: foundUser,
  });
});

exports.updatePassword = AsyncErrorHandler(async (req, res, next) => {
  const foundUser = await user.findById(req.user._id).select("+password");

  // CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
  if (!(await foundUser.comparePasswordInDb(req.body.currentPassword, foundUser.password))) {
    return next(new CustomError("The current password you provided is wrong", 401));
  }
  foundUser.password = req.body.password;
  foundUser.confirmPassword = req.body.confirmPassword;
  await foundUser.save();

  // Note: authController must be imported at the top if you use createSendResponse
  authController.createSendResponse(foundUser, 200, res);
});


exports.signup = AsyncErrorHandler(async (req, res, next) => {
  const { FirstName, Middle, LastName, email, password, role } = req.body;

  const existingUser = await user.findOne({ email });

  if (existingUser) {
    return res.status(400).json("Already Have an Account!");
  }

  const result = await user.create({
    FirstName,
    Middle,
    LastName,
    email,
    password,
    role
  });

  res.status(201).json(result);
});

exports.DisplayAllTechnician = AsyncErrorHandler(async (req, res) => {
  // 1. Force role to Technician
  req.query.role = "Technician";

  let query = user.find();

  // 2. ✅ NEW: Search functionality (Partial & Case-Insensitive Match)
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i'); // 'i' means case-insensitive

    // Hanapin sa types_of_technician, firstName, o lastName
    query = query.find({
      $or: [
        { types_of_technician: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    });

    // Tanggalin ang 'search' sa req.query para hindi ito i-process ng Apifeatures .filter() bilang exact match
    const filterQuery = { ...req.query };
    delete filterQuery.search;

    const features = new Apifeatures(query, filterQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let displayuser = await features.query;

    if (!displayuser || displayuser.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No technicians found matching your search"
      });
    }

    return res.status(200).json({
      status: "success",
      totalUser: displayuser.length,
      data: displayuser,
    });
  }

  // 3. Default Flow (Kung walang search, gagamitin ang normal filtering ng Apifeatures)
  const features = new Apifeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let displayuser = await features.query;

  if (!displayuser || displayuser.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No technicians found"
    });
  }

  res.status(200).json({
    status: "success",
    totalUser: displayuser.length,
    data: displayuser,
  });
});


exports.DisplayAllTypesOfTechnician = AsyncErrorHandler(async (req, res) => {
  const data = await user.aggregate([
    {
      $match: {
        role: "Technician",
        types_of_technician: { $exists: true, $nin: [null, ""] },
      },
    },
    {
      $group: {
        _id: "$types_of_technician",
      },
    },
    {
      $project: {
        _id: 0,
        types_of_technician: "$_id",
      },
    },
    {
      $sort: {
        types_of_technician: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    totalTechnicians: data.length,
    count: data.length,
    data,
  });
});