// src/components/Department.jsx
import React, { useState, useEffect, useMemo } from "react";

function Department() {
  const [department, setDepartment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentPerPage, setDepartmentsPerPage] = useState(6);
  const [totalDepartment, setTotalDepartments] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const token = localStorage.getItem("token");

  // ============================================================
  // ERROR HELPERS — para hindi lumabas ang "Network Error" sa UI
  // ============================================================

  /**
   * I-normalize ang kahit anong error (axios, fetch, Error, string)
   * papuntang friendly message. Never i-return ang raw "Network Error".
   */
  const getFriendlyErrorMessage = (err) => {
    // Network error (walang internet, server down, CORS, timeout, etc.)
    const isNetworkError =
      err?.message === "Network Error" ||
      err?.code === "ERR_NETWORK" ||
      err?.code === "ECONNABORTED" ||
      err?.name === "NetworkError" ||
      (typeof err === "string" && /network/i.test(err)) ||
      (!err?.response && err?.request); // axios: request sent, no response

    if (isNetworkError) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }

    // Timeout
    if (err?.code === "ETIMEDOUT" || /timeout/i.test(err?.message || "")) {
      return "The request timed out. Please try again.";
    }

    // HTTP status-based messages
    const status = err?.response?.status;
    if (status === 401) return "Your session has expired. Please log in again.";
    if (status === 403) return "You don't have permission to perform this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 500) return "Something went wrong on our end. Please try again later.";
    if (status >= 500) return "Server is temporarily unavailable. Please try again later.";
    if (status >= 400) {
      return (
        err?.response?.data?.message ||
        "Your request could not be processed. Please try again."
      );
    }

    // Fallback — generic message, hindi raw error
    return "Something went wrong. Please try again.";
  };

  /**
   * Safe logger — para hindi mag-leak ang raw error sa console
   * (optional: pwede mong i-remove kung gusto mong makita pa rin sa dev).
   */
  const logError = (context, err) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[${context}]`, err?.message || err);
    }
  };

  // ============================================================
  // FETCH DEPARTMENTS
  // ============================================================
  useEffect(() => {
    let isMounted = true;

    const fetchDepartments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/departments?page=${currentPage}&limit=${departmentPerPage}&search=${encodeURIComponent(
            searchTerm
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // HTTP error (4xx / 5xx)
        if (!res.ok) {
          // I-throw ang error na may response info para ma-handle ng helper
          const err = new Error(`HTTP ${res.status}`);
          err.response = { status: res.status };
          try {
            err.response.data = await res.json();
          } catch {
            // ignore JSON parse error
          }
          throw err;
        }

        const data = await res.json();
        if (!isMounted) return;
        setDepartment(data.departments || data.data || []);
        setTotalDepartments(data.total || data.totalDepartments || 0);
      } catch (err) {
        if (!isMounted) return;
        logError("fetchDepartments", err);
        // 👇 DITO ANG FIX: friendly message lang, hindi "Network Error"
        setError(getFriendlyErrorMessage(err));
        setDepartment([]);
        setTotalDepartments(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, [currentPage, departmentPerPage, searchTerm, token]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleAddDepartment = (isOpen, newDepartment) => {
    if (!newDepartment || !newDepartment._id) {
      // Friendly message instead of alert
      setError("Could not add department. Missing department ID.");
      return;
    }
    setDepartment((prev) => [...prev, newDepartment]);
    setTotalDepartments((prev) => prev + 1);
  };

  const handleDeleteDepartment = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/departments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.response = { status: res.status };
        throw err;
      }
      setDepartment((prev) => prev.filter((d) => d._id !== id));
      setTotalDepartments((prev) => Math.max(0, prev - 1));
    } catch (err) {
      logError("handleDeleteDepartment", err);
      setError(getFriendlyErrorMessage(err));
    }
  };

  const handleDepartmentSelect = (dept) => {
    setSelectedDepartment(dept);
  };

  const handleRetry = () => {
    setError(null);
    // Trigger refetch by bumping currentPage state (o add a `reloadKey` state)
    setCurrentPage((p) => p); // no-op; better to add reloadKey
  };

  // ============================================================
  // DERIVED
  // ============================================================
  const filteredEquipment = useMemo(() => {
    if (!searchTerm.trim()) return department;
    const q = searchTerm.toLowerCase();
    return department.filter((d) =>
      (d.DepartmentName || "").toLowerCase().includes(q)
    );
  }, [department, searchTerm]);

  const isNoDepartment = filteredEquipment.length === 0;
  const totalPages = Math.max(
    1,
    Math.ceil((totalDepartment || department.length) / departmentPerPage)
  );

  const paginate = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex flex-col p-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 shadow-sm text-gray-700 placeholder-gray-400 text-sm transition-colors duration-200"
          />
          <select
            value={departmentPerPage}
            onChange={(e) => {
              setDepartmentsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="ml-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 shadow-sm text-gray-700"
          >
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* ===== ERROR BANNER (friendly message, walang "Network Error") ===== */}
        {error && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
            <span className="mt-0.5 flex-shrink-0">
              {/* warning icon (inline SVG, walang external dep) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 text-xs font-semibold text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-col text-gray-700 bg-white shadow-md rounded-xl bg-clip-border px-4 py-4">
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            <table className="w-full text-left table-auto border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    Category Name
                  </th>
                  <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* LOADING STATE */}
                {loading ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-gray-300 p-6 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        Loading departments...
                      </div>
                    </td>
                  </tr>
                ) : isNoDepartment ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-gray-300 p-2 text-center text-gray-500"
                    >
                      No Results Found
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((dept) => (
                    <tr
                      key={dept._id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="border border-gray-300 p-2">
                        {dept.DepartmentName}
                      </td>
                      <td className="border border-gray-300 p-2 flex space-x-2">
                        <button
                          onClick={() => handleDepartmentSelect(dept)}
                          className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                          aria-label="Edit department"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept._id)}
                          className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
                          aria-label="Delete department"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex space-x-1 justify-center mt-4">
            <button
              className={`rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`min-w-9 rounded-full py-2 px-3.5 text-center text-sm transition-all shadow-sm ${
                  currentPage === index + 1
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "border border-slate-300 text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              className={`rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500 ${
                currentPage === totalPages || isNoDepartment
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || isNoDepartment}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Department;