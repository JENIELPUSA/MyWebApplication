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
    Microscope
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
                icon: History,
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
                icon: ClipboardCheck,
                path: "/dashboard/assign",
            },
            {
                label: "PMS Form",
                icon: FileText,
                path: "/dashboard/pms",
            },
            {
                label: "Maintenance History",
                icon: History,
                path: "/dashboard/maintenance",
            },
            {
                label: "Equipment Issues",
                icon: History,
                path: "/dashboard/problem",
            },

        ],
    }
];