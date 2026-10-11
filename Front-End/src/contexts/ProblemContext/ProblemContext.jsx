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

export const ProblemContext = createContext();

export const ProblemProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // ==================== STATE ====================
  const [problems, setProblems] = useState([]);
  const [problem, setProblem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [problemPerPage, setProblemPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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
  }, [
    statusFilter,
    priorityFilter,
    categoryFilter,
    fromDate,
    toDate,
    sortBy,
    sortOrder,
    problemPerPage,
  ]);

  // ============================================================
  // DISPLAY — Kunin ang lahat ng problema
  // ============================================================
  const displayProblems = useCallback(
    async (signal) => {
      if (!authToken) {
        setProblems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problem`,
          {
            params: {
              page: currentPage,
              limit: problemPerPage,
              search: debouncedSearch,
              sortBy,
              sortOrder,
              ...(statusFilter && statusFilter !== "All" && { status: statusFilter }),
              ...(priorityFilter && priorityFilter !== "All" && { priority: priorityFilter }),
              ...(categoryFilter && categoryFilter !== "All" && { category: categoryFilter }),
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
          // Support both new (totalRecords) at old (totalProblems) keys
          const total =
            response.data.totalRecords ??
            response.data.totalProblems ??
            0;
          const pages =
            response.data.totalPages ??
            Math.ceil(total / problemPerPage);

          const problemData = response.data.data || [];

          setProblems(problemData);
          setTotalProblems(total);
          setTotalPages(pages);
          setIsInitialized(true);
          setError(null);

          return problemData;
        }
      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
        console.error("Error fetching problems:", error);
        setError(error.response?.data?.message || "Failed to fetch problems");
      } finally {
        setLoading(false);
      }
    },
    [
      authToken,
      currentPage,
      problemPerPage,
      debouncedSearch,
      statusFilter,
      priorityFilter,
      categoryFilter,
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
      setProblems([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    displayProblems(controller.signal);

    return () => controller.abort();
  }, [authToken, displayProblems]);

  // ============================================================
  // CLIENT-SIDE FILTER (Fallback lang)
  // ============================================================
  const filteredProblems = useMemo(() => {
    let list = problems || [];

    if (statusFilter && statusFilter !== "All") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (priorityFilter && priorityFilter !== "All") {
      list = list.filter((p) => p.priority === priorityFilter);
    }

    if (categoryFilter && categoryFilter !== "All") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => {
        return (
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [problems, statusFilter, priorityFilter, categoryFilter, debouncedSearch]);

  // ============================================================
  // CREATE — Gumawa ng bagong problema
  // ============================================================
  const createProblem = async (values) => {
    if (!authToken) {
      console.error("No token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problem`,
        {
          title: values.title,
          category: values.category,
          description: values.description,
          priority: values.priority,
          location: values.location,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        await displayProblems(new AbortController().signal);
        return response.data;
      }
    } catch (error) {
      console.error("Error creating problem:", error);
      setError(error.response?.data?.message || "Failed to create problem");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DISPLAY BY ID — Kunin ang isang specific na problema
  // ============================================================
  const getProblem = async (id) => {
    if (!authToken || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problems/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setProblem(response.data.data.problem);
        return response.data.data.problem;
      }
    } catch (error) {
      console.error("Error fetching problem:", error);
      setError(error.response?.data?.message || "Failed to fetch problem");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPDATE — I-update ang isang problema
  // ============================================================
  const updateProblem = async (id, values) => {
    if (!authToken || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problems/${id}`,
        {
          title: values.title,
          category: values.category,
          description: values.description,
          priority: values.priority,
          status: values.status,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        await displayProblems(new AbortController().signal);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      setError(error.response?.data?.message || "Failed to update problem");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE — Burahin ang isang problema
  // ============================================================
  const deleteProblem = async (id) => {
    if (!authToken || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problem/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        await displayProblems(new AbortController().signal);
        return true;
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
      setError(error.response?.data?.message || "Failed to delete problem");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET / CLEAR / REFRESH
  // ============================================================
  const resetConfirm = () => setConfirm(null);
  const clearErrors = () => setError(null);
  const refreshProblems = async () => {
    await displayProblems(new AbortController().signal);
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  return (
    <ProblemContext.Provider
      value={{
        // Data
        problems,
        filteredProblems,
        problem,
        loading,
        error,
        isInitialized,
        confirm,

        // Pagination
        currentPage,
        setCurrentPage,
        problemPerPage,
        setProblemPerPage,
        totalPages,
        totalProblems,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        categoryFilter,
        setCategoryFilter,
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
        createProblem,
        displayProblems,
        getProblem,
        updateProblem,
        deleteProblem,
        resetConfirm,
        clearErrors,
        refreshProblems,
      }}
    >
      {children}
    </ProblemContext.Provider>
  );
};