import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL); // Connect to your Socket.io server
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("token") || null
  ); // Get token from localStorage
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null);
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
        { email, password }
      );      

      
      if (res.data.status === "Success") {
        const token = res.data.token;
        const role = res.data.role;
        const email = res.data.email;
        const userId = res.data.userId; // Get the user ID from response

        // Store token, role, email, and userId in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("email", email);
        localStorage.setItem("userId", userId); // Save ID

        // Set the token in global axios headers
        axios.defaults.headers["Authorization"] = `Bearer ${token}`;

        // Update the context
        setAuthToken(token);
        setRole(role);
        setEmail(email);
        setUserID(userId); // Update context (if applicable)

        return { success: true, role, userId }; // Return ID along with role
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");

    // Clear state
    setAuthToken(null);
    setRole(null);
    setUserID(null);

    // Remove token from axios headers
    delete axios.defaults.headers["Authorization"];

    // Confirm removal
    console.log("UserID after removal:", localStorage.getItem("userId")); // Should be null

    // Reload the page after logout
    window.location.reload();
  };
  return (
    <AuthContext.Provider
      value={{ email, authToken, role, login, logout, userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
