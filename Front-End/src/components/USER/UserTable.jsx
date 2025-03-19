import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {FaPlus} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserFormModal from "./SignUpForm"
import { UserContext } from "../CountContext";
import { UserDisplayContext } from '../Context/User/DisplayUser';

const UserTable = ({ isOpen, onClose }) => {
  const {users,usersPerPage,currentPage,setCurrentPage,setUsers}= useContext(UserDisplayContext);
  const { setUserCount } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(null); // State for the user to be edited
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const [isAddFormOpen, setAddFormOpen] = useState(false);
 

  const token = localStorage.getItem("token"); // Retrieve your token

  if (!isOpen) return null;

  const handleAddClick =()=>{
    setAddFormOpen(true);
    
}

const handleCloseModal =()=>{
    setAddFormOpen(false)
}
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://127.0.0.1:3000/api/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted user from the state
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success("User deleted successfully!");
      setUserCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const onUserSelect = (user) => {
    setAddFormOpen(true);
    setSelectedUser(user)

   
  };

  const handleUpdateUser = (updatedUser) => {
    console.log(updatedUser);
    if (!updatedUser || !updatedUser._id) {
      alert("User ID is missing. Cannot update.");
      return;
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      )
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

  
    // Filter users based on search term
    const filteredUsers = users.filter((user) =>
      `${user.FirstName} ${user.LastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );


  const totalPages = Math.ceil(filteredUsers.length / usersPerPage); // Calculate total pages

  const paginatedUser = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };



  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full text-black shadow-lg relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times"></i>
        </button>

        <h2 className="text-xl font-bold mb-4">User Table</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-300">Name</th>
              <th className="p-4 border-b border-gray-300">Email</th>
              <th className="p-4 border-b border-gray-300">Role</th>
              <th className="p-4 border-b border-gray-300 flex justify-center items-center">
                <button
                  onClick={() => handleAddClick()}
                  className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUser.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border p-2 text-center text-gray-500"
                >
                  No Results Found
                </td>
              </tr>
            ) : (
              paginatedUser.map((user) => (
                <tr key={user._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2">{`${
                    user.FirstName
                  } ${user.Middle ? user.Middle + " " : ""}${
                    user.LastName
                  }`}</td>
                  <td className="border border-gray-300 p-2">{user.email}</td>
                  <td className="border border-gray-300 p-2">{user.role}</td>
                  <td className="border p-2 flex space-x-2 justify-center">
                    <button
                      onClick={() => onUserSelect(user)}
                      className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                    >
                      <i className="fas fa-edit"></i>{" "}
                      {/* Font Awesome edit icon */}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
                    >
                      <i className="fas fa-trash-alt"></i>{" "}
                      {/* Font Awesome trash icon */}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="py-2 px-4 bg-gray-200 rounded-full"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`py-2 px-4 rounded-full ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            className="py-2 px-4 bg-gray-200 rounded-full"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        {isAddFormOpen&&(
            <UserFormModal
            isOpen={isAddFormOpen}
            onAddUser={handleAddUser}
            onUpdate={handleUpdateUser}
            user={selectedUser}
            onClose={handleCloseModal}
            />
        )}
      </div>
    </div>
  );
};

export default UserTable;
