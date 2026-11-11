import {
    ChartColumn,
    Home,
    NotepadText,
    Package,
    PackagePlus,
    Settings,
    ShoppingBag,
    UserCheck,
    UserPlus,
    Users,
    FlaskConical,
    Building2,
    FileText,
    ClipboardCheck,
    Wrench,
    History,
    FileBarChart,
    Microscope,
    Tags,
    MonitorCog,
    FlaskRound,
    ListChecks,
    ClipboardList,
    Hammer,
    AlertTriangle,
    KeyRound,
} from "lucide-react";

export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/dashboard",
            },
            {
                label: "User",
                icon: Users,
                path: "/dashboard/User",
            },
            {
                label: "Category",
                icon: Tags,
                path: "/dashboard/category",
            },
            {
                label: "Equipment Management",
                icon: Package,
                path: "/dashboard/equipment",
            },
            {
                label: "Department Management",
                icon: Building2,
                path: "/dashboard/department",
            },
            {
                label: "Laboratory Management",
                icon: FlaskConical,
                path: "/dashboard/laboratory",
            },
            {
                label: "Laboratory Items",
                icon: ListChecks,
                path: "/dashboard/assign",
            },
            {
                label: "PMS Form",
                icon: ClipboardList,
                path: "/dashboard/pms",
            },
            {
                label: "Maintenance History",
                icon: Wrench,
                path: "/dashboard/maintenance",
            },
            {
                label: "Equipment Issues",
                icon: AlertTriangle,
                path: "/dashboard/problem",
            },
            {
                label: "Update Password",
                icon: KeyRound,
                path: "/dashboard/updatepassword",
            }, {
                label: "PMS",
                icon: KeyRound,
                path: "/dashboard/pmsmain",
            },
        ],
    },
];