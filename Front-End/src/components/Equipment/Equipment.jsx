import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

//pag import ng Context na ginawa.
import { EquipmentContext } from "../CountContext"; // Path to the context

function Equipment({
  isOpen,
  onClose,
  equipment,
  onAddEquipment,
  onEditEquipment,
}) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const { setEquipmentCount } = useContext(EquipmentContext);

  const [values, setValues] = useState({
    Category: "",
    Specification: "",
    Brand: "",
    SerialNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown visibility
  const token = localStorage.getItem("token");

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

  const checkTokenAndFetchCategories = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/v1/categorys",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setCategories(response.data.data);
      } else {
        toast.error("Unexpected response format");
      }
    } catch (error) {
      toast.error("Error fetching categories");
      console.error("Fetch categories error:", error);
    }
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
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

    try {
      if (equipment) {
        await editEquipment(); // Edit the equipment
        onClose();
      } else {
        await addEquipment(); // Add new equipment
        onClose();
      }
    } catch (error) {
      console.error("There was an error:", error);
      toast.error(
        error.response?.data?.message || "Operation failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const editEquipment = async () => {
    try {
      // Validate that equipment._id exists before making the request
      if (!equipment._id) {
        toast.error("Invalid equipment ID");
        return;
      }

      const response = await axios.patch(
        `http://127.0.0.1:3000/api/v1/equipment/${equipment._id}`, // Correctly pass the ID
        {
          Category: values.Category, // Send the category ID
          Specification: values.Specification,
          Brand: values.Brand,
          SerialNumber: values.SerialNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.Status === "Success") {
        toast.success("Equipment updated successfully");

        // Pass the updated data back to the parent component to update the state
        onEditEquipment(response.data.data);

        // Clear the form fields after successful update
        setValues({
          CategoryId: "",
          Specification: "",
          Brand: "",
          SerialNumber: "",
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error("Failed to update equipment");
      }
    } catch (error) {
      toast.error("Error updating equipment");
      console.error(
        "Update error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  if (!isOpen) return null;

  const addEquipment = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/equipment",
        {
          Category: values.Category, // Send the Category ID directly
          Specification: values.Specification,
          Brand: values.Brand,
          SerialNumber: values.SerialNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      if (response.data.status === "success") {
      
        onAddEquipment(response.data.data); // Call the parent function to update state
        //para mag add doon sa previos display sa Card
        setEquipmentCount((prevCount) => prevCount + 1);
        setValues({
          Category: "",
          Specification: "",
          Brand: "",
          SerialNumber: "",
        }); // Clear all field
        toast.success("Equipment added successfully");
      } else {
        toast.success("Failed to add equipment");
      }
    } catch (error) {
      toast.error("Please Fill Up Every TextBox!");
      console.error(
        "Submission error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>

        <h4 className="block text-2xl font-medium text-slate-800 mb-2">
          {equipment ? "Edit Equipment" : "Add Equipment"}
        </h4>
        <p className="text-slate-500 font-light mb-6">
          {equipment
            ? "Update the equipment details"
            : "Enter equipment details to register."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col gap-4">
            {/* Brand Field */}
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">Brand</label>
              <input
                type="text"
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2"
                placeholder="Brand Name"
                autoComplete="off"
                name="Brand"
                onChange={handleInput}
                value={values.Brand || ""}
              />
            </div>

            {/* Custom Category Dropdown */}
            <div className="relative w-full">
              <label className="block mb-1 text-sm text-slate-600">
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
                  className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-md w-full max-h-40 overflow-y-auto"
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
              <label className="block mb-1 text-sm text-slate-600">
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
        <ToastContainer
         position="top-center"
        />
      </div>
    </div>
  );
}

export default Equipment;
