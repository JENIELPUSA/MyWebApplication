import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";

export const DepartmentDisplayContext = createContext();

export const DepartmentDisplayProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext); // Retrieve token from AuthContext
  const [department, setDepartment] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentPerPage, setDepartmentsPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [customError, setCustomError] = useState("");
  useEffect(() => {
    if (!authToken) {
      setDepartment(null);
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchCategoryData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change
  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => {
        setCustomError(null);
      }, 5000); // auto-dismiss after 5s

      return () => clearTimeout(timer); // cleanup
    }
  }, [customError]);
  const fetchCategoryData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`http://127.0.0.1:3000/api/v1/departments`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const DepartmentData = res.data.data;
      setDepartment(DepartmentData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };

  const AddAcceptDepartment = async (values) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/departments",
        {
          DepartmentName: values.DepartmentName,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        //para maka send pabalik sa component
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
      } else if (error.request) {
        setCustomError("No response from the server.");
      } else {
        setCustomError(error.message || "Unexpected error occurred.");
      }
    }
  };

  const UpdateDepartment = async (department, values) => {
    try {
      const dataToSend = {
        DepartmentName: values.DepartmentName,
      };
      if (values.password) {
        dataToSend.password = values.password;
      }

      const response = await axios.patch(
        `http://127.0.0.1:3000/api/v1/departments/${department}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        //para maka send pabalik sa component
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      setCustomError("There was an error:", error);
      setCustomError(
        error.response?.data?.message || "Operation failed. Please try again."
      );
    }
  };

  const DeleteDepartment = async (departmentId) => {
    try {
      const response = await axios.delete(
        `http://127.0.0.1:3000/api/v1/departments/${departmentId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        //para maka send pabalik sa component
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      console.error("Error deleting Equipment:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete Equipment."
      );
    }
  };

  return (
    <DepartmentDisplayContext.Provider
      value={{
        DeleteDepartment,
        UpdateDepartment,
        customError,
        setCustomError,
        AddAcceptDepartment,
        department,
        loading,
        error,
        departmentPerPage,
        setDepartmentsPerPage,
        currentPage,
        setCurrentPage,
        setDepartment,
      }}
    >
      {children}

      {/* Modal should be rendered here */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </DepartmentDisplayContext.Provider>
  );
};
