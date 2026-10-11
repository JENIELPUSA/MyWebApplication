import React, { useState, useContext, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, RefreshCw, Search,
  Package, Info, ClipboardList,
  Calendar, User, CheckCircle, Clock, AlertCircle,
  Loader2, X
} from "lucide-react";
import { HistoryContext } from "../../contexts/HistoryContext/HistoryContext";

const MaintenanceManagement = () => {
  const {
    // Data
    filteredHistories,
    loading,
    totalHistories,
    totalPages,

    // Pagination
    currentPage,
    setCurrentPage,
    historyPerPage,
    setHistoryPerPage,

    // Search & Filter
    searchQuery,
    setSearchQuery,
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
    refreshHistories,
  } = useContext(HistoryContext);

  // Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // ==========================================
  // PAGINATION
  // ==========================================
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (totalPages || 1)) {
      setCurrentPage(pageNumber);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleRefresh = () => {
    refreshHistories();
  };

  const handleRowClick = (item) => {
    setSelectedHistory(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedHistory(null);
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Assigned":
      case "AssignedTechnician":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "InchargeConfirmation":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "InchargedConfirmed":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "FeedbackSubmitted":
        return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400";
      case "Rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
      case "Approved":
      case "InchargedConfirmed":
        return <CheckCircle size={12} className="mr-1" />;
      case "Assigned":
      case "AssignedTechnician":
        return <User size={12} className="mr-1" />;
      case "In Progress":
      case "InchargeConfirmation":
        return <Clock size={12} className="mr-1" />;
      case "Pending":
      case "Rejected":
        return <AlertCircle size={12} className="mr-1" />;
      case "FeedbackSubmitted":
      case "Cancelled":
        return <Info size={12} className="mr-1" />;
      default:
        return <Info size={12} className="mr-1" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center
          bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg text-white shadow-sm shadow-blue-500/30">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-white">
                Maintenance History
              </h2>
              <p className="text-xs text-blue-600/70 dark:text-slate-400">
                View all maintenance request history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
                hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
              title="Refresh history"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Records:{" "}
              <span className="font-bold text-blue-700 dark:text-blue-400">
                {totalHistories || 0}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & SORT BAR */}
        <div className="p-4 flex flex-col sm:flex-row gap-3
          bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" size={16} />
            <input
              type="text"
              placeholder="Search equipment, ref, department, technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500"
              disabled={loading}
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="ASSIGN">Assign</option>
            <option value="RETRIEVE">Retrieve</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            title="From date"
          />

          {/* Date To */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            title="To date"
          />

          {/* Sort */}
          <select
            value={`${sortBy}|${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("|");
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt|desc">Newest First</option>
            <option value="createdAt|asc">Oldest First</option>
            <option value="action|asc">Action (A-Z)</option>
          </select>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto relative">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading history records...</p>
              </div>
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-slate-800 dark:to-slate-800
                text-white dark:text-slate-300 text-xs uppercase tracking-wider font-semibold
                border-b border-blue-800 dark:border-slate-700">
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Package size={12} />
                    Equipment / Ref / Category
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={12} />
                    Department / Lab
                  </div>
                </th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User size={12} />
                    Technician
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    Date
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
              {!loading && filteredHistories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    {searchQuery ? 'No matching history records found.' : 'No history records found.'}
                  </td>
                </tr>
              ) : (
                !loading && filteredHistories.map((item, index) => (
                  <tr
                    key={`${item._id}-${item.ref || index}`}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {/* COMBINED COLUMN: Equipment / Ref / Category */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.equipment || item.targetName || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Ref:</span>
                          <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                            {item.ref || item.referenceNo || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            {item.category || item.action || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department / Lab */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {item.department || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {item.lab || "No Lab"}
                      </div>
                    </td>

                    {/* DESCRIPTION — with tooltip */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <span
                        className="block truncate text-gray-700 dark:text-gray-300 cursor-help"
                        title={item.description || 'N/A'}
                      >
                        {item.description || 'N/A'}
                      </span>
                    </td>

                    {/* REMARKS — with tooltip */}
                    <td className="px-4 py-3 max-w-[150px]">
                      <span
                        className="block truncate text-gray-500 dark:text-gray-400 cursor-help"
                        title={item.remarks || '—'}
                      >
                        {item.remarks || '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status || 'Unknown'}
                      </span>
                    </td>

                    {/* Technician */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.technician || item.performedBy || 'Unassigned'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.date || item.createdAt)}
                      </span>
                    </td>

                    {/* FEEDBACK — with tooltip */}
                    <td className="px-4 py-3 text-center max-w-[120px]">
                      {item.feedback ? (
                        <span
                          className="inline-block truncate max-w-[100px] px-2 py-1 rounded-full
                            bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
                            cursor-help text-xs"
                          title={item.feedback}
                        >
                          {item.feedback}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">No feedback</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:bg-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800
          border-t border-blue-100 dark:border-slate-700
          rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-blue-700 dark:text-blue-400">
              {totalHistories === 0 ? 0 : Math.min(totalHistories, (currentPage - 1) * historyPerPage + 1)}
            </span> to{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {Math.min(currentPage * historyPerPage, totalHistories)}
            </span> of{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">{totalHistories}</span> entries
          </div>

          <div className="flex items-center gap-2">
            {/* Per Page */}
            <select
              value={historyPerPage}
              onChange={(e) => setHistoryPerPage(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700 text-blue-800 dark:text-slate-300"
            >
              {[5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>

            {/* Prev */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || totalHistories === 0 || loading}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>

            <span className="px-3 py-1 text-xs font-medium text-blue-800 dark:text-slate-300">
              Page {currentPage} of {totalPages || 1}
            </span>

            {/* Next */}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === (totalPages || 1) || totalHistories === 0 || loading}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
           DETAIL MODAL — Buong detalye ng history record
          ============================================================ */}
      {isDetailModalOpen && selectedHistory && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[999] p-4"
          onClick={handleCloseDetailModal}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-blue-100 dark:border-slate-700
              bg-gradient-to-r from-blue-50 via-white to-amber-50
              dark:from-slate-800 dark:via-slate-800 dark:to-slate-800
              flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg text-white">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-900 dark:text-white">
                    History Details
                  </h3>
                  <p className="text-xs text-blue-600/70 dark:text-slate-400">
                    {selectedHistory.ref || selectedHistory.referenceNo || 'No Ref'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">

              {/* Equipment / Ref / Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Equipment
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {selectedHistory.equipment || selectedHistory.targetName || 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Ref No.
                  </label>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white mt-1">
                    {selectedHistory.ref || selectedHistory.referenceNo || 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Category / Action
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {selectedHistory.category || selectedHistory.action || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Department / Lab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Department
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {selectedHistory.department || 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Laboratory
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {selectedHistory.lab || 'No Lab'}
                  </p>
                </div>
              </div>

              {/* Status / Technician / Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Status
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(selectedHistory.status)}`}>
                      {getStatusIcon(selectedHistory.status)}
                      {selectedHistory.status || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Technician
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {selectedHistory.technician || selectedHistory.performedBy || 'Unassigned'}
                  </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Date
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {formatDate(selectedHistory.date || selectedHistory.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description — full text */}
              <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  Description
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">
                  {selectedHistory.description || 'N/A'}
                </p>
              </div>

              {/* Remarks — full text */}
              <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  Remarks
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">
                  {selectedHistory.remarks || '—'}
                </p>
              </div>

              {/* Feedback — full text */}
              <div className="bg-blue-50/50 dark:bg-slate-700/50 rounded-lg p-3">
                <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  Feedback
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">
                  {selectedHistory.feedback || 'No feedback'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-blue-100 dark:border-slate-700
              bg-white dark:bg-slate-800 flex justify-end rounded-b-lg">
              <button
                onClick={handleCloseDetailModal}
                className="px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-700
                  hover:from-blue-700 hover:to-blue-800
                  text-white rounded-lg transition-all text-sm font-semibold
                  shadow-sm shadow-blue-500/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenanceManagement;