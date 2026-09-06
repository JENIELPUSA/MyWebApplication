import React, { useState, useContext, useEffect } from "react";
import { EquipmentDataContext } from "../../contexts/EquipmentContext/EquipmentContext";
import {
  Plus, ChevronLeft, ChevronRight, Edit,
  Trash2, RefreshCw, PlusCircle, Search,
  Package, Tag, Barcode, Info, ClipboardList,
  Calendar, User, CheckCircle, Clock, AlertCircle,
  Loader2
} from "lucide-react";
import { HistoryContext } from "../../contexts/HistoryContext/HistoryContext";

const MaintenanceManagement = () => {

  const { loading, histories, displayHistories } = useContext(HistoryContext);

  console.log("histories", histories);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const equipmentsPerPage = 5;

  // ==========================================
  // USE EFFECT - Auto-load histories on mount
  // ==========================================
  useEffect(() => {
    displayHistories();
  }, []); // Empty dependency array - runs once on mount

  // ==========================================
  // OPTIONAL: Auto-refresh when component updates
  // ==========================================
  useEffect(() => {
    // This will run every time the component re-renders
    // But we only want to refresh if there's a change
    // You can add dependencies here if needed
  });

  // ==========================================
  // REFRESH ON FOCUS - Refresh when tab becomes active
  // ==========================================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        displayHistories();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ==========================================
  // REFRESH ON INTERVAL - Refresh every 30 seconds
  // ==========================================
  useEffect(() => {
    const interval = setInterval(() => {
      displayHistories();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  // --- FILTER LOGIC para sa history data ---
  const filteredHistory = histories?.filter((item) =>
    (item.equipment?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.ref?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.department?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.technician?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.status?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredHistory.length / equipmentsPerPage);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Safety check para sa Pagination
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * equipmentsPerPage,
    currentPage * equipmentsPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // --- HANDLERS ---
  const handleAssignClick = (item) => {
    setSelectedEquipment(item);
    setIsAssignModalOpen(true);
  };

  const handleCloseSubModals = () => {
    setFormModalOpen(false);
    setIsRetrieveModalOpen(false);
    setIsAssignModalOpen(false);
    setSelectedEquipment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Assigned":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
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
        return <CheckCircle size={12} className="mr-1" />;
      case "Assigned":
        return <User size={12} className="mr-1" />;
      case "AssignedTechnician":
        return <User size={12} className="mr-1" />;
      case "In Progress":
        return <Clock size={12} className="mr-1" />;
      case "Pending":
        return <AlertCircle size={12} className="mr-1" />;
      case "Approved":
        return <CheckCircle size={12} className="mr-1" />;
      case "InchargeConfirmation":
        return <Clock size={12} className="mr-1" />;
      case "InchargedConfirmed":
        return <CheckCircle size={12} className="mr-1" />;
      case "FeedbackSubmitted":
        return <Info size={12} className="mr-1" />;
      case "Rejected":
        return <AlertCircle size={12} className="mr-1" />;
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
      minute: "2-digit"
    });
  };

  // Handle manual refresh
  const handleRefresh = () => {
    displayHistories();
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Package size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Maintenance History</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">View all maintenance request history</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            title="Refresh history"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Total Records: <span className="font-bold text-blue-600 dark:text-blue-400">{histories?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-4 flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by equipment, ref, department, technician, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading}
          />
        </div>
        {loading && (
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm">
            <Loader2 size={16} className="animate-spin mr-2" />
            Loading...
          </div>
        )}
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
            <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
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
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
            {!loading && paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                  {searchTerm ? 'No matching history records found.' : 'No history records found.'}
                </td>
              </tr>
            ) : (
              !loading && paginatedHistory.map((item, index) => (
                <tr
                  key={`${item._id}-${item.ref || index}`}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {/* COMBINED COLUMN: Equipment / Ref / Category */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {/* Equipment Name */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{item.equipment || 'N/A'}</span>
                      </div>

                      {/* Ref No. */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Ref:</span>
                        <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                          {item.ref || 'N/A'}
                        </span>
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          {item.category || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department / Lab */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{item.department || "N/A"}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{item.lab || "No Lab"}</div>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 max-w-[150px] truncate text-gray-700 dark:text-gray-300" title={item.description}>
                    {item.description || 'N/A'}
                  </td>

                  {/* Remarks */}
                  <td className="px-4 py-3 max-w-[120px] truncate text-gray-500 dark:text-gray-400" title={item.remarks}>
                    {item.remarks || '—'}
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.technician || 'Unassigned'}</span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.date)}
                    </span>
                  </td>

                  {/* Feedback */}
                  <td className="px-4 py-3 text-center">
                    {item.feedback ? (
                      <div className="text-xs">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {item.feedback}
                        </span>
                      </div>
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
      <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">
            {filteredHistory.length === 0 ? 0 : Math.min(filteredHistory.length, (currentPage - 1) * equipmentsPerPage + 1)}
          </span> to{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(currentPage * equipmentsPerPage, filteredHistory.length)}
          </span> of{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{filteredHistory.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || filteredHistory.length === 0 || loading}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>

          <span className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || filteredHistory.length === 0 || loading}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* SUB-MODALS */}
      {isFormModalOpen && <EquipmentformModal isOpen={isFormModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
      {isRetrieveModalOpen && <RetrieveForm isOpen={isRetrieveModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
      {isAssignModalOpen && <PopupModal isOpen={isAssignModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
    </div>
  );
};

export default MaintenanceManagement;