// src/contexts/AssignLabContext/AssignLabContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

// ✅ Named export for AssignContext
export const AssignContext = createContext();

// ✅ Also keep the default export for backward compatibility
export const AssignLabContext = AssignContext;

// ============================================================
// PROVIDER
// ============================================================
export const AssignLabProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // ==================== STATE ====================
  const [Assignlaboratories, setAssignLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [assignPerPage, setAssignPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAssigns, setTotalAssigns] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [laboratoryFilter, setLaboratoryFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

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
  }, [
    laboratoryFilter,
    categoryFilter,
    brandFilter,
    statusFilter,
    sortBy,
    sortOrder,
    assignPerPage,
  ]);

  // ============================================================
  // FETCH ASSIGN DATA (with pagination, search, filter, sort)
  // ============================================================
  const fetchAssignData = useCallback(
    async (signal) => {
      if (!authToken) {
        setAssignLaboratories([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment`,
          {
            params: {
              page: currentPage,
              limit: assignPerPage,
              search: debouncedSearch,
              sortBy,
              sortOrder,
              ...(laboratoryFilter && { laboratory: laboratoryFilter }),
              ...(categoryFilter && { category: categoryFilter }),
              ...(brandFilter && { brand: brandFilter }),
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

        if (response.data && response.data.status === "success") {
          // Support both new (totalRecords) at old keys
          const total =
            response.data.totalRecords ??
            response.data.totalLaboratories ??
            0;
          const pages =
            response.data.totalPages ??
            Math.ceil(total / assignPerPage);

          const assignData = Array.isArray(response.data.data)
            ? response.data.data
            : [];

          setAssignLaboratories(assignData);
          setTotalAssigns(total);
          setTotalPages(pages);
          setError(null);
        } else {
          setAssignLaboratories([]);
          setTotalAssigns(0);
          setTotalPages(0);
          setError("Unexpected data format from the API.");
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message ||
          "Failed to fetch data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      authToken,
      currentPage,
      assignPerPage,
      debouncedSearch,
      laboratoryFilter,
      categoryFilter,
      brandFilter,
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
      setAssignLaboratories([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchAssignData(controller.signal);

    return () => controller.abort();
  }, [authToken, fetchAssignData]);

  // ============================================================
  // CLIENT-SIDE FILTER (Fallback lang)
  // ============================================================
  const filteredAssigns = useMemo(() => {
    let list = Assignlaboratories || [];

    if (laboratoryFilter) {
      list = list.filter(
        (a) =>
          a.laboratoryId === laboratoryFilter ||
          a.laboratoryName === laboratoryFilter
      );
    }

    if (categoryFilter) {
      list = list.filter((a) =>
        (a.categories || []).some((c) => c === categoryFilter)
      );
    }

    if (brandFilter && brandFilter.trim()) {
      const q = brandFilter.toLowerCase();
      list = list.filter((a) =>
        (a.equipments || []).some((e) =>
          e.Brand?.toLowerCase().includes(q)
        )
      );
    }

    if (statusFilter && statusFilter !== "All") {
      list = list.filter((a) =>
        (a.equipments || []).some((e) => e.status === statusFilter)
      );
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((a) => {
        return (
          a.laboratoryName?.toLowerCase().includes(q) ||
          a.departmentName?.toLowerCase().includes(q) ||
          a.encharge?.toLowerCase().includes(q) ||
          (a.equipments || []).some(
            (e) =>
              e.code?.toLowerCase().includes(q) ||
              e.Brand?.toLowerCase().includes(q) ||
              e.SerialNumber?.toLowerCase().includes(q) ||
              e.Specification?.toLowerCase().includes(q)
          )
        );
      });
    }

    return list;
  }, [
    Assignlaboratories,
    laboratoryFilter,
    categoryFilter,
    brandFilter,
    statusFilter,
    debouncedSearch,
  ]);

  // ============================================================
  // REFRESH — I-refresh ang assign list
  // ============================================================
  const refreshAssigns = async () => {
    await fetchAssignData(new AbortController().signal);
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================
  const clearFilters = () => {
    setSearchQuery("");
    setLaboratoryFilter("");
    setCategoryFilter("");
    setBrandFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  return (
    <AssignLabContext.Provider
      value={{
        // Data
        Assignlaboratories,
        filteredAssigns,
        loading,
        error,
        totalAssigns,
        totalPages,

        // Pagination
        currentPage,
        setCurrentPage,
        assignPerPage,
        setAssignPerPage,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        laboratoryFilter,
        setLaboratoryFilter,
        categoryFilter,
        setCategoryFilter,
        brandFilter,
        setBrandFilter,
        statusFilter,
        setStatusFilter,

        // Sorting
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // Functions
        setAssignLaboratories,
        fetchAssignData,
        refreshAssigns,
        clearFilters,
      }}
    >
      {children}
    </AssignLabContext.Provider>
  );
};