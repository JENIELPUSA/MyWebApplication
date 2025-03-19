import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserTable from './components/USER/UserTable';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignUpForm from './components/USER/SignUpForm';
function UserForm() {
    const [users, setUsers] = useState([]); // State to hold the user list
    const [selectedUser, setSelectedUser] = useState(null); // State for the user to be edited
    const [loading, setLoading] = useState(true); // Loading state for fetching users
    const [error, setError] = useState(null); // State to handle errors
    const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
    const [usersPerPage, setUsersPerPage] = useState(6); // Users displayed per page
    const [totalUsers, setTotalUsers] = useState(0); // Total number of users
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
  
    const token = localStorage.getItem('token'); // Retrieve your token
  
    // Centralized function to fetch users from the server
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
  
        try {
            const res = await axios.get(`http://127.0.0.1:3000/api/v1/users?page=${currentPage}&limit=${usersPerPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(res.data.data);
            setTotalUsers(res.data.total);
        } catch (error) {
            console.error('Error fetching users:', error.response ? error.response.data : error.message);
            alert('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
  
    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://127.0.0.1:3000/api/v1/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            // Remove the deleted user from the state
            setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user.');
        }
    };
    
  
    // Fetch users on initial load and whenever pagination changes
    useEffect(() => {
        fetchUsers();
    }, [currentPage, usersPerPage, token]);
  
    const handleUserSelect = (user) => {
        if (user && user._id) {
            setSelectedUser(user); // Set the selected user for editing if valid
        } else {
            console.warn("Selected user has no valid ID.");
        }
    };
  
    const filteredUsers = users.filter((user) =>
        `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const handleUpdateUser = (updatedUser) => {
        console.log(updatedUser)
        if (!updatedUser || !updatedUser._id) {
            alert("User ID is missing. Cannot update.");
            return;
        }
    
        setUsers((prevUsers) =>
            prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
        );
    
        // Optionally, if you want to fetch the updated users from the server
        // fetchUsers();
    };
  
    const handleAddUser = (newUser) => {
        if (!newUser || !newUser._id) {
            alert("User ID is missing. Cannot add to the table.");
            return;
        }
    
        setUsers((prevUsers) => [...prevUsers, newUser]);
    
        // Optionally, if you want to fetch all users from the server after adding
        // fetchUsers();
    };
    
    return (
        <div className="flex flex-col md:flex-row h-screen">
      
{/* Main Content */}
<div className="flex flex-col flex-grow bg-gray-600 text-white">
  {/* Navbar */}
  <div className="h-16 bg-gray-500 sticky top-0 z-10">
    <Navbar />
  </div>

  {/* Main Content with Scrolling */}
  <div className="flex flex-col lg:flex-row flex-grow overflow-auto p-4 bg-transparent space-y-4 lg:space-y-0 lg:space-x-4 justify-center items-center">
    {/* User Form */}
    <div className="w-full lg:w-1/3 bg-transparent p-4 rounded">
      <SignUpForm
        user={selectedUser}
        onUpdate={handleUpdateUser}
        onAddUser={handleAddUser}
      />
    </div>

    {/* User Table */}
    <div className="w-full lg:w-2/3">
      <UserTable
        users={filteredUsers}
        onUserSelect={handleUserSelect}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        usersPerPage={usersPerPage}
        setUsersPerPage={setUsersPerPage}
        totalUsers={totalUsers}
        onDeleteUser={handleDeleteUser}
        searchTerm={searchTerm} // Pass the searchTerm state
      />
    </div>
  </div>
</div>

        </div>
      );
      
}

export default UserForm;
