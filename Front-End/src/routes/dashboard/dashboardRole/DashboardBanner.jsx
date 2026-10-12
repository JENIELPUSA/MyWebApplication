import { FaFlask, FaChartLine, FaTools, FaWrench, FaTerminal, FaBoxes, FaClipboardList, FaUserCog } from "react-icons/fa";
import { createContext, useContext, useState, useEffect } from "react";
import logobanner from "../../../assets/bannerbipsu.jpg";
import { AuthContext } from "../../../contexts/AuthContext";

const DashboardBanner = ({ role, laboratory }) => {
    // ✅ Kunin ang first_name, last_name, at email mula sa AuthContext
    const { first_name, last_name, email, Profile } = useContext(AuthContext);

    // ✅ Greeting logic based sa oras
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // ✅ Greeting emoji based sa oras
    const getGreetingEmoji = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "🌅";
        if (hour < 18) return "☀️";
        return "🌙";
    };

    // ✅ Buong pangalan — priority: AuthContext → Profile → fallback
    const getFullName = () => {
        const fn =
            first_name ||
            Profile?.FirstName ||
            Profile?.firstName ||
            "";
        const ln =
            last_name ||
            Profile?.LastName ||
            Profile?.lastName ||
            "";
        const full = `${fn} ${ln}`.trim();
        return full || email || "User";
    };

    const getTitle = () => {
        if (laboratory) return "Laboratory Focus";
        return getDashboardTitle(role);
    };

    const getSubtitle = () => {
        if (laboratory) return "Detailed Laboratory View";
        switch (role) {
            case "Admin": return "System Administration & Analytics";
            case "User": return "Department Equipment Management";
            case "Technician": return "Maintenance & Service Console";
            case "Supply": return "Equipment Inventory & Supply Management";
            default: return "Industrial Asset Management System";
        }
    };

    const getIcon = () => {
        if (laboratory) return <FaFlask />;
        switch (role) {
            case "Admin": return <FaChartLine />;
            case "User": return <FaTools />;
            case "Technician": return <FaWrench />;
            case "Supply": return <FaBoxes />;
            default: return <FaTerminal />;
        }
    };

    const getBadge = () => {
        if (laboratory) return "LAB";
        switch (role) {
            case "Admin": return "ADMIN";
            case "User": return "USER";
            case "Technician": return "TECH";
            case "Supply": return "SUPPLY";
            default: return "DASH";
        }
    };

    const getBadgeColor = () => {
        switch (role) {
            case "Admin": return "bg-yellow-400 text-blue-700 shadow-yellow-400/30";
            case "User": return "bg-blue-400 text-white shadow-blue-400/30";
            case "Technician": return "bg-yellow-500 text-blue-900 shadow-yellow-500/30";
            case "Supply": return "bg-blue-500 text-white shadow-blue-500/30";
            default: return "bg-yellow-400 text-blue-700 shadow-yellow-400/30";
        }
    };

    const getIconBgColor = () => {
        switch (role) {
            case "Admin": return "bg-blue-700/30 border-blue-400/30";
            case "User": return "bg-blue-600/30 border-blue-400/30";
            case "Technician": return "bg-yellow-600/20 border-yellow-400/30";
            case "Supply": return "bg-blue-500/30 border-blue-400/30";
            default: return "bg-white/20 border-white/30";
        }
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-blue-700/20 dark:shadow-yellow-400/20 border-2 border-blue-700/30 dark:border-yellow-400/30 min-h-[140px]">
            {/* Full Logo Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${logobanner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20px 20px, #c9a84c 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* ✅ Darker Overlay para readable ang text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30 z-0" />

            {/* Main Content */}
            <div className="relative z-10 p-6 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* ✅ Inalis ang backdrop-blur-sm dito */}
                        <div className={`p-3 md:p-4 bg-white/20 rounded-2xl shadow-lg border ${getIconBgColor()}`}>
                            <span className="text-2xl md:text-3xl text-yellow-400">
                                {getIcon()}
                            </span>
                        </div>
                        <div>
                            {/* ============================================================ */}
                            {/* ✅ GREETING — WALANG BLUR                                      */}
                            {/* ============================================================ */}
                            <div className="mb-2 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/15 border border-yellow-400/40 shadow-lg">
                                <span className="text-2xl md:text-3xl">{getGreetingEmoji()}</span>
                                <p className="text-base md:text-lg lg:text-xl font-semibold text-yellow-300 tracking-wide drop-shadow-md">
                                    {getGreeting()},{" "}
                                    <span className="font-black text-white drop-shadow-lg">
                                        {getFullName()}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
                                    {getTitle()}
                                </h1>
                                <span className={`hidden sm:inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg ${getBadgeColor()}`}>
                                    {getBadge()}
                                </span>
                            </div>
                            <p className="text-xs md:text-sm font-bold text-white/90 uppercase tracking-[0.15em] mt-1 drop-shadow">
                                {getSubtitle()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-yellow-400" />
                            {role === "Supply" ? "Equipment Inventory Management" : "Industrial Asset Management"}
                            <span className="w-1 h-1 rounded-full bg-yellow-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] text-white/50 font-black uppercase tracking-[0.2em]">
                        <span>BIPSU</span>
                        <span className="w-1 h-1 rounded-full bg-yellow-400/40" />
                        <span>Blue & Gold</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getDashboardTitle = (role) => {
    const titles = {
        Admin: "System Overview",
        User: "Department Portal",
        Technician: "Technician Console",
        Supply: "Supply Management"
    };
    return titles[role] || "Dashboard";
};

export default DashboardBanner;