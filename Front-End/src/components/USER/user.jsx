import React, { useState } from 'react';

const UserTable = ({
    users,
    onUserSelect,
    onDeleteUser,
    loading,
    currentPage,
    setCurrentPage,
    usersPerPage,
    setUsersPerPage,
    totalUsers,
}) => {
    const [searchTerm, setSearchTerm] = useState(''); // Local state for the search term

    const totalPages = Math.ceil(totalUsers / usersPerPage); // Calculate total pages

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return; // Check for valid page number
        setCurrentPage(pageNumber); // Update current page
    };

    // Center the loading spinner
    if (loading)
        return (
            <div className="flex justify-center items-center h-full">
                {/* Loading Spinner SVG */}
            </div>
        );

    // Filter users based on search term
    const filteredUsers = users.filter((user) =>
        `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If there are no filtered users, disable pagination buttons
    const isNoUsers = filteredUsers.length === 0;

    return (
        <div className="flex flex-col p-6">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 shadow-sm text-gray-700 placeholder-gray-400 text-sm transition-colors duration-200"
                    />
                    <select
                        value={usersPerPage}
                        onChange={(e) => setUsersPerPage(Number(e.target.value))}
                        className="ml-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 shadow-sm text-gray-700"
                    >
                        <option value={6}>6</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="flex-col text-gray-700 bg-white shadow-md rounded-xl bg-clip-border px-4 py-4">
                    <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                        <table className="table-auto first-letter:w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">Name</th>
                                    <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">Email</th>
                                    <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">Role</th>
                                    <th className="p-4 border-b border-gray-300 bg-blue-50 text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isNoUsers ? (
                                    <tr>
                                         <td colSpan={6} className="border border-gray-300 p-2 text-center text-gray-500">
                                            No Results Found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-100 transition-colors">
                                            <td className="border border-gray-300 p-2">{`${user.FirstName} ${user.Middle ? user.Middle + ' ' : ''}${user.LastName}`}</td>
                                            <td className="border border-gray-300 p-2">{user.email}</td>
                                            <td className="border border-gray-300 p-2">{user.role}</td>
                                            <td className="border border-gray-300 p-2 flex space-x-2">
                                                <button
                                                    onClick={() => onUserSelect(user)}
                                                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                                                >
                                                    <i className="fas fa-edit"></i> {/* Font Awesome edit icon */}
                                                </button>
                                                <button
                                                    onClick={() => onDeleteUser(user._id)}
                                                    className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
                                                >
                                                    <i className="fas fa-trash-alt"></i> {/* Font Awesome trash icon */}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex space-x-1 justify-center mt-4">
                        <button
                            className={`rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500 ${currentPage === 1 || isNoUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => paginate(currentPage - 1)}
                          
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={`min-w-9 rounded-full py-2 px-3.5 text-center text-sm transition-all shadow-sm ${currentPage === index + 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'border border-slate-300 text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            className={`rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm text-slate-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-indigo-500 ${currentPage === totalPages || isNoUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || isNoUsers}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTable;
