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
import { PMS002Context } from "../../contexts/PMS/pmsContext003";

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
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Fallback rows per page (dynamic ang actual computation)
const DEFAULT_ROWS_PER_PAGE = 10;

// Fixed height ng isang data row (px) — base sa CSS (h-[25px])
const ROW_HEIGHT_PX = 25;

// A4 content height (minus 45px top + 45px bottom padding)
const A4_CONTENT_HEIGHT = A4_HEIGHT_PX - 90;

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
// DEFAULT EMPTY EQUIPMENT INFO
// ============================================================
const DEFAULT_EQUIPMENT_INFO = {
    equipmentId: null,
    codeNo: "",
    nameOfEquipment: "",
    maker: "",
    modelType: "",
    serialNo: "",
    location: "",
};

// ============================================================
// DEFAULT EMPTY ITEMS
// ============================================================
const DEFAULT_ITEMS = [];

// ============================================================
// DATE HELPERS
// ============================================================
const toDateInputValue = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const formatDateReadable = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
};

// ============================================================
// HELPER — Map PMS record → row
// ============================================================
const mapPmsRecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};

    return {
        id: record?._id || `row-${index}`,
        pmsId: record?._id || null,
        equipmentId: eq?._id || null,
        laboratoryId: record?.laboratoryId || null,

        codeNo: eq?.code || "",
        name: eq?.Brand || "",
        serialNo: eq?.SerialNumber || "",

        date: toDateInputValue(record?.date),

        routineInspection: record?.routineInspection || "",
        lubrication: !!record?.lubrication,
        overhauling: !!record?.overhauling,
        minorAdjustment: !!record?.minorAdjustment,
        replaceWornOutParts: !!record?.replaceWornOutParts,
        repair: !!record?.repair,
        generalRecondition: !!record?.generalRecondition,
        repairPart: !!record?.repairPart,

        isNew: false,
    };
};

// ============================================================
// WORK FIELDS
// ============================================================
const WORK_FIELDS = [
    "routineInspection",
    "lubrication",
    "overhauling",
    "minorAdjustment",
    "replaceWornOutParts",
    "repair",
    "generalRecondition",
    "repairPart",
];

