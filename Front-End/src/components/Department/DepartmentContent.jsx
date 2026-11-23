// src/components/DepartmentContent/DepartmentContent.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import DepartmentTables from './DepartmentTables';
import axios from 'axios';
import { FaBuilding } from 'react-icons/fa';

// ============================================================
// API CONFIG
// ============================================================
// Gumamit ng environment variable. Fallback sa localhost para sa dev.
// Sa .env file: VITE_API_URL=http://127.0.0.1:3000
const API_BASE =
    (typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.VITE_API_URL) ||
    'http://127.0.0.1:3000';

// Optional: gumawa ng axios instance para consistent ang baseURL at headers
const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000, // 15s timeout — hindi mag-hang forever
});

function DepartmentContent() {
    const [department, setDepartment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [departmentPerPage, setDepartmentsPerPage] = useState(6);

    // Ref para ma-cancel ang lumang request kapag may bago
    const abortRef = useRef(null);

    // ============================================================
    // FETCH DATA
    // ============================================================
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');

        // Kung walang token, hindi na mag-request — clear agad
        if (!token) {
            setDepartment([]);
            setError(new Error('Walang token. Mag-login muna.'));
            setLoading(false);
            return;
        }

        // Cancel previous request kung meron
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const res = await api.get('/api/v1/departments', {
                params: {
                    page: currentPage,
                    limit: departmentPerPage,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
            });

            // Safe extraction — hindi mag-crash kung null/undefined
            const data = res?.data?.data;
            setDepartment(Array.isArray(data) ? data : []);
        } catch (err) {
            // Huwag i-set ang error kung na-cancel lang
            if (axios.isCancel(err) || err.name === 'CanceledError') {
                return;
            }

            // Mas detalyadong error message
            const status = err.response?.status;
            const serverMsg = err.response?.data?.message;
            const url = err.config?.url || '/api/v1/departments';

            console.error('Error fetching data:', {
                url,
                status,
                message: err.message,
                serverMsg,
                fullError: err,
            });

            // Gumawa ng bagong Error object na may readable message
            const readable = new Error(
                serverMsg ||
                    (status
                        ? `HTTP ${status} — ${err.message}`
                        : `Network Error — hindi maabot ang ${API_BASE}${url}. ` +
                          `Siguraduhing tumatakbo ang backend at tama ang CORS.`)
            );
            readable.original = err;
            readable.status = status;
            setError(readable);
            setDepartment([]);
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [currentPage, departmentPerPage]);

    // ============================================================
    // EFFECTS
    // ============================================================
    useEffect(() => {
        fetchData();

        // Cleanup: cancel request kapag unmount o bago mag-fetch ulit
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [fetchData]);

    // ============================================================
    // DELETE
    // ============================================================
    const handleDelete = async (departmentId) => {
        if (!departmentId) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Walang token. Mag-login muna.');
            return;
        }

        if (
            !window.confirm(
                'Are you sure you want to delete this department?'
            )
        ) {
            return;
        }

        try {
            await api.delete(`/api/v1/departments/${departmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Optimistic update
            setDepartment((prev) =>
                prev.filter((depart) => depart._id !== departmentId)
            );
        } catch (err) {
            const status = err.response?.status;
            const serverMsg = err.response?.data?.message;
            console.error('Error deleting department:', {
                status,
                message: err.message,
                serverMsg,
                fullError: err,
            });
            alert(
                serverMsg ||
                    (status
                        ? `HTTP ${status} — ${err.message}`
                        : `Network Error — hindi maabot ang ${API_BASE}.`)
            );
        }
    };

    // ============================================================
    // DERIVED
    // ============================================================
    const filteredDepartment = React.useMemo(() => {
        // Safe kahit anong shape ng `department`
        const list = Array.isArray(department) ? department : [];
        const q = searchTerm.trim().toLowerCase();
        if (!q) return list;
        return list.filter(
            (depart) =>
                depart?.DepartmentName &&
                String(depart.DepartmentName).toLowerCase().includes(q)
        );
    }, [department, searchTerm]);

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* HEADER (optional — kung may search bar ka, ilagay dito) */}
            {/* <div className="flex-shrink-0 px-6 py-3 border-b bg-white">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search department..."
                    className="border rounded px-3 py-1.5 text-sm"
                />
            </div> */}

            <div className="flex-1 overflow-hidden p-6">
                <DepartmentTables
                    department={filteredDepartment}
                    loading={loading}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    departmentPerPage={departmentPerPage}
                    onDeleteDepartment={handleDelete}
                />
            </div>

            {/* ERROR DISPLAY */}
            {error && (
                <div className="flex-shrink-0 px-6 py-2 bg-red-50 border-t border-red-200">
                    <div className="flex items-start gap-2">
                        <FaBuilding className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-600">
                            <p>
                                <strong>Error:</strong>{' '}
                                {error.response?.data?.message ||
                                    error.message}
                            </p>
                            {error.status && (
                                <p className="text-xs text-red-500 mt-0.5">
                                    Status: {error.status} · API:{' '}
                                    {API_BASE}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DepartmentContent;