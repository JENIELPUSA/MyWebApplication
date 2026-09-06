// contexts/HistoryContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState([]);
  const [history, setHistory] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const token = localStorage.getItem("token");

  // ==========================================
  // DISPLAY - Kunin ang lahat ng history records
  // ==========================================
  const displayHistories = async (queryParams = "") => {
    if (!token) {
      console.error("No token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setHistories(response.data.data);
        setIsInitialized(true);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching histories:", error);
      setError(error.response?.data?.message || "Failed to fetch histories");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DISPLAY BY ID - Kunin ang isang specific na history
  // ==========================================
  const getHistory = async (id) => {
    if (!token || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setHistory(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setError(error.response?.data?.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE - I-update ang isang history record
  // ==========================================
  const updateHistory = async (id, values) => {
    if (!token || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history/${id}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        setHistories(prev =>
          prev.map(h => h._id === id ? response.data.data : h)
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating history:", error);
      setError(error.response?.data?.message || "Failed to update history");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE - Burahin ang isang history record
  // ==========================================
  const deleteHistory = async (id) => {
    if (!token || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        setHistories(prev => prev.filter(h => h._id !== id));
        return true;
      }
    } catch (error) {
      console.error("Error deleting history:", error);
      setError(error.response?.data?.message || "Failed to delete history");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET - I-reset ang confirm state
  // ==========================================
  const resetConfirm = () => {
    setConfirm(null);
  };

  // ==========================================
  // CLEAR ERRORS - I-clear ang error state
  // ==========================================
  const clearErrors = () => {
    setError(null);
  };

  // ==========================================
  // REFRESH - I-refresh ang histories list
  // ==========================================
  const refreshHistories = async () => {
    await displayHistories();
  };

  // ==========================================
  // USE EFFECT - Auto-load histories on mount
  // ==========================================
  useEffect(() => {
    if (token) {
      displayHistories();
    } else {
      console.warn("No token found, skipping initial histories fetch");
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        // States
        loading,
        histories,
        history,
        confirm,
        error,
        isInitialized,

        // Functions
        displayHistories,
        getHistory,
        updateHistory,
        deleteHistory,
        resetConfirm,
        clearErrors,
        refreshHistories,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