// ============================================================
// PAGE CHUNKING HELPER
// ============================================================
const chunkItemsIntoPages = (allItems, rowsPerPage = DEFAULT_ROWS_PER_PAGE) => {
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
// PDF PAGE COMPONENT (STATIC RENDER)
// ============================================================
function PMS002PdfPage({
    pageItems,
    pageNumber,
    totalPages,
    equipmentInfo,
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
                padding: "45px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: "#000",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: "#ffffff",
            }}
        >
            {/* HEADER */}
            <header className="border border-black grid grid-cols-12 min-h-[110px]">
                <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                    <img
                        src={bispulogo}
                        alt="BiPSU Logo"
                        crossOrigin="anonymous"
                        className="w-[90px] h-[90px] object-contain mb-1"
                    />
                </div>

                <div className="col-span-6 border-r border-black flex flex-col">
                    <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                        <div className="text-[7px] leading-tight mb-0.5">
                            Type:
                        </div>
                        <div className="text-center text-[9px] font-bold leading-tight break-words">
                            QUALITY MANAGEMENT SYSTEM
                        </div>
                        <div className="text-center text-[9px] font-bold leading-tight break-words">
                            PERIODIC MAINTENANCE SYSTEM - FORM
                        </div>
                    </div>
                    <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                        <div className="text-[7px] leading-tight mb-0.5">
                            Title:
                        </div>
                        <div className="text-center text-[9px] font-bold leading-tight break-words">
                            EQUIPMENT/TOOL HISTORY FILE
                        </div>
                    </div>
                </div>

                <div className="col-span-3 flex flex-col text-[8px]">
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Document No.:</span>
                        <span className="block text-center font-bold text-[9px] leading-tight break-words">
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
                        <span className="leading-tight">Effective Date:</span>
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
            <div className="mt-6 mb-3 flex items-center justify-center gap-1">
                <span className="text-[11px] font-bold">
                    SCHOOL/OFFICE OF
                </span>
                <span
                    className="border-b border-black text-center font-bold text-[11px] px-2"
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

            {/* TABLE 1 — EQUIPMENT INFO */}
            <table className="w-[70%] mx-auto border-collapse border border-black table-fixed text-[8px]">
                <tbody>
                    <tr>
                        <td className="border-b border-r border-black px-1.5 py-1 font-bold w-[25%]">
                            CODE No.
                        </td>
                        <td className="border-b border-black px-1.5 py-1 text-[9px]">
                            {equipmentInfo.codeNo || ""}
                        </td>
                    </tr>
                    <tr>
                        <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                            NAME OF EQUIPMENT
                        </td>
                        <td className="border-b border-black px-1.5 py-1 text-[9px]">
                            {equipmentInfo.nameOfEquipment || ""}
                        </td>
                    </tr>
                    <tr>
                        <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                            MAKER
                        </td>
                        <td className="border-b border-black px-1.5 py-1 text-[9px]">
                            {equipmentInfo.maker || ""}
                        </td>
                    </tr>
                    <tr>
                        <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                            MODEL TYPE
                        </td>
                        <td className="border-b border-black px-1.5 py-1 text-[9px]">
                            {equipmentInfo.modelType || ""}
                        </td>
                    </tr>
                    <tr>
                        <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                            SERIAL No.
                        </td>
                        <td className="border-b border-black px-1.5 py-1 text-[9px]">
                            {equipmentInfo.serialNo || ""}
                        </td>
                    </tr>
                    <tr>
                        <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                            LOCATION
                        </td>
                        <td className="border-b border-black px-1.5 py-1 text-[9px]">
                            {equipmentInfo.location || ""}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* TABLE 2 — HISTORY + LEGEND */}
            <table className="w-[70%] mx-auto border-collapse border border-black table-fixed text-[8px]">
                <colgroup>
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "5.5%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                </colgroup>
                <tbody>
                    <tr className="text-[7px] font-bold text-center">
                        <th rowSpan="2" className="border border-black px-0.5 py-1">
                            Date
                        </th>
                        <th colSpan="8" className="border border-black px-0.5 py-1">
                            WORKDONE
                        </th>
                        <th rowSpan="2" className="border border-black px-0.5 py-1">
                            Performed by
                        </th>
                        <th rowSpan="2" className="border border-black px-0.5 py-1">
                            Checked by
                        </th>
                    </tr>
                    <tr className="text-[7px] font-bold text-center">
                        <th className="border border-black px-0.5 py-1">A</th>
                        <th className="border border-black px-0.5 py-1">B</th>
                        <th className="border border-black px-0.5 py-1">C</th>
                        <th className="border border-black px-0.5 py-1">D</th>
                        <th className="border border-black px-0.5 py-1">E</th>
                        <th className="border border-black px-0.5 py-1">F</th>
                        <th className="border border-black px-0.5 py-1">G</th>
                        <th className="border border-black px-0.5 py-1">I</th>
                    </tr>

                    {pageItems.map((item, idx) => (
                        <tr
                            key={item.id || `row-${idx}`}
                            className="text-[8px] text-center h-[25px]"
                        >
                            <td className="border border-black px-0.5 py-1 text-[7px]">
                                {formatDateReadable(item.date)}
                            </td>

                            {WORK_FIELDS.map((field, fIdx) => {
                                if (field === "routineInspection") {
                                    return (
                                        <td
                                            key={fIdx}
                                            className="border border-black px-0.5 py-1 text-[9px]"
                                        >
                                            {item[field] || ""}
                                        </td>
                                    );
                                }

                                return (
                                    <td
                                        key={fIdx}
                                        className="border border-black text-center align-middle"
                                    >
                                        {item[field] ? (
                                            <span
                                                style={{
                                                    fontSize: "10px",
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
                                );
                            })}

                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                        </tr>
                    ))}

                    {Array.from({ length: emptyRowCount }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-[25px]">
                            {Array.from({ length: 11 }).map((_, i) => (
                                <td key={i} className="border border-black" />
                            ))}
                        </tr>
                    ))}

                    {/* LEGEND */}
                    <tr>
                        <td
                            colSpan={11}
                            className="border border-black p-0 align-top"
                        >
                            <div className="p-1.5 text-[7.5px] font-semibold grid grid-cols-2 gap-x-3">
                                <div className="space-y-1">
                                    <div>
                                        <span className="font-bold">A</span> –
                                        Routine Inspection &amp; Cleaning
                                    </div>
                                    <div>
                                        <span className="font-bold">B</span> –
                                        Lubricating
                                    </div>
                                    <div>
                                        <span className="font-bold">C</span> –
                                        Over hauling
                                    </div>
                                    <div>
                                        <span className="font-bold">D</span> –
                                        Minor adjustment / calibration
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div>
                                        <span className="font-bold">E</span> –
                                        Replace Worn-out parts
                                    </div>
                                    <div>
                                        <span className="font-bold">F</span> –
                                        Repair
                                    </div>
                                    <div>
                                        <span className="font-bold">G</span> –
                                        General Recondition
                                    </div>
                                    <div>
                                        <span className="font-bold">I</span> –
                                        Repair part
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* SIGNATURES */}
            <div className="mt-10 grid grid-cols-3 gap-8 text-[9px] w-[70%] mx-auto">
                <div>
                    <div className="mb-8 font-medium">Prepared:</div>
                    <div className="border-b border-black text-center font-bold text-[9px] min-h-[20px]">
                        {signatures.prepared || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-8 font-medium">Attested:</div>
                    <div className="border-b border-black text-center font-bold text-[9px] min-h-[20px]">
                        {signatures.attested || "\u00A0"}
                    </div>
                </div>
                <div>
                    <div className="mb-8 font-medium">Approved:</div>
                    <div className="border-b border-black text-center font-bold text-[9px] min-h-[20px]">
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
    const { equipmentByCode } = useContext(EquipmentDataContext);

    const {
        createPMS002,
        updatePMS002,
        deletePMS002,
        fetchMyLaboratory,
        myLaboratory,
        pms003Data,
        fetchEquipmentByCode,
        loading: pms002Loading,
    } = useContext(PMS002Context);

    // ========================================================
    // STATE
    // ========================================================
    const [officeName, setOfficeName] = useState(DEFAULT_OFFICE_NAME);
    const [signatures, setSignatures] = useState(DEFAULT_SIGNATURES);

    console.log("pms003Data", pms003Data);

    const [equipmentInfo, setEquipmentInfo] = useState(
        DEFAULT_EQUIPMENT_INFO
    );
    const [items, setItems] = useState(DEFAULT_ITEMS);

    const [notification, setNotification] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // ✅ DYNAMIC rows-per-page (kinokompute via DOM measurement)
    const [computedRowsPerPage, setComputedRowsPerPage] = useState(
        DEFAULT_ROWS_PER_PAGE
    );

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
    const topDebounceRef = useRef(null);
    const formRef = useRef(null);
    const pdfContainerRef = useRef(null);
    const didFetchLabRef = useRef(false);

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
    // LOAD pms003Data → TABLE ROWS
    // ========================================================
    useEffect(() => {
        if (!Array.isArray(pms003Data)) {
            return;
        }

        if (pms003Data.length === 0) {
            setItems([]);
            return;
        }

        const rows = pms003Data.map((rec, idx) =>
            mapPmsRecordToRow(rec, idx)
        );
        setItems(rows);
    }, [pms003Data]);

    // ========================================================
    // CLEANUP DEBOUNCE TIMERS
    // ========================================================
    useEffect(() => {
        const timers = debounceRef.current;
        return () => {
            Object.values(timers).forEach((t) => clearTimeout(t));
            if (topDebounceRef.current) {
                clearTimeout(topDebounceRef.current);
            }
        };
    }, []);

    // ========================================================
    // DYNAMIC ROWS-PER-PAGE MEASUREMENT
    // Sinusukat ang actual height ng fixed sections para
    // malaman kung ilang rows ang eksaktong kasya sa A4.
    // ========================================================
    useEffect(() => {
        const measureRowsPerPage = () => {
            const firstPage = pdfContainerRef.current?.querySelector(
                ".pdf-page"
            );
            if (!firstPage) return;

            const header = firstPage.querySelector("header");
            const allTables = firstPage.querySelectorAll("table");
            const eqTable = allTables[0];
            const historyTable = allTables[1];
            const signatureBlock = firstPage.querySelector(
                ".mt-10.grid.grid-cols-3"
            );

            if (!header || !eqTable || !historyTable || !signatureBlock) {
                return;
            }

            const headerH = header.getBoundingClientRect().height;
            const eqTableH = eqTable.getBoundingClientRect().height;
            const signatureH = signatureBlock.getBoundingClientRect().height;

            // Sa history table: kunin ang header rows at legend row
            const tbodyRows = Array.from(
                historyTable.querySelectorAll("tbody > tr")
            );
            const headerRows = tbodyRows.filter((tr) =>
                tr.querySelector("th")
            );
            const legendRow = tbodyRows.find((tr) =>
                tr.querySelector('td[colspan="11"]')
            );

            const headerRowsH = headerRows.reduce(
                (sum, tr) => sum + tr.getBoundingClientRect().height,
                0
            );
            const legendH = legendRow
                ? legendRow.getBoundingClientRect().height
                : 0;

            // Sukatin ang isang data row (kung may data)
            let rowH = ROW_HEIGHT_PX;
            const firstDataRow = tbodyRows.find(
                (tr) =>
                    !tr.querySelector("th") &&
                    !tr.querySelector('td[colspan="11"]')
            );
            if (firstDataRow) {
                const measured = firstDataRow.getBoundingClientRect().height;
                if (measured > 0) rowH = measured;
            }

            // Fixed gaps/margins (mt-6, mb-3, mt-10, etc.)
            const gaps =
                24 + // mt-6 sa office section
                12 + // mb-3
                40;  // mt-10 sa signature

            // Available height para sa data rows
            const totalFixed =
                headerH +
                eqTableH +
                headerRowsH +
                legendH +
                signatureH +
                gaps;

            const availableForRows = A4_CONTENT_HEIGHT - totalFixed;
            const rowsFit = Math.max(
                1,
                Math.floor(availableForRows / rowH)
            );

            console.log("📐 A4 measurement:", {
                headerH,
                eqTableH,
                headerRowsH,
                legendH,
                signatureH,
                gaps,
                totalFixed,
                availableForRows,
                rowH,
                rowsFit,
            });

            setComputedRowsPerPage(rowsFit);
        };

        // Delay para siguradong tapos na ang render
        const timer = setTimeout(measureRowsPerPage, 150);
        return () => clearTimeout(timer);
    }, [
        equipmentInfo,
        officeName,
        signatures,
        items.length,
        // Re-measure kapag nagbago ang laki ng window (responsive)
    ]);

    // ========================================================
    // NOTIFICATION
    // ========================================================
    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // ========================================================
    // AUTO-FETCH PARA SA TOP TABLE
    // ========================================================
    const lookupEquipmentForTopTable = useCallback(
        async (code) => {
            const trimmed = (code || "").trim();
            if (trimmed.length < 3) return;

            if (typeof fetchEquipmentByCode !== "function") {
                console.warn(
                    "fetchEquipmentByCode is not available in context."
                );
                return;
            }

            try {
                const result = await fetchEquipmentByCode(trimmed);
                const found = result?.data ?? result;

                if (found && (found.code || found.Brand)) {
                    setEquipmentInfo((prev) => ({
                        ...prev,
                        equipmentId: found._id || prev.equipmentId,
                        codeNo: found.code || prev.codeNo,
                        nameOfEquipment:
                            found.Brand || prev.nameOfEquipment,
                        serialNo:
                            found.SerialNumber || prev.serialNo,
                        location: found.Location || prev.location,
                        modelType: found.Type || prev.modelType,
                    }));

                    showToast(
                        `Equipment found: ${found.code || trimmed}`
                    );
                } else {
                    showToast(`No equipment found with code: ${trimmed}`);
                }
            } catch (err) {
                console.error(
                    "Error fetching equipment for top table:",
                    err
                );
                showToast("Failed to fetch equipment by code.");
            }
        },
        [fetchEquipmentByCode]
    );

    // ========================================================
    // EQUIPMENT INFO CHANGE
    // ========================================================
    const handleEquipmentInfoChange = (field, value) => {
        setEquipmentInfo((prev) => ({ ...prev, [field]: value }));

        if (field === "codeNo") {
            if (topDebounceRef.current) {
                clearTimeout(topDebounceRef.current);
            }

            topDebounceRef.current = setTimeout(() => {
                lookupEquipmentForTopTable(value);
            }, 500);
        }
    };

    // ========================================================
    // AUTO-FILL MULA SA equipmentByCode (context)
    // ========================================================
    useEffect(() => {
        if (!equipmentByCode) return;

        setEquipmentInfo((prev) => ({
            ...prev,
            equipmentId: equipmentByCode?._id || prev.equipmentId,
            codeNo: equipmentByCode?.code || prev.codeNo,
            nameOfEquipment:
                equipmentByCode?.Brand || prev.nameOfEquipment,
            serialNo:
                equipmentByCode?.SerialNumber || prev.serialNo,
            location: equipmentByCode?.Location || prev.location,
            modelType: equipmentByCode?.Type || prev.modelType,
        }));
    }, [equipmentByCode]);

    // ========================================================
    // ADD ROW
    // ========================================================
    const handleAddRow = () => {
        const newId = `new-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        const today = toDateInputValue(new Date());

        const newItem = {
            id: newId,
            pmsId: null,
            equipmentId: equipmentInfo.equipmentId || null,
            laboratoryId: null,

            codeNo: equipmentInfo.codeNo || "",
            name: equipmentInfo.nameOfEquipment || "",
            serialNo: equipmentInfo.serialNo || "",

            date: today,
            routineInspection: "",
            lubrication: false,
            overhauling: false,
            minorAdjustment: false,
            replaceWornOutParts: false,
            repair: false,
            generalRecondition: false,
            repairPart: false,

            isNew: true,
        };

        setItems((prev) => [...prev, newItem]);
        showToast("New row added. Fill in and press Save.");
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

                if (
                    equipmentInfo.codeNo &&
                    typeof fetchEquipmentByCode === "function"
                ) {
                    await fetchEquipmentByCode(equipmentInfo.codeNo);
                }
            } catch (err) {
                console.error("deletePMS002 error:", err);
                showToast("Failed to delete PMS002 record.");
                return;
            }
        } else {
            setItems((prev) => prev.filter((item) => item.id !== id));
        }

        showToast("Row removed.");
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

        const equipmentId =
            itemToSave.equipmentId ||
            equipmentInfo.equipmentId ||
            null;

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
            date: itemToSave.date || null,
            routineInspection: itemToSave.routineInspection || "",
            lubrication: !!itemToSave.lubrication,
            overhauling: !!itemToSave.overhauling,
            minorAdjustment: !!itemToSave.minorAdjustment,
            replaceWornOutParts: !!itemToSave.replaceWornOutParts,
            repair: !!itemToSave.repair,
            generalRecondition: !!itemToSave.generalRecondition,
            repairPart: !!itemToSave.repairPart,
        };

        console.log("💾 handleSaveRow (PMS002) PAYLOAD:", payload);

        try {
            let res;

            if (itemToSave.pmsId) {
                res = await updatePMS002(itemToSave.pmsId, payload);
            } else {
                res = await createPMS002(payload);
            }

            if (res?.success) {
                if (
                    equipmentInfo.codeNo &&
                    typeof fetchEquipmentByCode === "function"
                ) {
                    await fetchEquipmentByCode(equipmentInfo.codeNo);
                }

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
    // PDF — MULTI-PAGE
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

            const safeOffice = (officeName || "PMS002")
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "_");

            const fileName = `PMS002_${safeOffice}_${Date.now()}.pdf`;

            pdf.save(fileName);

            showToast(
                `PDF generated successfully (${pageNodes.length} page${
                    pageNodes.length > 1 ? "s" : ""
                }).`
            );
        } catch (error) {
            console.error("PDF generation error:", error);
            showToast("Failed to generate PDF.");
        } finally {
            setIsGenerating(false);
        }
    }, [officeName]);

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
                @page { size: A4 portrait; margin: 0; }
                html, body { margin: 0; padding: 0; }
                * { box-sizing: border-box; }
                body { background: #f1f5f9; }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slideUp 0.3s ease-out; }

                @media print {
                    html, body {
                        width: 210mm; height: 297mm;
                        margin: 0; padding: 0;
                        background: white !important;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print { display: none !important; }
                    .print-wrapper {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        background: white !important;
                    }
                    .print-form {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 12mm !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .no-print-column { display: none !important; }
                    input {
                        color: #000 !important;
                        background: transparent !important;
                    }
                    .history-table-scroll {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                }

                .work-checkbox {
                    width: 14px;
                    height: 14px;
                    cursor: pointer;
                    accent-color: #000;
                    margin: 0 auto;
                    display: block;
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
                }
                .history-table-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .history-table-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
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
                            equipmentInfo={equipmentInfo}
                            officeName={officeName}
                            signatures={signatures}
                            emptyRowCount={emptyRowCount}
                        />
                    );
                })}
            </div>

            {/* VISIBLE UI */}
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
                                    Periodic Maintenance System (PMS-002)
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

                    {/* PAGE INFO — dynamic */}
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

                {/* FORM (VISIBLE) */}
                <div
                    ref={formRef}
                    className="print-form bg-white w-[794px] min-h-[1123px] p-[45px] border border-slate-400 shadow-xl text-black"
                >
                    {/* HEADER */}
                    <header className="border border-black grid grid-cols-12 min-h-[110px]">
                        <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                            <img
                                src={bispulogo}
                                alt="BiPSU Logo"
                                crossOrigin="anonymous"
                                className="w-[90px] h-[90px] object-contain mb-1"
                            />
                        </div>

                        <div className="col-span-6 border-r border-black flex flex-col">
                            <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                                <div className="text-[7px] leading-tight mb-0.5">
                                    Type:
                                </div>
                                <div className="text-center text-[9px] font-bold leading-tight break-words">
                                    QUALITY MANAGEMENT SYSTEM
                                </div>
                                <div className="text-center text-[9px] font-bold leading-tight break-words">
                                    PERIODIC MAINTENANCE SYSTEM - FORM
                                </div>
                            </div>
                            <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                                <div className="text-[7px] leading-tight mb-0.5">
                                    Title:
                                </div>
                                <div className="text-center text-[9px] font-bold leading-tight break-words">
                                    EQUIPMENT/TOOL HISTORY FILE
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 flex flex-col text-[8px]">
                            <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                <span className="leading-tight">Document No.:</span>
                                <span className="block text-center font-bold text-[9px] leading-tight break-words">
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
                                <span className="leading-tight">Effective Date:</span>
                                <span className="block text-center font-bold leading-tight">
                                    October 09, 2020
                                </span>
                            </div>
                            <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                                <span className="leading-tight">Issuance/Revision:</span>
                                <span className="block text-center font-bold leading-tight">
                                    02/01
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* SCHOOL/OFFICE */}
                    <div className="office-section mt-6 mb-3 flex items-center justify-center gap-1">
                        <Building2 className="no-print w-3 h-3" />
                        <span className="text-[11px] font-bold">
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
                            className="border-b border-black outline-none text-center font-bold text-[11px] px-2 bg-transparent"
                        />
                    </div>

                    {/* TABLE 1 — EQUIPMENT INFO */}
                    <table className="w-[70%] mx-auto border-collapse border border-black table-fixed text-[8px]">
                        <tbody>
                            <tr>
                                <td className="border-b border-r border-black px-1.5 py-1 font-bold w-[25%]">
                                    CODE No.
                                </td>
                                <td className="border-b border-black p-0 relative">
                                    <input
                                        type="text"
                                        value={equipmentInfo.codeNo || ""}
                                        onChange={(e) =>
                                            handleEquipmentInfoChange("codeNo", e.target.value)
                                        }
                                        className="w-full h-6 px-1.5 outline-none bg-transparent text-[9px]"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                                    NAME OF EQUIPMENT
                                </td>
                                <td className="border-b border-black p-0">
                                    <input
                                        type="text"
                                        value={equipmentInfo.nameOfEquipment || ""}
                                        onChange={(e) =>
                                            handleEquipmentInfoChange("nameOfEquipment", e.target.value)
                                        }
                                        className="w-full h-6 px-1.5 outline-none bg-transparent text-[9px]"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                                    MAKER
                                </td>
                                <td className="border-b border-black p-0">
                                    <input
                                        type="text"
                                        value={equipmentInfo.maker || ""}
                                        onChange={(e) =>
                                            handleEquipmentInfoChange("maker", e.target.value)
                                        }
                                        className="w-full h-6 px-1.5 outline-none bg-transparent text-[9px]"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                                    MODEL TYPE
                                </td>
                                <td className="border-b border-black p-0">
                                    <input
                                        type="text"
                                        value={equipmentInfo.modelType || ""}
                                        onChange={(e) =>
                                            handleEquipmentInfoChange("modelType", e.target.value)
                                        }
                                        className="w-full h-6 px-1.5 outline-none bg-transparent text-[9px]"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                                    SERIAL No.
                                </td>
                                <td className="border-b border-black p-0">
                                    <input
                                        type="text"
                                        value={equipmentInfo.serialNo || ""}
                                        onChange={(e) =>
                                            handleEquipmentInfoChange("serialNo", e.target.value)
                                        }
                                        className="w-full h-6 px-1.5 outline-none bg-transparent text-[9px]"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-b border-r border-black px-1.5 py-1 font-bold">
                                    LOCATION
                                </td>
                                <td className="border-b border-black p-0">
                                    <input
                                        type="text"
                                        value={equipmentInfo.location || ""}
                                        onChange={(e) =>
                                            handleEquipmentInfoChange("location", e.target.value)
                                        }
                                        className="w-full h-6 px-1.5 outline-none bg-transparent text-[9px]"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* TABLE 2 — HISTORY + LEGEND (SCROLLABLE, DYNAMIC HEIGHT) */}
                    <div
                        className="history-table-scroll w-[70%] mx-auto"
                        style={{
                            maxHeight: `${
                                computedRowsPerPage * ROW_HEIGHT_PX + 50
                            }px`,
                        }}
                    >
                        <table className="w-full border-collapse border border-black table-fixed text-[8px]">
                            <colgroup>
                                <col style={{ width: "12%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "5.5%" }} />
                                <col style={{ width: "15%" }} />
                                <col style={{ width: "15%" }} />
                                <col className="no-print-column" style={{ width: "8%" }} />
                            </colgroup>
                            <tbody>
                                <tr className="text-[7px] font-bold text-center">
                                    <th rowSpan="2" className="border border-black px-0.5 py-1 sticky top-0 bg-white z-10">
                                        Date
                                    </th>
                                    <th colSpan="8" className="border border-black px-0.5 py-1 sticky top-0 bg-white z-10">
                                        WORKDONE
                                    </th>
                                    <th rowSpan="2" className="border border-black px-0.5 py-1 sticky top-0 bg-white z-10">
                                        Performed by
                                    </th>
                                    <th rowSpan="2" className="border border-black px-0.5 py-1 sticky top-0 bg-white z-10">
                                        Checked by
                                    </th>
                                    <th rowSpan="2" className="no-print-column border border-black px-0.5 py-1 sticky top-0 bg-white z-10">
                                        Action
                                    </th>
                                </tr>
                                <tr className="text-[7px] font-bold text-center">
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">A</th>
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">B</th>
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">C</th>
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">D</th>
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">E</th>
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">F</th>
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">G</th>
                                    <th className="border border-black px-0.5 py-1 sticky top-[22px] bg-white z-10">I</th>
                                </tr>

                                {items.map((item) => (
                                    <tr key={item.id} className="text-[8px] text-center h-[25px]">
                                        <td className="border border-black p-0">
                                            <input
                                                type="date"
                                                value={item.date || ""}
                                                onChange={(e) =>
                                                    handleItemChange(item.id, "date", e.target.value)
                                                }
                                                className="w-full h-[25px] text-center text-[7px] outline-none bg-transparent px-0.5"
                                            />
                                        </td>

                                        {WORK_FIELDS.map((field, idx) => {
                                            if (field === "routineInspection") {
                                                return (
                                                    <td key={idx} className="border border-black p-0">
                                                        <input
                                                            type="text"
                                                            value={item[field] || ""}
                                                            onChange={(e) =>
                                                                handleItemChange(item.id, field, e.target.value)
                                                            }
                                                            className="w-full h-[25px] text-center text-[9px] outline-none bg-transparent"
                                                        />
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td
                                                    key={idx}
                                                    className="border border-black p-0 text-center align-middle"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={!!item[field]}
                                                        onChange={(e) =>
                                                            handleItemChange(item.id, field, e.target.checked)
                                                        }
                                                        className="work-checkbox"
                                                    />
                                                </td>
                                            );
                                        })}

                                        <td className="border border-black p-0 text-center"></td>
                                        <td className="border border-black p-0 text-center"></td>

                                        <td className="no-print-column border border-black p-0 text-center">
                                            <div className="flex items-center justify-center gap-0.5">
                                                {item.isNew && (
                                                    <button
                                                        type="button"
                                                        title="Save"
                                                        onClick={() => handleSaveRow(item.id)}
                                                        className="text-emerald-600 hover:text-emerald-800 p-0.5"
                                                    >
                                                        <Save className="w-3 h-3 mx-auto" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    onClick={() => handleDeleteRow(item.id)}
                                                    className="text-red-600 hover:text-red-800 p-0.5"
                                                >
                                                    <Trash2 className="w-3 h-3 mx-auto" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {items.length < computedRowsPerPage &&
                                    Array.from({
                                        length: computedRowsPerPage - items.length,
                                    }).map((_, index) => (
                                        <tr key={`empty-${index}`} className="h-[25px]">
                                            {Array.from({ length: 11 }).map((_, i) => (
                                                <td key={i} className="border border-black" />
                                            ))}
                                            <td className="no-print-column border border-black" />
                                        </tr>
                                    ))}

                                {/* LEGEND */}
                                <tr>
                                    <td
                                        colSpan={12}
                                        className="border border-black p-0 align-top"
                                    >
                                        <div className="p-1.5 text-[7.5px] font-semibold grid grid-cols-2 gap-x-3">
                                            <div className="space-y-1">
                                                <div>
                                                    <span className="font-bold">A</span> – Routine Inspection &amp; Cleaning
                                                </div>
                                                <div>
                                                    <span className="font-bold">B</span> – Lubricating
                                                </div>
                                                <div>
                                                    <span className="font-bold">C</span> – Over hauling
                                                </div>
                                                <div>
                                                    <span className="font-bold">D</span> – Minor adjustment / calibration
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div>
                                                    <span className="font-bold">E</span> – Replace Worn-out parts
                                                </div>
                                                <div>
                                                    <span className="font-bold">F</span> – Repair
                                                </div>
                                                <div>
                                                    <span className="font-bold">G</span> – General Recondition
                                                </div>
                                                <div>
                                                    <span className="font-bold">I</span> – Repair part
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* SIGNATURES */}
                    <div className="signature-section mt-10 grid grid-cols-3 gap-8 text-[9px] w-[70%] mx-auto">
                        <div>
                            <div className="mb-8 font-medium">Prepared:</div>
                            <input
                                type="text"
                                value={signatures.prepared}
                                onChange={(e) =>
                                    handleSignatureChange("prepared", e.target.value)
                                }
                                className="w-full border-b border-black text-center outline-none bg-transparent text-[9px] font-bold h-5"
                            />
                        </div>
                        <div>
                            <div className="mb-8 font-medium">Attested:</div>
                            <input
                                type="text"
                                value={signatures.attested}
                                onChange={(e) =>
                                    handleSignatureChange("attested", e.target.value)
                                }
                                className="w-full border-b border-black text-center outline-none bg-transparent text-[9px] font-bold h-5"
                            />
                        </div>
                        <div>
                            <div className="mb-8 font-medium">Approved:</div>
                            <input
                                type="text"
                                value={signatures.approved}
                                onChange={(e) =>
                                    handleSignatureChange("approved", e.target.value)
                                }
                                className="w-full border-b border-black text-center outline-none bg-transparent text-[9px] font-bold h-5"
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
                            className={`px-5 py-4 border-b border-slate-100 flex items-center gap-3 ${
                                confirmState.variant === "danger"
                                    ? "bg-red-50"
                                    : "bg-blue-50"
                            }`}
                        >
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                    confirmState.variant === "danger"
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
                                onClick={() => confirmState.onConfirm?.(false)}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
                            >
                                {confirmState.cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmState.onConfirm?.(true)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium text-white transition ${
                                    confirmState.variant === "danger"
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