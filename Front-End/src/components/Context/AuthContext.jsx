import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
<<<<<<< HEAD

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Kinukuha ang initial state mula sa LocalStorage base sa eksaktong fields ng Schema
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("token") || null,
  );
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null); // Ito ang 'username' sa schema
  const [FirstName, setFirstName] = useState(
    localStorage.getItem("FirstName") || null,
  );
  const [Middle, setMiddle] = useState(localStorage.getItem("Middle") || null);
  const [LastName, setLastName] = useState(
    localStorage.getItem("LastName") || null,
  );
  const [userId, setUserID] = useState(localStorage.getItem("userId") || null);
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  // AuthContext.jsx

  const login = async (inputEmail, password) => {
    console.log("Logging in with:", inputEmail);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/login`,
        { email: inputEmail, password },
        { withCredentials: true },
      );

      if (res.data.status === "Success") {
        // Destructure lahat ng kailangan mula sa server response
        const {
          token,
          role, // <--- Siguraduhin na ang backend ay nagpapadala nito sa root ng response JSON
          email: serverEmail,
          FirstName,
          Middle,
          LastName,
          userId,
        } = res.data;

        // 1. I-save sa LocalStorage para manatili kahit i-refresh ang page
        localStorage.setItem("token", token);
        localStorage.setItem("role", role); // <--- Sine-save dito para ma-access mo sa Dashboard
        localStorage.setItem("email", serverEmail);
        localStorage.setItem("FirstName", FirstName);
        localStorage.setItem("Middle", Middle || "");
        localStorage.setItem("LastName", LastName);
        localStorage.setItem("userId", userId);

        // 2. I-update ang React states
        setAuthToken(token);
        setRole(role);
        setEmail(serverEmail);
        setFirstName(FirstName);
        setMiddle(Middle);
        setLastName(LastName);
        setUserID(userId);

        // 3. I-set ang default axios header para sa susunod na requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 4. Ibalik ang data na kailangan ng iyong handleLoginSubmit sa UI
        // Isinasama natin ang 'role' at 'success'
        return {
          success: true,
          role: role,
          userId: userId,
        };
      }
    } catch (error) {
      console.error(
        "Axios Login Error:",
        error.response?.data || error.message,
      );
=======
export const AuthContext = createContext();
import socket from "../../socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const AuthProvider = ({ children }) => {
  //const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL); // Connect to your Socket.io server
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("token") || null
  ); // Get token from localStorage
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null);
  const [fullName, setFullName] = useState(localStorage.getItem("fullName") || null);
  const [userId, setUserID] = useState(localStorage.getItem("userId") || null);
  // Set the token globally for all axios requests
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers["Authorization"];
    }
  }, [authToken]);

    // Handle socket connection and registering the user ID
    useEffect(() => {
      if (userId) {
        socket.emit("register-user", userId,role); // Send the userId to the server on socket connection
        console.log(`Socket registered for userId: ${userId}`);
      }
  
      // Cleanup on disconnect
      return () => {
        socket.disconnect();
      };
    }, [userId]);
  

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/login`,
        { email, password },
        { withCredentials: true } 
      );      

      console.log("Login response:", res.data);

      if (res.data.status === "Success") {
        const fullName=res.data.fullName;
        const token = res.data.token;
        const role = res.data.role;
        const email = res.data.email;
        const userId = res.data.userId; // Get the user ID from response
        // Store token, role, email, and userId in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("email", email);
        localStorage.setItem("userId", userId); // Save ID
        localStorage.setItem("fullName", fullName);

        // Set the token in global axios headers
        axios.defaults.headers["Authorization"] = `Bearer ${token}`;

        // Update the context
        setFullName(fullName)
        setAuthToken(token);
        setRole(role);
        setEmail(email);
        setUserID(userId); // Update context (if applicable)

        return { success: true, role, userId }; // Return ID along with role
      }
    } catch (error) {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
<<<<<<< HEAD
    // Linisin ang lahat ng items na itinugma sa Schema
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("FirstName");
    localStorage.removeItem("Middle");
    localStorage.removeItem("LastName");
    localStorage.removeItem("userId");

    // Reset states
    setAuthToken(null);
    setRole(null);
    setEmail(null);
    setFirstName(null);
    setMiddle(null);
    setLastName(null);
    setUserID(null);

    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        role,
        email,
        FirstName,
        Middle,
        LastName,
        userId,
        login,
        logout,
      }}
=======
    // Clear local storage
    localStorage.removeItem("fullName");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("selectedLab");
    localStorage.removeItem("laboratory");
    localStorage.removeItem("selectedLabsData");
    localStorage.removeItem("assignedEquipments")
    localStorage.removeItem("maintenanceRequests")
    localStorage.removeItem("maintenanceData")
    localStorage.removeItem("maintenanceLabels")
    // Clear state
    setAuthToken(null);
    setRole(null);
    setUserID(null);

    // Remove token from axios headers
    delete axios.defaults.headers["Authorization"];

    // Confirm removal
    console.log("UserID after removal:", localStorage.getItem("userId")); // Should be null

    // Reload the page after logout
    window.location.href = "";
  };
  <ToastContainer />
  return (
    <AuthContext.Provider
      value={{ email, authToken, role, login, logout, userId,fullName }}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    >
      {children}
    </AuthContext.Provider>
  );
<<<<<<< HEAD
};

=======
  
};

// Custom hook to use AuthContext
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
export const useAuth = () => useContext(AuthContext);
