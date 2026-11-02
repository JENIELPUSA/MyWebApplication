import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

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
  dateFrom: "", // 🆕
  dateTo: "",   // 🆕
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
      // Normalize ID-like fields
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
  // ADD ASSIGN EQUIPMENT
  // ============================================================
  const addAssignEquipment = async (values) => {
    const authToken = getAuthToken();
    if (!authToken) {
      console.warn("⚠️ No auth token — cannot add assign");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment`,
        {
          Equipments: values.id,
          Laboratory: values.Laboratory,
        },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      if (response.data.status === "success") {
        await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${values.id}`,
          { status: "Not Available" },
          { headers: { Authorization: `Bearer ${authToken}` } },
        );
        setConfirm(true);
      }
    } catch (error) {
      console.error("Error assigning equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ DISPLAY ASSIGN — Robust param handling + logs
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
        // ✅ DETECT kung "reset" ang request
        const isResetRequest =
          !queryParams || Object.keys(queryParams).length === 0;

        // ✅ Merge filters + queryParams
        const baseFilters = isResetRequest ? DEFAULT_FILTERS : filters;
        const mergedParams = { ...baseFilters, ...queryParams };

        // ✅ Clean & normalize
        const cleanedParams = cleanQueryParams(mergedParams);
        const queryString = new URLSearchParams(cleanedParams).toString();

        const url = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment${
          queryString ? `?${queryString}` : ""
        }`;

        // ============ DEBUG LOGS ============
        console.log("🌐 Fetching Assigns:");
        console.log("  isResetRequest:", isResetRequest);
        console.log("  Filters sent:", {
          department: cleanedParams.department || "(none)",
          laboratory: cleanedParams.laboratory || "(none)",
          category: cleanedParams.category || "(none)",
          brand: cleanedParams.brand || "(none)",
          status: cleanedParams.status || "(none)",
          search: cleanedParams.search || "(none)",
          dateFrom: cleanedParams.dateFrom || "(none)", // 🆕
          dateTo: cleanedParams.dateTo || "(none)",     // 🆕
        });
        console.log("  Full URL:", url);
        // =====================================

        const response = await axiosInstance.get(url, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log("📥 displayAssign response:", {
          status: response.data.status,
          totalRecords: response.data.totalRecords,
          totalLaboratories: response.data.totalLaboratories,
          count: response.data.count,
          firstItem: response.data.data?.[0] || null,
        });

        if (response.data.status === "success") {
          // ✅ I-save ang data
          setAssigns(response.data.data);

          // ✅ I-save ang pagination metadata
          setPagination({
            totalRecords: response.data.totalRecords || 0,
            totalLaboratories: response.data.totalLaboratories || 0,
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 1,
            limit: response.data.limit || 10,
            count: response.data.count || 0,
          });

          // ✅ Reset o merge ang filters
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
    [filters],
  );

  // ============================================================
  // ✅ PAGINATION HELPERS
  // ============================================================
  const goToPage = useCallback(
    (page) => {
      const safePage = Math.max(1, Math.min(page, pagination.totalPages));
      return displayAssign({ ...filters, page: safePage });
    },
    [displayAssign, filters, pagination.totalPages],
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
    [displayAssign, filters],
  );

  // ============================================================
  // ✅ SEARCH / FILTER HELPERS
  // ============================================================
  const handleSearch = useCallback(
    (searchTerm) => {
      return displayAssign({ ...filters, search: searchTerm, page: 1 });
    },
    [displayAssign, filters],
  );

  const handleFilterChange = useCallback(
    (filterKey, value) => {
      // 🆕 Normalize ID-like filters automatically
      const normalizedValue = ["department", "laboratory", "category"].includes(
        filterKey,
      )
        ? toIdStr(value)
        : value;

      // 🆕 Debug pag date filter
      if (filterKey === "dateFrom" || filterKey === "dateTo") {
        console.log(`📅 ${filterKey} changed:`, normalizedValue || "(cleared)");
      }

      return displayAssign({
        ...filters,
        [filterKey]: normalizedValue,
        page: 1,
      });
    },
    [displayAssign, filters],
  );

  const handleSort = useCallback(
    (sortBy, sortOrder = "desc") => {
      return displayAssign({ ...filters, sortBy, sortOrder, page: 1 });
    },
    [displayAssign, filters],
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
      console.log("🚀 AuthToken detected — fetching assigns...");
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
          console.log("🔄 Token changed — updating state");
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
    if (!laboratoryId) return console.error("Laboratory ID is required");

    const authToken = getAuthToken();
    if (!authToken) {
      console.warn("⚠️ No auth token — cannot download PDF");
      return;
    }

    setLoading(true);

    try {
      const response = await axios({
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment/displayAssignHistory?laboratory=${laboratoryId}`,
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
      alert("No records found or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

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
      }}
    >
      {children}
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