import React, { forwardRef, useContext, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

import { navbarLinks } from "@/constants";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";

import bipsulogo from "../assets/logo.png";
import { AuthContext } from "../contexts/AuthContext";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { role, logout } = useContext(AuthContext);
    const location = useLocation();

    const rolePermissions = useMemo(() => ({
        Admin: [
            "/dashboard",
            "/dashboard/LaboratoryAssign",
            "/dashboard/RequestMaintenances",
            "/dashboard/User",
            "/dashboard/equipment",
            "/dashboard/department",
            "/dashboard/laboratory",
            "/dashboard/report",
            "/dashboard/assign",
            "/dashboard/maintenance",
            "/dashboard/problem"
        ],
        Technician: [
            "/dashboard",
            "/dashboard/report",
            "/dashboard/pms",
            "/dashboard/maintenance",
            "/dashboard/assign",
        ],
        Supply: [
            "/dashboard",
            "/dashboard/equipment",
            "/dashboard/laboratory",
            "/dashboard",
            "/dashboard/LaboratoryAssign",
            "/dashboard/RequestMaintenances",
            "/dashboard/equipment",
            "/dashboard/department",
            "/dashboard/laboratory",
            "/dashboard/report",
            "/dashboard/assign",

        ],
        User: [
            "/dashboard"]
    }), []);

    const filteredNavLinks = useMemo(() => {
        if (!role) return [];

        const allowedPaths = rolePermissions[role] || [];

        return navbarLinks
            .map((group) => ({
                ...group,
                links: group.links.filter((link) => allowedPaths.includes(link.path)),
            }))
            .filter((group) => group.links.length > 0);
    }, [role, rolePermissions]);

    // Strict check para sa Dashboard active state
    const isDashboardActive = useMemo(() => {
        const currentPath = location.pathname;
        return currentPath === "/dashboard";
    }, [location.pathname]);

    // Loading state
    if (!role) {
        return (
            <aside
                ref={ref}
                className={cn(
                    "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-[#1a56db] bg-[#1e3a8a]",
                    collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                    collapsed ? "max-md:-left-full" : "max-md:left-0",
                )}
            >
                <div className="flex items-center justify-center h-full text-white/50 text-sm">
                    Loading...
                </div>
            </aside>
        );
    }

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-[#1a56db] bg-[#1e3a8a] [transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1),_left_300ms_cubic-bezier(0.4,_0,_0.2,_1),_background-color_150ms_cubic-bezier(0.4,_0,_0.2,_1),_border_150ms_cubic-bezier(0.4,_0,_0.2,_1)]",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            {/* Logo Section */}
            <div className={cn(
                "flex items-center justify-center border-b border-[#1a56db]",
                collapsed ? "md:px-2 md:py-4" : "px-4 py-4"
            )}>
                <img
                    src={bipsulogo}
                    alt="Bipsu Logo"
                    className={cn(
                        "rounded-full object-cover border-2 border-[#fbbf24] shadow-lg shadow-[#fbbf24]/30",
                        collapsed ? "w-10 h-10" : "w-16 h-16"
                    )}
                />
            </div>

            {/* Navigation Links */}
            <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-2 [scrollbar-width:_thin] scrollbar-thumb-[#fbbf24] scrollbar-track-[#1e3a8a]">
                {filteredNavLinks.length === 0 ? (
                    <div className="text-center text-white/30 text-sm py-4">
                        No menu items available
                    </div>
                ) : (
                    filteredNavLinks.map((group) => (
                        <div key={group.title} className="mb-4 w-full">
                            {!collapsed && (
                                <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[2px] text-white/30">
                                    {group.title}
                                </p>
                            )}

                            <div className="flex flex-col gap-1.5 px-1">
                                {group.links.map((link) => {
                                    const isDashboardLink = link.path === "/dashboard";

                                    return (
                                        <NavLink
                                            key={link.label}
                                            to={link.path}
                                            className={({ isActive }) => {
                                                const shouldBeActive = isDashboardLink
                                                    ? isDashboardActive
                                                    : isActive;

                                                return cn(
                                                    "group flex transition-all duration-300 relative overflow-hidden",
                                                    collapsed
                                                        ? "flex-col items-center justify-center rounded-xl py-2 px-1 text-center w-full"
                                                        : "flex-row items-center gap-4 rounded-xl px-4 py-3",
                                                    shouldBeActive
                                                        ? "bg-yellow-400 text-[#002B7F] shadow-lg shadow-yellow-400/20"
                                                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                                                );
                                            }}
                                        >
                                            {({ isActive }) => {
                                                const shouldBeActive = isDashboardLink
                                                    ? isDashboardActive
                                                    : isActive;

                                                return (
                                                    <>
                                                        {/* Active Indicator Line - Changed to Blue */}
                                                        {shouldBeActive && (
                                                            <span className={cn(
                                                                "absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full left-0"
                                                            )} />
                                                        )}

                                                        <link.icon
                                                            size={collapsed ? 20 : 22}
                                                            className="shrink-0 transition-transform duration-300 group-hover:scale-110"
                                                        />

                                                        <span className={cn(
                                                            "font-medium transition-all duration-300",
                                                            collapsed
                                                                ? "mt-1 text-[8px] uppercase tracking-tighter leading-none w-full truncate px-0.5"
                                                                : "text-[14px]"
                                                        )}>
                                                            {link.label}
                                                        </span>

                                                        {/* Tooltip sa Collapsed Mode */}
                                                        {collapsed && (
                                                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md">
                                                                {link.label}
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            }}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / User Info */}
            <div className="mt-auto border-t border-[#1a56db] bg-[#1a3a7a]">
                {collapsed && (
                    <div className="flex justify-center py-2">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#fbbf24] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#fbbf24]/30">
                                {role?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#fbbf24] rounded-full border-2 border-[#1e3a8a] animate-pulse"></div>
                        </div>
                    </div>
                )}

                <div className="p-2">
                    <button
                        onClick={logout}
                        className={cn(
                            "group flex w-full transition-all duration-300 relative overflow-hidden",
                            collapsed
                                ? "flex-col items-center justify-center py-2 text-red-400"
                                : "flex-row items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400",
                            "hover:bg-red-500/10 rounded-xl"
                        )}
                    >
                        <LogOut size={20} className="shrink-0" />
                        <span className={cn(
                            "font-bold transition-all duration-300",
                            collapsed ? "mt-1 text-[8px] uppercase tracking-tighter truncate w-full px-0.5" : "text-sm"
                        )}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};