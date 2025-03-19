import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AddRequest from "./AddRequest";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import {
  FaClock,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const MaintenanceModalDisplay = ({ Lab, Equip, onClose }) => {
  const { authToken, role } = useContext(AuthContext);
  const { fetchRequestData } = useContext(RequestDisplayContext);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isEquipId, setEquipId] = useState(null);
  const [isDepartID, setDaprtID] = useState(null);
  const [isLabID, setLabID] = useState(null);
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  //format para ma convert ang time at Date.
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long", // Full month name
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // AM/PM format
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  const handleAddClick = (Equipment, Department, Laboratory) => {
    setEquipId(Equipment);
    setDaprtID(Department);
    setLabID(Laboratory);
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
  };

  useEffect(() => {
    if (!authToken) {
      console.warn("No token found in localStorage");
      setError("Authentication token is missing. Please log in.");
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchRequest();
    fetchRequestData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:3000/api/v1/MaintenanceRequest?Equipments=${Equip._id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setRequest(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    }
  };

  const handleAddRequest = (neAddRequest) => {
    if (!neAddRequest || !neAddRequest._id) {
      alert("Department ID is Missing!!");
      return;
    }

    setRequest((prevRequest) => [...prevRequest, neAddRequest]);
  };

  const handleDeleteSpecificData = async (SpecifDataID) => {
    if (!SpecifDataID) {
      toast.error("Equipment ID is required to delete.");
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:3000/api/v1/MaintenanceRequest/${SpecifDataID._id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setRequest((prevRequest) =>
        prevRequest.filter((equipment) => equipment._id !== SpecifDataID._id)
      );
      toast.success("Request deleted successfully!");
      fetchRequestData();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment.");
    }
  };

  return (
    //Para sa Floating Modal
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full text-black shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Maintenance Request Records
        </h2>
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 text-sm">
                <span className="font-bold">Equipment</span>
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {Equip.Brand} / {Equip.categoryName}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-sm">
                <span className="font-bold">S/N</span>
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {Equip.SerialNumber}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-sm">
                <span className="font-bold">Laboratory Room</span>
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {Lab.departmentName}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-sm">
                <span className="font-bold">In-charge</span>
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {Lab.encharge}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Divider Line */}
        <div className="border-t border-gray-300 my-4"></div>

        {/* Table Section */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left text-sm">
                Date & Time
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm">
                Ref #
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm">
                Description
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm">
                Technician
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm">
                Remarks
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm">
                Status
              </th>
              <th className="border border-gray-300 p-2 text-left text-sm">
                Feedback
              </th>
              <th className="border border-gray-300 p-2 text-center text-sm">
                <button
                  onClick={() =>
                    handleAddClick(
                      Equip._id,
                      Lab.departmentId,
                      Lab.laboratoryId
                    )
                  }
                  className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center"
                >
                  <i className="fas fa-plus text-lg"></i>{" "}
                  {/* FontAwesome plus icon */}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {request.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border border-gray-300 p-2 text-center text-sm"
                >
                  No Results Found
                </td>
              </tr>
            ) : (
              request.map((requestData) => (
                <tr key={requestData._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2 text-sm">
                    {formatDateTime(requestData.DateTime)}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm">
                    {requestData.Ref}
                  </td>
                  <td className="border border-gray-300 p-2 text-sm">
                    <div className="grid justify-center">
                      {requestData.Description}
                      <button className="text-blue-500 text-sm ml-2">
                        Edit
                      </button>
                    </div>
                  </td>
                  <td className="border border-gray-300 p-2 text-sm">
                    <div className="grid justify-center">
                      {requestData.Technician}
                    </div>
                  </td>

                  <td className="border border-gray-300 p-2 text-sm">
                    <div className="grid justify-center">
                      {requestData.remarksread ? requestData.Remarks : null}
                    </div>
                  </td>

                  <td
                    className={`px-6 py-4 flex items-center gap-2 ${
                      requestData.Status === "Pending"
                        ? "text-red-500"
                        : requestData.Status === "Assigned"
                        ? "text-orange-300"
                        : requestData.Status === "Success"
                        ? "text-green-500"
                        : "text-gray-700"
                    }`}
                  >
                    {requestData.Status === "Pending" && (
                      <FaClock className="text-red-500" />
                    )}
                    {requestData.Status === "Assigned" && (
                      <FaUserCheck className="text-orange-300" />
                    )}
                    {requestData.Status === "Success" && (
                      <FaCheckCircle className="text-green-500" />
                    )}
                    {requestData.Status !== "Pending" &&
                      requestData.Status !== "Assigned" &&
                      requestData.Status !== "Success" && (
                        <FaTimesCircle className="text-gray-700" />
                      )}

                    {requestData.Status}
                  </td>

                  <td className="border border-gray-300 p-2 text-sm">
                    <div className="grid justify-center">
                      {requestData.feedback}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-2 text-center text-sm">
                    {role === "admin"&& (
                      <button
                        onClick={() => handleDeleteSpecificData(requestData)}
                        className="text-red-500 mx-1"
                      >
                        DELETE
                      </button>
                    ) }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isFormModalOpen && (
        //name ng component
        <AddRequest
          isOpen={isFormModalOpen}
          EquipmentID={isEquipId}
          DepartmentID={isDepartID}
          LaboratoryID={isLabID}
          onClose={handleCloseModal}
          onAddRequest={handleAddRequest}
        />
      )}
    </div>
  );
};

export default MaintenanceModalDisplay;
