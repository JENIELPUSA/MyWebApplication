import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = () => {
    const { authToken, loading } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    // Define which paths are public (should redirect if authenticated)
    const publicPaths = ["/", "/login", "/landingPage"];
    const isPublicPath = publicPaths.includes(location.pathname);

    // If authenticated and trying to access public route, redirect to dashboard
    if (authToken && isPublicPath) {
        return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
    }

    // Otherwise, render the public route
    return <Outlet />;
};

export default PublicRoute;