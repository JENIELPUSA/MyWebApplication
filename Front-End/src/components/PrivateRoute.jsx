import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
//nanggaling sa autoContext
import { useAuth } from '../components/Context/AuthContext'; // Import the useAuth hook
//Ang purpose ng code na ito ay route protection — pinipigilan nito ang mga hindi authenticated 
// na user (walang authToken) na makapasok sa mga protected routes sa iyong React app.
const PrivateRoute = () => {
  const { authToken } = useAuth(); // Access the authToken from the context
  //Pag walang authToken, ang user ay ire-redirect sa /login.
  return authToken ? <Outlet /> : <Navigate to=""/>;
};

export default PrivateRoute;
