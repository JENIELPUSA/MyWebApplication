// src/components/PMS/BiPSUPMS002App.jsx
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
import { PMS002Context } from "../../contexts/PMS/pmsContext002";

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
// CONSTANTS — LANDSCAPE A4
// ============================================================
const A4_WIDTH_PX = 1123;
const A4_HEIGHT_PX = 794;

const A4_WIDTH_MM = 297;
const A4_HEIGHT_MM = 210;

// Fixed height ng isang data row (px) — base sa CSS (h-[32px])
const ROW_HEIGHT_PX = 32;

// A4 content height (minus 35px top + 35px bottom padding)
const A4_CONTENT_HEIGHT = A4_HEIGHT_PX - 80;

// Fallback rows per page (dynamic ang actual computation)
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
// HELPER — Map isang PMS002 record → table row
// ============================================================
const mapPms002RecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};

    const year = eq?.DateAcquired
        ? String(eq.DateAcquired).slice(0, 4)
        : "";

    return {
        id: record?._id || `row-${index}`,
        rowIndex: index + 1,

        pmsId: record?._id || null,
        equipmentId: eq?._id || null,
        laboratoryId: record?.laboratoryId || null,

        codeNo: eq?.code || "",
        name: eq?.Brand || "",
        dateAcquired: year,

        remarks: record?.remarks || "",

        routineInspection: record?.routineInspection || "",
        lubrication: !!record?.lubrication,
        overhauling: !!record?.overhauling,
        minorAdjustment: !!record?.minorAdjustment,
        replaceWornOutParts: !!record?.replaceWornOutParts,
        repair: !!record?.repair,
        generalRecondition: !!record?.generalRecondition,
        repairPart: !!record?.repairPart,

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
    if (!Array.isArray(allItems) || allItems.length === 0) {
        return [[]];
    }

    const pages = [];
    for (let i = 0; i < allItems.length; i += rowsPerPage) {
        pages.push(allItems.slice(i, i + rowsPerPage));
    }
    return pages;
};

