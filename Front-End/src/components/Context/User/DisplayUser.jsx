import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";
export const UserDisplayContext = createContext();

export const UserDisplayProvider = ({ children }) => {
  const [customError, setCustomError] = useState("");
  const { authToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  // Get token from localStorage
  const [usersPerPage, setusersPerPage] = useState(6);
  useEffect(() => {
    if (!authToken) {
      setUsers([]);
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchUserData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchUserData = async () => {
    if (!authToken) return;
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`, {
        withCredentials: true ,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const userData = res?.data.data;
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };

  const AddUser = async (values) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`,
        {
          FirstName: values.FirstName,
          Middle: values.Middle,
          LastName: values.LastName,
          email: values.email,
          password: values.password,
          role: values.role
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (res.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        return { success: true, data: res.data.data };
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

  const UpdateUser = async(user,values)=>{
    try{
      const dataToSend = {
        FirstName: values.FirstName,
        Middle: values.Middle,
        LastName: values.LastName,
        email: values.email,
        role: values.role
      };
  
      if (values.password) {
        dataToSend.password = values.password;
      }
  
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${user}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }

    }catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message);
      } else if (error.request) {
        // The request was made but no response was received
        setCustomError("No response from the server.");
      } else {
        // Something happened in setting up the request
        setCustomError(error.message || "Unexpected error occurred.");
      }
    }
     
  }

  const DeleteUser=async(userId)=>{
    try {
      const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data && response.data.status === "success") {
        setModalStatus("success");
        setShowModal(true);
        return { success: true, data: response.data.data };
      } else {
        setModalStatus("failed");
        setShowModal(true);
        return { success: false, error: "Unexpected response from server." };
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }

  }

  return (
    <UserDisplayContext.Provider
      value={{
        DeleteUser,
        UpdateUser,
        AddUser,
        users,
        loading,
        error,
        usersPerPage,
        setusersPerPage,
        currentPage,
        setCurrentPage,
        setUsers,
        fetchUserData,
      }}
    >
      {children}

      {/* Modal should be rendered here */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </UserDisplayContext.Provider>
  );
};
