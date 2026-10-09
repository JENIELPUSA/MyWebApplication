import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Save, Loader2, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import { MaintenanceRecordContext } from "../../contexts/PMSMaintenanceRecord/PMSMaintenanceRecord";

function MaintenanceRecord({
    isOpen = true,
    onClose,
    toLab,
    toEquip,
    laboratory,
    equipment,
}) {
    const location = useLocation();

    const labData =
        toLab || laboratory || location.state?.selectedAssignEquipment || {};
    const equipData = toEquip || equipment || null;

    const {
        AddMaintenanceRecord,
        FetchSingleMaintenanceRecord,
        UpdateMaintenanceRecord,
        loading: contextLoading,
    } = useContext(MaintenanceRecordContext);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);

    // History records mula sa backend
    const [reports, setReports] = useState([]);

    // ============================================
    // PAGINATION STATE
    // ============================================
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // ============================================
    // EDIT MODAL STATE
    // ============================================
    const [editingRecord, setEditingRecord] = useState(null);
    const [editForm, setEditForm] = useState({
        code: "",
        inspection: false,
        lubrication: false,
        overhauling: false,
        replaceWornOutParts: false,
        generalRecondition: false,
        repairParts: false,
        adjustment: false,
        repair: false,
        remarks: "",
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    const toastTimerRef = useRef(null);

    // ============================================
    // FORM STATE — ito ang sine-save
    // ============================================
    const [form, setForm] = useState({
        date: new Date().toISOString().split("T")[0],
        code: "",
        serialNo: equipData?.SerialNumber || "",
        equipmentName: `${equipData?.Brand || ""} ${equipData?.Specification || ""}`.trim(),
        inspection: false,
        lubrication: false,
        overhauling: false,
        replaceWornOutParts: false,
        generalRecondition: false,
        repairParts: false,
        adjustment: false,
        repair: false,
        remarks: "",
    });

    const [selectedEquipment, setSelectedEquipment] = useState(equipData || null);

    // ============================================
    // SYNC FORM KAPAG NAGBAGO ANG equipment PROP
    // ============================================
    useEffect(() => {
        if (equipData) {
            setSelectedEquipment(equipData);
            setForm((prev) => ({
                ...prev,
                serialNo: equipData.SerialNumber || prev.serialNo,
                equipmentName:
                    `${equipData.Brand || ""} ${equipData.Specification || ""}`.trim() ||
                    prev.equipmentName,
            }));
        }
    }, [equipData]);

    // ============================================
    // FETCH HISTORY NG EQUIPMENT
    // ============================================
    useEffect(() => {
        let isMounted = true;

        const fetchRecord = async () => {
            if (!equipData?._id) return;

            try {
                const data = await FetchSingleMaintenanceRecord(equipData._id);
                if (!isMounted) return;

                if (Array.isArray(data)) {
                    setReports(data);
                } else if (data) {
                    setReports([data]);
                } else {
                    setReports([]);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("FetchSingleMaintenanceRecord error:", err);
                    setReports([]);
                }
            }
        };

        fetchRecord();

        return () => {
            isMounted = false;
        };
    }, [equipData?._id, FetchSingleMaintenanceRecord]);

    // ============================================
    // CLEANUP TIMER
    // ============================================
    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    // ============================================
    // HELPERS
    // ============================================
    const showSuccess = useCallback((msg, duration = 2500) => {
        setSuccess(msg);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setSuccess(""), duration);
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // ============================================
    // RESET FORM AFTER SAVE
    // ============================================
    const resetForm = () => {
        setForm((prev) => ({
            ...prev,
            code: "",
            inspection: false,
            lubrication: false,
            overhauling: false,
            replaceWornOutParts: false,
            generalRecondition: false,
            repairParts: false,
            adjustment: false,
            repair: false,
            remarks: "",
        }));
    };

    // ============================================
    // PAGINATION LOGIC
    // ============================================
    const totalPages = Math.ceil(reports.length / rowsPerPage) || 1;

    const paginatedReports = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return reports.slice(start, end);
    }, [reports, currentPage, rowsPerPage]);

    // Reset to page 1 kapag nagbago ang reports o rowsPerPage
    useEffect(() => {
        setCurrentPage(1);
    }, [reports.length, rowsPerPage]);

    // Clamp currentPage kung lumampas sa totalPages
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
    };

    // ============================================
    // REFRESH HISTORY
    // ============================================
    const refreshHistory = async () => {
        if (!equipData?._id) return;
        try {
            const data = await FetchSingleMaintenanceRecord(equipData._id);
            if (Array.isArray(data)) {
                setReports(data);
            } else if (data) {
                setReports([data]);
            } else {
                setReports([]);
            }
        } catch (err) {
            console.error("refreshHistory error:", err);
        }
    };

    // ============================================
    // OPEN EDIT MODAL
    // ============================================
    const handleOpenEdit = (record) => {
        setEditingRecord(record);
        setEditForm({
            code: record.code || "",
            inspection: !!record.RoutineInspectionCleaning,
            lubrication: !!record.Lubrication,
            overhauling: !!record.Overhauling,
            replaceWornOutParts: !!record.Replace_worn_out_parts,
            generalRecondition: !!record.General_Recondition,
            repairParts: !!record.RepairParts,
            adjustment: !!record.MinorAdjustment,
            repair: !!record.Repair,
            remarks: record.remarks || "",
        });
        setEditError("");
    };

    // ============================================
    // CLOSE EDIT MODAL
    // ============================================
    const handleCloseEdit = () => {
        setEditingRecord(null);
        setEditError("");
    };

    // ============================================
    // HANDLE EDIT FORM CHANGE
    // ============================================
    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    // ============================================
    // SAVE EDIT (UPDATE)
    // ============================================
    const handleUpdateSave = async () => {
        if (
            !editForm.inspection &&
            !editForm.lubrication &&
            !editForm.overhauling &&
            !editForm.replaceWornOutParts &&
            !editForm.generalRecondition &&
            !editForm.repairParts &&
            !editForm.adjustment &&
            !editForm.repair
        ) {
            setEditError("Please select at least one Work Performed.");
            return;
        }

        if (!editingRecord?._id) {
            setEditError("No record selected for update.");
            return;
        }

        const payload = {
            code: editForm.code,
            Lubrication: !!editForm.lubrication,
            Overhauling: !!editForm.overhauling,
            Replace_worn_out_parts: !!editForm.replaceWornOutParts,
            General_Recondition: !!editForm.generalRecondition,
            RepairParts: !!editForm.repairParts,
            MinorAdjustment: !!editForm.adjustment,
            Repair: !!editForm.repair,
            RoutineInspectionCleaning: !!editForm.inspection,
            remarks: editForm.remarks,
        };

        console.log("📤 Update payload:", editingRecord._id, payload);

        try {
            setEditLoading(true);
            setEditError("");

            const result = await UpdateMaintenanceRecord(editingRecord._id, payload);

            if (result?.success === true) {
                showSuccess("Maintenance record updated successfully!", 3000);
                setShowToast(true);

                handleCloseEdit();
                await refreshHistory();

                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => {
                    setShowToast(false);
                }, 3000);
            } else {
                setEditError(result?.error || "Failed to update record.");
            }
        } catch (err) {
            console.error("❌ Update error:", err);
            setEditError(
                err.response?.data?.message || "Failed to update record."
            );
        } finally {
            setEditLoading(false);
        }
    };

    // ============================================
    // SAVE — deretso mula sa INPUT FIELDS
    // ============================================
    const handleSave = async () => {
        // Validation
        if (!form.serialNo.trim()) {
            setError("Serial No. is required.");
            return;
        }

        if (
            !form.inspection &&
            !form.lubrication &&
            !form.overhauling &&
            !form.replaceWornOutParts &&
            !form.generalRecondition &&
            !form.repairParts &&
            !form.adjustment &&
            !form.repair
        ) {
            setError("Please select at least one Work Performed.");
            return;
        }

        const equipId = selectedEquipment?._id || equipData?._id || null;

        if (!equipId) {
            setError("No equipment selected.");
            return;
        }

        const payload = {
            code: form.code,
            EquipmentId: equipId,
            Lubrication: !!form.lubrication,
            Overhauling: !!form.overhauling,
            Replace_worn_out_parts: !!form.replaceWornOutParts,
            General_Recondition: !!form.generalRecondition,
            RepairParts: !!form.repairParts,
            MinorAdjustment: !!form.adjustment,
            Repair: !!form.repair,
            RoutineInspectionCleaning: !!form.inspection,
            remarks: form.remarks,
        };

        console.log("📤 Payload sent to backend:", payload);

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const result = await AddMaintenanceRecord(payload);

            if (result?.success === true) {
                showSuccess("Maintenance record saved successfully!", 3000);
                setShowToast(true);

                // Reset checkboxes
                resetForm();

                // Re-fetch history para makita agad ang bagong record
                await refreshHistory();

                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => {
                    setShowToast(false);
                }, 3000);
            } else {
                setError(result?.error || "Failed to save record.");
            }
        } catch (err) {
            console.error("❌ Save error:", err);
            setError(
                err.response?.data?.message || "Failed to save record."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-full font-['Poppins'] text-slate-900">
            {/* TOAST */}
            {showToast && (
                <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
                    <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-lg shadow-2xl border-l-4 border-green-800 min-w-[300px]">
                        <CheckCircle className="w-6 h-6 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold text-sm">Success!</p>
                            <p className="text-xs text-green-100">
                                Maintenance record saved successfully.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="text-white/70 hover:text-white text-lg font-bold leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* EDIT MODAL                                    */}
            {/* ============================================ */}
            {editingRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border-2 border-blue-500 my-8">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-blue-500 bg-blue-50 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Pencil className="w-4 h-4 text-blue-700" />
                                <h3 className="text-sm font-black text-blue-800 uppercase tracking-wider">
                                    Edit Maintenance Record
                                </h3>
                            </div>
                            <button
                                onClick={handleCloseEdit}
                                className="text-slate-500 hover:text-slate-800 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 max-h-[70vh] overflow-y-auto">
                            {/* Record info */}
                            <div className="mb-4 bg-slate-50 border border-slate-200 rounded p-3 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-slate-500">Date:</span>{" "}
                                        <span className="font-bold">
                                            {editingRecord.createdAt
                                                ? new Date(editingRecord.createdAt).toLocaleDateString()
                                                : "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Serial No.:</span>{" "}
                                        <span className="font-bold">
                                            {editingRecord.EquipmentInfo?.SerialNumber ||
                                                editingRecord.EquipmentId?.SerialNumber ||
                                                "-"}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500">Equipment:</span>{" "}
                                        <span className="font-bold">
                                            {`${editingRecord.EquipmentInfo?.Brand || editingRecord.EquipmentId?.Brand || ""} ${editingRecord.EquipmentInfo?.Specification || editingRecord.EquipmentId?.Specification || ""}`.trim() || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Code */}
                            <div className="mb-4">
                                <label className="text-[10px] font-bold text-slate-600 uppercase">
                                    Code
                                </label>
                                <input
                                    type="text"
                                    value={editForm.code}
                                    onChange={(e) => handleEditChange("code", e.target.value)}
                                    placeholder="e.g., MR-2025-001"
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs mt-1"
                                />
                            </div>

                            {/* Work Performed checkboxes */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 uppercase">
                                    Work Performed
                                </label>
                                <div className="mt-2 flex flex-wrap gap-4 bg-white border border-slate-300 rounded px-3 py-2">
                                    {[
                                        { key: "inspection", label: "Insp/Clean" },
                                        { key: "lubrication", label: "Lubrication" },
                                        { key: "overhauling", label: "Overhauling" },
                                        { key: "replaceWornOutParts", label: "Replace Worn-out Parts" },
                                        { key: "generalRecondition", label: "General Recondition" },
                                        { key: "repairParts", label: "Repair Parts" },
                                        { key: "adjustment", label: "Adjustment" },
                                        { key: "repair", label: "Repair" },
                                    ].map(({ key, label }) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={editForm[key]}
                                                onChange={(e) => handleEditChange(key, e.target.checked)}
                                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="mt-4">
                                <label className="text-[10px] font-bold text-slate-600 uppercase">
                                    Remarks
                                </label>
                                <textarea
                                    value={editForm.remarks}
                                    onChange={(e) => handleEditChange("remarks", e.target.value)}
                                    rows={3}
                                    placeholder="Optional notes…"
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs mt-1 resize-none"
                                />
                            </div>

                            {/* Edit error */}
                            {editError && (
                                <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded text-xs">
                                    <AlertCircle className="w-4 h-4" /> {editError}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                            <button
                                onClick={handleCloseEdit}
                                className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSave}
                                disabled={editLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {editLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {editLoading ? "Updating…" : "Update Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SELECTED EQUIPMENT SUMMARY */}
            {selectedEquipment && (
                <div className="mt-4 border-2 border-blue-300 bg-blue-50 rounded-lg p-3">
                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-wider mb-1">
                        Selected Equipment
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                            <span className="text-slate-500">Serial No.:</span>{" "}
                            <span className="font-bold">
                                {selectedEquipment.SerialNumber || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Brand:</span>{" "}
                            <span className="font-bold">
                                {selectedEquipment.Brand || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Specification:</span>{" "}
                            <span className="font-bold">
                                {selectedEquipment.Specification || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Category:</span>{" "}
                            <span className="font-bold">
                                {selectedEquipment.categoryName ||
                                    selectedEquipment.Category ||
                                    "-"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERTS */}
            {success && !showToast && (
                <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded text-xs">
                    <CheckCircle className="w-4 h-4" /> {success}
                </div>
            )}
            {error && (
                <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded text-xs">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* ============================================ */}
            {/* INPUT FORM — ito ang sine-save                */}
            {/* ============================================ */}
            <div className="mt-6 border-2 border-dashed border-blue-400 rounded-lg p-4 bg-blue-50/40">
                <p className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">
                    Add Maintenance Entry
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">
                            Date
                        </label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => handleChange("date", e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">
                            Serial No.
                        </label>
                        <input
                            type="text"
                            value={form.serialNo}
                            readOnly
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-slate-100 cursor-not-allowed"
                            title="Auto-filled from selected equipment"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">
                            Equipment
                        </label>
                        <input
                            type="text"
                            value={form.equipmentName}
                            readOnly
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-slate-100 cursor-not-allowed"
                            title="Auto-filled from selected equipment"
                        />
                    </div>
                </div>

                {/* Code */}
                <div className="mt-3">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                        Code
                    </label>
                    <input
                        type="text"
                        value={form.code}
                        onChange={(e) => handleChange("code", e.target.value)}
                        placeholder="e.g., MR-2025-001"
                        className="w-full md:w-1/3 border border-slate-300 rounded px-2 py-1 text-xs"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                        Work Performed
                    </label>
                    <div className="mt-2 flex flex-wrap gap-4 bg-white border border-slate-300 rounded px-3 py-2">
                        {[
                            { key: "inspection", label: "Insp/Clean" },
                            { key: "lubrication", label: "Lubrication" },
                            { key: "overhauling", label: "Overhauling" },
                            { key: "replaceWornOutParts", label: "Replace Worn-out Parts" },
                            { key: "generalRecondition", label: "General Recondition" },
                            { key: "repairParts", label: "Repair Parts" },
                            { key: "adjustment", label: "Adjustment" },
                            { key: "repair", label: "Repair" },
                        ].map(({ key, label }) => (
                            <label
                                key={key}
                                className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={form[key]}
                                    onChange={(e) => handleChange(key, e.target.checked)}
                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Remarks */}
                <div className="mt-4">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                        Remarks
                    </label>
                    <textarea
                        value={form.remarks}
                        onChange={(e) => handleChange("remarks", e.target.value)}
                        rows={3}
                        placeholder="Optional notes…"
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs mt-1 resize-none"
                    />
                </div>
            </div>

            {/* ============================================ */}
            {/* HISTORY TABLE                                  */}
            {/* ============================================ */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Maintenance History
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="border border-slate-300 rounded px-1 py-0.5 text-xs bg-white"
                        >
                            {[5, 10, 15, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-slate-800 text-xs">
                        <thead>
                            <tr className="bg-slate-100">
                                <th rowSpan={2} className="border border-slate-800 px-2 py-1 w-[100px]">
                                    Date
                                </th>
                                <th rowSpan={2} className="border border-slate-800 px-2 py-1 w-[100px]">
                                    Code
                                </th>
                                <th rowSpan={2} className="border border-slate-800 px-2 py-1 w-[120px]">
                                    Serial No.
                                </th>
                                <th rowSpan={2} className="border border-slate-800 px-2 py-1 min-w-[180px]">
                                    Equipment
                                </th>
                                <th colSpan={8} className="border border-slate-800 px-2 py-1">
                                    WORK PERFORMED
                                </th>
                                <th rowSpan={2} className="border border-slate-800 px-2 py-1 min-w-[150px]">
                                    Remarks
                                </th>
                                <th rowSpan={2} className="border border-slate-800 px-2 py-1 w-[80px]">
                                    Actions
                                </th>
                            </tr>
                            <tr className="bg-slate-100">
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Insp/Clean</th>
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Lubrication</th>
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Overhauling</th>
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Replace Worn-out</th>
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Gen. Recond.</th>
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Repair Parts</th>
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Adjustment</th>
                                <th className="border border-slate-800 px-1 py-1 text-[10px]">Repair</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contextLoading ? (
                                <tr>
                                    <td colSpan={14} className="text-center py-6 text-slate-400">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        <p className="mt-1 text-xs">Loading maintenance history…</p>
                                    </td>
                                </tr>
                            ) : !Array.isArray(reports) || reports.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="text-center py-6 text-slate-400 italic">
                                        No maintenance records yet.
                                    </td>
                                </tr>
                            ) : (
                                paginatedReports.map((item) => {
                                    const dateStr = item.createdAt
                                        ? new Date(item.createdAt).toLocaleDateString()
                                        : "-";
                                    const serial =
                                        item.EquipmentInfo?.SerialNumber ||
                                        item.EquipmentId?.SerialNumber ||
                                        "-";
                                    const eqName =
                                        `${item.EquipmentInfo?.Brand || item.EquipmentId?.Brand || ""} ${item.EquipmentInfo?.Specification || item.EquipmentId?.Specification || ""
                                            }`.trim() || "-";

                                    return (
                                        <tr key={item._id} className="hover:bg-blue-50/50">
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {dateStr}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.code || "-"}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {serial}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1">
                                                {eqName}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.RoutineInspectionCleaning ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.Lubrication ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.Overhauling ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.Replace_worn_out_parts ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.General_Recondition ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.RepairParts ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.MinorAdjustment ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                {item.Repair ? "✔" : ""}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-[10px]">
                                                {item.remarks || "-"}
                                            </td>
                                            <td className="border border-slate-800 px-2 py-1 text-center">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                    title="Edit record"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ============================================ */}
                {/* PAGINATION CONTROLS                            */}
                {/* ============================================ */}
                {Array.isArray(reports) && reports.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 text-xs">
                        <div className="text-slate-500">
                            Showing{" "}
                            <span className="font-bold text-slate-700">
                                {reports.length === 0
                                    ? 0
                                    : (currentPage - 1) * rowsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-slate-700">
                                {Math.min(currentPage * rowsPerPage, reports.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-slate-700">
                                {reports.length}
                            </span>{" "}
                            records
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    if (totalPages <= 7) return true;
                                    if (page === 1 || page === totalPages) return true;
                                    if (Math.abs(page - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((page, idx, arr) => {
                                    const prev = arr[idx - 1];
                                    const showEllipsis = prev && page - prev > 1;

                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsis && (
                                                <span className="px-1 text-slate-400">…</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-7 h-7 rounded border text-xs font-bold transition-colors ${
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "border-slate-300 hover:bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================ */}
            {/* ACTIONS — deretso Save, walang Add Row        */}
            {/* ============================================ */}
            <div className="mt-6 flex justify-end gap-2">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                        Close
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {loading ? "Saving…" : "Save Record"}
                </button>
            </div>
        </div>
    );
}

export default MaintenanceRecord;