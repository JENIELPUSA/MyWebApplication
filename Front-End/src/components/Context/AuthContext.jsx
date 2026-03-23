import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
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
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
