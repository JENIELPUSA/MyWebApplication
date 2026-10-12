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

export const AddAssignProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [assigns, setAssigns] = useState([]);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // ✅ BAGO: Pagination state
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalLaboratories: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    count: 0,
  });

  // ✅ BAGO: Search & filter state (para persistent sa UI)
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    laboratory: "",
    category: "",
    brand: "",
    status: "",
  });

  // ✅ Kunin ang token mula sa localStorage
  const getAuthToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null
    );
  };

  const [token, setToken] = useState(() => getAuthToken());

  // ============================================================
  // ✅ I-watch ang localStorage changes
  // ============================================================
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
  // ✅ CLEAN QUERY PARAMS (tanggalin ang empty values)
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
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  // ============================================================
  // ✅ DISPLAY ASSIGN (may Pagination + Search)
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
        // ✅ Pagsamahin ang filters state at bagong params
        const mergedParams = { ...filters, ...queryParams };
        const cleanedParams = cleanQueryParams(mergedParams);
        const queryString = new URLSearchParams(cleanedParams).toString();

        const url = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment${
          queryString ? `?${queryString}` : ""
        }`;

        console.log("🌐 Fetching:", url);

        const response = await axiosInstance.get(url, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log("📥 displayAssign response:", response.data);

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

          // ✅ I-save ang filters (para consistent ang UI state)
          setFilters((prev) => ({ ...prev, ...queryParams }));

          return {
            data: response.data.data,
            pagination: {
              totalRecords: response.data.totalRecords,
              currentPage: response.data.currentPage,
              totalPages: response.data.totalPages,
              limit: response.data.limit,
              count: response.data.count,
            },
          };
        }
      } catch (error) {
        console.error("Error fetching assigns:", error);

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
    [filters], // ✅ depende sa filters
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
      // ✅ I-reset ang page sa 1 kapag nag-search
      return displayAssign({ ...filters, search: searchTerm, page: 1 });
    },
    [displayAssign, filters],
  );

  const handleFilterChange = useCallback(
    (filterKey, value) => {
      // ✅ I-reset ang page sa 1 kapag nag-filter
      return displayAssign({ ...filters, [filterKey]: value, page: 1 });
    },
    [displayAssign, filters],
  );

  const handleSort = useCallback(
    (sortBy, sortOrder = "desc") => {
      return displayAssign({ ...filters, sortBy, sortOrder, page: 1 });
    },
    [displayAssign, filters],
  );

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: "",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      laboratory: "",
      category: "",
      brand: "",
      status: "",
    };
    return displayAssign(defaultFilters);
  }, [displayAssign]);

  // ============================================================
  // ✅ AUTO-FETCH ASSIGNS KAPAG MAY AUTHTOKEN
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
  }, [token]); // ✅ Mag-re-run lang kapag nagbago ang token (iwas infinite loop)

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
        // ✅ BAGO: Pagination & filter helpers
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