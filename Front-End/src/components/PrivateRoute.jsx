import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../components/Context/AuthContext';

const PrivateRoute = () => {
  const { authToken } = useAuth();
  return authToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;