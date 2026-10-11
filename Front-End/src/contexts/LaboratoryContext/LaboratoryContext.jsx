import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "../../contexts/AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const LaboratoryContext = createContext();

export const LaboratoryProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // ==================== STATE ====================
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [laboratoryPerPage, setLaboratoryPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLaboratories, setTotalLaboratories] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Dropdown (para sa filters)
  const [isLabDropdown, setLabDropdown] = useState([]);

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
  }, [departmentFilter, sortBy, sortOrder, laboratoryPerPage]);

  // ============================================================
  // FETCH LABORATORY DATA (with pagination, search, filter, sort)
  // ============================================================
  const fetchLaboratoryData = useCallback(
    async (signal) => {
      if (!authToken) {
        setLaboratories([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axiosInstance.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory`,
          {
            params: {
              page: currentPage,
              limit: laboratoryPerPage,
              search: debouncedSearch,
              sortBy,
              sortOrder,
              ...(departmentFilter && { department: departmentFilter }),
            },
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Cache-Control": "no-cache",
            },
            signal,
          }
        );

        // Support both new (totalRecords) at old (totalLaboratory) keys
        const total =
          response.data.totalRecords ??
          response.data.totalLaboratory ??
          0;
        const pages =
          response.data.totalPages ??
          Math.ceil(total / laboratoryPerPage);

        const laboratoryData = response.data.data || [];

        setLaboratories(laboratoryData);
        setTotalLaboratories(total);
        setTotalPages(pages);
        setError(null);
      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;

        if (error.response?.status === 401) {
          setCustomError("Unauthorized: Please log in again.");
        } else {
          setCustomError("Failed to fetch data. Please try again later.");
        }
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    [
      authToken,
      currentPage,
      laboratoryPerPage,
      debouncedSearch,
      departmentFilter,
      sortBy,
      sortOrder,
    ]
  );

  // ============================================================
  // AUTO-FETCH WITH ABORT CONTROLLER
  // ============================================================
  useEffect(() => {
    if (!authToken) {
      setLaboratories([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchLaboratoryData(controller.signal);

    return () => controller.abort();
  }, [authToken, fetchLaboratoryData]);

  // ============================================================
  // CLIENT-SIDE FILTER (Fallback lang)
  // ============================================================
  const filteredLaboratories = useMemo(() => {
    let list = laboratories || [];

    if (departmentFilter) {
      list = list.filter(
        (lab) =>
          lab.DepartmentId === departmentFilter ||
          lab.department === departmentFilter
      );
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((lab) => {
        return (
          lab.LaboratoryName?.toLowerCase().includes(q) ||
          lab.RefNo?.toLowerCase().includes(q) ||
          lab.EnchargeName?.toLowerCase().includes(q) ||
          lab.department?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [laboratories, departmentFilter, debouncedSearch]);

  // ============================================================
  // FETCH LABORATORY DROPDOWN (by department)
  // ============================================================
  const fetchLaboratoryDropdown = async (deptId) => {
    setLabDropdown([]);

    if (!authToken || !deptId) {
      return { success: false, error: "Missing token or Department ID" };
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/GetLaboratoriesByDepartment`,
        {
          params: { departmentId: deptId },
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        }
      );

      setLabDropdown(res.data.data || []);
      return { success: true, data: res.data.data };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Server connection error";
      setCustomError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CRUD — ADD
  // ============================================================
  const AddedLaboratory = async (values) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory`,
        {
          department: values.department,
          Encharge: values.Encharge,
          LaboratoryName: values.LaboratoryName,
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchLaboratoryData(new AbortController().signal);
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
  const UpdateLaboratory = async (LaboratoryId, values) => {
    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/${LaboratoryId}`,
        {
          department: values.department,
          Encharge: values.Encharge,
          LaboratoryName: values.LaboratoryName,
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchLaboratoryData(new AbortController().signal);
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
  const DeleteLaboratory = async (laboratoryId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/${laboratoryId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        await fetchLaboratoryData(new AbortController().signal);
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete Laboratory.";
      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: errorMessage };
    }
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  return (
    <LaboratoryContext.Provider
      value={{
        // Data
        laboratories,
        filteredLaboratories,
        loading,
        error,
        totalLaboratories,
        totalPages,

        // Pagination
        currentPage,
        setCurrentPage,
        laboratoryPerPage,
        setLaboratoryPerPage,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        departmentFilter,
        setDepartmentFilter,

        // Sorting
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // CRUD
        setLaboratories,
        fetchLaboratoryData,
        fetchLaboratoryDropdown,
        isLabDropdown,
        AddedLaboratory,
        UpdateLaboratory,
        DeleteLaboratory,

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
    </LaboratoryContext.Provider>
  );
};