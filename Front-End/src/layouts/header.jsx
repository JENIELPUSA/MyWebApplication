// Header.jsx - Show ALL notifications always, mark as read changes status only
import { useState, useContext, useMemo, useEffect, useCallback } from "react";
import {
    Bell,
    Moon,
    Sun,
    AlertCircle,
    Wrench,
    CheckCircle2,
    CheckCircle,
    XCircle,
    Clock,
    Activity,
    User,
    CheckCheckIcon,
    Loader2,
    UserPlus,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight,
    RefreshCw,
    ClipboardCheck,
    ShieldCheck,
    MessageSquare,
    Info,
    AlertTriangle,
} from "lucide-react";
import PropTypes from "prop-types";
import { MessagePOSTcontext } from "../contexts/MessageContext/POSTmessage";
import { UserDataContext } from "../contexts/UserContext/UserContext";
import { MessageDetailModal } from "./MessageDetailModal";
import { AuthContext } from "../contexts/AuthContext";

// ==========================================
// ✅ PROFESSIONAL LABEL MAP
// ==========================================
const NOTIFICATION_LABELS = {
    AssignedTechnician: {
        label: "Technician Assigned",
        shortLabel: "Assigned",
        icon: UserPlus,
        iconColor: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    ReAssignedTechnician: {
        label: "Task Reassigned",
        shortLabel: "Reassigned",
        icon: RefreshCw,
        iconColor: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    MaintenanceRequest: {
        label: "Maintenance Request",
        shortLabel: "Request",
        icon: Wrench,
        iconColor: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    Approved: {
        label: "Request Approved",
        shortLabel: "Approved",
        icon: CheckCircle2,
        iconColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    Rejected: {
        label: "Request Rejected",
        shortLabel: "Rejected",
        icon: XCircle,
        iconColor: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    TaskCompleted: {
        label: "Task Completed",
        shortLabel: "Completed",
        icon: CheckCircle,
        iconColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    Pending: {
        label: "Pending Review",
        shortLabel: "Pending",
        icon: Clock,
        iconColor: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    UnderMaintenance: {
        label: "Under Maintenance",
        shortLabel: "Maintenance",
        icon: Activity,
        iconColor: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    TechnicianConfirmed: {
        label: "Technician Confirmation",
        shortLabel: "Confirmed",
        icon: ClipboardCheck,
        iconColor: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-100 dark:bg-teal-900/30",
    },
    InchargeConfirmation: {
        label: "Awaiting Confirmation",
        shortLabel: "For Review",
        icon: ShieldCheck,
        iconColor: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    NewMessage: {
        label: "New Message",
        shortLabel: "Message",
        icon: MessageSquare,
        iconColor: "text-slate-600 dark:text-slate-400",
        bgColor: "bg-slate-100 dark:bg-slate-800",
    },
    StatusUpdate: {
        label: "Status Update",
        shortLabel: "Update",
        icon: Bell,
        iconColor: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    Reminder: {
        label: "Reminder",
        shortLabel: "Reminder",
        icon: Bell,
        iconColor: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    Urgent: {
        label: "Urgent Notice",
        shortLabel: "Urgent",
        icon: AlertTriangle,
        iconColor: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    General: {
        label: "Notification",
        shortLabel: "Notice",
        icon: Info,
        iconColor: "text-slate-600 dark:text-slate-400",
        bgColor: "bg-slate-100 dark:bg-slate-800",
    },
};

const DEFAULT_NOTIFICATION_LABEL = NOTIFICATION_LABELS.General;

const getNotificationLabel = (type) =>
    NOTIFICATION_LABELS[type] || DEFAULT_NOTIFICATION_LABEL;

// ✅ Theme validation helper
const VALID_THEMES = ["light", "dark"];
const resolveTheme = (value) =>
    VALID_THEMES.includes(value) ? value : "light";

export const Header = ({ collapsed, setCollapsed }) => {
    const { messages, markAllAsRead, markMessageAsRead } = useContext(MessagePOSTcontext);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isLoadingTechnicians] = useState(false);
    const [localTechnicians] = useState([]);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [isSavingTheme, setIsSavingTheme] = useState(false);

    // ✅ Optimistic "read" override set
    const [locallyReadIds, setLocallyReadIds] = useState(() => new Set());

    // ✅ Auth — theme at saveTheme galing sa AuthContext
    const {
        first_name,
        role,
        Firstname,
        theme,
        saveTheme,
    } = useContext(AuthContext);

    const displayFirstName = first_name || Firstname || "";

    const { technicians = [] } = useContext(UserDataContext) || {};

    // ✅ Resolved theme para sa UI (para hindi mag-render ng invalid state)
    const activeTheme = resolveTheme(theme);
    const isDark = activeTheme === "dark";

    // ✅ Greeting
    const getGreeting = () => {
        if (!role) return "Welcome Back";
        const normalizedRole = role.toLowerCase();
        if (normalizedRole === "admin") return "Welcome Back Admin";
        if (normalizedRole === "technician") return "Welcome Back Technician";
        if (normalizedRole === "supply") return "Welcome Back Supply";
        return "Welcome Back User";
    };

    const isEmptyOrWhitespace = (str) => {
        return !str || str.trim() === "" || str === "N/A" || str === "   ";
    };

    // ==========================================
    // ✅ THEME TOGGLE — gamit ang saveTheme (backend + localStorage + state)
    // ==========================================
    const handleThemeToggle = useCallback(async () => {
        if (isSavingTheme) return;

        const nextTheme = isDark ? "light" : "dark";

        try {
            setIsSavingTheme(true);

            // saveTheme ang bahala sa:
            //  1) setTheme (state)
            //  2) localStorage.setItem("theme", ...)
            //  3) PATCH backend (kung may authToken)
            const result = await saveTheme(nextTheme);

            if (result?.success) {
                console.log(`[Header] ✅ Theme saved: ${nextTheme}`);
            } else {
                console.warn(`[Header] ⚠️ Theme save failed:`, result?.message);
            }
        } catch (err) {
            console.error("[Header] ❌ Theme toggle error:", err);

            // Fallback — apply class + localStorage manually para hindi stuck
            try {
                localStorage.setItem("theme", nextTheme);
                document.documentElement.classList.toggle("dark", nextTheme === "dark");
            } catch (fallbackErr) {
                console.error("[Header] Theme fallback failed:", fallbackErr);
            }
        } finally {
            setIsSavingTheme(false);
        }
    }, [isDark, saveTheme, isSavingTheme]);

    // ==========================================
    // ✅ Sync "dark" class sa <html> kapag nagbago ang theme
    // ==========================================
    useEffect(() => {
        document.documentElement.classList.toggle("dark", activeTheme === "dark");
    }, [activeTheme]);

    // ==========================================
    // TRANSFORM MESSAGES → NOTIFICATIONS
    // ==========================================
    const notifications = useMemo(() => {
        if (!messages || messages.length === 0) return [];

        return messages.map((msg, index) => {
            const meta = getNotificationLabel(msg.typesNotification);

            const msgId = msg._id || index;
            const isUnread = msg.read === false && !locallyReadIds.has(msgId);

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

            const technicianName = msg.TechnicianName;

            return {
                id: msgId,
                title: meta.label,
                shortLabel: meta.shortLabel,
                desc: description,
                details: details,
                time: msg.DateTime,
                unread: isUnread,
                icon: meta.icon,
                iconColor: meta.iconColor,
                bgColor: meta.bgColor,
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
    }, [messages, locallyReadIds]);

    const unreadCount = notifications.filter(n => n.unread).length;
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
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    // ==========================================
    // ✅ CLICK → MARK AS READ AGAD
    // ==========================================
    const handleNotificationClick = async (notif) => {
        console.log("[Header] Notification clicked:", notif);

        if (notif.unread && notif.id) {
            setLocallyReadIds((prev) => {
                const next = new Set(prev);
                next.add(notif.id);
                return next;
            });

            if (typeof markMessageAsRead === "function") {
                try {
                    const success = await markMessageAsRead(notif.id);
                    if (success) {
                        console.log(`[Header] ✅ Message ${notif.id} marked as read`);
                    } else {
                        console.warn(`[Header] ⚠️ Failed to mark ${notif.id} as read`);
                    }
                } catch (error) {
                    console.error(`[Header] ❌ markMessageAsRead error:`, error);
                    setLocallyReadIds((prev) => {
                        const next = new Set(prev);
                        next.delete(notif.id);
                        return next;
                    });
                }
            }
        }

        setSelectedMessage(notif);
        setShowNotifications(false);
    };

    const closeDetailView = () => setSelectedMessage(null);

    // Cleanup locallyReadIds
    useEffect(() => {
        if (!messages || messages.length === 0) return;
        setLocallyReadIds((prev) => {
            if (prev.size === 0) return prev;
            const next = new Set(prev);
            let changed = false;
            messages.forEach((msg) => {
                if (msg.read === true && next.has(msg._id)) {
                    next.delete(msg._id);
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [messages]);

    // Mark all as read
    const handleMarkAllAsRead = useCallback(async () => {
        const unreadIds = notifications.filter(n => n.unread).map(n => n.id);
        if (unreadCount === 0) return;

        setLocallyReadIds((prev) => {
            const next = new Set(prev);
            unreadIds.forEach((id) => next.add(id));
            return next;
        });

        if (typeof markAllAsRead === "function") {
            try {
                setIsMarkingAllRead(true);
                await markAllAsRead(unreadIds);
                return;
            } catch (error) {
                console.error("[Header] markAllAsRead failed:", error);
            } finally {
                setIsMarkingAllRead(false);
            }
        }

        if (typeof markMessageAsRead === "function") {
            try {
                setIsMarkingAllRead(true);
                await Promise.allSettled(unreadIds.map((id) => markMessageAsRead(id)));
            } catch (error) {
                console.error("[Header] markMessageAsRead loop failed:", error);
            } finally {
                setIsMarkingAllRead(false);
            }
        }
    }, [notifications, unreadCount, markAllAsRead, markMessageAsRead]);

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
                    {/* ✅ Theme Toggle — via saveTheme (backend + localStorage + state) */}
                    <button
                        type="button"
                        className="btn-ghost size-10 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleThemeToggle}
                        disabled={isSavingTheme}
                        title={isSavingTheme ? "Saving..." : isDark ? "Switch to light mode" : "Switch to dark mode"}
                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        aria-busy={isSavingTheme}
                    >
                        {isSavingTheme ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : isDark ? (
                            <Sun size={20} />
                        ) : (
                            <Moon size={20} />
                        )}
                    </button>

                    {/* Notification Button */}
                    <div className="relative">
                        <button
                            className="btn-ghost size-10 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 relative rounded-lg transition-all duration-300"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-[min(30rem,calc(100vw-2rem))] max-h-[min(75vh,42rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col">
                                {/* HEADER */}
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                <Bell size={19} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                                    Notifications
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Stay updated with your latest activities
                                                </p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                                            <span className="size-1.5 rounded-full bg-blue-500" />
                                            {unreadCount} Unread
                                        </span>
                                    </div>
                                </div>

                                {/* ACTION BAR */}
                                <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        Recent activity
                                    </span>
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={unreadCount === 0 || isMarkingAllRead}
                                        className={`
                                            flex items-center gap-1.5 text-xs font-semibold transition-colors
                                            ${unreadCount === 0 || isMarkingAllRead
                                                ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                                : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            }
                                        `}
                                    >
                                        {isMarkingAllRead ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Marking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCheckIcon size={14} />
                                                Mark all as read
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* LIST */}
                                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                                    {displayedNotifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 px-5">
                                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                                <Bell size={27} className="text-slate-400" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                No notifications yet
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 text-center">
                                                You're all caught up! New activities will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        displayedNotifications.map((notif) => {
                                            const IconComponent = notif.icon || AlertCircle;

                                            const isTechnicianConfirmed =
                                                notif.data?.typesNotification === "TechnicianConfirmed";

                                            const visibleDetails = (notif.details || []).filter((detail) => {
                                                if (!isTechnicianConfirmed) return true;
                                                return !/^(equipment|serial)\s*:/i.test(detail.trim());
                                            });

                                            return (
                                                <button
                                                    type="button"
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`
                                                        w-full text-left px-5 py-4
                                                        border-b border-slate-100 dark:border-slate-800
                                                        transition-colors duration-200
                                                        hover:bg-slate-50 dark:hover:bg-slate-800/70
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500
                                                        ${notif.unread
                                                            ? "bg-blue-50/40 dark:bg-blue-900/10"
                                                            : "bg-white dark:bg-slate-900"
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`
                                                                size-10 rounded-xl flex items-center justify-center shrink-0
                                                                ${notif.unread
                                                                    ? `${notif.bgColor} ${notif.iconColor}`
                                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                                                }
                                                            `}
                                                        >
                                                            <IconComponent size={19} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                                                                    <h4
                                                                        className={`
                                                                            text-sm leading-5 break-words
                                                                            ${notif.unread
                                                                                ? "font-bold text-slate-800 dark:text-white"
                                                                                : "font-semibold text-slate-600 dark:text-slate-300"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {notif.title}
                                                                    </h4>

                                                                    {notif.shortLabel && (
                                                                        <span
                                                                            className={`
                                                                                inline-flex items-center rounded-full px-2 py-0.5
                                                                                text-[10px] font-semibold uppercase tracking-wide
                                                                                ${notif.unread
                                                                                    ? `${notif.bgColor} ${notif.iconColor}`
                                                                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                                                }
                                                                            `}
                                                                        >
                                                                            {notif.shortLabel}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {notif.unread && (
                                                                    <span className="size-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                                                )}
                                                            </div>

                                                            {notif.desc && (
                                                                <p className="mt-2 text-[13px] leading-6 text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                                                                    {notif.desc}
                                                                </p>
                                                            )}

                                                            {visibleDetails.length > 0 && (
                                                                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 space-y-2">
                                                                    {visibleDetails.map((detail, i) => (
                                                                        <div
                                                                            key={`${notif.id}-detail-${i}`}
                                                                            className="flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-400"
                                                                        >
                                                                            <span className="size-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                                                                            <span className="break-words min-w-0">{detail}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                                                                <span className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                                                    <Clock size={12} />
                                                                    {formatDate(notif.data?.DateTime)}
                                                                </span>
                                                                <span
                                                                    className={`
                                                                        inline-flex items-center rounded-md px-2 py-1
                                                                        text-[10px] font-semibold
                                                                        ${notif.unread
                                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                                                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                                        }
                                                                    `}
                                                                >
                                                                    {notif.unread ? "UNREAD" : "READ"}
                                                                </span>
                                                            </div>

                                                            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                                View details
                                                                <ChevronRight size={13} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {/* FOOTER */}
                                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 shrink-0 flex items-center justify-between gap-3">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {notifications.length} total notifications
                                    </span>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-x-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <span className="hidden md:block text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {getGreeting()}
                        </span>
                        <button
                            className="size-10 flex items-center justify-center rounded-full border-2 border-yellow-400 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
                            title={displayFirstName || "User"}
                        >
                            <User size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <MessageDetailModal
                selectedMessage={selectedMessage}
                onClose={closeDetailView}
                technicians={techniciansToUse}
                isLoadingTechnicians={isLoadingTechnicians}
                onAssignSuccess={() => {}}
                onAssignError={(error) => console.error("Assignment error:", error)}
                onApprove={(requestId) => {}}
            />
        </>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};

export default Header;