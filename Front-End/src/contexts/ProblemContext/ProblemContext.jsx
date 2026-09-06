import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const ProblemContext = createContext();

export const ProblemProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [problem, setProblem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const token = localStorage.getItem("token");

  // CREATE - Gumawa ng bagong problema
  const createProblem = async (values) => {
    if (!token) {
      console.error("No token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problem`,
        {
          title: values.title,
          category: values.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        setProblems(prev => [response.data.data, ...prev]);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error creating problem:", error);
      setError(error.response?.data?.message || "Failed to create problem");
    } finally {
      setLoading(false);
    }
  };

  // DISPLAY - Kunin ang lahat ng problema
  const displayProblems = async (queryParams = "") => {
    if (!token) {
      console.error("No token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problem?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setProblems(response.data.data);
        setIsInitialized(true);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      setError(error.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  // DISPLAY BY ID - Kunin ang isang specific na problema
  const getProblem = async (id) => {
    if (!token || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problems/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setProblem(response.data.data.problem);
        return response.data.data.problem;
      }
    } catch (error) {
      console.error("Error fetching problem:", error);
      setError(error.response?.data?.message || "Failed to fetch problem");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE - I-update ang isang problema
  const updateProblem = async (id, values) => {
    if (!token || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problems/${id}`,
        {
          title: values.title,
          category: values.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        setProblems(prev =>
          prev.map(p => p._id === id ? response.data.data : p)
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      setError(error.response?.data?.message || "Failed to update problem");
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Burahin ang isang problema
  const deleteProblem = async (id) => {
    if (!token || !id) {
      console.error("No token or ID found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/problem/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setConfirm(true);
        setProblems(prev => prev.filter(p => p._id !== id));
        return true;
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
      setError(error.response?.data?.message || "Failed to delete problem");
    } finally {
      setLoading(false);
    }
  };

  // RESET - I-reset ang confirm state
  const resetConfirm = () => {
    setConfirm(null);
  };

  // CLEAR ERRORS - I-clear ang error state
  const clearErrors = () => {
    setError(null);
  };

  // REFRESH - I-refresh ang problems list
  const refreshProblems = async () => {
    await displayProblems();
  };

  // --- USE EFFECT - Auto-load problems on mount ---
  useEffect(() => {
    // Check if token exists before fetching
    if (token) {
      displayProblems();
    } else {
      console.warn("No token found, skipping initial problems fetch");
    }
    
    // Optional: Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, []); // Empty dependency array means this runs once on mount

  // --- OPTIONAL: Auto-refresh when token changes ---
  useEffect(() => {
    if (token && !isInitialized) {
      displayProblems();
    }
  }, [token]);

  return (
    <ProblemContext.Provider
      value={{
        // States
        loading,
        problems,
        problem,
        confirm,
        error,
        isInitialized,
        
        // Functions
        createProblem,
        displayProblems,
        getProblem,
        updateProblem,
        deleteProblem,
        resetConfirm,
        clearErrors,
        refreshProblems,
      }}
    >
      {children}
    </ProblemContext.Provider>
  );
};
