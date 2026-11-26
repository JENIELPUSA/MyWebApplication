import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AddRequest from "./AddRequest";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

const MaintenanceModalDisplay = ({ Lab, Equip, onClose }) => {
  const { authToken, role } = useContext(AuthContext);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [request, setRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (!authToken) return;
    fetchRequest();
  }, [authToken]);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest?Equipments=${Equip._id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setRequest(res.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "---";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTechnicianName = (technician) => {
    if (!technician) return "---";
    if (typeof technician === "string") return technician;
    if (typeof technician === "object" && technician.FirstName && technician.LastName) {
      return `${technician.FirstName} ${technician.LastName}`;
    }
    return "---";
  };

  const formatFeedback = (feedback) => {
    if (!feedback) return "---";

    if (Array.isArray(feedback)) {
      const validItems = feedback.filter(
        (item) => item && (item.type?.trim() || item.message?.trim())
      );
      if (validItems.length === 0) return "---";

      return validItems
        .map((item) => {
          const parts = [item.type?.trim(), item.message?.trim()].filter(Boolean);
          return parts.join(": ");
        })
        .join(" | ");
    }

    if (typeof feedback === "object") {
      const hasContent =
        Boolean(feedback.type?.trim()) || Boolean(feedback.message?.trim());
      if (!hasContent) return "---";

      const parts = [feedback.type?.trim(), feedback.message?.trim()].filter(
        Boolean
      );
      return parts.join(": ");
    }

    return String(feedback);
  };

  const getDisplayValue = (value) => {
    if (value === null || value === undefined || value === "") return "---";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") {
      if (value.name) return value.name;
      if (value.DepartmentName) return value.DepartmentName;
      if (value.departmentName) return value.departmentName;
      if (value.LaboratoryName) return value.LaboratoryName;
      if (value.laboratoryName) return value.laboratoryName;
      if (value.categoryName) return value.categoryName;
      if (value.CategoryName) return value.CategoryName;
      if (value.Brand) return value.Brand;
      if (value.FirstName && value.LastName) {
        return `${value.FirstName} ${value.LastName}`;
      }
      return JSON.stringify(value);
    }
    return "---";
  };

  const equipment = Array.isArray(Equip) ? Equip[0] : Equip;
  const lab = Array.isArray(Lab) ? Lab[0] : Lab;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center flex-shrink-0 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">Maintenance Log System</h2>
            <p className="text-sm text-blue-100">Equipment Service History</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Table */}
        <div className="p-6 flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-auto border border-gray-200 rounded">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-gray-700 text-white">
                <tr>
                  <th className="p-3 pl-4">Date</th>
                  <th className="p-3">Ref #</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Technician</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3 text-center">
                    {role === "User" ? (
                      <button
                        onClick={() => setFormModalOpen(true)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        + Add
                      </button>
                    ) : (
                      "Action"
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center">
                      <LoadingTableSpinner />
                    </td>
                  </tr>
                ) : request.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400">
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  request.map((data) => (
                    <tr
                      key={data._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 pl-4 text-gray-500">
                        {formatDateTime(data.DateTime)}
                      </td>
                      <td className="p-3 font-mono text-blue-600">{data.Ref}</td>
                      <td className="p-3 max-w-[200px] truncate">
                        {data.Description}
                      </td>
                      <td className="p-3">{getTechnicianName(data.Technician)}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            data.Status === "Success"
                              ? "bg-green-100 text-green-700"
                              : data.Status === "Pending"
                              ? "bg-red-100 text-red-700"
                              : data.Status === "Assigned"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {data.Status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 max-w-[200px] truncate">
                        {data.Remarks || "---"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedRecord(data)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 px-3 py-1 rounded text-xs font-medium transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 py-2 text-center border-t border-gray-200 flex-shrink-0 rounded-b-lg">
          <p className="text-xs text-gray-500">
            Maintenance Verification System • Lab Official Log
          </p>
        </div>
      </div>

      {/* View Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold">Work Order Details</h3>
                <p className="text-xs text-blue-100 font-mono">
                  Ref #: {getDisplayValue(selectedRecord.Ref)}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded border border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block">Status</span>
                  <span className="font-semibold">
                    {getDisplayValue(selectedRecord.Status)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Date Requested</span>
                  <span className="font-medium">
                    {formatDateTime(selectedRecord.DateTime)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Date Accomplished</span>
                  <span className="font-medium">
                    {selectedRecord.DateTimeAccomplish
                      ? formatDateTime(selectedRecord.DateTimeAccomplish)
                      : "---"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded border border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block">Equipment</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.EquipmentName || equipment?.Brand)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Category</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.CategoryName)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Department</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.Department)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Laboratory</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.laboratoryName || lab?.LaboratoryName)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Location / Area</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.location_areas)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Type of Work</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.type_works)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded border border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block">Department Head</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.DepartmentHead)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Printed Name (Requestor)</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.Printed_name_requestor)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Contact Person</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.ContactPerson)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Contact Phone</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.ContactPhone)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Contact Email</span>
                  <span className="font-medium">
                    {getDisplayValue(selectedRecord.ContactEmail)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Technician</span>
                  <span className="font-medium">
                    {getTechnicianName(selectedRecord.Technician)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded border border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block">Description</span>
                  <p className="font-medium whitespace-pre-wrap">
                    {getDisplayValue(selectedRecord.Description)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Remarks</span>
                  <p className="font-medium whitespace-pre-wrap">
                    {getDisplayValue(selectedRecord.Remarks)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Feedback</span>
                  <p className="font-medium whitespace-pre-wrap">
                    {formatFeedback(selectedRecord.feedback)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Request Modal */}
      {isFormModalOpen && (
        <AddRequest
          isOpen={isFormModalOpen}
          EquipmentID={equipment?._id}
          DepartmentID={lab?.departmentId || lab?.DepartmentId || lab?._id}
          LaboratoryID={lab?._id}
          LaboratoryObject={lab}
          onClose={() => setFormModalOpen(false)}
          onAddRequest={(newData) => setRequest((prev) => [...prev, newData])}
        />
      )}
    </div>
  );
};

export default MaintenanceModalDisplay;