import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => {
        const token = localStorage.getItem("token");
        return token || null;
    });
    const [role, setRole] = useState(() => {
        const storedRole = localStorage.getItem("role");
        return storedRole || null;
    });
    const [email, setEmail] = useState(() => {
        const storedEmail = localStorage.getItem("email");
        return storedEmail || null;
    });
    const [first_name, setfirst_name] = useState(() => {
        const storedFirstName = localStorage.getItem("first_name");
        return storedFirstName || null;
    });
    const [last_name, setlast_name] = useState(() => {
        const storedLastName = localStorage.getItem("last_name");
        return storedLastName || null;
    });
    const [contact_number, setcontact_number] = useState(() => {
        const storedContact = localStorage.getItem("contact_number");
        return storedContact || null;
    });
    const [userId, setUserID] = useState(() => {
        const storedUserId = localStorage.getItem("userId");
        return storedUserId || null;
    });
    const [linkId, setlinkId] = useState(() => {
        const storedLinkId = localStorage.getItem("linkId");
        return storedLinkId || null;
    });
    const [isLoading, setLoading] = useState(false);
    const [Designatedzone, setDesignatedzone] = useState(() => {
        const storedZone = localStorage.getItem("Designatedzone");
        return storedZone || null;
    });
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem("theme");
        return storedTheme || "light";
    });
    const [isUpdatedInfo, setIsUpdatedInfo] = useState(() => {
        const stored = localStorage.getItem("isUpdatedInfo");
        return stored === "true" || false;
    });
    const [Profile, setProfile] = useState("");

    //  NEW: Role status fields
    const [isApprover, setIsApprover] = useState(() => {
        const stored = localStorage.getItem("isApprover");
        return stored === "true" || false;
    });
    const [approverStatus, setApproverStatus] = useState(() => {
        const stored = localStorage.getItem("approverStatus");
        return stored || "Available";
    });
    const [isHr, setIsHr] = useState(() => {
        const stored = localStorage.getItem("isHr");
        return stored === "true" || false;
    });
    const [hrStatus, setHrStatus] = useState(() => {
        const stored = localStorage.getItem("hrStatus");
        return stored || "Available";
    });
    const [isSupervisor, setIsSupervisor] = useState(() => {
        const stored = localStorage.getItem("isSupervisor");
        return stored === "true" || false;
    });
    const [supervisorStatus, setSupervisorStatus] = useState(() => {
        const stored = localStorage.getItem("supervisorStatus");
        return stored || "Available";
    });

    //  FIXED: Properly parse jobToApply from localStorage
    const [jobToApply, setJobToApply] = useState(() => {
        const stored = localStorage.getItem("jobToApply");
        if (stored && stored !== "[object Object]" && stored !== "null" && stored !== "undefined") {
            try {
                const parsed = JSON.parse(stored);
                console.log("Successfully loaded jobToApply from localStorage:", parsed);
                return parsed;
            } catch (error) {
                console.error("Error parsing jobToApply from localStorage:", error);
                localStorage.removeItem("jobToApply");
                return null;
            }
        }
        return null;
    });

    // Clean up corrupted data on initial load
    useEffect(() => {
        const stored = localStorage.getItem("jobToApply");
        if (stored === "[object Object]") {
            console.warn("Found corrupted jobToApply data, clearing...");
            localStorage.removeItem("jobToApply");
            setJobToApply(null);
        }
    }, []);

    useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [authToken]);
    
    const clearJobToApply = () => {
        console.log("Clearing jobToApply from localStorage and state");
        localStorage.removeItem("jobToApply");
        setJobToApply(null);
    };

