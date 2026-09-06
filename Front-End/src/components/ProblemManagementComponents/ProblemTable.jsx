import React, { useState, useMemo, useContext } from "react";
import {
    FaPlus, FaEdit, FaTrashAlt, FaSearch,
    FaChevronLeft, FaChevronRight, FaList,
    FaTag, FaClock, FaFilter
} from "react-icons/fa";
import ProblemFormModal from "./ProblemAddModal";
import { ProblemContext } from "../../contexts/ProblemContext/ProblemContext";

// --- DUMMY DATA ---
const DUMMY_PROBLEMS = [
    { _id: "1", title: "Network Connectivity Issues", category: "Infrastructure", createdAt: "2026-01-15T08:30:00.000Z" },
    { _id: "2", title: "Database Connection Timeout", category: "Database", createdAt: "2026-01-16T10:20:00.000Z" },
    { _id: "3", title: "Memory Leak in Production", category: "Performance", createdAt: "2026-01-17T14:45:00.000Z" },
    { _id: "4", title: "API Rate Limiting Error", category: "API", createdAt: "2026-01-18T09:15:00.000Z" },
    { _id: "5", title: "SSL Certificate Expired", category: "Security", createdAt: "2026-01-19T11:30:00.000Z" },
    { _id: "6", title: "Data Sync Failure", category: "Database", createdAt: "2026-01-20T16:00:00.000Z" },
    { _id: "7", title: "UI Rendering Performance Issue", category: "Frontend", createdAt: "2026-01-21T13:25:00.000Z" },
    { _id: "8", title: "File Upload Timeout", category: "Infrastructure", createdAt: "2026-01-22T08:45:00.000Z" },
    { _id: "9", title: "Authentication Token Expiry", category: "Security", createdAt: "2026-01-23T10:10:00.000Z" },
    { _id: "10", title: "Search Index Outdated", category: "Database", createdAt: "2026-01-24T15:30:00.000Z" },
    { _id: "11", title: "CORS Policy Blocking Requests", category: "API", createdAt: "2026-01-25T09:50:00.000Z" },
    { _id: "12", title: "Server Load Balancing Issue", category: "Infrastructure", createdAt: "2026-01-26T12:15:00.000Z" },
    { _id: "13", title: "React Component Memory Leak", category: "Frontend", createdAt: "2026-01-27T14:00:00.000Z" },
    { _id: "14", title: "Database Query Performance", category: "Performance", createdAt: "2026-01-28T11:40:00.000Z" },
    { _id: "15", title: "WebSocket Connection Drops", category: "Infrastructure", createdAt: "2026-01-29T16:20:00.000Z" },
];

