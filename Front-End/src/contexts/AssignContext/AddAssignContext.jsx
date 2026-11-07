import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";

export const AddAssignContext = createContext();

// ============================================================
// ✅ DEFAULT FILTERS
// ============================================================
const DEFAULT_FILTERS = {
  search: "",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
  laboratory: "",
  department: "",
  category: "",
  brand: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

// ============================================================
// ✅ HELPER — Normalize ID (string / ObjectId / object) → string
// ============================================================
const toIdStr = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "object" && val._id) return String(val._id).trim();
  return String(val).trim();
};

// ============================================================
// ✅ HELPER — Clean query params (remove empty values)
// ============================================================
const cleanQueryParams = (params) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== "" &&
      value !== null &&
      value !== undefined &&
      value !== "All"
    ) {
      if (["department", "laboratory", "category"].includes(key)) {
        const normalized = toIdStr(value);
        if (normalized) cleaned[key] = normalized;
      } else {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
};

export const AddAssignProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [assigns, setAssigns] = useState([]);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // ✅ StatusModal states
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  // ✅ Pagination state
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalLaboratories: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    count: 0,
  });

  // ✅ Search & filter state
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ✅ Kunin ang token mula sa localStorage
  const getAuthToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null
    );
  };

  const [token, setToken] = useState(() => getAuthToken());

  // ✅ Watch localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "authToken") {
        setToken(getAuthToken());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    setToken(getAuthToken());
  }, []);

  // ============================================================
  // ✅ HELPER — Show Status Modal
  // ============================================================
  const openStatusModal = useCallback((status, message) => {
    setModalStatus(status);
    setModalMessage(message);
    setShowModal(true);
  }, []);

  const closeStatusModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // ============================================================
  // ADD ASSIGN EQUIPMENT
  // ============================================================
  const addAssignEquipment = async (values) => {
    const authToken = getAuthToken();
    if (!authToken) {
      openStatusModal("error", "Authentication required. Please log in.");
      return { success: false };
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment`,
        {
          Equipments: values.id,
          Laboratory: values.Laboratory,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${values.id}`,
          { status: "Not Available" },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setConfirm(true);
        openStatusModal("success", "Equipment assigned successfully.");
        return { success: true, data: response.data.data };
      } else {
        openStatusModal(
          "error",
          response.data.message || "Failed to assign equipment."
        );
        return { success: false };
      }
    } catch (error) {
      console.error("Error assigning equipment:", error);
      openStatusModal(
        "error",
        error?.response?.data?.message ||
          error.message ||
          "Unexpected error occurred."
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ DISPLAY ASSIGN
  // ============================================================
  const displayAssign = useCallback(
    async (queryParams = {}) => {
      const authToken = getAuthToken();

      if (!authToken) {
        console.warn("⚠️ No auth token — skipping displayAssign");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const isResetRequest =
          !queryParams || Object.keys(queryParams).length === 0;

        const baseFilters = isResetRequest ? DEFAULT_FILTERS : filters;
        const mergedParams = { ...baseFilters, ...queryParams };

        const cleanedParams = cleanQueryParams(mergedParams);
        const queryString = new URLSearchParams(cleanedParams).toString();

        const url = `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/AssignEquipment${queryString ? `?${queryString}` : ""}`;

        const response = await axiosInstance.get(url, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data.status === "success") {
          setAssigns(response.data.data);

          setPagination({
            totalRecords: response.data.totalRecords || 0,
            totalLaboratories: response.data.totalLaboratories || 0,
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 1,
            limit: response.data.limit || 10,
            count: response.data.count || 0,
          });

          if (isResetRequest) {
            setFilters(DEFAULT_FILTERS);
          } else {
            setFilters((prev) => ({ ...prev, ...queryParams }));
          }

          return {
            data: response.data.data,
            pagination: {
              totalRecords: response.data.totalRecords,
              totalLaboratories: response.data.totalLaboratories,
              currentPage: response.data.currentPage,
              totalPages: response.data.totalPages,
              limit: response.data.limit,
              count: response.data.count,
            },
          };
        }
      } catch (error) {
        console.error("❌ Error fetching assigns:", error);

        if (error.response?.status === 404) {
          setError(error.response.data.message || "No laboratory assigned.");
          setAssigns([]);
          setPagination({
            totalRecords: 0,
            totalLaboratories: 0,
            currentPage: 1,
            totalPages: 1,
            limit: 10,
            count: 0,
          });
        } else {
          setError(error.message || "Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // ============================================================
  // ✅ PAGINATION HELPERS
  // ============================================================
  const goToPage = useCallback(
    (page) => {
      const safePage = Math.max(1, Math.min(page, pagination.totalPages));
      return displayAssign({ ...filters, page: safePage });
    },
    [displayAssign, filters, pagination.totalPages]
  );

  const nextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      return goToPage(pagination.currentPage + 1);
    }
  }, [goToPage, pagination.currentPage, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      return goToPage(pagination.currentPage - 1);
    }
  }, [goToPage, pagination.currentPage]);

  const changeLimit = useCallback(
    (newLimit) => {
      return displayAssign({ ...filters, limit: newLimit, page: 1 });
    },
    [displayAssign, filters]
  );

  // ============================================================
  // ✅ SEARCH / FILTER HELPERS
  // ============================================================
  const handleSearch = useCallback(
    (searchTerm) => {
      return displayAssign({ ...filters, search: searchTerm, page: 1 });
    },
    [displayAssign, filters]
  );

  const handleFilterChange = useCallback(
    (filterKey, value) => {
      const normalizedValue = ["department", "laboratory", "category"].includes(
        filterKey
      )
        ? toIdStr(value)
        : value;

      return displayAssign({
        ...filters,
        [filterKey]: normalizedValue,
        page: 1,
      });
    },
    [displayAssign, filters]
  );

  const handleSort = useCallback(
    (sortBy, sortOrder = "desc") => {
      return displayAssign({ ...filters, sortBy, sortOrder, page: 1 });
    },
    [displayAssign, filters]
  );

  // ============================================================
  // ✅ RESET FILTERS
  // ============================================================
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    return displayAssign();
  }, [displayAssign]);

  // ============================================================
  // ✅ AUTO-FETCH ASSIGNS
  // ============================================================
  useEffect(() => {
    const authToken = getAuthToken();

    if (!authToken) {
      console.log("⏸️ No auth token — waiting...");
      return;
    }

    let isMounted = true;

    const fetchAssigns = async () => {
      await displayAssign();
      if (!isMounted) return;
    };

    fetchAssigns();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ============================================================
  // ✅ RE-FETCH KAPAG NAG-LOGIN
  // ============================================================
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = getAuthToken();
      setToken((prevToken) => {
        if (prevToken !== currentToken) {
          return currentToken;
        }
        return prevToken;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // DOWNLOAD PDF HISTORY
  // ============================================================
  const downloadPMSEquipmentHistory = async (laboratoryId) => {
    if (!laboratoryId) {
      openStatusModal("error", "Laboratory ID is required.");
      return;
    }

    const authToken = getAuthToken();
    if (!authToken) {
      openStatusModal("error", "Authentication required. Please log in.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios({
        url: `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/AssignEquipment/displayAssignHistory?laboratory=${laboratoryId}`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${authToken}` },
        withCredentials: true,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      const filename = `Equipment_History_Report_${Date.now()}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Download Error:", error);
      openStatusModal(
        "error",
        error?.response?.status === 404
          ? "No records found for this laboratory."
          : "Unauthorized access or unexpected error."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ RENDER — StatusModal nasa LOOB ng Provider, katabi ng children
  // ============================================================
  return (
    <AddAssignContext.Provider
      value={{
        addAssignEquipment,
        displayAssign,
        assigns,
        error,
        loading,
        confirm,
        downloadPMSEquipmentHistory,
        token,
        // Pagination & filter helpers
        pagination,
        filters,
        goToPage,
        nextPage,
        prevPage,
        changeLimit,
        handleSearch,
        handleFilterChange,
        handleSort,
        resetFilters,
        // ✅ StatusModal helpers (optional, para sa manual trigger)
        openStatusModal,
        closeStatusModal,
      }}
    >
      {children}

      {/* ===== STATUS MODAL — nasa loob ng Provider ===== */}
      <StatusModal
        isOpen={showModal}
        onClose={closeStatusModal}
        status={modalStatus}
        message={modalMessage}
        showCancel={false}
        submitText="OK"
      />
    </AddAssignContext.Provider>
  );
};

export const useAddAssign = () => {
  const context = useContext(AddAssignContext);
  if (!context) {
    throw new Error("useAddAssign must be used within an AddAssignProvider");
  }
  return context;
};