import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTools, FaBarcode, FaTags, FaInfoCircle, FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";
import { EquipmentContext } from "../CountContext"; 
import StatusModal from "../ReusableComponent/SuccessandFailedModal";
import { EquipmentDisplayContext } from "../Context/EquipmentContext/DisplayContext";

function Equipment({ isOpen, onClose, equipment, onAddEquipment, onEditEquipment }) {
  const { sendaddEquipment, customError, setCustomError, EditEquipmentData } = useContext(EquipmentDisplayContext);
  const [animateExit, setAnimateExit] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

=======
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion
//pag import ng Context na ginawa.
import { EquipmentContext } from "../CountContext"; // Path to the context
import StatusModal from "../ReusableComponent/SuccessandFailedModal";
import { EquipmentDisplayContext } from "../Context/EquipmentContext/DisplayContext";
function Equipment({
  isOpen,
  onClose,
  equipment,
  onAddEquipment,
  onEditEquipment,
}) {
  const { sendaddEquipment, customError, setCustomError, EditEquipmentData } =
    useContext(EquipmentDisplayContext);
  const [animateExit, setAnimateExit] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const { setEquipmentCount } = useContext(EquipmentContext);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [values, setValues] = useState({
    Category: "",
    Specification: "",
    Brand: "",
    SerialNumber: "",
  });
<<<<<<< HEAD

  useEffect(() => {
    if (isOpen) {
      checkTokenAndFetchCategories();
      if (equipment) {
        setValues({
          Brand: equipment.Brand || "",
          SerialNumber: equipment.SerialNumber || "",
          Specification: equipment.Specification || "",
          Category: equipment.CategoryId || "",
        });
      } else {
        resetForm();
      }
    }
  }, [equipment, isOpen]);

  const resetForm = () => {
    setValues({ Category: "", Specification: "", Brand: "", SerialNumber: "" });
  };
=======
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown visibility
  const token = localStorage.getItem("token");
  const handleClose = () => {
    onClose();
  };
  useEffect(() => {
    checkTokenAndFetchCategories();

    // Set form values for editing if equipment exists
    if (equipment) {
      setValues({
        Brand: equipment.Brand || "",
        SerialNumber: equipment.SerialNumber || "",
        Specification: equipment.Specification || "",
        Category: equipment.CategoryId || "", // Ensure Category is set to its _id
      });
    }
  }, [equipment]);

  const resetForm=()=>{
    setValues({
      Category: "",
    Specification: "",
    Brand: "",
    SerialNumber: "",
    })
  }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const checkTokenAndFetchCategories = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
<<<<<<< HEAD
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data?.status === "success") {
        setCategories(response.data.data);
      }
    } catch (err) {
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleClose = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
=======
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys`,
        {
          withCredentials: true,headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.status === "success") {
        setCategories(response.data.data);
      } else {
        toast.error("Unexpected response format");
      }
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    ``;
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      Category: selectedCategoryId, // Update Category ID when a new category is selected
    }));
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
<<<<<<< HEAD
    const result = equipment 
      ? await EditEquipmentData(equipment._id, values)
      : await sendaddEquipment(values);

    if (result?.success) {
      equipment ? onEditEquipment(result.data) : onAddEquipment(result.data);
      handleClose();
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={animateExit ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
      >
        {/* Header - Industrial Blue */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><FaTools size={70} /></div>
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors"><FaTimes size={20} /></button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-400 rounded-2xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
              <FaTools size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {equipment ? "Modify" : "Register"} <span className="text-yellow-400">Equipment</span>
              </h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em]">Asset Management Terminal</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {customError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-md">
              {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manufacturer / Brand</label>
                <div className="relative group">
                  <FaTags className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                  <input type="text" name="Brand" value={values.Brand} onChange={handleInput} placeholder="e.g. Caterpillar"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all" />
                </div>
              </div>

              {/* Serial Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Serial S/N</label>
                <div className="relative group">
                  <FaBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                  <input type="text" name="SerialNumber" value={values.SerialNumber} onChange={handleInput} placeholder="SN-000-000"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all" />
                </div>
              </div>
            </div>

            {/* Category Custom Dropdown */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipment Category</label>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer group hover:border-blue-400 transition-all"
              >
                <span className={`text-sm font-bold ${values.Category ? "text-slate-700" : "text-slate-400"}`}>
                  {values.Category ? categories.find(c => c._id === values.Category)?.CategoryName : "Select Type..."}
                </span>
                {dropdownOpen ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-slate-300" />}
              </div>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto border-t-4 border-t-yellow-400"
                  >
                    {categories.map((cat) => (
                      <li key={cat._id} onClick={() => { setValues({...values, Category: cat._id}); setDropdownOpen(false); }}
                        className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                        {cat.CategoryName}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Specification */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technical Specification</label>
              <div className="relative group">
                <FaInfoCircle className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                <textarea name="Specification" value={values.Specification} onChange={handleInput} placeholder="Describe technical details..." rows="3"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all resize-none" />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3
                ${isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#1e3a8a] hover:bg-[#112d7a] active:scale-95 shadow-blue-900/20"}`}>
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FaSave /> {equipment ? "Update Asset" : "Initialize Asset"}</>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-yellow-400 py-2 text-center">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Authorized Personnel Access Only</p>
        </div>
      </motion.div>
      <StatusModal isOpen={showModal} onClose={() => setShowModal(false)} status={modalStatus} />
    </div>
  );
}

