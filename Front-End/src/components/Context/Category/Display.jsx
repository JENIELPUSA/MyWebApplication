import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";
export const CategoryDisplayContext = createContext();

export const CategoryDisplayProvider = ({ children }) => {
  const [category, setCategory] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  const { authToken } = useContext(AuthContext); // Get token from localStorage
  const [categoryPerPage, setDepartmentsPerPage] = useState(6);
  const [totalUsers, setTotalUser] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [customError, setCustomError] = useState("");
  useEffect(() => {
    if (!authToken) {
      setCategory(null);
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
    if (!authToken) return;
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys`, {
        withCredentials: true ,headers: { Authorization: `Bearer ${authToken}` },
      });

      const categoryData = res.data.data;
      setCategory(categoryData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };

  const addedCategory = async (values) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys`,
        {
          CategoryName: values.CategoryName,
        },
        {withCredentials: true , headers: { Authorization: `Bearer ${authToken}` } }
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

  const UpdateCategory = async (categoryId, values) => {
    try {
      const dataToSend = {
        CategoryName: values.CategoryName,
      };
      if (values.password) {
        dataToSend.password = values.password;
      }

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys/${categoryId}`,
        dataToSend,
        {
          withCredentials: true ,headers: { Authorization: `Bearer ${authToken}` },
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

  const RemoveCategory = async (categoryId) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys/${categoryId}`,
        {
          withCredentials: true , headers: { Authorization: `Bearer ${authToken}` },
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
    <CategoryDisplayContext.Provider
      value={{
        RemoveCategory,
        UpdateCategory,
        customError,
        addedCategory,
        category,
        loading,
        error,
        categoryPerPage,
        setDepartmentsPerPage,
        currentPage,
        setCurrentPage,
        setCategory,
      }}
    >
      {children}

      {/* Modal should be rendered here */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </CategoryDisplayContext.Provider>
  );
};
