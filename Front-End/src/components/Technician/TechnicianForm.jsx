<<<<<<< HEAD
import React, { useState, useContext, useCallback } from "react";
import { UserDisplayContext } from "../Context/User/DisplayUser";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import socket from "../../socket";
import { motion, AnimatePresence } from "framer-motion";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
import { PostEmailContext } from "../Context/EmailContext/SendNotificationContext";
import {
  FaTimes,
  FaTools,
  FaChevronDown,
  FaSpinner,
  FaCheckSquare,
  FaSquare,
  FaFileAlt,
} from "react-icons/fa";

function TechnicianForm({ isOpen, data, remarkdata, onClose, acceptNewDtaa }) {
  const { setSendPost } = useContext(MessagePOSTcontext);
  const { authToken } = useContext(AuthContext);
  const { triggerSendEmail, setToTechnician } = useContext(PostEmailContext);
  const { users } = useContext(UserDisplayContext);

  const [isLoading, setIsLoading] = useState(false);
  const [enchargeDropdownOpen, setEnchargeDropdownOpen] = useState(false);

  console.log("users", users);
=======
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect, useContext,useCallback } from "react";
import { UserDisplayContext } from "../Context/User/DisplayUser";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import socket from "../../socket";
import { motion } from "framer-motion";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
import { PostEmailContext } from "../Context/EmailContext/SendNotificationContext";
function TechnicianForm({ isOpen, data, remarkdata, onClose,acceptNewDtaa }) {
  const { setSendPost } = useContext(MessagePOSTcontext);
  const [animateExit, setAnimateExit] = useState(false);
  const { fetchRequestData, request } = useContext(RequestDisplayContext); // Connect to the backend server
  const { authToken } = useContext(AuthContext);
  const { triggerSendEmail, setToTechnician } = useContext(PostEmailContext);
  const { users } = useContext(UserDisplayContext);
  const [isLoading, setIsLoading] = useState(false);
  const [enchargeDropdownOpen, setEnchargeDropdownOpen] = useState(false);

  const encharges = users.filter((user) => user.role === "Technician");
  if (!isOpen) return null;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const [values, setValues] = useState({
    Encharge: "",
    Remarks: "",
<<<<<<< HEAD
    RoutineInspectionCleaning: false,
    Lubrication: false,
    Overhauling: false,
    MinorAdjustment: false,
    ReplaceWornOutParts: false,
    Repair: false,
    GeneralRecondition: false,
    RepairPart: "",
    FrequencyCode: "D",
    AdjustmentSetting: "",
    ManHoursUsed: 8,
    CounterMeasures: "",
    ImprovementInRepairProcedure: "",
    SparePartsMaterialsUsed: "",
    RepairDate: new Date().toISOString().split("T")[0],
  });

  const encharges = users.filter((user) => user.role === "Technician");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      const ID = remarkdata?._id || data?._id;
      const isRemarkMode = !!remarkdata;

      console.log("isRemarkMode", isRemarkMode);

      try {
        const payload = isRemarkMode
          ? {
              technicianId: data.Technician?._id ,
              Remarks: values.Remarks,
              RoutineInspectionCleaning: values.RoutineInspectionCleaning,
              Lubrication: values.Lubrication,
              Overhauling: values.Overhauling,
              MinorAdjustment: values.MinorAdjustment,
              ReplaceWornOutParts: values.ReplaceWornOutParts,
              Repair: values.Repair,
              GeneralRecondition: values.GeneralRecondition,
              RepairPart: values.RepairPart,
              FrequencyCode: values.FrequencyCode,
              AdjustmentSetting: values.AdjustmentSetting,
              ManHoursUsed: Number(values.ManHoursUsed),
              CounterMeasures: values.CounterMeasures,
              ImprovementInRepairProcedure: values.ImprovementInRepairProcedure,
              SparePartsMaterialsUsed: values.SparePartsMaterialsUsed.split(",")
                .map((s) => s.trim())
                .filter((s) => s !== ""),
              RepairDate: values.RepairDate,
            }
          : { Technician: values.Encharge, technicianId: data.Technician?._id };


          console.log("payload",payload)

        const response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${ID}`,
          payload,
          { headers: { Authorization: `Bearer ${authToken}` } },
        );

        if (response.data?.status === "success") {
          socket.emit("RequestMaintenance", response.data.data);
          if (isRemarkMode) {
            acceptNewDtaa(response.data.data);
            setSendPost({
              ...response.data,
              message: "BIPSU Maintenance Report Submitted.",
              Status: "Accepted",
            });
          } else {
            setToTechnician(response.data);
            setSendPost({
              ...response.data,
              message: "Technician assigned.",
              Status: "Pending",
            });
          }
          setTimeout(onClose, 800);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      authToken,
      values,
      data,
      remarkdata,
      onClose,
      setSendPost,
      setToTechnician,
      acceptNewDtaa,
    ],
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-2 bg-blue-950/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col rounded-xl bg-white w-full max-w-lg shadow-2xl border-t-4 border-[#1e3a8a] overflow-hidden max-h-[92vh]"
        >
          {/* BIPSU Navy Header */}
          <div className="bg-[#1e3a8a] px-5 py-3 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              {remarkdata ? (
                <FaFileAlt className="text-yellow-400" size={18} />
              ) : (
                <FaTools className="text-yellow-400" size={18} />
              )}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight leading-none">
                  {remarkdata ? "Maintenance Log" : "Unit Assignment"}
                </h4>
                <p className="text-[9px] font-medium text-yellow-400 uppercase mt-0.5">
                  BIPSU MIS-Support
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:text-red-300 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 overflow-y-auto flex-1 custom-scrollbar"
          >
            {remarkdata ? (
              <div className="space-y-4">
                {/* REMARKS SECTION */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1e3a8a] uppercase flex items-center gap-1.5">
                    <span className="w-1 h-3 bg-yellow-400 rounded-full"></span>{" "}
                    Findings & Remarks
                  </label>
                  <textarea
                    className="bipsu-input min-h-[70px] py-2"
                    placeholder="Enter technical details..."
                    value={values.Remarks}
                    onChange={(e) =>
                      setValues({ ...values, Remarks: e.target.value })
                    }
                    required
                  />
                </div>

                {/* ACTIVITIES CHECKLIST */}
                <div>
                  <label className="text-[10px] font-bold text-[#1e3a8a] uppercase block mb-2 tracking-tight">
                    Activities Performed
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "RoutineInspectionCleaning", label: "Cleaning" },
                      { id: "Lubrication", label: "Lubrication" },
                      { id: "Overhauling", label: "Overhauling" },
                      { id: "MinorAdjustment", label: "Adjustment" },
                      { id: "ReplaceWornOutParts", label: "Parts Replace" },
                      { id: "Repair", label: "Repair" },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          setValues((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }))
                        }
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${values[item.id] ? "border-[#1e3a8a] bg-blue-50 text-[#1e3a8a]" : "border-slate-100 text-slate-400 hover:bg-slate-50"}`}
                      >
                        {values[item.id] ? (
                          <FaCheckSquare
                            className="text-yellow-500"
                            size={12}
                          />
                        ) : (
                          <FaSquare className="opacity-10" size={12} />
                        )}
                        <span className="text-[9px] font-bold uppercase">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LOG DATA GRID */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      Countermeasures
                    </label>
                    <input
                      className="bipsu-input py-1.5 text-xs"
                      value={values.CounterMeasures}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          CounterMeasures: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      Adjustment/Setting
                    </label>
                    <input
                      className="bipsu-input py-1.5 text-xs"
                      value={values.AdjustmentSetting}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          AdjustmentSetting: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      Man-Hours
                    </label>
                    <input
                      type="number"
                      className="bipsu-input py-1.5 text-xs"
                      value={values.ManHoursUsed}
                      onChange={(e) =>
                        setValues({ ...values, ManHoursUsed: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      Repair Date
                    </label>
                    <input
                      type="date"
                      className="bipsu-input py-1.5 text-xs"
                      value={values.RepairDate}
                      onChange={(e) =>
                        setValues({ ...values, RepairDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    Spare Parts Used
                  </label>
                  <input
                    className="bipsu-input py-2 text-xs"
                    placeholder="HDD, RAM, etc."
                    value={values.SparePartsMaterialsUsed}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        SparePartsMaterialsUsed: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              /* ASSIGNMENT MODE */
              <div className="py-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center mb-3">
                  <FaTools size={20} />
                </div>
                <h2 className="text-sm font-bold text-[#1e3a8a] uppercase mb-1">
                  Personnel Assignment
                </h2>
                <p className="text-[10px] text-slate-400 mb-5">
                  Select technician for this laboratory unit.
                </p>

                <div className="relative w-full">
                  <div
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 cursor-pointer flex justify-between items-center hover:border-[#1e3a8a]"
                    onClick={() =>
                      setEnchargeDropdownOpen(!enchargeDropdownOpen)
                    }
                  >
                    <span
                      className={
                        values.Encharge
                          ? "text-xs font-bold text-[#1e3a8a]"
                          : "text-xs text-slate-400"
                      }
                    >
                      {values.Encharge
                        ? encharges.find((e) => e._id === values.Encharge)
                            ?.FirstName +
                          " " +
                          encharges.find((e) => e._id === values.Encharge)
                            ?.LastName
                        : "Select Personnel..."}
                    </span>
                    <FaChevronDown className="text-yellow-500" size={12} />
                  </div>
                  {enchargeDropdownOpen && (
                    <div className="absolute z-50 w-full bg-white border border-slate-100 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {encharges.map((tech) => (
                        <div
                          key={tech._id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-xs font-medium text-slate-600 border-b border-slate-50 last:border-none"
                          onClick={() => {
                            setValues({ ...values, Encharge: tech._id });
                            setEnchargeDropdownOpen(false);
                          }}
                        >
                          {tech.FirstName} {tech.LastName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-6 w-full py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isLoading ? "bg-slate-200 text-slate-400" : "bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-md active:scale-95"}`}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" />
              ) : remarkdata ? (
                "Submit Final Report"
              ) : (
                "Confirm Assignment"
              )}
            </button>
          </form>

          {/* BIPSU Yellow Footer Decoration */}
          <div className="h-1.5 w-full bg-[#facc15] shrink-0"></div>
        </motion.div>
      </div>

      <style jsx>{`
        .bipsu-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          font-size: 0.813rem;
          outline: none;
          transition: 0.2s;
        }
        .bipsu-input:focus {
          border-color: #1e3a8a;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </AnimatePresence>
=======
  });

  const handlesend = (details) => {
    const encharges = users.filter(
      (user) =>
        user.role === "Technician" &&
        details.data.data.Technician.includes(user._id)
    );

    const fullName =
      `${encharges[0]?.FirstName} ${encharges[0]?.Middle} ${encharges[0]?.LastName}`.trim();
    const message = `Hello [${fullName}], A new maintenance request from Admin requires your attention. Please review the details in your dashboard.\nDetails:\nRequest Reference: ${details.data.data.Ref}\nStatus: ${details.data.data.Status}\nAssigned By: Admin`;
    // Trigger email sending
    triggerSendEmail(message);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (values?.Encharge) {
      try {
        const response = await axios.patch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/v1/MaintenanceRequest/${data._id}`,
          { Technician: values.Encharge },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.data?.status === "success") {
          const result = response.data;
          toast.success("Successfully Assigned!");
          socket.emit("RequestMaintenance",response.data.data) 
          handlesend(response);
          setToTechnician(result);
          setValues({ Encharge: "" });
          //ibig sabihin nito isinasama ang message sa result
          setSendPost({
            ...result,
            message: "Admin Already Assign Technician to your Laboratory!",
            Status: "Pending"
          });
          socket.emit("RequestMaintenance",response.data.data)
          setTimeout(() => {
            onClose();
          }, 2000);
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
    } else if (values.Remarks) {
      setIsLoading(true);
      const ID = remarkdata._id;
      try {
        const response = await axios.patch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/v1/MaintenanceRequest/${ID}`,
          {
            Remarks: values.Remarks,
          },

          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.data?.status === "success") {
          const result = response.data;
          acceptNewDtaa(response.data.data)
          //ibig sabihin nito isinasama ang message sa result
          setSendPost({
            ...result,
            message:
              "I need your verification to approve a remark from the technician.",
            Status: "Accepted",
          });
          setValues({ Remarks: "" });
          setTimeout(() => {
            onClose();
          }, 3000); // 3000 milliseconds = 3 seconds
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
  },[  authToken,
    values,
    data,
    remarkdata,
    socket,
    onClose,
    setSendPost,
    handlesend,
    setToTechnician,]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Icon */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }} // Shrinks on click
          whileHover={{ scale: 1.1 }} // Enlarges on hover
          transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
          onClick={() => {
            setAnimateExit(true); // Set the animation state to trigger upward motion
            setTimeout(onClose, 500); // Close after 500ms to match the animation duration
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <h4 className="block text-2xl font-medium text-slate-800 mb-2">
          {remarkdata ? "Add Remarks" : "Assign Technician"}
        </h4>

        <p className="text-slate-500 font-light mb-6">
          {remarkdata ? "Input Remarks" : "Select Technician"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="relative w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Remark
              </label>

              {remarkdata?.Status === "Under Maintenance" ? (
                // If status is "Under Maintenance", show an input field
                <textarea
                  type="text"
                  className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2"
                  placeholder="Add a Remark..."
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
      </motion.div>

      <ToastContainer />
    </motion.div>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  );
}

export default TechnicianForm;
