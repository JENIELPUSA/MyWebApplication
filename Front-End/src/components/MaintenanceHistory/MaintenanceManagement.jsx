import React, { useState, useContext, useEffect } from "react";
import { EquipmentDataContext } from "../../contexts/EquipmentContext/EquipmentContext";
import {
  Plus, ChevronLeft, ChevronRight, Edit,
  Trash2, RefreshCw, PlusCircle, Search,
  Package, Tag, Barcode, Info, ClipboardList,
  Calendar, User, CheckCircle, Clock, AlertCircle
} from "lucide-react";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";

const MaintenanceManagement = () => {

  const { view } = useContext(MaintenanceRequestContext);
  const { equipment, setEquipment, DeleteDatas } = useContext(EquipmentDataContext);

  console.log("view", view);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const equipmentsPerPage = 5;

  // --- FILTER LOGIC para sa view data ---
  const filteredView = view?.filter((item) =>
    (item.EquipmentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.Ref?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.Department?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.CategoryName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.Technician?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (item.Status?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredView.length / equipmentsPerPage);

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

  const paginatedView = filteredView.slice(
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
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
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
      case "In Progress":
        return <Clock size={12} className="mr-1" />;
      case "Pending":
        return <AlertCircle size={12} className="mr-1" />;
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

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Package size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Maintenance Requests</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">View and manage maintenance requests</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Total Requests: <span className="font-bold text-blue-600 dark:text-blue-400">{view?.length || 0}</span>
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
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
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
            {paginatedView.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                  {searchTerm ? 'No matching requests found.' : 'No maintenance requests found.'}
                </td>
              </tr>
            ) : (
              paginatedView.map((item, index) => (
                <tr
                  key={`${item._id}-${item.Ref || index}`}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {/* COMBINED COLUMN: Equipment / Ref / Category */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {/* Equipment Name */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{item.EquipmentName || 'N/A'}</span>
                      </div>
                      
                      {/* Ref No. */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Ref:</span>
                        <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                          {item.Ref || 'N/A'}
                        </span>
                      </div>
                      
                      {/* Category */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          {item.CategoryName || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department / Lab */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{item.Department || "N/A"}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{item.laboratoryName || "No Lab"}</div>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 max-w-[150px] truncate text-gray-700 dark:text-gray-300" title={item.Description}>
                    {item.Description || 'N/A'}
                  </td>

                  {/* Remarks */}
                  <td className="px-4 py-3 max-w-[120px] truncate text-gray-500 dark:text-gray-400" title={item.Remarks}>
                    {item.Remarks || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(item.Status)}`}>
                      {getStatusIcon(item.Status)}
                      {item.Status || 'Unknown'}
                    </span>
                  </td>

                  {/* Technician */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.Technician || 'Unassigned'}</span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.DateTime)}
                    </span>
                  </td>

                  {/* Feedback */}
                  <td className="px-4 py-3 text-center">
                    {item.feedback ? (
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full ${item.feedback.type === 'Satisfied' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {item.feedback.type || 'N/A'}
                        </span>
                        {item.feedback.message && (
                          <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate max-w-[100px]" title={item.feedback.message}>
                            "{item.feedback.message}"
                          </div>
                        )}
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
            {filteredView.length === 0 ? 0 : Math.min(filteredView.length, (currentPage - 1) * equipmentsPerPage + 1)}
          </span> to{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(currentPage * equipmentsPerPage, filteredView.length)}
          </span> of{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{filteredView.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || filteredView.length === 0}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>

          <span className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || filteredView.length === 0}
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