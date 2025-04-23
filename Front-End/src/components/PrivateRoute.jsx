import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../components/Context/AuthContext'; // Import the useAuth hook

const PrivateRoute = () => {
  const { authToken } = useAuth(); // Access the authToken from the context
  // If there's no token, navigate to login, otherwise show the protected route
  return authToken ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
