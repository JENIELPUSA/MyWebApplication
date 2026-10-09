// Header.jsx - Show ALL notifications always, mark as read changes status only
import { useState, useContext, useMemo, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import {
    Bell,
    ChevronsLeft,
    Moon,
    Sun,
    AlertCircle,
    Wrench,
    CheckCircle2,
    Clock,
    Activity,
    Package,
    Building2,
    User,
    Mail,
    Hash,
    Calendar,
    FileText,
    Tag,
    Monitor,
    Cpu,
    HardDrive,
    Server,
    Info,
    Users,
    Building,
    Phone,
    MapPin,
    Check,
    X,
    Loader2,
    UserPlus,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    ChevronLeft,
    ChevronRight,
    ArrowLeftToLine,
    ArrowRightToLine
} from "lucide-react";
import profileImg from "@/assets/profile-image.jpg";
import PropTypes from "prop-types";
import { MessagePOSTcontext } from "../contexts/MessageContext/POSTmessage";
import { UserDataContext } from "../contexts/UserContext/UserContext";
import { MessageDetailModal } from "./MessageDetailModal";
import { AuthContext } from "../contexts/AuthContext";
export const Header = ({ collapsed, setCollapsed }) => {
    const { messages, markAllAsRead, markMessageAsRead } = useContext(MessagePOSTcontext);
    const { theme, setTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
    const [localTechnicians, setLocalTechnicians] = useState([]);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

    const { Firstname, role } = useContext(AuthContext)

    console.log("role",Firstname)
    const { technicians = [] } = useContext(UserDataContext) || {};

    // Helper function
    const isEmptyOrWhitespace = (str) => {
        return !str || str.trim() === "" || str === "N/A" || str === "   ";
    };

    // Transform messages into notifications format with improved icons
    const notifications = useMemo(() => {
        if (!messages || messages.length === 0) return [];

        // Step 1: Group messages by RequestID
        const groupedByRequestId = {};
        messages.forEach((msg) => {
            const requestId = msg.RequestID || msg.RequestId;
            if (!requestId) {
                const key = `no-id-${msg._id || Math.random()}`;
                groupedByRequestId[key] = [msg];
                return;
            }
            if (!groupedByRequestId[requestId]) {
                groupedByRequestId[requestId] = [];
            }
            groupedByRequestId[requestId].push(msg);
        });

        // Step 2: Filter each group
        const filteredMessages = [];
        Object.values(groupedByRequestId).forEach((group) => {
            const hasTechnicianConfirmed = group.some(
                (msg) => msg.typesNotification === "TechnicianConfirmed"
            );

            if (hasTechnicianConfirmed) {
                const confirmedMessages = group.filter(
                    (msg) => msg.typesNotification === "TechnicianConfirmed"
                );
                filteredMessages.push(...confirmedMessages);
            } else {
                filteredMessages.push(...group);
            }
        });

        // Step 3: Transform filtered messages into notifications
        return filteredMessages.map((msg, index) => {
            let icon = AlertCircle;
            let iconColor = "text-blue-500";
            let bgColor = "bg-blue-100 dark:bg-blue-900/30";
            let statusColor = "text-blue-600 dark:text-blue-400";
            let statusBg = "bg-blue-100 dark:bg-blue-900/30";

            if (msg.typesNotification === "MaintenanceRequest") {
                icon = Wrench;
                iconColor = "text-yellow-600";
                bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
                statusColor = "text-yellow-600 dark:text-yellow-400";
                statusBg = "bg-yellow-100 dark:bg-yellow-900/30";
            } else if (msg.typesNotification === "TechnicianConfirmed") {
                icon = CheckCircle2;
                iconColor = "text-green-500";
                bgColor = "bg-green-100 dark:bg-green-900/30";
                statusColor = "text-green-600 dark:text-green-400";
                statusBg = "bg-green-100 dark:bg-green-900/30";
            } else if (msg.RequestStatus === "Completed" || msg.Status === "Completed") {
                icon = CheckCircle2;
                iconColor = "text-green-500";
                bgColor = "bg-green-100 dark:bg-green-900/30";
                statusColor = "text-green-600 dark:text-green-400";
                statusBg = "bg-green-100 dark:bg-green-900/30";
            } else if (msg.RequestStatus === "Pending" || msg.Status === "Pending") {
                icon = Clock;
                iconColor = "text-orange-500";
                bgColor = "bg-orange-100 dark:bg-orange-900/30";
                statusColor = "text-orange-600 dark:text-orange-400";
                statusBg = "bg-orange-100 dark:bg-orange-900/30";
            } else if (msg.RequestStatus === "In Progress" || msg.Status === "In Progress") {
                icon = Activity;
                iconColor = "text-purple-500";
                bgColor = "bg-purple-100 dark:bg-purple-900/30";
                statusColor = "text-purple-600 dark:text-purple-400";
                statusBg = "bg-purple-100 dark:bg-purple-900/30";
            }

            const isUnread = msg.read === false;

            let description = msg.message || "";
            let details = [];

            if (msg.RequestDescription && !isEmptyOrWhitespace(msg.RequestDescription)) {
                details.push(`Issue: ${msg.RequestDescription}`);
            }

            const hasEquipmentBrand = msg.EquipmentBrand && !isEmptyOrWhitespace(msg.EquipmentBrand);
            const hasEquipmentSpec = msg.EquipmentSpecification && !isEmptyOrWhitespace(msg.EquipmentSpecification);

            if (hasEquipmentBrand && hasEquipmentSpec) {
                details.push(`Equipment: ${msg.EquipmentBrand} - ${msg.EquipmentSpecification}`);
            } else if (hasEquipmentBrand) {
                details.push(`Equipment: ${msg.EquipmentBrand}`);
            }

            if (msg.EquipmentSerial && !isEmptyOrWhitespace(msg.EquipmentSerial)) {
                details.push(`Serial: ${msg.EquipmentSerial}`);
            }

            if (msg.laboratoryNames && !isEmptyOrWhitespace(msg.laboratoryNames)) {
                details.push(`📍 ${msg.laboratoryNames}`);
            }

            if (msg.RequestRef && !isEmptyOrWhitespace(msg.RequestRef)) {
                details.push(`Reference: ${msg.RequestRef}`);
            }

            const hasEnchargeName = msg.EnchargeName && !isEmptyOrWhitespace(msg.EnchargeName);
            if (hasEnchargeName) {
                details.push(`In-charge: ${msg.EnchargeName}`);
            }

            const hasTechnicianName = msg.TechnicianName && !isEmptyOrWhitespace(msg.TechnicianName);
            if (hasTechnicianName) {
                details.push(`Technician: ${msg.TechnicianName}`);
            }

            let enchargeName = msg.EnchargeName;
            let enchargeEmail = msg.EnchargeEmail;
            let enchargeFullDetails = null;

            if (isEmptyOrWhitespace(enchargeName) && msg.LaboratoryEnchargeDetails && msg.LaboratoryEnchargeDetails.length > 0) {
                const enchargeDetail = msg.LaboratoryEnchargeDetails[0];
                if (enchargeDetail && enchargeDetail.fullName && !isEmptyOrWhitespace(enchargeDetail.fullName)) {
                    enchargeName = enchargeDetail.fullName;
                    enchargeFullDetails = enchargeDetail;
                    if (enchargeDetail.email && !isEmptyOrWhitespace(enchargeDetail.email)) {
                        enchargeEmail = enchargeDetail.email;
                    }
                }
            }

            let technicianName = msg.TechnicianName;

            return {
                id: msg._id || index,
                title: msg.typesNotification || msg.RequestStatus || "Maintenance Request",
                desc: description,
                details: details,
                time: msg.DateTime,
                unread: isUnread,
                icon: icon,
                iconColor: iconColor,
                bgColor: bgColor,
                statusColor: statusColor,
                statusBg: statusBg,
                data: msg,
                enchargeFullDetails: enchargeFullDetails,
                summary: {
                    requestId: msg.RequestID || msg.RequestId,
                    requestRef: msg.RequestRef,
                    status: msg.RequestStatus || msg.Status,
                    category: msg.CategoryName,
                    equipment: msg.EquipmentBrand,
                    serial: msg.EquipmentSerial,
                    spec: msg.EquipmentSpecification,
                    lab: msg.laboratoryNames,
                    department: msg.departmentName,
                    technician: technicianName,
                    encharge: enchargeName,
                    enchargeEmail: enchargeEmail,
                    to: msg.To,
                    role: msg.role,
                    description: msg.RequestDescription,
                    message: msg.message,
                    dateTime: msg.DateTime,
                    requestDateTime: msg.RequestDateTime,
                    equipmentDateTime: msg.EquipmentDateTime,
                }
            };
        });
    }, [messages]);

    const unreadCount = notifications.filter(n => n.unread).length;

    console.log("[Header] notifications count:", notifications.length);
    console.log("[Header] unreadCount:", unreadCount);

    // 👇 IPAKITA LAHAT — read man o unread
    const displayedNotifications = notifications;

    const formatDate = (dateString) => {
        if (!dateString) return "Just now";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleNotificationClick = (notif) => {
        console.log("[Header] Notification clicked:", notif);
        setSelectedMessage(notif);
        setShowNotifications(false);
    };

    const closeDetailView = () => {
        setSelectedMessage(null);
    };

    // ==========================================
    // MARK ALL AS READ
    // Priority: markAllAsRead(messageIds) > markMessageAsRead(id) loop
    // ==========================================
    const handleMarkAllAsRead = async () => {
        console.log("========================================");
        console.log("[Header] 🖱️ Mark all as read clicked");
        console.log("[Header] Current unreadCount:", unreadCount);
        console.log("[Header] Total notifications:", notifications.length);

        // Collect unread message IDs
        const unreadIds = notifications
            .filter(n => n.unread)
            .map(n => n.id);

        console.log("[Header] Unread notification IDs:", unreadIds);

        if (unreadCount === 0) {
            console.warn("[Header] ⚠️ No unread notifications — skipping.");
            return;
        }

        // ==========================================
        // STRATEGY 1: Batch endpoint (markAllAsRead)
        // ==========================================
        if (typeof markAllAsRead === "function") {
            try {
                setIsMarkingAllRead(true);
                console.log("[Header] 📤 Using markAllAsRead() batch endpoint with IDs:", unreadIds);

                const result = await markAllAsRead(unreadIds);
                console.log("[Header] ✅ markAllAsRead() resolved:", result);
                return;
            } catch (error) {
                console.error("[Header] ❌ markAllAsRead() failed:", error);
                console.warn("[Header] 🔄 Falling back to markMessageAsRead() loop...");
                // Fall through to strategy 2
            } finally {
                setIsMarkingAllRead(false);
            }
        }

        // ==========================================
        // STRATEGY 2: Loop markMessageAsRead(id)
        // ==========================================
        if (typeof markMessageAsRead === "function") {
            try {
                setIsMarkingAllRead(true);
                console.log("[Header] 📤 Using markMessageAsRead() loop for", unreadIds.length, "messages");

                const results = await Promise.allSettled(
                    unreadIds.map((id) => {
                        console.log(`[Header]   ↳ markMessageAsRead(${id})`);
                        return markMessageAsRead(id);
                    })
                );

                const fulfilled = results.filter(
                    r => r.status === "fulfilled" && r.value === true
                ).length;
                const rejected = results.filter(r => r.status === "rejected");
                const returnedFalse = results.filter(
                    r => r.status === "fulfilled" && r.value === false
                );

                console.log(`[Header] ✅ ${fulfilled}/${unreadIds.length} marked as read.`);
                if (returnedFalse.length > 0) {
                    console.warn(`[Header] ⚠️ ${returnedFalse.length} returned false.`);
                }
                if (rejected.length > 0) {
                    console.warn("[Header] ⚠️ Some threw errors:", rejected);
                }
            } catch (error) {
                console.error("[Header] ❌ Loop failed:", error);
            } finally {
                setIsMarkingAllRead(false);
            }
            return;
        }

        // ==========================================
        // WALANG AVAILABLE NA FUNCTION
        // ==========================================
        console.error(
            "[Header] ❌ Neither markAllAsRead nor markMessageAsRead is available in MessagePOSTcontext."
        );
        console.log("[Header] 🏁 Mark all as read flow finished (no-op).");
        console.log("========================================");
    };

    const techniciansToUse = localTechnicians.length > 0 ? localTechnicians : technicians;

    return (
        <>
            <header className="relative z-[60] flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
                <div className="flex items-center gap-x-3">
                    <button
                        className="btn-ghost size-10 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all duration-300 hover:scale-105"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {collapsed ? (
                            <PanelLeftOpen size={20} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                            <PanelLeftClose size={20} className="text-blue-600 dark:text-blue-400" />
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-x-4">
                    <button
                        className="btn-ghost size-10 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all duration-300"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        <Sun size={20} className="dark:hidden" />
                        <Moon size={20} className="hidden dark:block" />
                    </button>

                    {/* Notification Button */}
                    <div className="relative">
                        <button
                            className="btn-ghost size-10 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 relative rounded-lg transition-all duration-300"
                            onClick={() => {
                                console.log("[Header] 🔔 Bell clicked. Opening:", !showNotifications);
                                setShowNotifications(!showNotifications);
                            }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700 shrink-0">
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</h3>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-semibold px-2 py-0.5 rounded-full">
                                        {unreadCount} New
                                    </span>
                                </div>

                                {/* Mark all as read control */}
                                <div className="flex items-center justify-end px-4 py-2 border-b border-slate-100 dark:border-slate-700 shrink-0">
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={unreadCount === 0 || isMarkingAllRead}
                                        className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${unreadCount === 0 || isMarkingAllRead
                                            ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                            : "text-blue-600 dark:text-blue-400 hover:underline"
                                            }`}
                                        title="Mark all notifications as read"
                                    >
                                        {isMarkingAllRead ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                Marking...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={12} />
                                                Mark all as read
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                    {displayedNotifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                                            <Bell size={32} className="mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No notifications</p>
                                            <p className="text-xs">All caught up!</p>
                                        </div>
                                    ) : (
                                        displayedNotifications.map((notif) => {
                                            const IconComponent = notif.icon || AlertCircle;
                                            return (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${notif.unread
                                                        ? 'bg-yellow-50/40 dark:bg-yellow-900/10'
                                                        : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${notif.unread
                                                            ? `${notif.bgColor} ${notif.iconColor}`
                                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                                                            }`}>
                                                            <IconComponent size={14} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    {notif.unread && (
                                                                        <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
                                                                    )}
                                                                    <p className={`text-xs truncate ${notif.unread
                                                                        ? 'font-semibold text-slate-800 dark:text-slate-200'
                                                                        : 'font-medium text-slate-500 dark:text-slate-400'
                                                                        }`}>
                                                                        {notif.title}
                                                                    </p>
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                                                                    {formatDate(notif.data?.DateTime)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${notif.unread
                                                                ? 'text-slate-500 dark:text-slate-400'
                                                                : 'text-slate-400 dark:text-slate-500'
                                                                }`}>
                                                                {notif.desc || notif.data?.RequestDescription || notif.data?.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-700 text-center shrink-0 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                        {notifications.length} total · {unreadCount} unread
                                    </span>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-x-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Incharge
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                incharge@gmail.com
                            </span>
                        </div>
                        <button className="size-10 overflow-hidden rounded-full border-2 border-yellow-400 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                            <img
                                src={profileImg}
                                alt="profile image"
                                className="size-full object-cover"
                            />
                        </button>
                    </div>
                </div>
            </header>

            <MessageDetailModal
                selectedMessage={selectedMessage}
                onClose={closeDetailView}
                technicians={techniciansToUse}
                isLoadingTechnicians={isLoadingTechnicians}
                onAssignSuccess={() => {
                    console.log("Technician assigned successfully");
                }}
                onAssignError={(error) => {
                    console.error("Assignment error:", error);
                }}
                onApprove={(requestId) => {
                    console.log("Request approved:", requestId);
                }}
            />
        </>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};