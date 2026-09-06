import React, { useState, useEffect, useContext } from 'react';
import { FaUserEdit, FaTimes, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { MaintenanceRequestContext } from '../../../contexts/MaintenanceRequestContext/MaintenanceRequestContext';

const ReassignModal = ({
    isOpen,
    onClose,
    task,
    currentTechnician,
    technicians,
    onReassign,
    onSubmitted, // New callback for after successful submission
    isReassigning = false,
    isLoadingTechnicians = false
}) => {
    const { UpdateAssignTechnician } = useContext(MaintenanceRequestContext)
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [error, setError] = useState('');

    // Reset selection and error when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedTechnician('');
            setError('');
        }
    }, [isOpen]);

    // Get technician name helper - handles both data structures
    const getTechnicianName = (tech) => {
        if (!tech) return 'Unknown';
        // Check for FirstName + LastName pattern
        if (tech.FirstName || tech.LastName) {
            const firstName = tech.FirstName || '';
            const lastName = tech.LastName || '';
            return `${firstName} ${lastName}`.trim() || 'Unknown';
        }
        // Fallback to other possible fields
        return tech.technicianName || tech.name || tech.fullName || 'Unknown';
    };

    // Get technician ID helper
    const getTechnicianId = (tech) => {
        return tech._id || tech.id || tech.technicianId || '';
    };

    // Get full name with middle initial if available
    const getFullName = (tech) => {
        if (!tech) return 'Unknown';
        const firstName = tech.FirstName || '';
        const lastName = tech.LastName || '';
        const middle = tech.Middle || '';

        if (firstName && lastName) {
            // If middle name exists, use first letter with dot
            if (middle) {
                return `${firstName} ${middle.charAt(0)}. ${lastName}`;
            }
            return `${firstName} ${lastName}`;
        }
        return getTechnicianName(tech);
    };

    // Filter out the current technician from the list
    const availableTechnicians = technicians?.filter(
        tech => {
            const techName = getTechnicianName(tech);
            return techName !== currentTechnician;
        }
    ) || [];

    // Get current technician's full name for display
    const getCurrentTechnicianDisplay = () => {
        if (!currentTechnician) return 'Unassigned';
        // Check if currentTechnician is in the technicians list
        const found = technicians?.find(
            tech => getTechnicianName(tech) === currentTechnician
        );
        if (found) {
            return getFullName(found);
        }
        return currentTechnician;
    };

    // Handle form submission
    const handleSubmit = async () => {
        setError('');

        if (!selectedTechnician) {
            setError('Please select a technician to reassign.');
            return;
        }

        const reassignData = {
            RequestId: task?._id || task?.id,
            technicianId: selectedTechnician,
            action: "Re-assign"
        };
        await UpdateAssignTechnician(reassignData)
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0  flex items-center justify-center z-[900] animate-in fade-in duration-200 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <FaUserEdit size={20} className="text-yellow-500" />
                            Reassign Task
                        </h4>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Task Info */}
                    <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-medium">Task:</span>
                            <span className="text-slate-700 dark:text-slate-200">
                                #{task?.Ref || task?.ref || "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
                            <span className="font-medium">Description:</span>
                            <span className="text-slate-700 dark:text-slate-200 text-xs truncate max-w-[200px]">
                                {task?.Description || task?.description || "No description"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
                            <span className="font-medium">Current Assignee:</span>
                            <span className="text-blue-600 dark:text-yellow-400 font-medium">
                                {getCurrentTechnicianDisplay()}
                            </span>
                        </div>
                        {task?.Status && (
                            <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
                                <span className="font-medium">Status:</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${task.Status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    task.Status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        task.Status === 'Assigned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {task.Status}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <FaExclamationTriangle size={14} />
                            {error}
                        </div>
                    )}

                    {/* Select Technician */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Choose New Technician <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedTechnician}
                            onChange={(e) => {
                                setSelectedTechnician(e.target.value);
                                setError('');
                            }}
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                            disabled={isLoadingTechnicians || availableTechnicians.length === 0}
                        >
                            <option value="">Choose a technician...</option>
                            {availableTechnicians.length > 0 ? (
                                availableTechnicians.map((tech) => {
                                    const techId = getTechnicianId(tech);
                                    const fullName = getFullName(tech);
                                    const activeTasks = tech.assignedTasks || tech.activeTasks || 0;
                                    return (
                                        <option key={techId} value={techId}>
                                            {fullName} {activeTasks > 0 ? `(${activeTasks} active tasks)` : ''}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>No other technicians available</option>
                            )}
                        </select>
                        {isLoadingTechnicians && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading technicians...
                            </p>
                        )}
                        {availableTechnicians.length === 0 && !isLoadingTechnicians && (
                            <p className="text-xs text-yellow-500 flex items-center gap-1">
                                <FaExclamationTriangle size={12} />
                                No other technicians available for reassignment
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedTechnician || isReassigning || isLoadingTechnicians || availableTechnicians.length === 0}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${!selectedTechnician || isReassigning || isLoadingTechnicians || availableTechnicians.length === 0
                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isReassigning ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Reassigning...
                                </>
                            ) : (
                                <>
                                    <FaCheck size={18} />
                                    Confirm Reassignment
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReassignModal;