// components/MessageDetailModal.jsx
import { useState, useContext } from "react";
import {
    FileText,
    Building,
    MapPin,
    Monitor,
    Users,
    User,
    Mail,
    Wrench,
    Building2,
    Tag,
    Hash,
    Calendar,
    AlertTriangle,
    Check,
    X,
    Loader2,
    UserPlus,
    MessageSquare,
    Plus,
    Send,
    Shield,
    Clock,
    ThumbsUp,
    ThumbsDown
} from "lucide-react";
import { MaintenanceRequestContext } from "../contexts/MaintenanceRequestContext/MaintenanceRequestContext";
import { AuthContext } from "../contexts/AuthContext";


// Helper functions
const isEmptyOrWhitespace = (value) => {
    if (!value) return true;
    if (typeof value === "string") {
        return value.trim() === "" || value === "N/A" || value === "  ";
    }
    if (typeof value === "object") {
        const displayValue = getDisplayValue(value);
        return !displayValue || displayValue === "N/A" || displayValue.trim() === "";
    }
    return true;
};

const formatFullDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const getTechnicianName = (tech) => {
    if (!tech) return '';
    if (typeof tech === 'object') {
        const firstName = tech.FirstName || tech.firstName || '';
        const lastName = tech.LastName || tech.lastName || '';
        return `${firstName} ${lastName}`.trim();
    }
    if (typeof tech === 'string') return tech;
    return '';
};

const getDisplayValue = (value) => {
    if (!value) return "N/A";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") {
        if (value.DepartmentName) return value.DepartmentName;
        if (value.departmentName) return value.departmentName;
        if (value.name) return value.name;
        if (value.Name) return value.Name;
        if (value.laboratoryName) return value.laboratoryName;
        if (value.LaboratoryName) return value.LaboratoryName;
        if (value.FirstName) {
            return value.LastName ? `${value.FirstName} ${value.LastName}` : value.FirstName;
        }
        if (value.Status) return value.Status;
        if (value.RequestStatus) return value.RequestStatus;
        if (value._id) return value._id;
        return JSON.stringify(value);
    }
    return "N/A";
};

