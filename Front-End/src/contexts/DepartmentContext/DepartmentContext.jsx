import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const DepartmentDisplayContext = createContext();

export const DepartmentDisplayProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // ==================== STATE ====================
  const [department, setDepartment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentPerPage, setDepartmentsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [customError, setCustomError] = useState("");

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
  }, [statusFilter, sortBy, sortOrder, departmentPerPage]);

  // ============================================================
  // FETCH DEPARTMENT DATA (with pagination, search, filter, sort)
  // ============================================================
  const fetchCategoryData = useCallback(
    async (signal) => {
      if (!authToken) {
        setDepartment([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axiosInstance.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
          {
            params: {
              page: currentPage,
              limit: departmentPerPage,
              search: debouncedSearch,
              sortBy,
              sortOrder,
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

        // Support both new (totalRecords) at old (totalDepartment) keys
        const total =
          response.data.totalRecords ??
          response.data.totalDepartment ??
          0;
        const pages =
          response.data.totalPages ??
          Math.ceil(total / departmentPerPage);

        const departmentData = response.data.data || [];

        setDepartment(departmentData);
        setTotalDepartments(total);
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
      departmentPerPage,
      debouncedSearch,
      statusFilter,
      sortBy,
      sortOrder,
    ]
  );

  // ============================================================
  // AUTO-FETCH WITH ABORT CONTROLLER
  // ============================================================
  useEffect(() => {
    if (!authToken) {
      setDepartment([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchCategoryData(controller.signal);

    return () => controller.abort();
  }, [authToken, fetchCategoryData]);

  // ============================================================
  // CLIENT-SIDE FILTER (Fallback lang)
  // ============================================================
  const filteredDepartments = useMemo(() => {
    let list = department || [];

    if (statusFilter && statusFilter !== "All") {
      list = list.filter((d) => d.status === statusFilter);
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((d) => {
        return (
          d.DepartmentName?.toLowerCase().includes(q) ||
          d.DepartmentCode?.toLowerCase().includes(q) ||
          d.Description?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [department, statusFilter, debouncedSearch]);

  // ============================================================
  // CRUD — ADD
  // ============================================================
  const AddAcceptDepartment = async (values) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
        {
          DepartmentName: values.DepartmentName,
          DepartmentCode: values.DepartmentCode,
          Description: values.Description,
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchCategoryData(new AbortController().signal);
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

  // ============================================================
  // CRUD — UPDATE
  // ============================================================
  const UpdateDepartment = async (departmentId, values) => {
    try {
      const dataToSend = {
        DepartmentName: values.DepartmentName,
        DepartmentCode: values.DepartmentCode,
        Description: values.Description,
      };

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments/${departmentId}`,
        dataToSend,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchCategoryData(new AbortController().signal);
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
        "Operation failed. Please try again.";
      setCustomError(message);
      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: message };
    }
  };

  // ============================================================
  // CRUD — DELETE
  // ============================================================
  const DeleteDepartment = async (departmentId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments/${departmentId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchCategoryData(new AbortController().signal);
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      setModalStatus("failed");
      setShowModal(true);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete department",
      };
    }
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  return (
    <DepartmentDisplayContext.Provider
      value={{
        // Data
        department,
        filteredDepartments,
        loading,
        error,
        totalDepartments,
        totalPages,

        // Pagination
        currentPage,
        setCurrentPage,
        departmentPerPage,
        setDepartmentsPerPage,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        statusFilter,
        setStatusFilter,

        // Sorting
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // CRUD
        setDepartment,
        fetchCategoryData,
        AddAcceptDepartment,
        UpdateDepartment,
        DeleteDepartment,

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
    </DepartmentDisplayContext.Provider>
  );
};