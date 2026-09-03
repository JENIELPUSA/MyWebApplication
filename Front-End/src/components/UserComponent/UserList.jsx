import React, { useState, useEffect } from "react";
import axios from 'axios';
import { UserDataContext } from "../../contexts/UserContext/UserContext";
import UserTable from "../../components/USER/UserTable";
import SignUpForm from "../../components/USER/SignUpForm";

function UserForm() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(6);
    const [totalUsers, setTotalUsers] = useState(0);

    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `http://127.0.0.1:3000/api/v1/users?page=${currentPage}&limit=${usersPerPage}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(res.data.data);
            setTotalUsers(res.data.total);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://127.0.0.1:3000/api/v1/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, usersPerPage]);

    const handleUserSelect = (user) => {
        if (user && user._id) {
            setSelectedUser(user);
        }
    };

    const handleUpdateUser = (updatedUser) => {
        if (!updatedUser || !updatedUser._id) {
            alert("User ID is missing. Cannot update.");
            return;
        }
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user._id === updatedUser._id ? updatedUser : user
            )
        );
    };

    const handleAddUser = (newUser) => {
        if (!newUser || !newUser._id) {
            alert("User ID is missing. Cannot add to the table.");
            return;
        }
        setUsers((prevUsers) => [...prevUsers, newUser]);
    };

    const contextValue = {
        users,
        setUsers,
        usersPerPage,
        currentPage,
        setCurrentPage,
        DeleteUser: handleDeleteUser,
        loading
    };

    return (
        <UserDataContext.Provider value={contextValue}>

            {/* Optional: Add a top bar or navigation here */}
            <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full w-full">
                    <UserTable />
                </div>
            </div>

        </UserDataContext.Provider>
    );
}

export default UserForm;