export const MessageDetailModal = ({
    selectedMessage,
    onClose,
    technicians = [],
    isLoadingTechnicians = false,
    onAssignSuccess,
    onAssignError,
    onApprove
}) => {
    const { role } = useContext(AuthContext);
    const { UpdateAssignTechnician } = useContext(MaintenanceRequestContext);
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignSuccess, setAssignSuccess] = useState(false);
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [approveSuccess, setApproveSuccess] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [showRemarksPopup, setShowRemarksPopup] = useState(false);
    const [isSubmittingRemarks, setIsSubmittingRemarks] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    console.log("selectedMessage",selectedMessage)

    // =============================================
    // FEEDBACK STATES
    // =============================================
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [feedbackType, setFeedbackType] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    if (!selectedMessage) return null;

    // =============================================
    // CHECK IF RE-ASSIGN - ACCESS FROM data OBJECT
    // =============================================
    const isReassign = selectedMessage.data?.isReassign === true;

    // =============================================
    // HANDLE ASSIGN TECHNICIAN
    // =============================================
    const handleAssignTechnician = async () => {
        if (!selectedTechnician) return;

        setIsAssigning(true);
        try {
            const payload = {
                technicianId: selectedTechnician,
                RequestId: selectedMessage.data?.RequestID || selectedMessage.data?._id,
                MessageId: selectedMessage.id || selectedMessage.data?._id,
                status: "AssignedTechnician"
            };

            console.log("📤 ASSIGN PAYLOAD:", payload);
            await UpdateAssignTechnician(payload);
            setAssignSuccess(true);
            setShowAssignDropdown(false);
            if (onAssignSuccess) onAssignSuccess();

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Error assigning technician:", error);
            if (onAssignError) onAssignError(error);
        } finally {
            setIsAssigning(false);
        }
    };

    // =============================================
    // HANDLE APPROVE
    // =============================================
    const handleApprove = async () => {
        setIsApproving(true);
        try {
            const requestId = selectedMessage.data?.RequestID || selectedMessage.data?._id;
            const messageId = selectedMessage.id || selectedMessage.data?._id;

            const payload = {
                RequestId: requestId,
                MessageId: messageId,
                status: "Approved"
            };

            console.log("📤 APPROVAL PAYLOAD:", JSON.stringify(payload, null, 2));

            const result = await UpdateAssignTechnician(payload);
            console.log("Approval response:", result);

            setApproveSuccess(true);
            setShowConfirmation(true);

            if (onApprove) {
                onApprove(requestId);
            }

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error("❌ Error approving request:", error);
            if (onAssignError) onAssignError(error);
        } finally {
            setIsApproving(false);
        }
    };

    // =============================================
    // HANDLE OPEN REMARKS POPUP
    // =============================================
    const handleOpenRemarksPopup = () => {
        const status = getDisplayValue(selectedMessage.data?.RequestStatus);
        if (status !== "Approved") {
            alert("Remarks can only be added when the request is Approved.");
            return;
        }

        if (selectedMessage.data?.Remarks) {
            setRemarks(selectedMessage.data.Remarks);
        } else {
            setRemarks("");
        }

        setShowRemarksPopup(true);
    };

    // =============================================
    // HANDLE SUBMIT REMARKS
    // =============================================
    const handleSubmitRemarks = async () => {
        if (!remarks || remarks.trim() === "") {
            alert("Please enter approval remarks before submitting.");
            return;
        }

        setIsSubmittingRemarks(true);
        try {
            const requestId = selectedMessage.data?.RequestID || selectedMessage.data?._id;
            const messageId = selectedMessage.id || selectedMessage.data?._id;

            let laboratoryEnchargeId = null;
            if (selectedMessage.data?.LaboratoryEnchargeId &&
                Array.isArray(selectedMessage.data.LaboratoryEnchargeId) &&
                selectedMessage.data.LaboratoryEnchargeId.length > 0) {
                laboratoryEnchargeId = selectedMessage.data.LaboratoryEnchargeId[0];
            } else if (selectedMessage.data?.LaboratoryEnchargeId) {
                laboratoryEnchargeId = selectedMessage.data.LaboratoryEnchargeId;
            }

            const payload = {
                RequestId: requestId,
                MessageId: messageId,
                status: "InchargedConfirmed",
                remarks: remarks.trim(),
                LaboratoryEnchargeId: laboratoryEnchargeId
            };

            console.log("📤 SUBMIT REMARKS PAYLOAD:", JSON.stringify(payload, null, 2));

            const result = await UpdateAssignTechnician(payload);
            console.log("Submit remarks response:", result);

            setShowRemarksPopup(false);
            setApproveSuccess(true);
            setShowConfirmation(true);

            if (result.data) {
                selectedMessage.data.Remarks = result.data.Remarks;
                selectedMessage.data.RequestStatus = result.data.Status;
            }

            if (onApprove) {
                onApprove(requestId);
            }

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error("❌ Error submitting remarks:", error);
            if (onAssignError) onAssignError(error);
        } finally {
            setIsSubmittingRemarks(false);
        }
    };

    // =============================================
    // HANDLE OPEN FEEDBACK POPUP
    // =============================================
    const handleOpenFeedbackPopup = () => {
        setFeedbackType("");
        setFeedbackMessage("");
        setShowFeedbackPopup(true);
    };

    // =============================================
    // HANDLE SUBMIT FEEDBACK
    // =============================================
    const handleSubmitFeedback = async () => {
        if (!feedbackType) {
            alert("Please select feedback type (Satisfied or Dissatisfied).");
            return;
        }

        if (!feedbackMessage || feedbackMessage.trim() === "") {
            alert("Please provide feedback message.");
            return;
        }

        setIsSubmittingFeedback(true);
        try {
            const requestId = selectedMessage.data?.RequestID || selectedMessage.data?._id;
            const messageId = selectedMessage.id || selectedMessage.data?._id;

            const payload = {
                RequestId: requestId,
                MessageId: messageId,
                status: "Completed",
                feedback: {
                    type: feedbackType,
                    message: feedbackMessage.trim(),
                    submittedBy: role || "User",
                    submittedAt: new Date().toISOString()
                }
            };

            console.log("📤 SUBMIT FEEDBACK PAYLOAD:", JSON.stringify(payload, null, 2));

            const result = await UpdateAssignTechnician(payload);
            console.log("Submit feedback response:", result);

            setShowFeedbackPopup(false);
            setShowConfirmation(true);

            if (result.data) {
                selectedMessage.data.RequestStatus = result.data.Status || "FeedbackSubmitted";
                selectedMessage.data.feedback = {
                    type: feedbackType,
                    message: feedbackMessage.trim(),
                    submittedBy: role || "User",
                    submittedAt: new Date().toISOString()
                };
            }

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error("❌ Error submitting feedback:", error);
            if (onAssignError) onAssignError(error);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    // =============================================
    // GET DISPLAY STATUS
    // =============================================
    const getDisplayStatus = (status) => {
        if (status === "InchargedConfirmed") {
            return "Waiting For Incharge Feedback";
        }
        if (status === "InchargeConfirmation") {
            return "Awaiting User Confirmation";
        }
        if (status === "FeedbackSubmitted") {
            return "Feedback Submitted";
        }
        return status || "N/A";
    };

    // =============================================
    // GET STATUS COLOR
    // =============================================
    const getStatusColor = (status) => {
        if (status === "Approved") return "text-green-600 dark:text-green-400";
        if (status === "Pending") return "text-yellow-600 dark:text-yellow-400";
        if (status === "Completed") return "text-blue-600 dark:text-blue-400";
        if (status === "Rejected") return "text-red-600 dark:text-red-400";
        if (status === "InchargedConfirmed") return "text-purple-600 dark:text-purple-400";
        if (status === "InchargeConfirmation") return "text-orange-600 dark:text-orange-400";
        if (status === "FeedbackSubmitted") return "text-teal-600 dark:text-teal-400";
        return "text-slate-600 dark:text-slate-400";
    };

    const getStatusBg = (status) => {
        if (status === "Approved") return "bg-green-100 dark:bg-green-900/30";
        if (status === "Pending") return "bg-yellow-100 dark:bg-yellow-900/30";
        if (status === "Completed") return "bg-blue-100 dark:bg-blue-900/30";
        if (status === "Rejected") return "bg-red-100 dark:bg-red-900/30";
        if (status === "InchargedConfirmed") return "bg-purple-100 dark:bg-purple-900/30";
        if (status === "InchargeConfirmation") return "bg-orange-100 dark:bg-orange-900/30";
        if (status === "FeedbackSubmitted") return "bg-teal-100 dark:bg-teal-900/30";
        return "bg-slate-100 dark:bg-slate-700/30";
    };

    // =============================================
    // STATUS CHECKS
    // =============================================
    const isAssignedTechnician = selectedMessage.data?.typesNotification === "AssignedTechnician";
    const currentStatus = getDisplayValue(selectedMessage.data?.RequestStatus);
    const displayStatus = getDisplayStatus(currentStatus);
    const isApproved = currentStatus === "Approved";
    const isInchargedConfirmed = currentStatus === "InchargedConfirmed";
    const isInchargeConfirmation = currentStatus === "InchargeConfirmation";
    const isFeedbackSubmitted = currentStatus === "FeedbackSubmitted";
    const isCompleted = currentStatus === "Completed";

    // =============================================
    // SHOW FEEDBACK BUTTON
    // =============================================
    const statusLower = (currentStatus || "").toLowerCase();
    const isInchargeRelated = statusLower.includes("incharge") ||
        statusLower.includes("confirmation") ||
        statusLower === "inchargeconfirmation";
    const showFeedbackButton = role === "User" && isInchargeRelated && !isFeedbackSubmitted;

    // =============================================
    // BUTTON VISIBILITY - HIDE ALL WHEN ISREASSIGN IS TRUE
    // =============================================
    const showRemarksButton = !isReassign && isAssignedTechnician && isApproved;
    const showApproveButton = !isReassign && isAssignedTechnician && !isApproved && !isInchargedConfirmed && !isCompleted;
    const showAssignButton = !isReassign && !isAssignedTechnician &&
        selectedMessage.data?.typesNotification === "MaintenanceRequest" &&
        getDisplayValue(selectedMessage.data?.RequestStatus) !== "Completed";
    const showFeedbackButtonFinal = !isReassign && showFeedbackButton;

    const hasAdditionalInfo =
        (selectedMessage.data?.EquipmentRemarks && !isEmptyOrWhitespace(selectedMessage.data.EquipmentRemarks)) ||
        (selectedMessage.data?.RequestDescription && !isEmptyOrWhitespace(selectedMessage.data.RequestDescription) &&
            selectedMessage.data.RequestDescription !== selectedMessage.data?.message);

    return (
        <>
            {/* Main Modal */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ========================================== */}
                    {/* RE-ASSIGN WATERMARK - TOP RIGHT CORNER */}
                    {/* ========================================== */}
                    {isReassign && (
                        <div className="absolute top-6 right-6 z-10">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg transform rotate-12 border-2 border-orange-600 flex items-center gap-2 animate-pulse">
                                <span className="text-lg">🔄</span>
                                Re-Assign
                            </div>
                        </div>
                    )}

                    {/* ========================================== */}
                    {/* RE-ASSIGN OVERLAY WATERMARK - DIAGONAL */}
                    {/* ========================================== */}
                    {isReassign && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] opacity-5">
                                <span className="text-8xl font-black text-orange-600 whitespace-nowrap tracking-widest select-none">
                                    RE-ASSIGN
                                </span>
                            </div>
                            <div className="absolute top-[30%] left-[20%] rotate-[-25deg] opacity-5">
                                <span className="text-6xl font-black text-orange-600 whitespace-nowrap tracking-widest select-none">
                                    RE-ASSIGN
                                </span>
                            </div>
                            <div className="absolute bottom-[30%] right-[20%] rotate-[-25deg] opacity-5">
                                <span className="text-6xl font-black text-orange-600 whitespace-nowrap tracking-widest select-none">
                                    RE-ASSIGN
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ========================================== */}
                    {/* CONFIRMATION BANNER */}
                    {/* ========================================== */}
                    {showConfirmation && (
                        <div className="mx-6 mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50 shrink-0">
                                    <Check size={18} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                        {isFeedbackSubmitted ? "Feedback Submitted Successfully" : "Task Confirmed and Approved"}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                        {isFeedbackSubmitted
                                            ? `Your feedback has been recorded. Thank you for your response.`
                                            : `You have successfully confirmed and approved the maintenance task.
                                            ${remarks ? ` Remarks: "${remarks}"` : ''}`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getDisplayValue(selectedMessage.bgColor)} ${getDisplayValue(selectedMessage.iconColor)}`}>
                                {selectedMessage.icon && <selectedMessage.icon size={20} />}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    {getDisplayValue(selectedMessage.title)}
                                    {isReassign && (
                                        <span className="ml-2 text-xs font-medium text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full border border-orange-300 dark:border-orange-700">
                                            Re-Assign
                                        </span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {/* Hide status badge when isReassign is true */}
                                    {!isReassign && (
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBg(currentStatus)} ${getStatusColor(currentStatus)}`}>
                                            {displayStatus}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        {formatFullDate(selectedMessage.data?.DateTime)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* ========================================== */}
                    {/* CONTENT */}
                    {/* ========================================== */}
                    <div className="p-6 space-y-5 text-sm text-slate-700 dark:text-slate-200">

                        {/* ========================================== */}
                        {/* DEPARTMENT & LABORATORY */}
                        {/* ========================================== */}
                        <div className="flex items-start gap-3">
                            <Building size={18} className="text-slate-400 mt-1 shrink-0" />
                            <p className="leading-7">
                                This maintenance request was submitted for{" "}
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {getDisplayValue(selectedMessage.data?.departmentName)}
                                </span>
                                {" "}and is intended for the{" "}
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {getDisplayValue(selectedMessage.data?.laboratoryNames)}
                                </span>{" "}
                                laboratory.
                            </p>
                        </div>

                        {/* ========================================== */}
                        {/* EQUIPMENT DETAILS */}
                        {/* ========================================== */}
                        {selectedMessage.data?.EquipmentBrand && !isEmptyOrWhitespace(selectedMessage.data.EquipmentBrand) && (
                            <div className="flex items-start gap-3">
                                <Monitor size={18} className="text-slate-400 mt-1 shrink-0" />
                                <p className="leading-7">
                                    The equipment is a{" "}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {getDisplayValue(selectedMessage.data?.EquipmentBrand)}
                                    </span>
                                    {" "}under the{" "}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {getDisplayValue(selectedMessage.data?.CategoryName)}
                                    </span>
                                    {" "}category, with serial number{" "}
                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-1 rounded">
                                        {getDisplayValue(selectedMessage.data?.EquipmentSerial)}
                                    </span>
                                    {" "}and specifications of{" "}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {getDisplayValue(selectedMessage.data?.EquipmentSpecification)}
                                    </span>.
                                </p>
                            </div>
                        )}

                        {/* ========================================== */}
                        {/* PERSONNEL & ASSIGNMENT */}
                        {/* ========================================== */}
                        {!isAssignedTechnician && (
                            <div className="flex items-start gap-3">
                                <Users size={18} className="text-slate-400 mt-1 shrink-0" />
                                <p className="leading-7">
                                    {selectedMessage.data?.EnchargeName && !isEmptyOrWhitespace(selectedMessage.data.EnchargeName) ? (
                                        <>
                                            The request is currently assigned to{" "}
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {getDisplayValue(selectedMessage.data?.EnchargeName)}
                                            </span>
                                            {selectedMessage.data?.EnchargeEmail && !isEmptyOrWhitespace(selectedMessage.data.EnchargeEmail) && (
                                                <> ({getDisplayValue(selectedMessage.data?.EnchargeEmail)})</>
                                            )}
                                            {" "}as the person in-charge.
                                        </>
                                    ) : selectedMessage.enchargeFullDetails ? (
                                        <>
                                            The request is currently assigned to{" "}
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {getDisplayValue(selectedMessage.enchargeFullDetails.fullName)}
                                            </span>
                                            {" "}as the person in-charge.
                                        </>
                                    ) : (
                                        "No personnel has been assigned to this request yet."
                                    )}
                                </p>
                            </div>
                        )}

                        {/* ========================================== */}
                        {/* REFERENCE & REQUEST ID */}
                        {/* ========================================== */}
                        <div className="flex items-start gap-3">
                            <Hash size={18} className="text-slate-400 mt-1 shrink-0" />
                            <p className="leading-7 break-words">
                                The reference number for this request is{" "}
                                <span className="font-mono font-medium text-slate-800 dark:text-slate-100">
                                    {getDisplayValue(selectedMessage.data?.RequestRef)}
                                </span>
                                {" "}and the request ID is{" "}
                                <span className="font-mono font-medium text-slate-800 dark:text-slate-100">
                                    {getDisplayValue(selectedMessage.data?.RequestID) || getDisplayValue(selectedMessage.data?._id)}
                                </span>.
                            </p>
                        </div>

                        {/* ========================================== */}
                        {/* TIMESTAMPS */}
                        {/* ========================================== */}
                        <div className="flex items-start gap-3">
                            <Calendar size={18} className="text-slate-400 mt-1 shrink-0" />
                            <p className="leading-7">
                                The request was created on{" "}
                                <span className="font-medium text-slate-800 dark:text-slate-100">
                                    {formatFullDate(selectedMessage.data?.RequestDateTime)}
                                </span>
                                {" "}and the notification was created on{" "}
                                <span className="font-medium text-slate-800 dark:text-slate-100">
                                    {formatFullDate(selectedMessage.data?.DateTime)}
                                </span>.
                            </p>
                        </div>

                        {/* ========================================== */}
                        {/* ISSUE / PROBLEM */}
                        {/* ========================================== */}
                        {hasAdditionalInfo && (
                            <div className="flex items-start gap-3 p-4 rounded-xl border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 shadow-sm">
                                <AlertTriangle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                                        Reported Issue
                                    </p>
                                    <p className="leading-6 text-slate-700 dark:text-slate-200">
                                        {selectedMessage.data?.EquipmentRemarks && !isEmptyOrWhitespace(selectedMessage.data.EquipmentRemarks) ? (
                                            getDisplayValue(selectedMessage.data.EquipmentRemarks)
                                        ) : selectedMessage.data?.RequestDescription && !isEmptyOrWhitespace(selectedMessage.data.RequestDescription) ? (
                                            getDisplayValue(selectedMessage.data.RequestDescription)
                                        ) : (
                                            "No issue description was provided."
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ========================================== */}
                        {/* EXISTING REMARKS */}
                        {/* ========================================== */}
                        {selectedMessage.data?.Remarks && !isEmptyOrWhitespace(selectedMessage.data.Remarks) && (
                            <div className="flex items-start gap-3">
                                <MessageSquare size={18} className="text-blue-500 mt-1 shrink-0" />
                                <p className="leading-7">
                                    The current approval remarks are:{" "}
                                    <span className="font-medium italic text-slate-800 dark:text-slate-100">
                                        "{getDisplayValue(selectedMessage.data.Remarks)}"
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* ========================================== */}
                        {/* FEEDBACK DISPLAY (if already submitted) */}
                        {/* ========================================== */}
                        {isFeedbackSubmitted && selectedMessage.data?.feedback && (
                            <div className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${selectedMessage.data.feedback.type === "Satisfied"
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-red-500 bg-red-50 dark:bg-red-950/20"}`}>
                                {selectedMessage.data.feedback.type === "Satisfied" ? (
                                    <ThumbsUp size={18} className="text-green-500 mt-0.5 shrink-0" />
                                ) : (
                                    <ThumbsDown size={18} className="text-red-500 mt-0.5 shrink-0" />
                                )}
                                <div>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Your Feedback ({selectedMessage.data.feedback.type})
                                    </p>
                                    <p className="leading-6 text-slate-700 dark:text-slate-200">
                                        "{getDisplayValue(selectedMessage.data.feedback.message)}"
                                    </p>
                                    {selectedMessage.data.feedback.submittedAt && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            Submitted on: {formatFullDate(selectedMessage.data.feedback.submittedAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========================================== */}
                    {/* MODAL FOOTER */}
                    {/* ========================================== */}
                    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">

                        {/* Left side - Re-assign info or status */}
                        {isReassign ? (
                            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                                <Clock size={16} />
                                <span className="font-medium">This request is pending re-assignment</span>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 dark:text-slate-500">
                                Request Details
                            </div>
                        )}

                        {/* Right side - Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* ========================================== */}
                            {/* ADD FEEDBACK BUTTON */}
                            {/* ========================================== */}
                            {showFeedbackButtonFinal && (
                                <button
                                    onClick={handleOpenFeedbackPopup}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg animate-pulse"
                                >
                                    <MessageSquare size={16} />
                                    Add Feedback
                                </button>
                            )}

                            {/* ADD REMARKS BUTTON */}
                            {showRemarksButton && (
                                <button
                                    onClick={handleOpenRemarksPopup}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                                >
                                    <MessageSquare size={16} />
                                    {selectedMessage.data?.Remarks ? "Update Remarks" : "Add Remarks"}
                                </button>
                            )}

                            {/* ASSIGN TECHNICIAN BUTTON */}
                            {showAssignButton && (
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (assignSuccess) {
                                                setAssignSuccess(false);
                                                setSelectedTechnician("");
                                            }
                                            setShowAssignDropdown(!showAssignDropdown);
                                        }}
                                        disabled={isAssigning}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${assignSuccess
                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                            : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        {isAssigning ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Assigning...
                                            </>
                                        ) : assignSuccess ? (
                                            <>
                                                <Check size={16} />
                                                Assigned!
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={16} />
                                                Assign Technician
                                            </>
                                        )}
                                    </button>

                                    {/* Assign Dropdown Modal */}
                                    {showAssignDropdown && !assignSuccess && (
                                        <div
                                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] animate-in fade-in duration-200 p-4"
                                            onClick={(e) => {
                                                if (e.target === e.currentTarget) {
                                                    setShowAssignDropdown(false);
                                                }
                                            }}
                                        >
                                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                            <UserPlus size={20} className="text-yellow-500" />
                                                            Select Technician
                                                        </h4>
                                                        <button
                                                            onClick={() => setShowAssignDropdown(false)}
                                                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </div>

                                                    <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                                        <span className="font-medium">Request:</span> {getDisplayValue(selectedMessage.data?.RequestRef) || getDisplayValue(selectedMessage.data?.RequestID) || "N/A"}
                                                        {selectedMessage.data?.RequestStatus && (
                                                            <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBg(currentStatus)} ${getStatusColor(currentStatus)}`}>
                                                                {displayStatus}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            Choose Technician
                                                        </label>
                                                        <select
                                                            value={selectedTechnician}
                                                            onChange={(e) => setSelectedTechnician(e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                                                            disabled={isLoadingTechnicians}
                                                        >
                                                            <option value="">Choose a technician...</option>
                                                            {technicians && technicians.length > 0 ? (
                                                                technicians.map((tech) => {
                                                                    const techId = tech._id || tech.id;
                                                                    const fullName = getTechnicianName(tech);
                                                                    return (
                                                                        <option key={techId} value={techId}>
                                                                            {fullName} {tech.role ? `(${tech.role})` : ''}
                                                                        </option>
                                                                    );
                                                                })
                                                            ) : (
                                                                <option value="" disabled>No technicians available</option>
                                                            )}
                                                        </select>
                                                        {isLoadingTechnicians && (
                                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                                <Loader2 size={12} className="animate-spin" />
                                                                Loading technicians...
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-3 pt-2">
                                                        <button
                                                            onClick={handleAssignTechnician}
                                                            disabled={!selectedTechnician || isAssigning || isLoadingTechnicians}
                                                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${!selectedTechnician || isAssigning || isLoadingTechnicians
                                                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                                                : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                                                                }`}
                                                        >
                                                            {isAssigning ? (
                                                                <>
                                                                    <Loader2 size={18} className="animate-spin" />
                                                                    Assigning...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Check size={18} />
                                                                    Confirm Assignment
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowAssignDropdown(false)}
                                                            className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* APPROVE BUTTON */}
                            {showApproveButton && (
                                <button
                                    onClick={handleApprove}
                                    disabled={isApproving || approveSuccess}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${approveSuccess
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : isApproving
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {isApproving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : approveSuccess ? (
                                        <>
                                            <Check size={16} />
                                            Confirmed ✓
                                        </>
                                    ) : (
                                        <>
                                            <Shield size={16} />
                                            Confirmed
                                        </>
                                    )}
                                </button>
                            )}

                            {/* ALREADY APPROVED BADGE */}
                            {!isReassign && isAssignedTechnician && isApproved && !showRemarksButton && (
                                <span className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <Check size={16} />
                                    Already Confirmed ✓
                                </span>
                            )}

                            {/* INCHARGE CONFIRMED BADGE */}
                            {!isReassign && isInchargedConfirmed && (
                                <span className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                    <Clock size={16} />
                                    Waiting For Feedback
                                </span>
                            )}

                            {/* INCHARGE CONFIRMATION BADGE */}
                            {!isReassign && isInchargeConfirmation && !showFeedbackButtonFinal && (
                                <span className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center gap-2">
                                    <Clock size={16} />
                                    Awaiting Your Response
                                </span>
                            )}

                            {/* FEEDBACK SUBMITTED BADGE */}
                            {!isReassign && isFeedbackSubmitted && (
                                <span className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center gap-2">
                                    <Check size={16} />
                                    Feedback Submitted ✓
                                </span>
                            )}

                            {/* CLOSE BUTTON */}
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* REMARKS POPUP MODAL */}
            {/* ========================================== */}
            {showRemarksPopup && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] animate-in fade-in duration-200 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowRemarksPopup(false);
                        }
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full animate-in slide-in-from-bottom-4 duration-300 border border-slate-200 dark:border-slate-700">
                        {/* Popup Header */}
                        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                        {selectedMessage.data?.Remarks ? "Update Approval Remarks" : "Approval Remarks"}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {selectedMessage.data?.Remarks ? "Update remarks for this request" : "Enter remarks before approving this request"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRemarksPopup(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Popup Body */}
                        <div className="px-6 py-4 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="font-medium">Request:</span> {getDisplayValue(selectedMessage.data?.RequestRef) || getDisplayValue(selectedMessage.data?.RequestID) || "N/A"}
                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBg(currentStatus)} ${getStatusColor(currentStatus)}`}>
                                        {displayStatus}
                                    </span>
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                    <span className="font-medium">Equipment:</span> {getDisplayValue(selectedMessage.data?.EquipmentBrand)} {getDisplayValue(selectedMessage.data?.EquipmentSpecification)}
                                </p>
                                {selectedMessage.data?.Remarks && (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                        <span className="font-medium">Current Remarks:</span> {getDisplayValue(selectedMessage.data.Remarks)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Remarks / Notes
                                    <span className="text-red-500 text-xs">*Required</span>
                                </label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter approval remarks or notes..."
                                    rows={5}
                                    className="w-full mt-1 px-3 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
                                    autoFocus
                                />
                                <div className="flex justify-between mt-1">
                                    <span className={`text-xs ${remarks.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {remarks.length > 0 ? (
                                            <><Check size={12} className="inline mr-1" /> Remarks provided</>
                                        ) : (
                                            <><AlertTriangle size={12} className="inline mr-1" /> Remarks required</>
                                        )}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{remarks.length} characters</span>
                                </div>
                            </div>
                        </div>

                        {/* Popup Footer */}
                        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowRemarksPopup(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRemarks}
                                disabled={isSubmittingRemarks || !remarks.trim()}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isSubmittingRemarks || !remarks.trim()
                                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {isSubmittingRemarks ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        {selectedMessage.data?.Remarks ? "Update Remarks" : "Submit Remarks"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* FEEDBACK POPUP MODAL */}
            {/* ========================================== */}
            {showFeedbackPopup && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] animate-in fade-in duration-200 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowFeedbackPopup(false);
                        }
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full animate-in slide-in-from-bottom-4 duration-300 border border-slate-200 dark:border-slate-700">
                        {/* Popup Header */}
                        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                                    <MessageSquare size={20} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                        Provide Your Feedback
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Let us know about your experience with this maintenance request
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFeedbackPopup(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Popup Body */}
                        <div className="px-6 py-4 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="font-medium">Request:</span> {getDisplayValue(selectedMessage.data?.RequestRef) || getDisplayValue(selectedMessage.data?.RequestID) || "N/A"}
                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBg(currentStatus)} ${getStatusColor(currentStatus)}`}>
                                        {displayStatus}
                                    </span>
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                    <span className="font-medium">Equipment:</span> {getDisplayValue(selectedMessage.data?.EquipmentBrand)} {getDisplayValue(selectedMessage.data?.EquipmentSpecification)}
                                </p>
                            </div>

                            {/* Feedback Type Selection */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    How was your experience?
                                    <span className="text-red-500 text-xs">*Required</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <button
                                        onClick={() => setFeedbackType("Satisfied")}
                                        className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${feedbackType === "Satisfied"
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                            }`}
                                    >
                                        <ThumbsUp size={20} className={feedbackType === "Satisfied" ? 'text-green-500' : 'text-slate-400'} />
                                        <span className={`text-sm font-medium ${feedbackType === "Satisfied" ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                            Satisfied
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setFeedbackType("Dissatisfied")}
                                        className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${feedbackType === "Dissatisfied"
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                            }`}
                                    >
                                        <ThumbsDown size={20} className={feedbackType === "Dissatisfied" ? 'text-red-500' : 'text-slate-400'} />
                                        <span className={`text-sm font-medium ${feedbackType === "Dissatisfied" ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                            Dissatisfied
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Feedback Message */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Feedback Details
                                    <span className="text-red-500 text-xs">*Required</span>
                                </label>
                                <textarea
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    placeholder="Please share your feedback, suggestions, or concerns..."
                                    rows={4}
                                    className="w-full mt-1 px-3 py-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y"
                                    autoFocus
                                />
                                <div className="flex justify-between mt-1">
                                    <span className={`text-xs ${feedbackMessage.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {feedbackMessage.length > 0 ? (
                                            <><Check size={12} className="inline mr-1" /> Feedback provided</>
                                        ) : (
                                            <><AlertTriangle size={12} className="inline mr-1" /> Feedback required</>
                                        )}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{feedbackMessage.length} characters</span>
                                </div>
                            </div>
                        </div>

                        {/* Popup Footer */}
                        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowFeedbackPopup(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitFeedback}
                                disabled={isSubmittingFeedback || !feedbackType || !feedbackMessage.trim()}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isSubmittingFeedback || !feedbackType || !feedbackMessage.trim()
                                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {isSubmittingFeedback ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Submit Feedback
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};