const login = async (inputEmail, password, selectedJob) => {
    console.log("Login attempt with:", { inputEmail, password, selectedJob });

    try {
        const res = await axios.post(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/login`,
            { email: inputEmail, password },
            { withCredentials: true },
        );

        // ===== Handle success =====
        if (res.data.status === "Success") {
            const {
                token,
                role,
                email: serverEmail,
                first_name,
                last_name,
                contact_number,
                userId,
                linkId,
                Designatedzone,
                theme,
                isUpdatedInfo,
                isApprover,
                approverStatus,
                isHr,
                hrStatus,
                isSupervisor,
                supervisorStatus,
            } = res.data;

            // Save to localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("email", serverEmail);
            localStorage.setItem("first_name", first_name);
            localStorage.setItem("last_name", last_name);
            localStorage.setItem("contact_number", contact_number);
            localStorage.setItem("userId", userId);
            localStorage.setItem("linkId", linkId);
            localStorage.setItem("Designatedzone", Designatedzone);
            localStorage.setItem("authToken", token);
            localStorage.setItem("theme", theme);
            localStorage.setItem("isUpdatedInfo", isUpdatedInfo);

            localStorage.setItem("isApprover", isApprover);
            localStorage.setItem("approverStatus", approverStatus || "Available");
            localStorage.setItem("isHr", isHr);
            localStorage.setItem("hrStatus", hrStatus || "Available");
            localStorage.setItem("isSupervisor", isSupervisor);
            localStorage.setItem("supervisorStatus", supervisorStatus || "Available");

            // Save jobToApply
            if (selectedJob && typeof selectedJob === "object") {
                localStorage.setItem("jobToApply", JSON.stringify(selectedJob));
            } else if (typeof selectedJob === "string") {
                try {
                    const parsed = JSON.parse(selectedJob);
                    localStorage.setItem("jobToApply", JSON.stringify(parsed));
                } catch {
                    localStorage.setItem("jobToApply", selectedJob);
                }
            } else {
                localStorage.removeItem("jobToApply");
            }

            // Update state
            setAuthToken(token);
            setRole(role);
            setEmail(serverEmail);
            setfirst_name(first_name);
            setlast_name(last_name);
            setcontact_number(contact_number);
            setUserID(userId);
            setlinkId(linkId);
            setDesignatedzone(Designatedzone);
            setTheme(theme);
            setIsUpdatedInfo(isUpdatedInfo);

            setIsApprover(isApprover || false);
            setApproverStatus(approverStatus || "Available");
            setIsHr(isHr || false);
            setHrStatus(hrStatus || "Available");
            setIsSupervisor(isSupervisor || false);
            setSupervisorStatus(supervisorStatus || "Available");

            if (selectedJob && typeof selectedJob === "object") {
                setJobToApply(selectedJob);
            } else if (typeof selectedJob === "string") {
                try {
                    setJobToApply(JSON.parse(selectedJob));
                } catch {
                    setJobToApply(null);
                }
            } else {
                setJobToApply(null);
            }

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // ===== Return with message for consistency =====
            return {
                success: true,
                message: res.data.message || "Login successful",
                role,
                userId,
                requiresUpdate: !isUpdatedInfo,
            };
        }

        // ===== Handle API-level failure (status !== "Success") =====
        return {
            success: false,
            message: res.data?.message || "Login failed",
        };

    } catch (error) {
        console.error("Login error:", error);

        // ===== Handle axios errors (400, 401, 500, etc.) =====
        const message =
            error?.response?.data?.message ||   // backend message
            error?.message ||                    // JS error
            "Login failed. Please try again.";   // fallback

        return {
            success: false,
            message,
        };
    }
};

    // Fetch profile data
    const fetchProfile = async () => {
        if (!authToken) {
            setProfile(null);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/getProfileUser`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            console.log("response",response)

            if (response.data.success === true) {

                setProfile(response.data.data);
            } else {
                setProfile(null);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("first_name");
        localStorage.removeItem("last_name");
        localStorage.removeItem("contact_number");
        localStorage.removeItem("userId");
        localStorage.removeItem("linkId");
        localStorage.removeItem("Designatedzone");
        localStorage.removeItem("authToken");
        localStorage.removeItem("jobToApply");
        localStorage.removeItem("theme");
        localStorage.removeItem("isUpdatedInfo");

        //  NEW: Clear role status fields
        localStorage.removeItem("isApprover");
        localStorage.removeItem("approverStatus");
        localStorage.removeItem("isHr");
        localStorage.removeItem("hrStatus");
        localStorage.removeItem("isSupervisor");
        localStorage.removeItem("supervisorStatus");

        // Clear state
        setAuthToken(null);
        setRole(null);
        setEmail(null);
        setfirst_name(null);
        setlast_name(null);
        setcontact_number(null);
        setUserID(null);
        setlinkId(null);
        setDesignatedzone(null);
        setJobToApply(null);
        setTheme("light");
        setIsUpdatedInfo(false);
        setProfile("");

        //  NEW: Reset role status state
        setIsApprover(false);
        setApproverStatus("Available");
        setIsHr(false);
        setHrStatus("Available");
        setIsSupervisor(false);
        setSupervisorStatus("Available");

        // Remove Axios headers
        delete axios.defaults.headers.common["Authorization"];

        // Redirect to login page
        window.location.href = "/login";
    };

    const updateAvatar = async (file) => {
        if (!file || !authToken) throw new Error("No file or token");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/UpdateAvatar`, formData, {
                headers: { Authorization: `Bearer ${authToken}` },
                withCredentials: true,
            });

            setProfile((prev) => ({
                ...prev,
                avatar: res.data.data.avatar,
            }));
            return { success: true, data: res.data.data };
        } catch (err) {
            console.error("updateAvatar error:", err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const UpdateProfileInfo = async (dataID, values) => {
        console.log("Updating profile info:", values);

        try {
            const payload = {
                first_name: values.first_name || "",
                last_name: values.last_name || "",
                middle_name: values.middle_name || "",
                email: values.email || "",
                role: role || "admin",
                avatar: values.avatar || null,
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Admin/${dataID}`, payload, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data?.status === "success") {
                // Update local storage and state with new values
                if (payload.first_name) {
                    localStorage.setItem("first_name", payload.first_name);
                    setfirst_name(payload.first_name);
                }
                if (payload.last_name) {
                    localStorage.setItem("last_name", payload.last_name);
                    setlast_name(payload.last_name);
                }
                if (payload.email) {
                    localStorage.setItem("email", payload.email);
                    setEmail(payload.email);
                }

                await fetchProfile();
                return { success: true, data: response.data };
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";
            console.error("UpdateProfileInfo error:", message);
            return { success: false, error: message };
        }
    };

    //NEW: Function to update role status
    const updateRoleStatus = async (roleType, status) => {
        // roleType: 'approver', 'hr', 'supervisor'
        // status: 'Available' or 'Unavailable'

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/${userId}/role-status`,
                { roleType, status },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data?.status === "success") {
                // Update local storage and state
                const statusKey = `${roleType}Status`;
                const isKey = `is${roleType.charAt(0).toUpperCase() + roleType.slice(1)}`;

                localStorage.setItem(statusKey, status);

                // Update state based on roleType
                switch (roleType) {
                    case 'approver':
                        setApproverStatus(status);
                        break;
                    case 'hr':
                        setHrStatus(status);
                        break;
                    case 'supervisor':
                        setSupervisorStatus(status);
                        break;
                    default:
                        break;
                }

                return { success: true, data: response.data };
            } else {
                return { success: false, error: "Failed to update status" };
            }
        } catch (error) {
            console.error("Update role status error:", error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to update status"
            };
        }
    };

    const value = {
        authToken,
        role,
        email,
        first_name,
        last_name,
        contact_number,
        userId,
        linkId,
        Designatedzone,
        jobToApply,
        setJobToApply,
        clearJobToApply,
        isLoading,
        theme,
        setTheme,
        isUpdatedInfo,
        Profile,
        login,
        logout,
        fetchProfile,
        updateAvatar,
        UpdateProfileInfo,
        isApprover,
        approverStatus,
        isHr,
        hrStatus,
        isSupervisor,
        supervisorStatus,
        updateRoleStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};