// --- CATEGORY COLOR MAP ---
const CATEGORY_COLORS = {
    // Equipment Categories
    'Aircon': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Laptop': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Water Dispenser': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'Printer': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Desktop': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Server': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Network Switch': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Projector': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    'Router': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    'Monitor': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    'Keyboard': 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300',
    'Mouse': 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
    'UPS': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Scanner': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
    'Telephone': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
    'CCTV': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'Biometrics': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'Network Cable': 'bg-stone-100 text-stone-700 dark:bg-stone-800/50 dark:text-stone-300',
    'Server Rack': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300',
    'Generator': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Firewall': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    'NAS Storage': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

// --- FORMAT DATE ---
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ProblemTable = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const { createProblem, problems, loading, updateProblem, deleteProblem } = useContext(ProblemContext)


    console.log("problems", problems)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 5;

    // --- FILTER LOGIC ---
    const filteredProblems = useMemo(() => {
        let filtered = problems;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(problem =>
                problem.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(problem =>
                problem.category === selectedCategory
            );
        }

        return filtered;
    }, [problems, searchTerm, selectedCategory]);

    // --- PAGINATION ---
    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
    const paginatedProblems = filteredProblems.slice(
        (currentPage - 1) * problemsPerPage,
        currentPage * problemsPerPage
    );

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // --- PAGE NUMBERS WITH ELLIPSIS ---
    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pages.push("...");
            }
        }
        return [...new Set(pages)];
    };

    // --- CRUD HANDLERS ---
    const handleAddClick = () => {
        setSelectedProblem(null);
        setAddFormOpen(true);
    };

    const handleEditClick = (problem) => {
        setSelectedProblem(problem);
        setAddFormOpen(true);
    };

    const handleCloseModal = () => {
        setAddFormOpen(false);
        setSelectedProblem(null);
    };

    const handleUpdateProblem = async (updatedProblem) => {
        await updateProblem(updatedProblem)
    };

    const handleDelete = async (id) => {
        await deleteProblem(id)
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setCurrentPage(1);
    };

    // --- GET CATEGORY COUNT ---
    const getCategoryCount = (category) => {
        return problems.filter(p => p.category === category).length;
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">

            {/* HEADER */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <FaList size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Problem Management</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Track and manage system issues</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Total: <span className="font-bold text-blue-600 dark:text-blue-400">{problems.length}</span>
                    </div>
                </div>
            </div>

            {/* FILTER & SEARCH SECTION */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search problems by title..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative min-w-[180px]">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat} ({getCategoryCount(cat)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {(searchTerm || selectedCategory) && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Clear Filters
                            </button>
                        )}
                        <button
                            onClick={handleAddClick}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm whitespace-nowrap"
                        >
                            <FaPlus size={12} /> <span>Add Problem</span>
                        </button>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || selectedCategory) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                                Search: "{searchTerm}"
                                <button onClick={() => { setSearchTerm(""); setCurrentPage(1); }} className="ml-1 hover:text-blue-900 dark:hover:text-blue-300">
                                    ×
                                </button>
                            </span>
                        )}
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                                Category: {selectedCategory}
                                <button onClick={() => { setSelectedCategory(""); setCurrentPage(1); }} className="ml-1 hover:text-purple-900 dark:hover:text-purple-300">
                                    ×
                                </button>
                            </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {filteredProblems.length} result{filteredProblems.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-3 w-12">#</th>
                            <th className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <FaList size={12} />
                                    Problem Title
                                </div>
                            </th>
                            <th className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <FaTag size={12} />
                                    Category
                                </div>
                            </th>
                            <th className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <FaClock size={12} />
                                    Created
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm bg-white dark:bg-slate-900">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                                        <span>Loading problems...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedProblems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                                    {searchTerm || selectedCategory
                                        ? 'No problems match your filters.'
                                        : 'No problems found. Click "Add Problem" to get started.'}
                                </td>
                            </tr>
                        ) : (
                            paginatedProblems.map((problem, index) => {
                                const globalIndex = (currentPage - 1) * problemsPerPage + index + 1;
                                const categoryColor = CATEGORY_COLORS[problem.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';

                                return (
                                    <tr key={problem._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs">
                                            {globalIndex}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                    {problem.title.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{problem.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                                                {problem.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                            {formatDate(problem.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(problem)}
                                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                    title="Edit Problem"
                                                >
                                                    <FaEdit size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(problem._id)}
                                                    className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                    title="Delete Problem"
                                                >
                                                    <FaTrashAlt size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION FOOTER - Category Legend Removed */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-700 dark:text-gray-300">
                        {filteredProblems.length === 0 ? 0 : Math.min(filteredProblems.length, (currentPage - 1) * problemsPerPage + 1)}
                    </span> to{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {Math.min(currentPage * problemsPerPage, filteredProblems.length)}
                    </span> of{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">{filteredProblems.length}</span> entries
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1 || filteredProblems.length === 0}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        <FaChevronLeft size={10} />
                    </button>

                    <div className="flex gap-0.5">
                        {getPageNumbers().map((num, i) => (
                            <button
                                key={i}
                                onClick={() => typeof num === "number" && paginate(num)}
                                disabled={num === "..."}
                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentPage === num
                                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                                    : num === "..."
                                        ? "cursor-default text-gray-300 dark:text-gray-600"
                                        : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages || filteredProblems.length === 0}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        <FaChevronRight size={10} />
                    </button>
                </div>
            </div>

            {/* CATEGORY LEGEND - REMOVED */}

            {/* MODAL */}
            {isAddFormOpen && (
                <ProblemFormModal
                    isOpen={isAddFormOpen}
                    onUpdate={handleUpdateProblem}
                    problem={selectedProblem}
                    onClose={handleCloseModal}
                    categories={CATEGORIES}
                    createProblem={createProblem}
                />
            )}
        </div>
    );
};

export default ProblemTable;