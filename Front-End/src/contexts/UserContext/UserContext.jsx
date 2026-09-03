import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
export const UserDataContext = createContext();
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const UserProvider = ({ children }) => {
  const [customError, setCustomError] = useState("");
  const { authToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [usersPerPage, setusersPerPage] = useState(6);
  
  // Technician-specific states
  const [technicians, setTechnicians] = useState([]);
  const [techniciansLoading, setTechniciansLoading] = useState(false);
  const [techniciansError, setTechniciansError] = useState(null);
  const [totalTechnicians, setTotalTechnicians] = useState(0);

  useEffect(() => {
    if (!authToken) {
      setUsers([]);
      setLoading(false);
      return;
    }

    fetchUserData();
    fetchAllTechnicians();
  }, [authToken]);

  // ==================== USER FUNCTIONS ====================
  
  const fetchUserData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const userData = res?.data.data;
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const AddUser = async (values) => {
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
        {
          FirstName: values.FirstName,
          Middle: values.Middle,
          LastName: values.LastName,
          email: values.email,
          password: values.password,
          role: values.role
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.status === "Success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchUserData(); // Refresh users list
        return { success: true, data: res.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: message };
      } else if (error.request) {
        setCustomError("No response from the server.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "No response from the server." };
      } else {
        setCustomError(error.message || "Unexpected error occurred.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: error.message || "Unexpected error occurred." };
      }
    }
  };

  const UpdateUser = async (userId, values) => {
    try {
      const dataToSend = {
        FirstName: values.FirstName,
        Middle: values.Middle,
        LastName: values.LastName,
        email: values.email,
        role: values.role
      };

      if (values.password) {
        dataToSend.password = values.password;
      }

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchUserData(); // Refresh users list
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: message };
      } else if (error.request) {
        setCustomError("No response from the server.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "No response from the server." };
      } else {
        setCustomError(error.message || "Unexpected error occurred.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: error.message || "Unexpected error occurred." };
      }
    }
  };

  const DeleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchUserData(); // Refresh users list
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setModalStatus("failed");
      setShowModal(true);
      return { 
        success: false, 
        error: error.response?.data?.message || "Failed to delete user" 
      };
    }
  };

  // ==================== TECHNICIAN FUNCTIONS ====================

  // Fetch all technicians - gumagamit ng route parameter /api/v1/users/Technician
  const fetchAllTechnicians = async (queryParams = {}) => {
    if (!authToken) {
      setTechnicians([]);
      setTechniciansLoading(false);
      return;
    }

    setTechniciansLoading(true);
    setTechniciansError(null);

    try {
      // Gumamit ng route parameter: /users/Technician
      let url = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/Technician`;
      
      // Kung may query params (pagination, sorting, etc.)
      const params = new URLSearchParams(queryParams);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await axiosInstance.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Response structure mula sa DisplayAllTechnician controller
      if (res.data.status === "success") {
        setTechnicians(res.data.data || []);
        setTotalTechnicians(res.data.totalUser || 0);
        setTechniciansError(null);
        
        return {
          success: true,
          data: res.data.data,
          totalUser: res.data.totalUser,
          status: res.data.status
        };
      } else {
        setTechnicians([]);
        setTotalTechnicians(0);
        setTechniciansError(res.data.message || "No technicians found");
        
        return {
          success: false,
          message: res.data.message || "No technicians found",
          status: res.data.status
        };
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to fetch technicians";
      setTechniciansError(errorMessage);
      setTechnicians([]);
      setTotalTechnicians(0);
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    } finally {
      setTechniciansLoading(false);
    }
  };

  // Fetch technicians with pagination
  const fetchTechniciansWithPagination = async (page = 1, limit = 6, filters = {}) => {
    const queryParams = {
      page,
      limit,
      ...filters
    };
    
    return await fetchAllTechnicians(queryParams);
  };

  // Get single technician by ID
  const getTechnicianById = async (technicianId) => {
    if (!authToken) {
      return { success: false, error: "No authentication token" };
    }

    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${technicianId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data && res.data.status === "success") {
        return {
          success: true,
          data: res.data.data
        };
      } else {
        return {
          success: false,
          error: res.data.message || "Failed to fetch technician"
        };
      }
    } catch (error) {
      console.error("Error fetching technician:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch technician"
      };
    }
  };

  // Add Technician
  const AddTechnician = async (values) => {
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
        {
          FirstName: values.FirstName,
          Middle: values.Middle,
          LastName: values.LastName,
          email: values.email,
          password: values.password,
          role: values.role || "Technician"
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data.status === "Success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchAllTechnicians(); // Refresh technicians list
        return { success: true, data: res.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: message };
      } else if (error.request) {
        setCustomError("No response from the server.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "No response from the server." };
      } else {
        setCustomError(error.message || "Unexpected error occurred.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: error.message || "Unexpected error occurred." };
      }
    }
  };

  // Update Technician
  const UpdateTechnician = async (userId, values) => {
    try {
      const dataToSend = {
        FirstName: values.FirstName,
        Middle: values.Middle,
        LastName: values.LastName,
        email: values.email,
        role: values.role || "Technician"
      };

      if (values.password) {
        dataToSend.password = values.password;
      }

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchAllTechnicians(); // Refresh technicians list
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: message };
      } else if (error.request) {
        setCustomError("No response from the server.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "No response from the server." };
      } else {
        setCustomError(error.message || "Unexpected error occurred.");
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: error.message || "Unexpected error occurred." };
      }
    }
  };

  // Delete Technician
  const DeleteTechnician = async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchAllTechnicians(); // Refresh technicians list
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      console.error("Error deleting technician:", error);
      setModalStatus("failed");
      setShowModal(true);
      return { 
        success: false, 
        error: error.response?.data?.message || "Failed to delete technician" 
      };
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        // User functions
        users,
        loading,
        error,
        currentPage,
        setCurrentPage,
        usersPerPage,
        setusersPerPage,
        setUsers,
        fetchUserData,
        AddUser,
        UpdateUser,
        DeleteUser,
        technicians,
        techniciansLoading,
        techniciansError,
        totalTechnicians,
        fetchAllTechnicians,
        fetchTechniciansWithPagination,
        getTechnicianById,
        AddTechnician,
        UpdateTechnician,
        DeleteTechnician,
      }}
    >
      {children}

      {/* Modal for success/failed notifications */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </UserDataContext.Provider>
  );
};