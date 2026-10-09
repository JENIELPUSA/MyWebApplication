// src/components/PMS/BiPSUPMS004App.jsx
import React, {
    useState,
    useRef,
    useCallback,
    useContext,
    useEffect,
} from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import bispulogo from "../../assets/bipsulogo.png";

import { EquipmentDataContext } from "../../contexts/EquipmentContext/EquipmentContext";
import { PMS004Context } from "../../contexts/PMS/pmsContext004";

import {
    Plus,
    Printer,
    FileText,
    Building2,
    AlertCircle,
    Loader2,
    Download,
    Trash2,
    Save,
    X,
    Filter,
    CalendarDays,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const ROW_HEIGHT_PX = 32;

const A4_CONTENT_HEIGHT = A4_HEIGHT_PX - 80;

const DEFAULT_ROWS_PER_PAGE = 10;

// ============================================================
// DEFAULT OFFICE + SIGNATURES (EMPTY)
// ============================================================
const DEFAULT_OFFICE_NAME = "";

const DEFAULT_SIGNATURES = {
    prepared: "",
    attested: "",
    approved: "",
};

// ============================================================
// HELPER — Check mark
// ============================================================
const CheckMark = () => (
    <span
        aria-label="checked"
        style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}
    >
        &#10003;
    </span>
);

// ============================================================
// HELPER — Map isang PMS004 record → table row
// ============================================================
const mapPms004RecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};

    const year = eq?.DateAcquired
        ? String(eq.DateAcquired).slice(0, 4)
        : "";

    let performedByName = "";

    if (record?.performedBy) {
        if (typeof record.performedBy === "string") {
            performedByName = record.performedBy;
        } else {
            performedByName = [
                record.performedBy.FirstName,
                record.performedBy.Middle,
                record.performedBy.LastName,
            ]
                .filter(Boolean)
                .join(" ")
                .trim();
        }
    }

    return {
        id: record?._id || `row-${index}`,
        rowIndex: index + 1,

        pmsId: record?._id || null,
        equipmentId: eq?._id || null,
        laboratoryId: record?.laboratoryId || null,

        codeNo: eq?.code || "",
        name: eq?.Brand || "",
        dateAcquired: year,

        routineInspection: !!record?.routineInspection,
        lubrication: !!record?.lubrication,
        minorAdjustment: !!record?.minorAdjustment,
        repair: !!record?.repair,

        performedBy: performedByName,

        isNew: false,
        autoFilled: true,
    };
};

// ============================================================
// PAGE CHUNKING HELPER
// ============================================================
const chunkItemsIntoPages = (
    allItems,
    rowsPerPage = DEFAULT_ROWS_PER_PAGE
) => {
    const safeRows =
        Number.isFinite(rowsPerPage) && rowsPerPage > 0
            ? rowsPerPage
            : DEFAULT_ROWS_PER_PAGE;

    if (!Array.isArray(allItems) || allItems.length === 0) {
        return [[]];
    }

    const pages = [];
    for (let i = 0; i < allItems.length; i += safeRows) {
        pages.push(allItems.slice(i, i + safeRows));
    }
    return pages;
};

