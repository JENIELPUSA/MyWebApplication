// contexts/HistoryContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";
import { AuthContext } from "../../contexts/AuthContext";

export const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // ==================== STATE ====================
  const [histories, setHistories] = useState([]);
  const [history, setHistory] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [historyPerPage, setHistoryPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalHistories, setTotalHistories] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
  }, [actionFilter, fromDate, toDate, sortBy, sortOrder, historyPerPage]);

  // ============================================================
  // DISPLAY — Kunin ang lahat ng history records
  // ============================================================
  const displayHistories = useCallback(
    async (signal) => {
      if (!authToken) {
        setHistories([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history`,
          {
            params: {
              page: currentPage,
              limit: historyPerPage,
              search: debouncedSearch,
              sortBy,
              sortOrder,
              ...(actionFilter && actionFilter !== "All" && { action: actionFilter }),
              ...(fromDate && { from: fromDate }),
              ...(toDate && { to: toDate }),
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Cache-Control": "no-cache",
            },
            signal,
          }
        );

        if (response.data.status === "success") {
          // Support both new (totalRecords) at old (totalHistories) keys
          const total =
            response.data.totalRecords ??
            response.data.totalHistories ??
            0;
          const pages =
            response.data.totalPages ??
            Math.ceil(total / historyPerPage);

          const historyData = response.data.data || [];

          setHistories(historyData);
          setTotalHistories(total);
          setTotalPages(pages);
          setIsInitialized(true);
          setError(null);

          return historyData;
        }
      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
        console.error("Error fetching histories:", error);
        setError(error.response?.data?.message || "Failed to fetch histories");
      } finally {
        setLoading(false);
      }
    },
    [
      authToken,
      currentPage,
      historyPerPage,
      debouncedSearch,
      actionFilter,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
    ]
  );

  // ============================================================
  // AUTO-FETCH WITH ABORT CONTROLLER
  // ============================================================
  useEffect(() => {
    if (!authToken) {
      setHistories([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    displayHistories(controller.signal);

    return () => controller.abort();
  }, [authToken, displayHistories]);

  // ============================================================
  // CLIENT-SIDE FILTER (Fallback lang)
  // ============================================================
  const filteredHistories = useMemo(() => {
    let list = histories || [];

    if (actionFilter && actionFilter !== "All") {
      list = list.filter((h) => h.action === actionFilter);
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((h) => {
        return (
          h.action?.toLowerCase().includes(q) ||
          h.description?.toLowerCase().includes(q) ||
          h.performedBy?.toLowerCase().includes(q) ||
          h.targetName?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [histories, actionFilter, debouncedSearch]);

  // ============================================================
  // DISPLAY BY ID — Kunin ang isang specific na history
  // ============================================================
  const getHistory = async (id) => {
    if (!authToken || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setHistory(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setError(error.response?.data?.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPDATE — I-update ang isang history record
  // ============================================================
  const updateHistory = async (id, values) => {
    if (!authToken || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history/${id}`,
        values,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        await displayHistories(new AbortController().signal);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating history:", error);
      setError(error.response?.data?.message || "Failed to update history");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE — Burahin ang isang history record
  // ============================================================
  const deleteHistory = async (id) => {
    if (!authToken || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        await displayHistories(new AbortController().signal);
        return true;
      }
    } catch (error) {
      console.error("Error deleting history:", error);
      setError(error.response?.data?.message || "Failed to delete history");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET / CLEAR / REFRESH
  // ============================================================
  const resetConfirm = () => setConfirm(null);
  const clearErrors = () => setError(null);
  const refreshHistories = async () => {
    await displayHistories(new AbortController().signal);
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  return (
    <HistoryContext.Provider
      value={{
        // Data
        histories,
        filteredHistories,
        history,
        loading,
        error,
        isInitialized,
        confirm,

        // Pagination
        currentPage,
        setCurrentPage,
        historyPerPage,
        setHistoryPerPage,
        totalPages,
        totalHistories,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        actionFilter,
        setActionFilter,
        fromDate,
        setFromDate,
        toDate,
        setToDate,

        // Sorting
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // Functions
        displayHistories,
        getHistory,
        updateHistory,
        deleteHistory,
        resetConfirm,
        clearErrors,
        refreshHistories,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};