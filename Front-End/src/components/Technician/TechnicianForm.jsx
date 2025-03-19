import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect, useContext } from "react";
import { UserDisplayContext } from "../Context/User/DisplayUser";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { io } from "socket.io-client";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
function TechnicianForm({ isOpen, data, remarkdata, onClose }) {
  const { setSendPost } = useContext(MessagePOSTcontext);
  const { fetchunreadRequestData, fetchRequestData, request } = useContext(
    RequestDisplayContext
  );
   const socket = io("http://localhost:3000"); // Connect to the backend server
  const { authToken } = useContext(AuthContext);
  const { users } = useContext(UserDisplayContext);
  const [isLoading, setIsLoading] = useState(false);
  const [enchargeDropdownOpen, setEnchargeDropdownOpen] = useState(false);
  const encharges = users.filter((user) => user.role === "Technician");
  if (!isOpen) return null;

  const [values, setValues] = useState({
    Encharge: "",
    Remarks:""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
   
    if(values?.Encharge){
      try {
        const response = await axios.patch(
          `http://127.0.0.1:3000/api/v1/MaintenanceRequest/${data._id}`,
          { Technician: values.Encharge },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
  
        if (response.data?.status === "success") {
          const result = response.data;
          toast.success("Successfully Assigned!");
          fetchRequestData();
          setValues({ Encharge: "" });

          //ibig sabihin nito isinasama ang message sa result
          setSendPost({
            ...result,
            message: "Admin Already Assign Technician to your Laboratory!",
            Status: "Pending"
 
          });
          
          fetchunreadRequestData();
        } else {
          toast.error(
            response.data?.message || "Failed to update maintenance request"
          );
        }
      } catch (error) {
        console.error("Error updating maintenance request:", error);
        toast.error(
          error.response?.data?.message ||
            "Error submitting form. Please try again."
        );
      } finally {
        setIsLoading(false);
      }

    }else if(values.Remarks){
   
      const ID = remarkdata._id
      try {
        const response = await axios.patch(
          `http://127.0.0.1:3000/api/v1/MaintenanceRequest/${ID}`,
          { 
            Remarks: values.Remarks
          },
   
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
  
        if (response.data?.status === "success") {
          const result = response.data;
          toast.success("Successfully Send!");
            //ibig sabihin nito isinasama ang message sa result
          setSendPost({
            ...result,
            message: "I need your verification to approve a remark from the technician.",
            Status: "Accepted"
          });
       
          
          setValues({ Remarks: "" });
          fetchunreadRequestData();
        } else {
          toast.error(
            response.data?.message || "Failed to update maintenance request"
          );
        }
      } catch (error) {
        console.error("Error updating maintenance request:", error);
        toast.error(
          error.response?.data?.message ||
            "Error submitting form. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="flex flex-col relative rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>

        <h4 className="block text-2xl font-medium text-slate-800 mb-2">
          {remarkdata ? "Add Remarks" : "Assign Technician"}
        </h4>

        <p className="text-slate-500 font-light mb-6">{remarkdata ? "Input Remarks" : "Select Technician"}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="relative w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Encharge
              </label>

              {remarkdata?.Status === "Under Maintenance" ? (
                // If status is "Under Maintenance", show an input field
                <textarea
                  type="text"
                  className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2"
                  placeholder="INPUT REMARK"
                  value={values.Remarks || ""}
                  onChange={(e) =>
                    setValues({ ...values, Remarks: e.target.value })
                  }
                />
              ) : (
                // Else, show the dropdown
                <div
                  className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
                  onClick={() => setEnchargeDropdownOpen(!enchargeDropdownOpen)}
                >
                  <span>
                    {values.Encharge
                      ? encharges.find(
                          (encharge) => encharge._id === values.Encharge
                        )?.FirstName +
                          " " +
                          encharges.find(
                            (encharge) => encharge._id === values.Encharge
                          )?.LastName || "Select Technician"
                      : "Select Technician"}
                  </span>
                  <i
                    className={`fas ${
                      enchargeDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                    } text-gray-500`}
                  />
                </div>
              )}

              {enchargeDropdownOpen &&
                request.Status !== "Under Maintenance" && (
                  <ul
                    className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-md w-full max-h-40 overflow-y-auto"
                    style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                  >
                    <li
                      className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => {
                        setValues({ ...values, Encharge: "" });
                        setEnchargeDropdownOpen(false);
                      }}
                    >
                      Select Technician
                    </li>
                    {encharges.map((encharge) => (
                      <li
                        key={encharge._id}
                        className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setValues({ ...values, Encharge: encharge._id });
                          setEnchargeDropdownOpen(false);
                        }}
                      >
                        {`${encharge.FirstName} ${encharge.LastName}`}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : remarkdata ? "Add Remark" : "Assign"}
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default TechnicianForm;