// ============================================================
// PDF PAGE COMPONENT (STATIC RENDER) — PORTRAIT
// ============================================================
function PMS004PdfPage({
    pageItems,
    pageNumber,
    totalPages,
    officeName,
    signatures,
    emptyRowCount = 0,
}) {
    return (
        <div
            className="pdf-page bg-white"
            style={{
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                minWidth: `${A4_WIDTH_PX}px`,
                maxWidth: `${A4_WIDTH_PX}px`,
                minHeight: `${A4_HEIGHT_PX}px`,
                maxHeight: `${A4_HEIGHT_PX}px`,
                padding: "35px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: "#000",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: "#ffffff",
            }}
        >
            {/* HEADER */}
            <header className="border border-black grid grid-cols-12 min-h-[100px]">
                <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                    <img
                        src={bispulogo}
                        alt="BiPSU Logo"
                        crossOrigin="anonymous"
                        className="w-[80px] h-[80px] object-contain mb-1"
                    />
                </div>

                <div className="col-span-6 border-r border-black flex flex-col">
                    <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">
                            Type:
                        </div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">
                            QUALITY MANAGEMENT SYSTEM
                        </div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">
                            PERIODIC MAINTENANCE SYSTEM - FORM
                        </div>
                    </div>
                    <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">
                            Title:
                        </div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">
                            EQUIPMENT/TOOL HISTORY FILE
                        </div>
                    </div>
                </div>

                <div className="col-span-3 flex flex-col text-[9px]">
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">
                            Document No.:
                        </span>
                        <span className="block text-center font-bold text-[10px] leading-tight break-words">
                            BiPSU-QAA-PMS-004
                        </span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                        <span>Page:</span>
                        <span className="font-bold">
                            {pageNumber} of {totalPages}
                        </span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">
                            Effective Date:
                        </span>
                        <span className="block text-center font-bold leading-tight">
                            October 09, 2020
                        </span>
                    </div>
                    <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">
                            Issuance/Revision:
                        </span>
                        <span className="block text-center font-bold leading-tight">
                            02/01
                        </span>
                    </div>
                </div>
            </header>

            {/* SCHOOL/OFFICE */}
            <div className="mt-5 mb-3 flex items-center justify-center gap-1">
                <span className="text-[12px] font-bold">
                    SCHOOL/OFFICE OF
                </span>
                <span
                    className="border-b border-black text-center font-bold text-[12px] px-2"
                    style={{
                        width: `${Math.max(
                            260,
                            (officeName?.length || 0) * 7 + 20
                        )}px`,
                        display: "inline-block",
                        paddingBottom: "4px",
                        minHeight: "16px",
                    }}
                >
                    {officeName || "\u00A0"}
                </span>
            </div>

            {/* MAIN TABLE */}
            <table className="w-full border-collapse border border-black table-fixed">
                <thead>
                    <tr className="text-[9px] font-bold text-center">
                        <th
                            rowSpan="2"
                            className="border border-black px-1 py-1 w-[8%]"
                        >
                            Code
                            <br />
                            No.
                        </th>
                        <th
                            rowSpan="2"
                            className="border border-black px-1 py-1 w-[18%]"
                        >
                            Name of
                            <br />
                            Equipment/Tools
                        </th>
                        <th
                            colSpan="4"
                            className="border border-black px-1 py-1"
                        >
                            MAINTENANCE ACTIVITY
                        </th>
                        <th
                            rowSpan="2"
                            className="border border-black px-1 py-1 w-[16%]"
                        >
                            Performed
                            <br />
                            By
                        </th>
                    </tr>
                    <tr className="text-[8px] font-bold text-center">
                        <th className="border border-black px-0.5 py-1 w-[8%]">
                            Routine
                            <br />
                            Inspection
                            <br />
                            &amp;
                            <br />
                            Cleaning
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[8%]">
                            Lubrication
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[8%]">
                            Minor
                            <br />
                            Adjustment
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[8%]">
                            Repair
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {pageItems.map((item, idx) => (
                        <tr
                            key={item.id || `row-${idx}`}
                            className="text-[9px] text-center h-[32px]"
                        >
                            <td className="border border-black px-1 py-1 text-[9px]">
                                {item.codeNo || ""}
                            </td>
                            <td className="border border-black px-1 py-1 text-[9px]">
                                {item.name || ""}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.routineInspection ? <CheckMark /> : ""}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.lubrication ? <CheckMark /> : ""}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.minorAdjustment ? <CheckMark /> : ""}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.repair ? <CheckMark /> : ""}
                            </td>
                            <td className="border border-black px-1 py-1 text-[9px] break-words">
                                {item.performedBy || ""}
                            </td>
                        </tr>
                    ))}

                    {Array.from({ length: emptyRowCount }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-[32px]">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <td key={i} className="border border-black" />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* SIGNATURES */}
            <div className="mt-6 grid grid-cols-3 gap-8 text-[10px]">
                <div>
                    <div className="mb-6 font-medium">Prepared:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        {signatures.prepared || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-6 font-medium">Attested:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        {signatures.attested || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-6 font-medium">Approved:</div>
                    <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">
                        {signatures.approved || "\u00A0"}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BiPSUPMS004App() {
    const { fetchEquipmentByCode } = useContext(EquipmentDataContext);

    const {
        createPMS004,
        updatePMS004,
        deletePMS004,
        fetchMyLaboratory,
        myLaboratory,
        pms004Records,
        loading: pms004Loading,
        performedByFullName,
    } = useContext(PMS004Context);

    const [officeName, setOfficeName] = useState(DEFAULT_OFFICE_NAME);
    const [items, setItems] = useState([]);
    const [signatures, setSignatures] = useState(DEFAULT_SIGNATURES);

    const [notification, setNotification] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fetchingRowId, setFetchingRowId] = useState(null);

    const [computedRowsPerPage, setComputedRowsPerPage] = useState(
        DEFAULT_ROWS_PER_PAGE
    );

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        onConfirm: null,
        variant: "default",
    });

    const debounceRef = useRef({});
    const formRef = useRef(null);
    const pdfContainerRef = useRef(null);
    const didFetchLabRef = useRef(false);
    const toastTimerRef = useRef(null);

    const confirm = ({
        title = "Confirm",
        message = "Are you sure?",
        confirmText = "Confirm",
        cancelText = "Cancel",
        variant = "default",
    } = {}) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                variant,
                onConfirm: (result) => {
                    setConfirmState((prev) => ({ ...prev, isOpen: false }));
                    resolve(result);
                },
            });
        });
    };

    useEffect(() => {
        if (didFetchLabRef.current) return;
        didFetchLabRef.current = true;

        if (typeof fetchMyLaboratory === "function") {
            fetchMyLaboratory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (myLaboratory?.LaboratoryName) {
            setOfficeName(myLaboratory.LaboratoryName);
        }
    }, [myLaboratory]);

    useEffect(() => {
        if (!Array.isArray(pms004Records) || pms004Records.length === 0) {
            setItems([]);
            return;
        }

        const rows = pms004Records.map((rec, idx) => {
            const row = mapPms004RecordToRow(rec, idx);

            if (!row.performedBy && performedByFullName) {
                row.performedBy = performedByFullName;
            }

            return row;
        });

        setItems(rows);
    }, [pms004Records, performedByFullName]);

    useEffect(() => {
        const timers = debounceRef.current;
        return () => {
            Object.values(timers).forEach((t) => clearTimeout(t));
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    useEffect(() => {
        const measureRowsPerPage = () => {
            const firstPage = pdfContainerRef.current?.querySelector(
                ".pdf-page"
            );
            if (!firstPage) return;

            const header = firstPage.querySelector("header");
            const mainTable = firstPage.querySelector("table");
            const signatureBlock = firstPage.querySelector(
                ".mt-6.grid.grid-cols-3"
            );

            if (!header || !mainTable || !signatureBlock) {
                return;
            }

            const headerH = header.getBoundingClientRect().height;
            const signatureH = signatureBlock.getBoundingClientRect().height;

            const tbodyRows = Array.from(
                mainTable.querySelectorAll("tbody > tr")
            );
            const theadRows = Array.from(
                mainTable.querySelectorAll("thead > tr")
            );

            const theadH = theadRows.reduce(
                (sum, tr) => sum + tr.getBoundingClientRect().height,
                0
            );

            let rowH = ROW_HEIGHT_PX;
            const firstDataRow = tbodyRows.find(
                (tr) => !tr.querySelector("td[colspan]")
            );
            if (firstDataRow) {
                const measured = firstDataRow.getBoundingClientRect().height;
                if (measured > 0) rowH = measured;
            }

            const gaps = 20 + 12 + 24;

            const totalFixed =
                headerH + theadH + signatureH + gaps;

            const availableForRows = A4_CONTENT_HEIGHT - totalFixed;
            const rowsFit = Math.max(
                1,
                Math.floor(availableForRows / rowH)
            );

            if (import.meta.env.DEV) {
                console.log("📐 A4 measurement (PMS004):", {
                    headerH,
                    theadH,
                    signatureH,
                    gaps,
                    totalFixed,
                    availableForRows,
                    rowH,
                    rowsFit,
                });
            }

            setComputedRowsPerPage(rowsFit);
        };

        const timer = setTimeout(measureRowsPerPage, 150);
        return () => clearTimeout(timer);
    }, [
        items.length,
        officeName,
        signatures.prepared,
        signatures.attested,
        signatures.approved,
    ]);

    const showToast = useCallback((message) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setNotification(message);
        toastTimerRef.current = setTimeout(
            () => setNotification(null),
            3000
        );
    }, []);

    const handleApplyFilter = async () => {
        if (!dateFrom && !dateTo && !showAll) {
            setIsFiltering(true);
            await fetchMyLaboratory();
            setIsFiltering(false);
            showToast("No date range selected — no records displayed.");
            return;
        }

        if (showAll) {
            setIsFiltering(true);
            await fetchMyLaboratory({ all: true });
            setIsFiltering(false);
            showToast("Showing all records.");
            return;
        }

        setIsFiltering(true);
        const res = await fetchMyLaboratory({
            from: dateFrom || undefined,
            to: dateTo || undefined,
        });
        setIsFiltering(false);

        if (res?.success) {
            showToast(
                `Filtered: ${dateFrom || "..."} → ${dateTo || "..."}`
            );
        }
    };

    const handleShowAll = async () => {
        setShowAll(true);
        setDateFrom("");
        setDateTo("");
        setIsFiltering(true);
        await fetchMyLaboratory({ all: true });
        setIsFiltering(false);
        showToast("Showing all records.");
    };

    const handleClearFilter = async () => {
        setDateFrom("");
        setDateTo("");
        setShowAll(false);
        setIsFiltering(true);
        await fetchMyLaboratory();
        setIsFiltering(false);
        showToast("Filter cleared.");
    };

    const lookupEquipmentByCode = useCallback(
        async (rowId, code) => {
            const trimmed = (code || "").trim();
            if (trimmed.length < 3) return;

            if (typeof fetchEquipmentByCode !== "function") {
                console.warn(
                    "fetchEquipmentByCode is not available in context."
                );
                return;
            }

            setFetchingRowId(rowId);

            try {
                const result = await fetchEquipmentByCode(trimmed);

                if (import.meta.env.DEV) {
                    console.log("result", result);
                }

                const found =
                    result?.success === true
                        ? result.data
                        : result?.data ?? result;

                if (found && (found.code || found.Brand)) {
                    setItems((prev) =>
                        prev.map((item) => {
                            if (item.id !== rowId) return item;

                            return {
                                ...item,
                                equipmentId: found._id || item.equipmentId,
                                pmsId: item.pmsId,
                                codeNo: found.code || item.codeNo,
                                name:
                                    found.Brand ||
                                    found.name ||
                                    item.name,
                                dateAcquired: found.DateAcquired
                                    ? String(found.DateAcquired).slice(0, 4)
                                    : item.dateAcquired,
                                autoFilled: true,
                            };
                        })
                    );

                    showToast(`Equipment found: ${found.code || trimmed}`);
                } else {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === rowId
                                ? {
                                    ...item,
                                    equipmentId: null,
                                    name: "",
                                    dateAcquired: "",
                                    autoFilled: false,
                                }
                                : item
                        )
                    );
                    showToast(`No equipment found with code: ${trimmed}`);
                }
            } catch (err) {
                console.error("Error fetching equipment by code:", err);
                showToast("Failed to fetch equipment by code.");
            } finally {
                setFetchingRowId(null);
            }
        },
        [fetchEquipmentByCode, showToast]
    );

    const handleCodeChange = (rowId, value) => {
        handleItemChange(rowId, "codeNo", value);

        setItems((prev) =>
            prev.map((item) =>
                item.id === rowId ? { ...item, autoFilled: false } : item
            )
        );

        if (debounceRef.current[rowId]) {
            clearTimeout(debounceRef.current[rowId]);
        }

        debounceRef.current[rowId] = setTimeout(() => {
            lookupEquipmentByCode(rowId, value);
        }, 500);
    };

    const handleCodeBlur = (rowId, value) => {
        if (debounceRef.current[rowId]) {
            clearTimeout(debounceRef.current[rowId]);
            delete debounceRef.current[rowId];
        }
        lookupEquipmentByCode(rowId, value);
    };

    const handleAddRow = () => {
        const newId =
            items.length > 0
                ? Math.max(
                    ...items.map((item) =>
                        typeof item.id === "number" ? item.id : 0
                    )
                ) + 1
                : 1;

        const newItem = {
            id: newId,
            pmsId: null,
            equipmentId: null,
            laboratoryId: null,
            codeNo: "",
            name: "",
            dateAcquired: "",

            routineInspection: false,
            lubrication: false,
            minorAdjustment: false,
            repair: false,

            performedBy: performedByFullName || "",

            isNew: true,
            autoFilled: false,
        };

        setItems((prev) => [...prev, newItem]);
        showToast("New equipment row added. Fill in and press Save.");
    };

    const handleDeleteRow = async (id) => {
        const target = items.find((item) => item.id === id);
        if (!target) return;

        const confirmed = await confirm({
            title: target.pmsId ? "Delete Record" : "Remove Row",
            message: target.pmsId
                ? "Are you sure you want to delete this record? This action cannot be undone."
                : "Are you sure you want to remove this row?",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });

        if (!confirmed) return;

        if (target.pmsId) {
            try {
                const res = await deletePMS004(target.pmsId);
                if (!res?.success) {
                    showToast(
                        res?.error || "Failed to delete PMS004 record."
                    );
                    return;
                }
            } catch (err) {
                console.error("deletePMS004 error:", err);
                showToast("Failed to delete PMS004 record.");
                return;
            }
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
        showToast("Equipment row removed.");
    };

    const handleSaveRow = async (id) => {
        const itemToSave = items.find((item) => item.id === id);

        if (!itemToSave) {
            showToast("Row not found.");
            return;
        }

        const equipmentId = itemToSave.equipmentId || null;

        if (!equipmentId) {
            showToast(
                "Missing equipmentId. Please enter a valid Code No. first."
            );
            return;
        }

        const laboratoryId =
            myLaboratory?.LaboratoryId ??
            myLaboratory?._id ??
            myLaboratory?.laboratoryId ??
            null;

        if (!laboratoryId) {
            showToast(
                "Missing laboratoryId. Please make sure you are assigned to a laboratory."
            );
            return;
        }

        const payload = {
            equipmentId,
            laboratoryId,

            routineInspection: !!itemToSave.routineInspection,
            lubrication: !!itemToSave.lubrication,
            minorAdjustment: !!itemToSave.minorAdjustment,
            repair: !!itemToSave.repair,

            performedBy: itemToSave.performedBy || performedByFullName || "",
        };

        if (import.meta.env.DEV) {
            console.log("💾 handleSaveRow (PMS004) PAYLOAD:", payload);
        }

        try {
            let res;

            if (itemToSave.pmsId) {
                res = await updatePMS004(itemToSave.pmsId, payload);
            } else {
                res = await createPMS004(payload);
            }

            if (res?.success) {
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? {
                                ...item,
                                isNew: false,
                                equipmentId,
                                laboratoryId,
                                pmsId: res?.data?._id || item.pmsId,
                            }
                            : item
                    )
                );
                showToast(
                    itemToSave.pmsId
                        ? "Row updated successfully."
                        : "Row saved successfully."
                );
            } else {
                showToast(res?.error || "Failed to save row.");
            }
        } catch (err) {
            console.error("handleSaveRow error:", err);
            showToast("Failed to save row.");
        }
    };

    const handleItemChange = (id, field, value) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                return { ...item, [field]: value };
            })
        );
    };

    const handleSignatureChange = (field, value) => {
        setSignatures((prev) => ({ ...prev, [field]: value }));
    };

    const handlePrint = () => {
        window.print();
    };

    const waitForImages = (root) => {
        const images = Array.from(root.querySelectorAll("img"));

        return Promise.all(
            images.map((img) => {
                if (img.complete && img.naturalWidth > 0) {
                    return Promise.resolve();
                }

                return new Promise((resolve) => {
                    const done = () => resolve();
                    img.addEventListener("load", done, { once: true });
                    img.addEventListener("error", done, { once: true });
                    setTimeout(done, 4000);
                });
            })
        );
    };

    const handleDownloadPDF = useCallback(async () => {
        if (!pdfContainerRef.current) {
            showToast("PDF container not found.");
            return;
        }

        setIsGenerating(true);

        try {
            const pageNodes = Array.from(
                pdfContainerRef.current.querySelectorAll(".pdf-page")
            );

            if (pageNodes.length === 0) {
                showToast("No pages to export.");
                return;
            }

            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }
            await waitForImages(pdfContainerRef.current);

            await new Promise((resolve) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                });
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            });

            for (let i = 0; i < pageNodes.length; i++) {
                const node = pageNodes[i];

                const canvas = await html2canvas(node, {
                    scale: 2,
                    width: A4_WIDTH_PX,
                    height: A4_HEIGHT_PX,
                    windowWidth: A4_WIDTH_PX,
                    windowHeight: A4_HEIGHT_PX,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    backgroundColor: "#ffffff",
                    useCORS: true,
                    allowTaint: false,
                    imageTimeout: 8000,
                    logging: false,
                });

                const image = canvas.toDataURL("image/png", 1.0);

                if (i > 0) {
                    pdf.addPage();
                }

                pdf.addImage(
                    image,
                    "PNG",
                    0,
                    0,
                    A4_WIDTH_MM,
                    A4_HEIGHT_MM,
                    undefined,
                    "FAST"
                );
            }

            const safeOffice = (officeName || "PMS004")
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "_");

            const fileName = `PMS004_${safeOffice}_${Date.now()}.pdf`;

            pdf.save(fileName);

            showToast(
                `PDF generated successfully (${pageNodes.length} page${pageNodes.length > 1 ? "s" : ""
                }).`
            );
        } catch (error) {
            console.error("PDF generation error:", error);
            showToast("Failed to generate PDF.");
        } finally {
            setIsGenerating(false);
        }
    }, [officeName, showToast]);

    const effectiveRowsPerPage =
        computedRowsPerPage > 0
            ? computedRowsPerPage
            : DEFAULT_ROWS_PER_PAGE;

    const pdfPages = chunkItemsIntoPages(items, effectiveRowsPerPage);
    const totalPdfPages = pdfPages.length;

    return (
        <>
            <style>{`
                @page { size: A4 portrait; margin: 0; }
                html, body { margin: 0; padding: 0; }
                * { box-sizing: border-box; }
                body { background: #f1f5f9; }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-up {
                    animation: slideUp 0.3s ease-out;
                }

                .pdf-render-container {
                    position: fixed;
                    left: -10000px;
                    top: 0;
                    pointer-events: none;
                    z-index: -1;
                }

                .history-table-scroll {
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .history-table-scroll::-webkit-scrollbar {
                    width: 8px;
                }

                .history-table-scroll::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }

                .history-table-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .history-table-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                .history-table-scroll table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                }

                .history-table-scroll th,
                .history-table-scroll td {
                    border: 1px solid #000 !important;
                }

                .history-table-scroll thead th {
                    background-color: #ffffff !important;
                    position: sticky;
                    border: 1px solid #000 !important;
                    box-shadow: 0 1px 0 0 #000;
                }

                .history-table-scroll thead tr:first-child th {
                    top: 0;
                    z-index: 22;
                }

                .history-table-scroll thead tr:last-child th {
                    top: 26px;
                    z-index: 21;
                }

                .history-table-scroll thead tr:first-child th[rowspan="2"] {
                    z-index: 23;
                }

                @media print {
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        background: white !important;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print { display: none !important; }
                    .print-wrapper {
                        width: 210mm !important;
                        height: 297mm !important;
                        min-height: 297mm !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        background: white !important;
                    }
                    .print-form {
                        width: 210mm !important;
                        height: 297mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        border: none !important;
                        box-shadow: none !important;
                        overflow: hidden !important;
                        display: block !important;
                    }
                    .no-print-column { display: none !important; }
                    input {
                        color: #000 !important;
                        background: transparent !important;
                        font-size: 9px !important;
                    }
                    .history-table-scroll {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    .history-table-scroll table {
                        border-collapse: collapse !important;
                    }
                    .history-table-scroll thead th {
                        position: static !important;
                    }
                }
            `}</style>

            {/* HIDDEN PDF RENDER CONTAINER */}
            <div ref={pdfContainerRef} className="pdf-render-container">
                {pdfPages.map((pageItems, idx) => {
                    const emptyRowCount = Math.max(
                        0,
                        effectiveRowsPerPage - pageItems.length
                    );

                    return (
                        <PMS004PdfPage
                            key={`pdf-page-${idx}`}
                            pageItems={pageItems}
                            pageNumber={idx + 1}
                            totalPages={totalPdfPages}
                            officeName={officeName}
                            signatures={signatures}
                            emptyRowCount={emptyRowCount}
                        />
                    );
                })}
            </div>

            <div className="print-wrapper min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center font-sans">
                {notification && (
                    <div className="no-print fixed bottom-5 right-5 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up">
                        <AlertCircle className="w-5 h-5 text-blue-200" />
                        <span className="text-xs font-medium">
                            {notification}
                        </span>
                    </div>
                )}

                {/* TOOLBAR */}
                <div className="no-print mb-6 w-full max-w-[794px] bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">
                                    Periodic Maintenance System (PMS-004)
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Equipment & Tool History File
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                Add Row
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPDF}
                                disabled={isGenerating}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                        {totalPdfPages > 1 && (
                                            <span className="ml-1 bg-emerald-800 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {totalPdfPages}p
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-semibold">
                                Filter by Date:
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <label className="text-[11px] text-slate-600">
                                From:
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setShowAll(false);
                                }}
                                className="text-[11px] border border-slate-300 rounded-md px-2 py-1"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <label className="text-[11px] text-slate-600">
                                To:
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setShowAll(false);
                                }}
                                className="text-[11px] border border-slate-300 rounded-md px-2 py-1"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleApplyFilter}
                            disabled={isFiltering || pms004Loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                            {isFiltering ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Filtering...
                                </>
                            ) : (
                                <>
                                    <CalendarDays className="w-3 h-3" />
                                    Apply
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleShowAll}
                            disabled={isFiltering || pms004Loading}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition disabled:opacity-50 ${showAll
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                }`}
                        >
                            Show All
                        </button>

                        <button
                            type="button"
                            onClick={handleClearFilter}
                            disabled={isFiltering || pms004Loading}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>

                        <span className="text-[10px] text-slate-500 ml-auto">
                            {showAll
                                ? "📋 Showing all records"
                                : dateFrom || dateTo
                                    ? `🔎 ${dateFrom || "..."} → ${dateTo || "..."}`
                                    : "⏳ No filter applied"}
                        </span>
                    </div>

                    {/* Page Info */}
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between flex-wrap gap-2">
                        <span>
                            📄 {items.length} row{items.length !== 1 ? "s" : ""} sa table
                            <span className="text-slate-400 ml-1">
                                (max {effectiveRowsPerPage}/page)
                            </span>
                        </span>
                        <span>
                            {totalPdfPages > 1 ? (
                                <>
                                    <span className="font-semibold text-emerald-700">
                                        {totalPdfPages} pages
                                    </span>{" "}
                                    kapag na-download ang PDF
                                </>
                            ) : (
                                <span className="font-semibold text-slate-700">
                                    1 page lang
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* VISIBLE FORM */}
                <div
                    ref={formRef}
                    className="print-form bg-white w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-[35px] border border-slate-400 shadow-xl text-black flex flex-col"
                >
                    <header className="border border-black grid grid-cols-12 min-h-[100px] shrink-0">
                        <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                            <img
                                src={bispulogo}
                                alt="BiPSU Logo"
                                crossOrigin="anonymous"
                                className="w-[80px] h-[80px] object-contain mb-1"
                            />
                        </div>

                        <div className="col-span-6 border-r border-black flex flex-col">
                            <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                                <div className="text-[8px] leading-tight mb-0.5">
                                    Type:
                                </div>
                                <div className="text-center text-[11px] font-bold leading-tight break-words">
                                    QUALITY MANAGEMENT SYSTEM
                                </div>
                                <div className="text-center text-[11px] font-bold leading-tight break-words">
                                    PERIODIC MAINTENANCE SYSTEM - FORM
                                </div>
                            </div>
                            <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                                <div className="text-[8px] leading-tight mb-0.5">
                                    Title:
                                </div>
                                <div className="text-center text-[11px] font-bold leading-tight break-words">
                                    EQUIPMENT/TOOL HISTORY FILE
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 flex flex-col text-[9px]">
                            <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                <span className="leading-tight">
                                    Document No.:
                                </span>
                                <span className="block text-center font-bold text-[10px] leading-tight break-words">
                                    BiPSU-QAA-PMS-004
                                </span>
                            </div>
                            <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                                <span>Page:</span>
                                <span className="font-bold">
                                    {totalPdfPages > 1
                                        ? `1 of ${totalPdfPages} (view)`
                                        : `1 of ${totalPdfPages}`}
                                </span>
                            </div>
                            <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                <span className="leading-tight">
                                    Effective Date:
                                </span>
                                <span className="block text-center font-bold leading-tight">
                                    October 09, 2020
                                </span>
                            </div>
                            <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                                <span className="leading-tight">
                                    Issuance/Revision:
                                </span>
                                <span className="block text-center font-bold leading-tight">
                                    02/01
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="mt-5 mb-3 flex items-center justify-center gap-1 shrink-0">
                        <Building2 className="no-print w-3 h-3" />
                        <span className="text-[12px] font-bold">
                            SCHOOL/OFFICE OF
                        </span>
                        <input
                            type="text"
                            value={officeName}
                            onChange={(e) => setOfficeName(e.target.value)}
                            style={{
                                width: `${Math.max(
                                    260,
                                    (officeName?.length || 0) * 7 + 20
                                )}px`,
                                paddingBottom: "4px",
                            }}
                            className="border-b border-black outline-none text-center font-bold text-[12px] px-2 bg-transparent"
                        />
                    </div>

                    <div className="history-table-scroll flex-1 min-h-0">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="text-[9px] font-bold text-center">
                                    <th
                                        rowSpan="2"
                                        className="border border-black px-1 py-1 w-[8%] sticky top-0 bg-white z-[23]"
                                    >
                                        Code
                                        <br />
                                        No.
                                    </th>
                                    <th
                                        rowSpan="2"
                                        className="border border-black px-1 py-1 w-[18%] sticky top-0 bg-white z-[23]"
                                    >
                                        Name of
                                        <br />
                                        Equipment/Tools
                                    </th>
                                    <th
                                        colSpan="4"
                                        className="border border-black px-1 py-1 sticky top-0 bg-white z-[22]"
                                    >
                                        MAINTENANCE ACTIVITY
                                    </th>
                                    <th
                                        rowSpan="2"
                                        className="border border-black px-1 py-1 w-[16%] sticky top-0 bg-white z-[23]"
                                    >
                                        Performed
                                        <br />
                                        By
                                    </th>
                                    <th
                                        rowSpan="2"
                                        className="no-print-column border border-black px-1 py-1 w-[5%] sticky top-0 bg-white z-[23]"
                                    >
                                        Action
                                    </th>
                                </tr>

                                <tr className="text-[8px] font-bold text-center">
                                    <th className="border border-black px-0.5 py-1 w-[8%] sticky top-[26px] bg-white z-[21]">
                                        Routine
                                        <br />
                                        Inspection
                                        <br />
                                        &amp;
                                        <br />
                                        Cleaning
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[8%] sticky top-[26px] bg-white z-[21]">
                                        Lubrication
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[8%] sticky top-[26px] bg-white z-[21]">
                                        Minor
                                        <br />
                                        Adjustment
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[8%] sticky top-[26px] bg-white z-[21]">
                                        Repair
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="border border-black text-center text-[10px] italic text-slate-500 h-[32px]"
                                        >
                                            {showAll
                                                ? "No records found."
                                                : dateFrom || dateTo
                                                    ? "No records found for the selected date range."
                                                    : 'Select a date range (From/To) or click "Show All" to display records.'}
                                        </td>
                                    </tr>
                                )}

                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="text-[9px] text-center h-[32px]"
                                    >
                                        <td className="border border-black p-0 relative">
                                            <input
                                                type="text"
                                                value={item.codeNo}
                                                onChange={(e) =>
                                                    handleCodeChange(
                                                        item.id,
                                                        e.target.value
                                                    )
                                                }
                                                onBlur={(e) =>
                                                    handleCodeBlur(
                                                        item.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-[32px] text-center text-[9px] outline-none bg-transparent px-1"
                                            />
                                            {fetchingRowId === item.id && (
                                                <span className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                                </span>
                                            )}
                                        </td>

                                        <td className="border border-black p-0">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                readOnly={item.autoFilled}
                                                title={
                                                    item.autoFilled
                                                        ? "Auto-filled from equipment database"
                                                        : ""
                                                }
                                                className={`w-full h-[32px] text-center text-[9px] outline-none bg-transparent px-1 ${item.autoFilled
                                                        ? "cursor-not-allowed text-slate-700"
                                                        : ""
                                                    }`}
                                            />
                                        </td>

                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={!!item.routineInspection}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "routineInspection",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={!!item.lubrication}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "lubrication",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={!!item.minorAdjustment}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "minorAdjustment",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={!!item.repair}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "repair",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        <td className="border border-black p-0">
                                            <input
                                                type="text"
                                                value={item.performedBy || ""}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "performedBy",
                                                        e.target.value
                                                    )
                                                }
                                                title="Performed By (auto-filled from Encharge)"
                                                className="w-full h-[32px] text-center text-[9px] outline-none bg-transparent px-1"
                                            />
                                        </td>

                                        <td className="no-print-column border border-black p-0 text-center">
                                            <div className="flex items-center justify-center gap-0.5">
                                                {item.isNew && (
                                                    <button
                                                        type="button"
                                                        title="Save"
                                                        onClick={() =>
                                                            handleSaveRow(
                                                                item.id
                                                            )
                                                        }
                                                        className="text-emerald-600 hover:text-emerald-800 p-0.5"
                                                    >
                                                        <Save className="w-3.5 h-3.5 mx-auto" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    onClick={() =>
                                                        handleDeleteRow(
                                                            item.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-800 p-0.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {items.length < effectiveRowsPerPage &&
                                    Array.from({
                                        length:
                                            effectiveRowsPerPage -
                                            items.length,
                                    }).map((_, index) => (
                                        <tr
                                            key={`empty-${index}`}
                                            className="h-[32px]"
                                        >
                                            {Array.from({
                                                length: 7,
                                            }).map((_, i) => (
                                                <td
                                                    key={i}
                                                    className="border border-black"
                                                />
                                            ))}
                                            <td className="no-print-column border border-black" />
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-8 text-[10px] shrink-0">
                        <div>
                            <div className="mb-6 font-medium">Prepared:</div>
                            <input
                                type="text"
                                value={signatures.prepared}
                                onChange={(e) =>
                                    handleSignatureChange(
                                        "prepared",
                                        e.target.value
                                    )
                                }
                                className="w-full border-b border-black text-center outline-none bg-transparent text-[10px] font-bold h-5"
                            />
                        </div>
                        <div>
                            <div className="mb-6 font-medium">Attested:</div>
                            <input
                                type="text"
                                value={signatures.attested}
                                onChange={(e) =>
                                    handleSignatureChange(
                                        "attested",
                                        e.target.value
                                    )
                                }
                                className="w-full border-b border-black text-center outline-none bg-transparent text-[10px] font-bold h-5"
                            />
                        </div>
                        <div>
                            <div className="mb-6 font-medium">Approved:</div>
                            <input
                                type="text"
                                value={signatures.approved}
                                onChange={(e) =>
                                    handleSignatureChange(
                                        "approved",
                                        e.target.value
                                    )
                                }
                                className="w-full border-b border-black text-center outline-none bg-transparent text-[10px] font-bold h-5"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {confirmState.isOpen && (
                <div
                    className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    onClick={() => {
                        if (confirmState.onConfirm) {
                            confirmState.onConfirm(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={`px-5 py-4 border-b border-slate-100 flex items-center gap-3 ${confirmState.variant === "danger"
                                    ? "bg-red-50"
                                    : "bg-blue-50"
                                }`}
                        >
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center ${confirmState.variant === "danger"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                            >
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800">
                                {confirmState.title}
                            </h3>
                        </div>

                        <div className="px-5 py-5">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {confirmState.message}
                            </p>
                        </div>

                        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    confirmState.onConfirm?.(false)
                                }
                                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
                            >
                                {confirmState.cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    confirmState.onConfirm?.(true)
                                }
                                className={`px-4 py-2 rounded-lg text-xs font-medium text-white transition ${confirmState.variant === "danger"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}