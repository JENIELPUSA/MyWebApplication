import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const UserDataContext = createContext();

export const UserProvider = ({ children }) => {
  const [customError, setCustomError] = useState("");
  const { authToken } = useContext(AuthContext);

  // ==================== USERS STATE ====================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setusersPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");

  // ==================== TECHNICIAN STATE ====================
  const [technicians, setTechnicians] = useState([]);
  const [techniciansLoading, setTechniciansLoading] = useState(false);
  const [techniciansError, setTechniciansError] = useState(null);
  const [totalTechnicians, setTotalTechnicians] = useState(0);

  // ============================================================
  // AUTO-CLEAR CUSTOM ERROR
  // ============================================================
  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => setCustomError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [customError]);

  // ============================================================
  // DEBOUNCE SEARCH — 400ms
  // ============================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // ✅ Reset sa page 1 kapag nag-search
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page 1 kapag nag-change ang filters/sort
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, sortBy, sortOrder]);

  // ============================================================
  // FETCH USER DATA (with pagination, search, filter, sort)
  // ============================================================
  const fetchUserData = useCallback(
    async (signal) => {
      if (!authToken) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axiosInstance.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`,
          {
            params: {
              page: currentPage,
              limit: usersPerPage,
              search: debouncedSearch,
              sortBy,
              sortOrder,
              ...(roleFilter && roleFilter !== "All" && { role: roleFilter }),
              ...(statusFilter && statusFilter !== "All" && { status: statusFilter }),
            },
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Cache-Control": "no-cache",
            },
            signal,
          }
        );

        // Support both new (totalRecords) at old (totalUser) keys
        const total =
          response.data.totalRecords ??
          response.data.totalUser ??
          0;
        const pages =
          response.data.totalPages ??
          Math.ceil(total / usersPerPage);

        const userData = response.data.data || [];

        setUsers(userData);
        setTotalUsers(total);
        setTotalPages(pages);
        setError(null);
      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    [
      authToken,
      currentPage,
      usersPerPage,
      debouncedSearch,
      roleFilter,
      statusFilter,
      sortBy,
      sortOrder,
    ]
  );

  // ============================================================
  // AUTO-FETCH WITH ABORT CONTROLLER
  // ============================================================
  useEffect(() => {
    if (!authToken) return;

    const controller = new AbortController();
    fetchUserData(controller.signal);
    fetchAllTechnicians();

    return () => controller.abort();
  }, [authToken, fetchUserData]);

  // ============================================================
  // CLIENT-SIDE FILTER (Fallback lang)
  // ============================================================
  const filteredUsers = useMemo(() => {
    let list = users || [];

    if (roleFilter && roleFilter !== "All") {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (statusFilter && statusFilter !== "All") {
      list = list.filter((u) => u.status === statusFilter);
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((u) => {
        return (
          u.FirstName?.toLowerCase().includes(q) ||
          u.Middle?.toLowerCase().includes(q) ||
          u.LastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [users, roleFilter, statusFilter, debouncedSearch]);

  // ============================================================
  // USER CRUD
  // ============================================================
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
          role: values.role,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "Success" || res.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchUserData(new AbortController().signal);
        return { success: true, data: res.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong.";
      setCustomError(message);
      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: message };
    }
  };

  const UpdateUser = async (userId, values) => {
    try {
      const dataToSend = {
        FirstName: values.FirstName,
        Middle: values.Middle,
        LastName: values.LastName,
        email: values.email,
        role: values.role,
      };

      if (values.password) dataToSend.password = values.password;

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchUserData(new AbortController().signal);
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong.";
      setCustomError(message);
      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: message };
    }
  };

  const DeleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchUserData(new AbortController().signal);
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
        error: error.response?.data?.message || "Failed to delete user",
      };
    }
  };

  // ============================================================
  // TECHNICIAN FUNCTIONS
  // ============================================================
  const fetchAllTechnicians = async (queryParams = {}) => {
    if (!authToken) {
      setTechnicians([]);
      setTechniciansLoading(false);
      return;
    }

    setTechniciansLoading(true);
    setTechniciansError(null);

    try {
      let url = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/Technician`;
      const params = new URLSearchParams(queryParams);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axiosInstance.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.status === "success") {
        setTechnicians(res.data.data || []);
        setTotalTechnicians(res.data.totalRecords ?? res.data.totalUser ?? 0);
        setTechniciansError(null);
        return {
          success: true,
          data: res.data.data,
          totalRecords: res.data.totalRecords ?? res.data.totalUser,
          status: res.data.status,
        };
      } else {
        setTechnicians([]);
        setTotalTechnicians(0);
        setTechniciansError(res.data.message || "No technicians found");
        return {
          success: false,
          message: res.data.message || "No technicians found",
          status: res.data.status,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch technicians";
      setTechniciansError(errorMessage);
      setTechnicians([]);
      setTotalTechnicians(0);
      return { success: false, message: errorMessage, error };
    } finally {
      setTechniciansLoading(false);
    }
  };

  const fetchTechniciansWithPagination = async (page = 1, limit = 6, filters = {}) => {
    return await fetchAllTechnicians({ page, limit, ...filters });
  };

  const getTechnicianById = async (technicianId) => {
    if (!authToken) return { success: false, error: "No authentication token" };

    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${technicianId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.data && res.data.status === "success") {
        return { success: true, data: res.data.data };
      }
      return {
        success: false,
        error: res.data.message || "Failed to fetch technician",
      };
    } catch (error) {
      console.error("Error fetching technician:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch technician",
      };
    }
  };

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
          role: values.role || "Technician",
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "Success" || res.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchAllTechnicians();
        return { success: true, data: res.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong.";
      setCustomError(message);
      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: message };
    }
  };

  const UpdateTechnician = async (userId, values) => {
    try {
      const dataToSend = {
        FirstName: values.FirstName,
        Middle: values.Middle,
        LastName: values.LastName,
        email: values.email,
        role: values.role || "Technician",
      };

      if (values.password) dataToSend.password = values.password;

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchAllTechnicians();
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong.";
      setCustomError(message);
      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: message };
    }
  };

  const DeleteTechnician = async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchAllTechnicians();
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
        error: error.response?.data?.message || "Failed to delete technician",
      };
    }
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  return (
    <UserDataContext.Provider
      value={{
        // User data
        users,
        filteredUsers,
        loading,
        error,
        totalUsers,
        totalPages,

        // Pagination
        currentPage,
        setCurrentPage,
        usersPerPage,
        setusersPerPage,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,

        // Sorting
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // User CRUD
        setUsers,
        fetchUserData,
        AddUser,
        UpdateUser,
        DeleteUser,

        // Technician
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

        // Modal / Error
        customError,
        setCustomError,
      }}
    >
      {children}

      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </UserDataContext.Provider>
  );
};