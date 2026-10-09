import React, { createContext, useState, useEffect, useContext } from "react";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);

    // ============ STATE ============
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customError, setCustomError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage, setCategoriesPerPage] = useState(6);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("-createdAt");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    // ============ EFFECTS ============
    useEffect(() => {
        if (!authToken) {
            setCategories([]);
            setLoading(false);
            return;
        }
        fetchCategories();
    }, [authToken, currentPage, categoriesPerPage, sortBy]);

    // Auto-dismiss custom error after 5s
    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => setCustomError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    // ============ FETCH ============
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys`,
                {
                    params: {
                        page: currentPage,
                        limit: categoriesPerPage,
                        sort: sortBy,
                        ...(searchQuery && { name: searchQuery }),
                    },
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
            setCategories(res.data.data);
        } catch (error) {
            console.error("Fetch error:", error);
            setCustomError(
                error.response?.data?.message || "Failed to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============ CREATE ==========
    const addCategory = async (values) => {
        try {

            console.log("values",values)
            const response = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys`,
                {
                    CategoryName: values.CategoryName,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchCategories();
                return { success: true, data: response.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Something went wrong.";
            setCustomError(message);
            return { success: false, error: message };
        }
    };

    // ============ UPDATE ==========
    const updateCategory = async (categoryId, values) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys/${categoryId}`,
                {
                    name: values.name,
                    description: values.description,
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchCategories();
                return { success: true, data: response.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Update error:", error);
            setCustomError(
                error.response?.data?.message || "Operation failed. Please try again."
            );
            return { success: false, error: error.response?.data?.message };
        }
    };

    // ============ DELETE ==========
    const deleteCategory = async (categoryId) => {
        try {
            const response = await axiosInstance.delete(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys/${categoryId}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            if (response.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await fetchCategories();
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Delete error:", error);
            setCustomError(
                error.response?.data?.message || "Failed to delete category."
            );
            return { success: false };
        }
    };

    return (
        <CategoryContext.Provider
            value={{
                categories,
                loading,
                error,
                customError,
                setCustomError,
                currentPage,
                setCurrentPage,
                categoriesPerPage,
                setCategoriesPerPage,
                searchQuery,
                setSearchQuery,
                sortBy,
                setSortBy,
                addCategory,
                updateCategory,
                deleteCategory,
                fetchCategories,
            }}
        >
            {children}
            <StatusModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </CategoryContext.Provider>
    );
};