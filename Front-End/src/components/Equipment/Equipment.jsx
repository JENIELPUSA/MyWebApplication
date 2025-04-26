import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
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
  const [values, setValues] = useState({
    Category: "",
    Specification: "",
    Brand: "",
    SerialNumber: "",
  });
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

  const checkTokenAndFetchCategories = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (equipment) {
      await editEquipment(); // Edit the equipment
    } else {
      await addEquipment(); // Add new equipment
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
