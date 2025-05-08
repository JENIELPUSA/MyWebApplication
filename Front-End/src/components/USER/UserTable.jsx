import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import UserFormModal from "./SignUpForm";
import { UserContext } from "../CountContext";
import { UserDisplayContext } from "../Context/User/DisplayUser";

const UserTable = ({ isOpen, onClose }) => {
  const [animateExit, setAnimateExit] = useState(false);
  const {
    users,
    usersPerPage,
    currentPage,
    setCurrentPage,
    setUsers,
    DeleteUser,
  } = useContext(UserDisplayContext);
  const { setUserCount } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(null); // State for the user to be edited
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const [isAddFormOpen, setAddFormOpen] = useState(false);

  const token = localStorage.getItem("token"); // Retrieve your token

  if (!isOpen) return null;

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedUser(null);
  };
  const handleDeleteUser = async (userId) => {
    await DeleteUser(userId);
    setUsers((prevEquipment) => {
      const updated = prevEquipment.filter((user) => user._id !== userId);
      return updated;
    });
    setUserCount((prevCount) => prevCount - 1);
  };

  const onUserSelect = (user) => {
    setAddFormOpen(true);
    setSelectedUser(user);
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
    `${user.FirstName} ${user.Middle} ${user.LastName}`
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
    <motion.div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 px-2 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-screen-sm sm:max-w-screen-md lg:max-w-screen-lg shadow-lg max-h-[90vh] sm:max-h-none overflow-y-auto"
        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Icon */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }} // Shrinks on click
          whileHover={{ scale: 1.1 }} // Enlarges on hover
          transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
          onClick={() => {
            setAnimateExit(true); // Set the animation state to trigger upward motion
            setTimeout(onClose, 500); // Close after 500ms to match the animation duration
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <h2 className="text-xl font-bold mb-4 xs:text-sm xs:p-2 lg-p-2 lg:text-lg">User Table</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search FullName..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg xs:text-sm xs:p-2 lg-p-2 lg:text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
            <thead>
              <tr>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300">Name</th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300">Email</th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300">Role</th>
                <th >
                  <button
                    onClick={() => handleAddClick()}
                    className="xs:text-xs xs:p-2 lg:p-2 lg:text-sm px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
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
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">{`${
                      user.FirstName
                    } ${user.Middle ? user.Middle + " " : ""}${
                      user.LastName
                    }`}</td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">{user.email}</td>
                    <td className=" xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">{user.role}</td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() => onUserSelect(user)}
                        className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                      >
                        <i className="fas fa-edit"></i>{" "}
                        {/* Font Awesome edit icon */}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
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
        </div>

        {/* Pagination */}
        <div className="flex flex-row items-center justify-between flex-wrap mt-4 text-sm gap-2">
          {/* Left side: Page X of Y */}
          <div className="text-gray-700">
            Page {currentPage} of {totalPages}
          </div>

          {/* Right side: Prev and Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <button
              onClick={() => paginate(currentPage + 1)}
              className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Showing Info */}
        <div className="mt-2 text-sm text-center text-gray-700">
          Showing {(currentPage - 1) * usersPerPage + 1} to{" "}
          {Math.min(currentPage * usersPerPage, filteredUsers.length)}{" "}
          of {filteredUsers.length} results
        </div>

        {isAddFormOpen && (
          <UserFormModal
            isOpen={isAddFormOpen}
            onAddUser={handleAddUser}
            onUpdate={handleUpdateUser}
            user={selectedUser}
            onClose={handleCloseModal}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default UserTable;