export default Equipment;
=======
    if (equipment) {
      await editEquipment(); // Edit the equipment
      onClose()
    } else {
      await addEquipment(); // Add new equipment
      onClose();
    }
  };

  const editEquipment = async () => {
    const result = await EditEquipmentData(equipment._id, values);
  
    if (result?.success === true) {
      onEditEquipment(result.data);
      resetForm();
      handleClose();
    }
  };
  

  if (!isOpen) return null;

  const addEquipment = async () => {
    const result = await sendaddEquipment(values);
    if (result?.success === true) {
      onAddEquipment(result.data);
      resetForm();
      handleClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg "
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
        {/* Custom Error Message */}

        <h4 className=" xs:text-lg sm:text-sm lg:text-2xl block text-2xl font-medium text-slate-800 mb-2">
          {equipment ? "Edit Equipment" : "Add Equipment"}
        </h4>
        <p className="xs:text-sm sm:text-sm lg:text-sm text-slate-500 font-light mb-6">
          {equipment
            ? "Update the equipment details"
            : "Enter equipment details to register."}
        </p>
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col gap-4">
            {/* Brand Field */}
            <div className="w-full">
              <label className="xs:text-xs sm:text-sm block mb-1 text-sm text-slate-600">Brand</label>
              <input
                type="text"
                className="xs:text-xs sm:text-sm w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2"
                placeholder="Brand Name"
                autoComplete="off"
                name="Brand"
                onChange={handleInput}
                value={values.Brand || ""}
              />
            </div>

            {/* Custom Category Dropdown */}
            <div className="relative w-full">
              <label className=" xs:text-xs sm:text-sm block mb-1 text-sm text-slate-600">
                Category
              </label>
              <div
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>
                  {values.Category
                    ? categories.find((cat) => cat._id === values.Category)
                        ?.CategoryName || "Select Category"
                    : "Select Category"}
                </span>
                <i
                  className={`fas ${
                    dropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                  } text-gray-500`}
                />
              </div>

              {dropdownOpen && (
                <ul
                  className="xs:text-xs sm:text-sm absolute z-10 mt-1 bg-white border border-slate-300 rounded-md w-full max-h-40 overflow-y-auto"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                >
                  <li
                    className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                    onClick={() => {
                      handleCategoryChange({
                        target: { name: "Category", value: "" },
                      });
                      setDropdownOpen(false);
                    }}
                  >
                    Select Category
                  </li>
                  {categories.map((category) => (
                    <li
                      key={category._id}
                      className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => {
                        handleCategoryChange({
                          target: { name: "Category", value: category._id },
                        });
                        setDropdownOpen(false);
                      }}
                    >
                      {category.CategoryName}
                    </li>
                  ))}
                </ul>
              )}
            </div>


            {/* Serial Number Field */}
            <div className="w-full">
              <label className="xs:text-xs sm:text-sm block mb-1 text-sm text-slate-600">
                Serial Number
              </label>
              <input
                type="text"
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2"
                placeholder="Serial Number"
                autoComplete="off"
                name="SerialNumber"
                onChange={handleInput}
                value={values.SerialNumber || ""}
              />
            </div>

            {/* Specification Field */}
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Specification
              </label>
              <input
                type="text"
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2"
                placeholder="Specification"
                autoComplete="off"
                name="Specification"
                onChange={handleInput}
                value={values.Specification || ""}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            className={`mt-6 w-full rounded-md py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {equipment ? "Edit Equipment" : "Add Equipment"}
          </button>
        </form>
      </motion.div>
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </motion.div>
  );
}

export default Equipment;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
