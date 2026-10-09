import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import LoginPage from "./components/AuthenticationComponents/Login";
import LaboratoryHome from "./components/LaboratoryHome/LaboratoryHome";
import RequestMaintenance from "./components/RequestMaintenance/RequestMaintenance";
import UserList from "./components/UserComponent/UserList";
import EquipmentForm from "./components/Equipment/EquipmentManagement";
import DepartmentContent from "./components/Department/DepartmentContent";
import LaboratoryContent from "./components/Laboratories/LaboratoryContent";
import AssignLab from "./components/Assign/AssignLab";
//  Fixed import path - Use relative path
import ModalReport from "./components/Report/ModalReport";
import PmsExport from "./components/PMSExport/PmsDisplay";
import MaintenanceManagement from "./components/MaintenanceHistory/MaintenanceManagement";
import ProblemTable from "./components/ProblemManagementComponents/ProblemTable";
import Pms011 from "./components/PMSForm/Pms011"
import Pms002 from "./components/PMSForm/Pms002"
import Pms003 from "./components/PMSForm/Pms003"
import Pms004 from "./components/PMSForm/Pms004"
import Pms005 from "./components/PMSForm/Pms005"
import Pms006 from "./components/PMSForm/Pms006"
import Category from "./components/Category/CategoryTable";


function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
        },
        {
            element: <PublicRoute />,
            children: [
                { path: "/login", element: <LoginPage /> },
            ],
        },
        {
            element: <PrivateRoute />,
            children: [
                {
                    path: "dashboard",
                    element: <Layout />,
                    children: [
                        { index: true, element: <DashboardPage /> },
                        { path: "LaboratoryAssign", element: <LaboratoryHome /> },
                        { path: "RequestMaintenances", element: <RequestMaintenance /> },
                        { path: "User", element: <UserList /> },
                        { path: "equipment", element: <EquipmentForm /> },
                        { path: "department", element: <DepartmentContent /> },
                        { path: "laboratory", element: <LaboratoryContent /> },
                        { path: "report", element: <ModalReport /> },
                        { path: "assign", element: <AssignLab /> },
                        { path: "pms", element: <PmsExport /> },
                        { path: "maintenance", element: <MaintenanceManagement /> },
                        { path: "problem", element: <ProblemTable /> },
                        { path: "pms001", element: <Pms011 /> },
                        { path: "pms002", element: <Pms002 /> },
                        { path: "pms003", element: <Pms003 /> },
                        { path: "pms004", element: <Pms004 /> },
                        { path: "pms005", element: <Pms005 /> },
                        { path: "pms006", element: <Pms006 /> },
                        { path: "category", element: <Category /> },

                    ],
                },
            ],
        },
        {
            path: "*",
            element: <Navigate to="/dashboard" replace />,
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;