// ============================================================
// PDF PAGE COMPONENT (STATIC RENDER) — LANDSCAPE
// ============================================================
function PMS002PdfPage({
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
                            BiPSU-QAA-PMS-002
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
                            colSpan="8"
                            className="border border-black px-1 py-1"
                        >
                            MAINTENANCE ACTIVITY
                        </th>
                        <th
                            rowSpan="2"
                            className="border border-black px-1 py-1 w-[10%]"
                        >
                            Remarks
                        </th>
                    </tr>
                    <tr className="text-[8px] font-bold text-center">
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            Routine
                            <br />
                            Inspection
                            <br />
                            &amp;
                            <br />
                            Cleaning
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            Lubrication
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            Overhauling
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            Minor
                            <br />
                            Adjustment
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            Replace
                            <br />
                            Worn
                            <br />
                            out
                            <br />
                            Parts
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            Repair
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            General
                            <br />
                            Recondition
                        </th>
                        <th className="border border-black px-0.5 py-1 w-[7%]">
                            Repair
                            <br />
                            Part
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
                            <td className="border border-black px-1 py-1 text-[9px]">
                                {item.routineInspection || ""}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.lubrication ? (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        &#10003;
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.overhauling ? (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        &#10003;
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.minorAdjustment ? (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        &#10003;
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.replaceWornOutParts ? (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        &#10003;
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.repair ? (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        &#10003;
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.generalRecondition ? (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        &#10003;
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.repairPart ? (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        &#10003;
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                            <td className="border border-black px-1 py-1 text-[9px]">
                                {item.remarks || ""}
                            </td>
                        </tr>
                    ))}

                    {Array.from({ length: emptyRowCount }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-[32px]">
                            {Array.from({ length: 11 }).map((_, i) => (
                                <td key={i} className="border border-black" />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* FREQUENCY CODE */}
            <div className="border-x border-b border-black p-2 text-[10px] font-semibold bg-white">
                <div className="mb-1 font-bold">FREQUENCY CODE</div>
                <div className="grid grid-cols-2 gap-x-4">
                    <div>
                        <span className="font-bold">D</span> – Daily
                    </div>
                    <div>
                        <span className="font-bold">SM</span> – Semi-Monthly
                    </div>
                    <div>
                        <span className="font-bold">M</span> – Monthly
                    </div>
                    <div>
                        <span className="font-bold">SA</span> – Semi Annually
                    </div>
                    <div>
                        <span className="font-bold">W</span> – Weekly
                    </div>
                    <div>
                        <span className="font-bold">Q</span> – Quarterly
                    </div>
                    <div className="col-span-2">
                        <span className="font-bold">A</span> – Annually
                    </div>
                </div>
            </div>

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
export default function BiPSUPMS002App() {
    // ========================================================
    // CONTEXT
    // ========================================================
    const { fetchEquipmentByCode } = useContext(EquipmentDataContext);

    const {
        createPMS002,
        updatePMS002,
        deletePMS002,
        fetchMyLaboratory,
        myLaboratory,
        pms002Records,
        loading: pms002Loading,
    } = useContext(PMS002Context);

    // ========================================================
    // STATE
    // ========================================================
    const [officeName, setOfficeName] = useState(DEFAULT_OFFICE_NAME);
    const [items, setItems] = useState([]);
    const [signatures, setSignatures] = useState(DEFAULT_SIGNATURES);

    const [notification, setNotification] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fetchingRowId, setFetchingRowId] = useState(null);

    // ✅ DYNAMIC rows-per-page (kinokompute via DOM measurement)
    const [computedRowsPerPage, setComputedRowsPerPage] = useState(
        DEFAULT_ROWS_PER_PAGE
    );

    // 🔹 DATE FILTER STATE
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

    // ========================================================
    // CONFIRMATION HELPER
    // ========================================================
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

    // ========================================================
    // FETCH LABORATORY ON MOUNT
    // ========================================================
    useEffect(() => {
        if (didFetchLabRef.current) return;
        didFetchLabRef.current = true;

        if (typeof fetchMyLaboratory === "function") {
            fetchMyLaboratory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================================
    // SYNC OFFICE NAME
    // ========================================================
    useEffect(() => {
        if (myLaboratory?.LaboratoryName) {
            setOfficeName(myLaboratory.LaboratoryName);
        }
    }, [myLaboratory]);

    // ========================================================
    // LOAD PMS002 RECORDS → TABLE ROWS
    // ========================================================
    useEffect(() => {
        if (!Array.isArray(pms002Records) || pms002Records.length === 0) {
            setItems([]);
            return;
        }

        const rows = pms002Records.map((rec, idx) =>
            mapPms002RecordToRow(rec, idx)
        );
        setItems(rows);
    }, [pms002Records]);

    // ========================================================
    // CLEANUP DEBOUNCE TIMERS + TOAST TIMER
    // ========================================================
    useEffect(() => {
        const timers = debounceRef.current;
        return () => {
            Object.values(timers).forEach((t) => clearTimeout(t));
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    // ========================================================
    // DYNAMIC ROWS-PER-PAGE MEASUREMENT
    // ========================================================
    useEffect(() => {
        const measureRowsPerPage = () => {
            const firstPage = pdfContainerRef.current?.querySelector(
                ".pdf-page"
            );
            if (!firstPage) return;

            const header = firstPage.querySelector("header");
            const mainTable = firstPage.querySelector("table");
            const freqBlock = firstPage.querySelector(
                ".border-x.border-b.border-black.p-2"
            );
            const signatureBlock = firstPage.querySelector(
                ".mt-6.grid.grid-cols-3"
            );

            if (!header || !mainTable || !freqBlock || !signatureBlock) {
                return;
            }

            const headerH = header.getBoundingClientRect().height;
            const freqH = freqBlock.getBoundingClientRect().height;
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

            const gaps =
                20 + // mt-5 sa office section
                12 + // mb-3
                24; // mt-6 sa signature

            const totalFixed =
                headerH + theadH + freqH + signatureH + gaps;

            const availableForRows = A4_CONTENT_HEIGHT - totalFixed;
            const rowsFit = Math.max(
                1,
                Math.floor(availableForRows / rowH)
            );

            if (import.meta.env.DEV) {
                console.log("📐 A4 measurement (PMS002):", {
                    headerH,
                    theadH,
                    freqH,
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
    }, [items.length, officeName, signatures]);

    // ========================================================
    // NOTIFICATION
    // ========================================================
    const showToast = useCallback((message) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setNotification(message);
        toastTimerRef.current = setTimeout(
            () => setNotification(null),
            3000
        );
    }, []);

    // ========================================================
    // 🗓️ DATE FILTER HANDLERS
    // ========================================================
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

    // ========================================================
    // AUTO-FETCH EQUIPMENT BY CODE
    // ========================================================
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

    // ========================================================
    // HANDLE CODE CHANGE (debounced)
    // ========================================================
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

    // ========================================================
    // HANDLE CODE BLUR (immediate)
    // ========================================================
    const handleCodeBlur = (rowId, value) => {
        if (debounceRef.current[rowId]) {
            clearTimeout(debounceRef.current[rowId]);
            delete debounceRef.current[rowId];
        }
        lookupEquipmentByCode(rowId, value);
    };

    // ========================================================
    // ADD ROW
    // ========================================================
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
            remarks: "",

            routineInspection: "",
            lubrication: false,
            overhauling: false,
            minorAdjustment: false,
            replaceWornOutParts: false,
            repair: false,
            generalRecondition: false,
            repairPart: false,

            isNew: true,
            autoFilled: false,
        };

        setItems((prev) => [...prev, newItem]);
        showToast("New equipment row added. Fill in and press Save.");
    };

    // ========================================================
    // DELETE ROW
    // ========================================================
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
                const res = await deletePMS002(target.pmsId);
                if (!res?.success) {
                    showToast(
                        res?.error || "Failed to delete PMS002 record."
                    );
                    return;
                }
            } catch (err) {
                console.error("deletePMS002 error:", err);
                showToast("Failed to delete PMS002 record.");
                return;
            }
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
        showToast("Equipment row removed.");
    };

    // ========================================================
    // SAVE ROW
    // ========================================================
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

            routineInspection: itemToSave.routineInspection || "",
            lubrication: !!itemToSave.lubrication,
            overhauling: !!itemToSave.overhauling,
            minorAdjustment: !!itemToSave.minorAdjustment,
            replaceWornOutParts: !!itemToSave.replaceWornOutParts,
            repair: !!itemToSave.repair,
            generalRecondition: !!itemToSave.generalRecondition,
            repairPart: !!itemToSave.repairPart,
            remarks: itemToSave.remarks || "",
        };

        if (import.meta.env.DEV) {
            console.log("💾 handleSaveRow (PMS002) PAYLOAD:", payload);
        }

        try {
            let res;

            if (itemToSave.pmsId) {
                res = await updatePMS002(itemToSave.pmsId, payload);
            } else {
                res = await createPMS002(payload);
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

    // ========================================================
    // ITEM CHANGE
    // ========================================================
    const handleItemChange = (id, field, value) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                return { ...item, [field]: value };
            })
        );
    };

    // ========================================================
    // SIGNATURE CHANGE
    // ========================================================
    const handleSignatureChange = (field, value) => {
        setSignatures((prev) => ({ ...prev, [field]: value }));
    };

    // ========================================================
    // PRINT
    // ========================================================
    const handlePrint = () => {
        window.print();
    };

    // ========================================================
    // WAIT FOR IMAGES
    // ========================================================
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

    // ========================================================
    // PDF — MULTI-PAGE (LANDSCAPE)
    // ========================================================
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
                orientation: "landscape",
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

            const safeOffice = (officeName || "PMS002")
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "_");

            const fileName = `PMS002_${safeOffice}_${Date.now()}.pdf`;

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

    // ========================================================
    // COMPUTE PAGES — gamit ang DYNAMIC rowsPerPage
    // ========================================================
    const pdfPages = chunkItemsIntoPages(items, computedRowsPerPage);
    const totalPdfPages = pdfPages.length;

    // ========================================================
    // JSX
    // ========================================================
    return (
        <>
            <style>{`
                @page { size: A4 landscape; margin: 0; }
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

                /* ============================================
                   SCROLLABLE TABLE
                   ============================================ */
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

                /* ============================================
                   PRINT STYLES
                   ============================================ */
                @media print {
                    html, body {
                        width: 297mm;
                        height: 210mm;
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
                        width: 297mm !important;
                        height: 210mm !important;
                        min-height: 210mm !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        background: white !important;
                    }
                    .print-form {
                        width: 297mm !important;
                        height: 210mm !important;
                        min-height: 210mm !important;
                        max-height: 210mm !important;
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
                        computedRowsPerPage - pageItems.length
                    );

                    return (
                        <PMS002PdfPage
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

                {/* ============================================ */}
                {/* TOOLBAR — Actions + Filter                  */}
                {/* ============================================ */}
                <div className="no-print mb-6 w-full max-w-[1123px] bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                    {/* Row 1: Title + Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">
                                    Periodic Maintenance System (PMS-002)
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Equipment & Tool History File — Landscape
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

                    {/* Row 2: Date Filter */}
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
                            disabled={isFiltering || pms002Loading}
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
                            disabled={isFiltering || pms002Loading}
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
                            disabled={isFiltering || pms002Loading}
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

                    {/* Row 3: Page Info */}
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between flex-wrap gap-2">
                        <span>
                            📄 {items.length} row{items.length !== 1 ? "s" : ""} sa table
                            <span className="text-slate-400 ml-1">
                                (max {computedRowsPerPage}/page)
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

                {/* ============================================ */}
                {/* VISIBLE FORM — LANDSCAPE                     */}
                {/* ============================================ */}
                <div
                    ref={formRef}
                    className="print-form bg-white w-[1123px] h-[794px] min-h-[794px] max-h-[794px] p-[35px] border border-slate-400 shadow-xl text-black flex flex-col"
                >
                    {/* HEADER — fixed */}
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
                                    BiPSU-QAA-PMS-002
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

                    {/* SCHOOL/OFFICE — fixed */}
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

                    {/* ============================================ */}
                    {/* SCROLLABLE TABLE                             */}
                    {/* ============================================ */}
                    <div className="history-table-scroll flex-1 min-h-0">
                        <table className="w-full table-fixed">
                            <thead>
                                {/* FIRST HEADER ROW */}
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
                                        colSpan="8"
                                        className="border border-black px-1 py-1 sticky top-0 bg-white z-[22]"
                                    >
                                        MAINTENANCE ACTIVITY
                                    </th>
                                    <th
                                        rowSpan="2"
                                        className="border border-black px-1 py-1 w-[10%] sticky top-0 bg-white z-[23]"
                                    >
                                        Remarks
                                    </th>
                                    <th
                                        rowSpan="2"
                                        className="no-print-column border border-black px-1 py-1 w-[6%] sticky top-0 bg-white z-[23]"
                                    >
                                        Action
                                    </th>
                                </tr>

                                {/* SECOND HEADER ROW */}
                                <tr className="text-[8px] font-bold text-center">
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        Routine
                                        <br />
                                        Inspection
                                        <br />
                                        &amp;
                                        <br />
                                        Cleaning
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        Lubrication
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        Overhauling
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        Minor
                                        <br />
                                        Adjustment
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        Replace
                                        <br />
                                        Worn
                                        <br />
                                        out
                                        <br />
                                        Parts
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        Repair
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        General
                                        <br />
                                        Recondition
                                    </th>
                                    <th className="border border-black px-0.5 py-1 w-[7%] sticky top-[26px] bg-white z-[21]">
                                        Repair
                                        <br />
                                        Part
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {/* EMPTY STATE */}
                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={12}
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
                                        {/* CODE */}
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

                                        {/* NAME */}
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

                                        {/* ROUTINE INSPECTION */}
                                        <td className="border border-black p-0">
                                            <input
                                                type="text"
                                                value={
                                                    item.routineInspection ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "routineInspection",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-[32px] text-center text-[9px] outline-none bg-transparent"
                                            />
                                        </td>

                                        {/* LUBRICATION */}
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

                                        {/* OVERHAULING */}
                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={!!item.overhauling}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "overhauling",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        {/* MINOR ADJUSTMENT */}
                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    !!item.minorAdjustment
                                                }
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

                                        {/* REPLACE WORN OUT PARTS */}
                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    !!item.replaceWornOutParts
                                                }
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "replaceWornOutParts",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        {/* REPAIR */}
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

                                        {/* GENERAL RECONDITION */}
                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    !!item.generalRecondition
                                                }
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "generalRecondition",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        {/* REPAIR PART */}
                                        <td className="border border-black p-0">
                                            <input
                                                type="checkbox"
                                                checked={!!item.repairPart}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "repairPart",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </td>

                                        {/* REMARKS */}
                                        <td className="border border-black p-0">
                                            <input
                                                type="text"
                                                value={item.remarks}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "remarks",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-[32px] text-center text-[9px] outline-none bg-transparent px-1"
                                            />
                                        </td>

                                        {/* ACTION */}
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

                                {/* DEFAULT EMPTY ROWS */}
                                {items.length < computedRowsPerPage &&
                                    Array.from({
                                        length:
                                            computedRowsPerPage -
                                            items.length,
                                    }).map((_, index) => (
                                        <tr
                                            key={`empty-${index}`}
                                            className="h-[32px]"
                                        >
                                            {Array.from({
                                                length: 11,
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

                    {/* ============================================ */}
                    {/* FREQUENCY CODE — fixed sa ibaba             */}
                    {/* ============================================ */}
                    <div className="border-x border-b border-black p-2 text-[10px] font-semibold bg-white shrink-0">
                        <div className="mb-1 font-bold">FREQUENCY CODE</div>
                        <div className="grid grid-cols-2 gap-x-4">
                            <div>
                                <span className="font-bold">D</span> – Daily
                            </div>
                            <div>
                                <span className="font-bold">SM</span> – Semi-Monthly
                            </div>
                            <div>
                                <span className="font-bold">M</span> – Monthly
                            </div>
                            <div>
                                <span className="font-bold">SA</span> – Semi Annually
                            </div>
                            <div>
                                <span className="font-bold">W</span> – Weekly
                            </div>
                            <div>
                                <span className="font-bold">Q</span> – Quarterly
                            </div>
                            <div className="col-span-2">
                                <span className="font-bold">A</span> – Annually
                            </div>
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* SIGNATURES — fixed sa ibaba                 */}
                    {/* ============================================ */}
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