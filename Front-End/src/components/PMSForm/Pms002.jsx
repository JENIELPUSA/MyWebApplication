// src/components/PMSComponent/PMSComponent.jsx
import React, {
    useState,
    useEffect,
    useContext,
    useMemo,
    useRef,
    useCallback,
} from "react";
import {
    FlaskConical,
    Settings,
    Stethoscope,
    ChevronRight,
    AlertCircle,
    FileText,
    ArrowLeft,
    Search,
    FolderOpen,
    GraduationCap,
    Wrench,
    Building2,
    Download,
    Loader2,
    ChevronDown,
    X,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ✅ SEPARATE CONTEXTS
import { PMSContext } from "../../contexts/PMS/pmsContext";
import { PMS002Context } from "../../contexts/PMS/pmsContext002";

import bispulogo from "../../assets/bipsulogo.png";

// ============================================================
// CONSTANTS — PMS001 = PORTRAIT, PMS002 = LANDSCAPE
// ============================================================
// PMS001 — Portrait A4
const A4P_WIDTH_PX = 794;
const A4P_HEIGHT_PX = 1123;
const A4P_WIDTH_MM = 210;
const A4P_HEIGHT_MM = 297;

// PMS002 — Landscape A4
const A4L_WIDTH_PX = 1123;
const A4L_HEIGHT_PX = 794;
const A4L_WIDTH_MM = 297;
const A4L_HEIGHT_MM = 210;

const ROW_HEIGHT_PX = 32;
const A4L_CONTENT_HEIGHT = A4L_HEIGHT_PX - 80;

const DEFAULT_ROWS_PER_PAGE = 10;

// ============================================================
// Helper — map PMS001 record → table row
// ============================================================
const mapPmsRecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};
    const year = eq?.DateAcquired ? String(eq.DateAcquired).slice(0, 4) : "";

    return {
        id: record?._id || `pms-fallback-${index}`,
        codeNo: eq?.code || "",
        name: eq?.Brand || "",
        dateAcquired: year,
        serviceable: !!record?.serviceable,
        nonServiceable: !!record?.nonServiceable,
        type: record?.type || "",
        breakdownNo: record?.breakdownNo ?? "0",
        breakdownDuration: record?.breakdownDuration ?? "N/A",
        availYes: !!record?.availYes,
        availNo: !!record?.availNo,
        remarks: record?.remarks || "",
    };
};

// ============================================================
// Helper — map PMS002 record → table row (MAINTENANCE ACTIVITY)
// ============================================================
const mapPms002RecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};
    const year = eq?.DateAcquired ? String(eq.DateAcquired).slice(0, 4) : "";

    return {
        id: record?._id || `pms002-fallback-${index}`,
        pmsNo: record?.pmsNo ?? "",
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
    };
};

// ============================================================
// Page chunking
// ============================================================
const chunkItemsIntoPages = (allItems, rowsPerPage = DEFAULT_ROWS_PER_PAGE) => {
    if (!Array.isArray(allItems) || allItems.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < allItems.length; i += rowsPerPage) {
        pages.push(allItems.slice(i, i + rowsPerPage));
    }
    return pages;
};

// ============================================================
// Normalize PMS002 response
// ============================================================
const normalizePms002Response = (result) => {
    if (!result) {
        return { records: [], performedBy: null, total: 0 };
    }

    let records = [];

    if (Array.isArray(result?.pmsRecord002) && result.pmsRecord002.length > 0) {
        records = result.pmsRecord002;
    } else if (Array.isArray(result?.data) && result.data.length > 0) {
        records = result.data;
    } else if (Array.isArray(result?.data?.pmsRecord002)) {
        records = result.data.pmsRecord002;
    } else if (Array.isArray(result?.laboratory) && result.laboratory.length > 0) {
        records = result.laboratory;
    } else if (Array.isArray(result?.pmsRecord)) {
        records = result.pmsRecord;
    } else {
        records = [];
    }

    const performedBy =
        (result?.laboratory && !Array.isArray(result.laboratory)
            ? result.laboratory.performedBy
            : null) ||
        result?.data?.performedBy ||
        result?.performedBy ||
        null;

    const totalCandidates = [
        result?.totalPMS002,
        result?.total,
        result?.data?.totalPMS002,
        result?.data?.total,
    ].filter((n) => typeof n === "number" && n > 0);

    const total =
        totalCandidates.length > 0 ? totalCandidates[0] : records.length;

    return { records, performedBy, total };
};

// ============================================================
// PDF PAGE COMPONENT — PMS001 (PORTRAIT — unchanged)
// ============================================================
function PMS001PdfPage({
    pageItems,
    pageNumber,
    totalPages,
    officeName,
    emptyRowCount = 0,
}) {
    return (
        <div
            className="pdf-page pdf-page-pms001 bg-white"
            style={{
                width: `${A4P_WIDTH_PX}px`,
                height: `${A4P_HEIGHT_PX}px`,
                minWidth: `${A4P_WIDTH_PX}px`,
                maxWidth: `${A4P_WIDTH_PX}px`,
                minHeight: `${A4P_HEIGHT_PX}px`,
                maxHeight: `${A4P_HEIGHT_PX}px`,
                padding: "35px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: "#000",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: "#ffffff",
            }}
        >
            <header className="border border-black grid grid-cols-12 min-h-[100px]">
                <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                    <img src={bispulogo} alt="BiPSU Logo" crossOrigin="anonymous" className="w-[80px] h-[80px] object-contain mb-1" />
                </div>
                <div className="col-span-6 border-r border-black flex flex-col">
                    <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">Type:</div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">QUALITY MANAGEMENT SYSTEM</div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">PERIODIC MAINTENANCE SYSTEM - FORM</div>
                    </div>
                    <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">Title:</div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">EQUIPMENT/TOOL HISTORY FILE</div>
                    </div>
                </div>
                <div className="col-span-3 flex flex-col text-[9px]">
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Document No.:</span>
                        <span className="block text-center font-bold text-[10px] leading-tight break-words">BiPSU-QAA-PMS-001</span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                        <span>Page:</span>
                        <span className="font-bold">{pageNumber} of {totalPages}</span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Effective Date:</span>
                        <span className="block text-center font-bold leading-tight">October 09, 2020</span>
                    </div>
                    <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Issuance/Revision:</span>
                        <span className="block text-center font-bold leading-tight">02/01</span>
                    </div>
                </div>
            </header>

            <div className="mt-5 mb-3 flex items-center justify-center gap-1">
                <span className="text-[12px] font-bold">SCHOOL/OFFICE OF</span>
                <span
                    className="border-b border-black text-center font-bold text-[12px] px-2"
                    style={{
                        width: `${Math.max(260, (officeName?.length || 0) * 7 + 20)}px`,
                        display: "inline-block",
                        paddingBottom: "4px",
                        minHeight: "16px",
                    }}
                >
                    {officeName || "\u00A0"}
                </span>
            </div>

            <table className="w-full border-collapse border border-black table-fixed">
                <thead>
                    <tr className="text-[9px] font-bold text-center">
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[7%]">Code<br />No.</th>
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[18%]">Name of<br />Equipment/Tools</th>
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[11%]">Date<br />Acquired</th>
                        <th colSpan="2" className="border border-black px-1 py-1 w-[15%]">Status</th>
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[14%]">Type of<br />Equipment/tools</th>
                        <th colSpan="2" className="border border-black px-1 py-1 w-[14%]">Breakdown</th>
                        <th colSpan="2" className="border border-black px-1 py-1 w-[11%]">Availability<br />&amp;<br />Utilization</th>
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[10%]">Remarks</th>
                    </tr>
                    <tr className="text-[8px] font-bold text-center">
                        <th className="border border-black px-1 py-1">Serviceable</th>
                        <th className="border border-black px-1 py-1">Non<br />Serviceable</th>
                        <th className="border border-black px-1 py-1">No.</th>
                        <th className="border border-black px-1 py-1">Duration</th>
                        <th className="border border-black px-1 py-1">Yes</th>
                        <th className="border border-black px-1 py-1">No</th>
                    </tr>
                </thead>
                <tbody>
                    {pageItems.map((item, idx) => (
                        <tr key={item.id || `row-${idx}`} className="text-[9px] text-center h-[32px]">
                            <td className="border border-black px-1 py-1 text-[9px]">{item.codeNo?.trim() || ""}</td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.name || ""}</td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.dateAcquired || ""}</td>
                            <td className="border border-black text-center align-middle">
                                {item.serviceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.nonServiceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                            </td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.type || ""}</td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.breakdownNo || ""}</td>
                            <td className="border border-black px-1 py-1 text-[8px]">{item.breakdownDuration || ""}</td>
                            <td className="border border-black text-center align-middle">
                                {item.availYes ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                            </td>
                            <td className="border border-black text-center align-middle">
                                {item.availNo ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                            </td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.remarks || ""}</td>
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

            <div className="mt-6 grid grid-cols-3 gap-8 text-[10px]">
                {["Prepared", "Attested", "Approved"].map((label) => (
                    <div key={label}>
                        <div className="mb-6 font-medium">{label}:</div>
                        <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">{"\u00A0"}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// PDF PAGE COMPONENT — PMS002 (LANDSCAPE — gaya ng BiPSUPMS002App)
// ============================================================
function PMS002PdfPage({
    pageItems,
    pageNumber,
    totalPages,
    officeName,
    emptyRowCount = 0,
}) {
    return (
        <div
            className="pdf-page pdf-page-pms002 bg-white"
            style={{
                width: `${A4L_WIDTH_PX}px`,
                height: `${A4L_HEIGHT_PX}px`,
                minWidth: `${A4L_WIDTH_PX}px`,
                maxWidth: `${A4L_WIDTH_PX}px`,
                minHeight: `${A4L_HEIGHT_PX}px`,
                maxHeight: `${A4L_HEIGHT_PX}px`,
                padding: "35px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: "#000",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* HEADER */}
            <header className="border border-black grid grid-cols-12 min-h-[100px] shrink-0">
                <div className="col-span-3 border-r border-black flex flex-col items-center justify-center text-center px-2 py-2">
                    <img src={bispulogo} alt="BiPSU Logo" crossOrigin="anonymous" className="w-[80px] h-[80px] object-contain mb-1" />
                </div>
                <div className="col-span-6 border-r border-black flex flex-col">
                    <div className="flex-1 border-b border-black px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">Type:</div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">QUALITY MANAGEMENT SYSTEM</div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">PERIODIC MAINTENANCE SYSTEM - FORM</div>
                    </div>
                    <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                        <div className="text-[8px] leading-tight mb-0.5">Title:</div>
                        <div className="text-center text-[11px] font-bold leading-tight break-words">EQUIPMENT/TOOL HISTORY FILE</div>
                    </div>
                </div>
                <div className="col-span-3 flex flex-col text-[9px]">
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Document No.:</span>
                        <span className="block text-center font-bold text-[10px] leading-tight break-words">BiPSU-QAA-PMS-002</span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                        <span>Page:</span>
                        <span className="font-bold">{pageNumber} of {totalPages}</span>
                    </div>
                    <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Effective Date:</span>
                        <span className="block text-center font-bold leading-tight">October 09, 2020</span>
                    </div>
                    <div className="flex-1 px-1.5 py-1 flex flex-col justify-center">
                        <span className="leading-tight">Issuance/Revision:</span>
                        <span className="block text-center font-bold leading-tight">02/01</span>
                    </div>
                </div>
            </header>

            {/* SCHOOL/OFFICE */}
            <div className="mt-5 mb-3 flex items-center justify-center gap-1 shrink-0">
                <span className="text-[12px] font-bold">SCHOOL/OFFICE OF</span>
                <span
                    className="border-b border-black text-center font-bold text-[12px] px-2"
                    style={{
                        width: `${Math.max(260, (officeName?.length || 0) * 7 + 20)}px`,
                        display: "inline-block",
                        paddingBottom: "4px",
                        minHeight: "16px",
                    }}
                >
                    {officeName || "\u00A0"}
                </span>
            </div>

            {/* MAIN TABLE — MAINTENANCE ACTIVITY */}
            <div className="flex-1 min-h-0">
                <table className="w-full border-collapse border border-black table-fixed">
                    <thead>
                        <tr className="text-[9px] font-bold text-center">
                            <th rowSpan="2" className="border border-black px-1 py-1 w-[8%]">Code<br />No.</th>
                            <th rowSpan="2" className="border border-black px-1 py-1 w-[18%]">Name of<br />Equipment/Tools</th>
                            <th colSpan="8" className="border border-black px-1 py-1">MAINTENANCE ACTIVITY</th>
                            <th rowSpan="2" className="border border-black px-1 py-1 w-[10%]">Remarks</th>
                        </tr>
                        <tr className="text-[8px] font-bold text-center">
                            <th className="border border-black px-0.5 py-1 w-[7%]">Routine<br />Inspection<br />&amp;<br />Cleaning</th>
                            <th className="border border-black px-0.5 py-1 w-[7%]">Lubrication</th>
                            <th className="border border-black px-0.5 py-1 w-[7%]">Overhauling</th>
                            <th className="border border-black px-0.5 py-1 w-[7%]">Minor<br />Adjustment</th>
                            <th className="border border-black px-0.5 py-1 w-[7%]">Replace<br />Worn<br />out<br />Parts</th>
                            <th className="border border-black px-0.5 py-1 w-[7%]">Repair</th>
                            <th className="border border-black px-0.5 py-1 w-[7%]">General<br />Recondition</th>
                            <th className="border border-black px-0.5 py-1 w-[7%]">Repair<br />Part</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map((item, idx) => (
                            <tr key={item.id || `row-${idx}`} className="text-[9px] text-center h-[32px]">
                                <td className="border border-black px-1 py-1 text-[9px]">{item.codeNo || ""}</td>
                                <td className="border border-black px-1 py-1 text-[9px]">{item.name || ""}</td>
                                <td className="border border-black px-1 py-1 text-[9px]">{item.routineInspection || ""}</td>
                                <td className="border border-black text-center align-middle">
                                    {item.lubrication ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                </td>
                                <td className="border border-black text-center align-middle">
                                    {item.overhauling ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                </td>
                                <td className="border border-black text-center align-middle">
                                    {item.minorAdjustment ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                </td>
                                <td className="border border-black text-center align-middle">
                                    {item.replaceWornOutParts ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                </td>
                                <td className="border border-black text-center align-middle">
                                    {item.repair ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                </td>
                                <td className="border border-black text-center align-middle">
                                    {item.generalRecondition ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                </td>
                                <td className="border border-black text-center align-middle">
                                    {item.repairPart ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                </td>
                                <td className="border border-black px-1 py-1 text-[9px]">{item.remarks || ""}</td>
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
            </div>

            {/* FREQUENCY CODE */}
            <div className="border-x border-b border-black p-2 text-[10px] font-semibold bg-white shrink-0">
                <div className="mb-1 font-bold">FREQUENCY CODE</div>
                <div className="grid grid-cols-2 gap-x-4">
                    <div><span className="font-bold">D</span> – Daily</div>
                    <div><span className="font-bold">SM</span> – Semi-Monthly</div>
                    <div><span className="font-bold">M</span> – Monthly</div>
                    <div><span className="font-bold">SA</span> – Semi Annually</div>
                    <div><span className="font-bold">W</span> – Weekly</div>
                    <div><span className="font-bold">Q</span> – Quarterly</div>
                    <div className="col-span-2"><span className="font-bold">A</span> – Annually</div>
                </div>
            </div>

            {/* SIGNATURES */}
            <div className="mt-6 grid grid-cols-3 gap-8 text-[10px] shrink-0">
                {["Prepared", "Attested", "Approved"].map((label) => (
                    <div key={label}>
                        <div className="mb-6 font-medium">{label}:</div>
                        <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">{"\u00A0"}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// Animated Folder Card
// ============================================================
function AnimatedFolderCard({
    title,
    code,
    count,
    icon: Icon,
    textColor,
    desc,
    onClick,
    status,
}) {
    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer flex flex-col items-center justify-end h-64 w-full p-4 transition-transform duration-300 hover:-translate-y-2 select-none"
        >
            <div className="relative w-full h-full max-w-[240px] flex items-end justify-center">
                <div className="absolute inset-0 bg-blue-400 dark:bg-blue-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="absolute top-0 left-0 w-28 h-6 bg-blue-500 dark:bg-blue-800 rounded-br-xl rounded-tl-2xl"></div>
                </div>

                <div className="absolute bottom-3 w-[88%] h-[82%] bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 ease-out transform group-hover:-translate-y-12 group-hover:shadow-xl flex flex-col justify-between z-10">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {status ? "Status" : "Laboratory"}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                            {status ? status : `${count || 0} PMS`}
                        </span>
                    </div>

                    <div className="my-auto py-1">
                        <div className="flex items-center gap-1.5 mb-1">
                            {Icon && <Icon className={`w-4 h-4 ${textColor || "text-blue-600"}`} />}
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-wide uppercase truncate">
                                {code}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">
                            {title}
                        </p>
                        {desc && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                                {desc}
                            </p>
                        )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span>{status ? "View Details" : "PMS Records"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                <div className="relative w-full h-[70%] bg-gradient-to-t from-blue-400 to-blue-400/95 dark:from-blue-600 dark:to-blue-600/95 rounded-b-2xl rounded-tr-2xl shadow-lg z-20 transition-all duration-300 group-hover:bg-blue-400 dark:group-hover:bg-blue-600 flex flex-col justify-end p-4 border-t border-blue-300/50 dark:border-blue-500/50">
                    <div className="bg-blue-500/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-300/40 dark:border-blue-700/40 rounded-xl p-2.5 flex items-center justify-between text-blue-950 dark:text-blue-100 font-bold text-xs shadow-inner">
                        <span className="truncate">{code}</span>
                        <span className="w-2 h-2 rounded-full bg-blue-200 dark:bg-blue-300 animate-pulse"></span>
                    </div>
                </div>
            </div>

            <div className="mt-3 text-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm transition-colors truncate max-w-[200px]">
                    {title}
                </h3>
                <p className="text-xs text-slate-500">Click to open</p>
            </div>
        </div>
    );
}

// ============================================================
// Main Component
// ============================================================
export default function PMSComponent() {
    // ---------------- CONTEXT: PMS001 ----------------
    const {
        departmentsWithLabs,
        fetchDepartmentsWithLabEquipments,
        displayAllPMS001,
        loading: pms001Loading,
        error: pms001Error,
        user,
    } = useContext(PMSContext);

    // ---------------- CONTEXT: PMS002 ----------------
    const pms002Context = useContext(PMS002Context);
    const {
        displayAllPMS002,
        fetchAllPMS002,
        pms002Records,
        loading: pms002Loading,
        error: pms002Error,
    } = pms002Context || {};

    const fetchPms002 = useMemo(
        () => displayAllPMS002 || fetchAllPMS002 || null,
        [displayAllPMS002, fetchAllPMS002]
    );

    // ---------------- STATE ----------------
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedLab, setSelectedLab] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("PMS001");
    const [miniExpanded, setMiniExpanded] = useState(false);

    const [labPmsRecords, setLabPmsRecords] = useState([]);
    const [labPms002Records, setLabPms002Records] = useState([]);
    const [labPmsLoading, setLabPmsLoading] = useState(false);
    const [labPms002Loading, setLabPms002Loading] = useState(false);

    const [pms002PerformedBy, setPms002PerformedBy] = useState(null);
    const [pms002Total, setPms002Total] = useState(0);

    const [isGenerating, setIsGenerating] = useState(false);
    const [notification, setNotification] = useState(null);

    // ✅ Dynamic rows-per-page (PMS002 landscape measurement)
    const [computedRowsPerPage, setComputedRowsPerPage] = useState(
        DEFAULT_ROWS_PER_PAGE
    );

    const pdfContainerRef = useRef(null);
    const toastTimerRef = useRef(null);
    const fullFormRef = useRef(null);

    // ---------------- FETCH ON MOUNT ----------------
    useEffect(() => {
        fetchDepartmentsWithLabEquipments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    // ---------------- TOAST ----------------
    const showToast = useCallback((message) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setNotification(message);
        toastTimerRef.current = setTimeout(() => setNotification(null), 3000);
    }, []);

    // ============================================================
    // ✅ DYNAMIC ROWS-PER-PAGE MEASUREMENT (PMS002 LANDSCAPE)
    // ============================================================
    useEffect(() => {
        const measureRowsPerPage = () => {
            const firstPage = pdfContainerRef.current?.querySelector(
                ".pdf-page-pms002"
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

            if (!header || !mainTable || !freqBlock || !signatureBlock) return;

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

            const gaps = 20 + 12 + 24; // mt-5 + mb-3 + mt-6

            const totalFixed = headerH + theadH + freqH + signatureH + gaps;
            const availableForRows = A4L_CONTENT_HEIGHT - totalFixed;
            const rowsFit = Math.max(
                1,
                Math.floor(availableForRows / rowH)
            );

            if (import.meta.env.DEV) {
                console.log("📐 A4 measurement (PMS002 landscape):", {
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
    }, [labPms002Records.length, activeTab]);

    // ============================================================
    // ✅ HELPER — fetch PMS002 records
    // ============================================================
    const loadPms002 = useCallback(
        async (lab) => {
            if (!fetchPms002) {
                console.warn(
                    "⚠️ PMS002 fetch method not available in PMS002Context."
                );
                return;
            }
            if (!lab) return;

            const labId = lab.laboratoryId || lab._id;

            setLabPms002Loading(true);
            try {
                const options = { laboratoryId: labId };
                const result002 = await fetchPms002(options);

                const { records, performedBy, total } =
                    normalizePms002Response(result002);

                setLabPms002Records(records);
                setPms002PerformedBy(performedBy);
                setPms002Total(total);
            } catch (err) {
                console.error("❌ Error fetching PMS002 records:", err);
                setLabPms002Records([]);
                setPms002PerformedBy(null);
                setPms002Total(0);
            } finally {
                setLabPms002Loading(false);
            }
        },
        [fetchPms002]
    );

    // ============================================================
    // HANDLE LAB CLICK — fetch PMS001 + PMS002
    // ============================================================
    const handleLabClick = async (lab) => {
        const labId = lab.laboratoryId || lab._id;

        setSelectedLab(lab);
        setActiveTab("PMS001");
        setLabPmsRecords([]);
        setLabPms002Records([]);
        setPms002PerformedBy(null);
        setPms002Total(0);
        setMiniExpanded(false);

        try {
            setLabPmsLoading(true);
            const result = await displayAllPMS001({ laboratoryId: labId });
            const records =
                result?.pmsRecord ||
                result?.data?.pmsRecord ||
                result?.laboratory ||
                [];
            setLabPmsRecords(records);
        } catch (err) {
            console.error("❌ Error fetching PMS001 records:", err);
            setLabPmsRecords([]);
        } finally {
            setLabPmsLoading(false);
        }

        await loadPms002(lab);
    };

    // ============================================================
    // AUTO-FETCH PMS002 kapag nag-switch sa tab
    // ============================================================
    useEffect(() => {
        if (activeTab !== "PMS002") return;
        if (!selectedLab) return;
        if (labPms002Loading) return;
        if (labPms002Records.length > 0) return;
        if (!fetchPms002) return;

        loadPms002(selectedLab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, selectedLab]);

    const openFullForm = () => {
        setMiniExpanded(true);
        setTimeout(() => {
            fullFormRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
    };

    const closeFullForm = () => {
        setMiniExpanded(false);
    };

    // ---------------- DERIVED DATA ----------------
    const getDeptIcon = (deptName = "") => {
        const name = deptName.toUpperCase();
        if (name.includes("LAB")) return FlaskConical;
        if (name.includes("NURS")) return Stethoscope;
        if (name.includes("STCS") || name.includes("TECH") || name.includes("COMPUTER"))
            return GraduationCap;
        if (name.includes("ENG") || name.includes("FACIL")) return Settings;
        return FolderOpen;
    };

    const getDeptTextColor = (deptName = "") => {
        const name = deptName.toUpperCase();
        if (name.includes("NURS")) return "text-rose-600";
        if (name.includes("STCS") || name.includes("TECH")) return "text-purple-600";
        return "text-blue-600";
    };

    const selectedDeptLabs = useMemo(() => {
        if (!selectedDept) return [];
        return selectedDept.laboratories || [];
    }, [selectedDept]);

    const filteredLabs = useMemo(() => {
        return selectedDeptLabs.filter((lab) =>
            (lab.LaboratoryName || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    }, [selectedDeptLabs, searchQuery]);

    const allRows = useMemo(
        () => labPmsRecords.map((rec, idx) => mapPmsRecordToRow(rec, idx)),
        [labPmsRecords]
    );

    const allRows002 = useMemo(
        () => labPms002Records.map((rec, idx) => mapPms002RecordToRow(rec, idx)),
        [labPms002Records]
    );

    const officeName = selectedLab?.LaboratoryName || "";

    const pdfPages = useMemo(
        () => chunkItemsIntoPages(allRows, computedRowsPerPage),
        [allRows, computedRowsPerPage]
    );
    const totalPdfPages = pdfPages.length || 1;

    const pdfPages002 = useMemo(
        () => chunkItemsIntoPages(allRows002, computedRowsPerPage),
        [allRows002, computedRowsPerPage]
    );
    const totalPdfPages002 = pdfPages002.length || 1;

    // ---------------- WAIT FOR IMAGES ----------------
    const waitForImages = (root) => {
        const images = Array.from(root.querySelectorAll("img"));
        return Promise.all(
            images.map((img) => {
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise((resolve) => {
                    const done = () => resolve();
                    img.addEventListener("load", done, { once: true });
                    img.addEventListener("error", done, { once: true });
                    setTimeout(done, 4000);
                });
            })
        );
    };

    // ============================================================
    // DOWNLOAD PDF — tab-aware (orientation depende sa tab)
    // ============================================================
    const handleDownloadPDF = useCallback(async () => {
        if (!pdfContainerRef.current) {
            showToast("PDF container not found.");
            return;
        }

        const isPMS002 = activeTab === "PMS002";
        const rowsCount = isPMS002 ? allRows002.length : allRows.length;

        if (rowsCount === 0) {
            showToast("Walang records para i-download.");
            return;
        }

        setIsGenerating(true);

        try {
            const selector = isPMS002 ? ".pdf-page-pms002" : ".pdf-page-pms001";
            const pageNodes = Array.from(
                pdfContainerRef.current.querySelectorAll(selector)
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

            // ✅ Orientation: PMS001 = portrait, PMS002 = landscape
            const pdf = new jsPDF({
                orientation: isPMS002 ? "landscape" : "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            });

            const widthPx = isPMS002 ? A4L_WIDTH_PX : A4P_WIDTH_PX;
            const heightPx = isPMS002 ? A4L_HEIGHT_PX : A4P_HEIGHT_PX;
            const widthMm = isPMS002 ? A4L_WIDTH_MM : A4P_WIDTH_MM;
            const heightMm = isPMS002 ? A4L_HEIGHT_MM : A4P_HEIGHT_MM;

            for (let i = 0; i < pageNodes.length; i++) {
                const node = pageNodes[i];
                const canvas = await html2canvas(node, {
                    scale: 2,
                    width: widthPx,
                    height: heightPx,
                    windowWidth: widthPx,
                    windowHeight: heightPx,
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
                if (i > 0) pdf.addPage();
                pdf.addImage(image, "PNG", 0, 0, widthMm, heightMm, undefined, "FAST");
            }

            const safeOffice = (officeName || "PMS")
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "_");
            const formTag = isPMS002 ? "PMS002" : "PMS001";
            pdf.save(`${formTag}_${safeOffice}_${Date.now()}.pdf`);

            showToast(
                `PDF generated successfully (${pageNodes.length} page${pageNodes.length > 1 ? "s" : ""
                }).`
            );
        } catch (err) {
            console.error("PDF generation error:", err);
            showToast("Failed to generate PDF.");
        } finally {
            setIsGenerating(false);
        }
    }, [activeTab, allRows.length, allRows002.length, officeName, showToast]);

    // ---------------- LOADING / ERROR ----------------
    if (pms001Loading && departmentsWithLabs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Loading departments...
                    </p>
                </div>
            </div>
        );
    }

    if (pms001Error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h3 className="font-bold text-red-700 dark:text-red-300 mb-1">
                        Error Loading PMS001 Data
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400">{pms001Error}</p>
                </div>
            </div>
        );
    }

    // ---------------- RENDER ----------------
    return (
        <>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slideUp 0.3s ease-out; }

                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fadeInScale 0.25s ease-out; }

                .pdf-render-container {
                    position: fixed;
                    left: -10000px;
                    top: 0;
                    pointer-events: none;
                    z-index: -1;
                }

                .pms-view-table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                }
                .pms-view-table th,
                .pms-view-table td {
                    border: 1px solid #000 !important;
                }
                .pms-view-table thead th {
                    background-color: #ffffff !important;
                    position: sticky;
                    z-index: 20;
                }
                .pms-view-table thead tr:first-child th { top: 0; }
                .pms-view-table thead tr:last-child th { top: 26px; }

                .pms-view-scroll {
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                .pms-view-scroll::-webkit-scrollbar { width: 8px; }
                .pms-view-scroll::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .pms-view-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .pms-view-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            {/* ✅ TOAST */}
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-medium">{notification}</span>
                </div>
            )}

            {/* ✅ HIDDEN PDF RENDER CONTAINER */}
            <div ref={pdfContainerRef} className="pdf-render-container">
                {pdfPages.map((pageItems, idx) => {
                    const emptyRowCount = Math.max(0, computedRowsPerPage - pageItems.length);
                    return (
                        <PMS001PdfPage
                            key={`pdf-page-001-${idx}`}
                            pageItems={pageItems}
                            pageNumber={idx + 1}
                            totalPages={totalPdfPages}
                            officeName={officeName}
                            emptyRowCount={emptyRowCount}
                        />
                    );
                })}

                {allRows002.length > 0 &&
                    pdfPages002.map((pageItems, idx) => {
                        const emptyRowCount = Math.max(0, computedRowsPerPage - pageItems.length);
                        return (
                            <PMS002PdfPage
                                key={`pdf-page-002-${idx}`}
                                pageItems={pageItems}
                                pageNumber={idx + 1}
                                totalPages={totalPdfPages002}
                                officeName={officeName}
                                emptyRowCount={emptyRowCount}
                            />
                        );
                    })}
            </div>

            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 flex-wrap">
                        <button
                            onClick={() => {
                                setSelectedDept(null);
                                setSelectedLab(null);
                                setLabPmsRecords([]);
                                setLabPms002Records([]);
                                setMiniExpanded(false);
                            }}
                            className={`flex items-center gap-1.5 hover:text-blue-500 transition-colors ${!selectedDept ? "font-semibold text-slate-900 dark:text-white" : ""
                                }`}
                        >
                            <FolderOpen className="w-4 h-4 text-blue-500" />
                            <span>Department Folders</span>
                        </button>
                        {selectedDept && (
                            <>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                <button
                                    onClick={() => {
                                        setSelectedLab(null);
                                        setLabPmsRecords([]);
                                        setLabPms002Records([]);
                                        setMiniExpanded(false);
                                    }}
                                    className={`hover:text-blue-500 transition-colors ${!selectedLab ? "font-semibold text-slate-900 dark:text-white" : ""
                                        }`}
                                >
                                    {selectedDept.DepartmentName}
                                </button>
                            </>
                        )}
                        {selectedLab && (
                            <>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {selectedLab.LaboratoryName}
                                </span>
                            </>
                        )}
                    </nav>

                    {/* STEP 1 — DEPARTMENTS */}
                    {!selectedDept && (
                        <section className="space-y-8">
                            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Select a Department Folder
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Hover over a folder to reveal the department details.
                                </p>
                            </div>

                            {departmentsWithLabs.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        No departments found.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                                    {departmentsWithLabs.map((dept) => {
                                        const totalPms = (dept.laboratories || []).reduce(
                                            (sum, lab) => sum + (lab.pmsRecords?.length || 0),
                                            0
                                        );
                                        return (
                                            <AnimatedFolderCard
                                                key={dept._id}
                                                title={dept.DepartmentName}
                                                code={dept.DepartmentName?.split(" ")[0] || "DEPT"}
                                                count={totalPms}
                                                icon={getDeptIcon(dept.DepartmentName)}
                                                textColor={getDeptTextColor(dept.DepartmentName)}
                                                desc={`${dept.laboratories?.length || 0} Laboratories`}
                                                onClick={() => setSelectedDept(dept)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* STEP 2 — LABORATORIES */}
                    {selectedDept && !selectedLab && (
                        <section className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedDept(null)}
                                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FlaskConical className="w-6 h-6 text-blue-500" />
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {selectedDept.DepartmentName}
                                            </h2>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            Click a laboratory folder to view PMS records
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                                    {selectedDeptLabs.length} Laboratories
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full md:w-80">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Laboratory..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {filteredLabs.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <FlaskConical className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        No laboratories found.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                                    {filteredLabs.map((lab) => (
                                        <AnimatedFolderCard
                                            key={lab._id}
                                            title={lab.LaboratoryName}
                                            code={lab.LaboratoryName?.split(" ").slice(0, 2).join(" ") || "LAB"}
                                            count={lab.pmsRecords?.length || 0}
                                            icon={Wrench}
                                            textColor="text-blue-600"
                                            desc={lab.Encharge?.FullName || "No Encharge"}
                                            onClick={() => handleLabClick(lab)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* STEP 3 — PMS RECORDS */}
                    {selectedLab && (
                        <section className="space-y-6">
                            {/* HEADER CARD */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setSelectedLab(null);
                                            setLabPmsRecords([]);
                                            setLabPms002Records([]);
                                            setMiniExpanded(false);
                                        }}
                                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Wrench className="w-6 h-6 text-blue-500" />
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {selectedLab.LaboratoryName}
                                            </h2>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            Encharge: {selectedLab.Encharge?.FullName || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                                        {activeTab === "PMS002"
                                            ? `${pms002Total} PMS002`
                                            : `${allRows.length} PMS001`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleDownloadPDF}
                                        disabled={
                                            isGenerating ||
                                            (activeTab === "PMS002"
                                                ? allRows002.length === 0
                                                : allRows.length === 0)
                                        }
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                                        title="Download PDF"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-3.5 h-3.5" />
                                                Download {activeTab} PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* ✅ TAB SWITCHER */}
                            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => {
                                        setActiveTab("PMS001");
                                        setMiniExpanded(false);
                                    }}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "PMS001"
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    PMS001 ({allRows.length})
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab("PMS002");
                                        setMiniExpanded(false);
                                        if (
                                            labPms002Records.length === 0 &&
                                            !labPms002Loading
                                        ) {
                                            loadPms002(selectedLab);
                                        }
                                    }}
                                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "PMS002"
                                            ? "bg-emerald-600 text-white"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    PMS002 ({pms002Total})
                                </button>
                            </div>

                            {/* TAB CONTENT — PMS001 */}
                            {activeTab === "PMS001" && (
                                <>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm">
                                                PMS001
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                Equipment/Tool History File
                                            </span>
                                        </div>

                                        <div
                                            onClick={miniExpanded ? closeFullForm : openFullForm}
                                            className={`cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.99] ${miniExpanded ? "ring-2 ring-blue-500 rounded-md" : ""
                                                }`}
                                            title={
                                                miniExpanded
                                                    ? "Click to close full form"
                                                    : "Click to open PMS001 full form"
                                            }
                                        >
                                            <div
                                                className="bg-white border border-slate-300 shadow-lg"
                                                style={{
                                                    width: "260px",
                                                    height: "340px",
                                                    padding: "14px",
                                                    transform: miniExpanded ? "rotate(0deg)" : "rotate(-1deg)",
                                                }}
                                            >
                                                <div className="border border-black grid grid-cols-12 h-[52px] mb-1.5">
                                                    <div className="col-span-3 border-r border-black flex items-center justify-center">
                                                        <img src={bispulogo} alt="logo" className="w-9 h-9 object-contain" />
                                                    </div>
                                                    <div className="col-span-6 border-r border-black flex flex-col justify-center px-0.5">
                                                        <div className="text-[4px] font-bold text-center leading-tight">
                                                            QUALITY MANAGEMENT SYSTEM
                                                        </div>
                                                        <div className="text-[4px] font-bold text-center leading-tight">
                                                            PERIODIC MAINTENANCE SYSTEM - FORM
                                                        </div>
                                                        <div className="text-[4px] font-bold text-center leading-tight mt-0.5">
                                                            EQUIPMENT/TOOL HISTORY FILE
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 flex flex-col text-[3.5px] px-0.5">
                                                        <div className="border-b border-black flex-1 flex items-center justify-center font-bold">
                                                            BiPSU-QAA-PMS-001
                                                        </div>
                                                        <div className="border-b border-black flex-1 flex items-center justify-center">
                                                            Page: 1 of 1
                                                        </div>
                                                        <div className="border-b border-black flex-1 flex items-center justify-center">
                                                            October 09, 2020
                                                        </div>
                                                        <div className="flex-1 flex items-center justify-center font-bold">
                                                            02/01
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-[5px] text-center font-bold mb-1.5 truncate">
                                                    SCHOOL/OFFICE OF{" "}
                                                    <span className="border-b border-black inline-block px-0.5">
                                                        {officeName || "—"}
                                                    </span>
                                                </div>

                                                <div className="border border-black">
                                                    <div className="grid grid-cols-11 h-[14px] border-b border-black bg-slate-100">
                                                        {["Code", "Name", "Date", "Svc", "NSvc", "Type", "BD", "Dur", "Y", "N", "Rem"].map(
                                                            (h, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="border-r border-black last:border-r-0 text-[3.5px] font-bold flex items-center justify-center text-center"
                                                                >
                                                                    {h}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    {Array.from({ length: 7 }).map((_, rowIdx) => (
                                                        <div
                                                            key={rowIdx}
                                                            className="grid grid-cols-11 h-[14px] border-b border-black last:border-b-0"
                                                        >
                                                            {Array.from({ length: 11 }).map((_, colIdx) => (
                                                                <div
                                                                    key={colIdx}
                                                                    className="border-r border-black last:border-r-0"
                                                                />
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-3 gap-1.5 mt-3">
                                                    {["Prepared", "Attested", "Approved"].map((label) => (
                                                        <div key={label} className="text-center">
                                                            <div className="text-[3.5px] mb-1.5">{label}:</div>
                                                            <div className="border-b border-black h-1.5" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={miniExpanded ? closeFullForm : openFullForm}
                                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {miniExpanded ? (
                                                <>
                                                    <X className="w-3.5 h-3.5" />
                                                    Close PMS001 form
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                    Open PMS001 form
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {miniExpanded && (
                                        <div
                                            ref={fullFormRef}
                                            className="flex flex-col items-center gap-3 animate-fade-in-scale"
                                        >
                                            <div className="flex items-center gap-2 w-[794px] max-w-full">
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm">
                                                    PMS001
                                                </span>
                                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                    Full Form — {officeName || "PMS"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={closeFullForm}
                                                    className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                                                    title="Close full form"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div
                                                className="bg-white w-[794px] max-w-full p-[35px] border border-slate-400 shadow-xl text-black flex flex-col"
                                                style={{ minHeight: `${A4P_HEIGHT_PX}px` }}
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
                                                            <div className="text-[8px] leading-tight mb-0.5">Type:</div>
                                                            <div className="text-center text-[11px] font-bold leading-tight break-words">
                                                                QUALITY MANAGEMENT SYSTEM
                                                            </div>
                                                            <div className="text-center text-[11px] font-bold leading-tight break-words">
                                                                PERIODIC MAINTENANCE SYSTEM - FORM
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                                                            <div className="text-[8px] leading-tight mb-0.5">Title:</div>
                                                            <div className="text-center text-[11px] font-bold leading-tight break-words">
                                                                EQUIPMENT/TOOL HISTORY FILE
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 flex flex-col text-[9px]">
                                                        <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                                            <span className="leading-tight">Document No.:</span>
                                                            <span className="block text-center font-bold text-[10px] leading-tight break-words">
                                                                BiPSU-QAA-PMS-001
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                                                            <span>Page:</span>
                                                            <span className="font-bold">1 of 1</span>
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

                                                <div className="mt-5 mb-3 flex items-center justify-center gap-1 shrink-0">
                                                    <Building2 className="w-3 h-3" />
                                                    <span className="text-[12px] font-bold">SCHOOL/OFFICE OF</span>
                                                    <span
                                                        className="border-b border-black text-center font-bold text-[12px] px-2 inline-block"
                                                        style={{
                                                            width: `${Math.max(
                                                                260,
                                                                (officeName?.length || 0) * 7 + 20
                                                            )}px`,
                                                            paddingBottom: "4px",
                                                            minHeight: "16px",
                                                        }}
                                                    >
                                                        {officeName || "\u00A0"}
                                                    </span>
                                                </div>

                                                {labPmsLoading ? (
                                                    <div className="text-center py-16 border border-black">
                                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                        <p className="text-sm text-slate-500 mt-3">
                                                            Loading PMS001 records...
                                                        </p>
                                                    </div>
                                                ) : allRows.length === 0 ? (
                                                    <div className="text-center py-16 border border-black">
                                                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                                                        <p className="text-slate-500 font-medium">
                                                            No PMS001 records found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="pms-view-scroll flex-1 min-h-0 max-h-[600px]">
                                                        <table className="pms-view-table w-full table-fixed">
                                                            <thead>
                                                                <tr className="text-[9px] font-bold text-center">
                                                                    <th rowSpan="2" className="border border-black px-1 py-1 w-[7%] sticky top-0 bg-white z-20">Code<br />No.</th>
                                                                    <th rowSpan="2" className="border border-black px-1 py-1 w-[18%] sticky top-0 bg-white z-20">Name of<br />Equipment/Tools</th>
                                                                    <th rowSpan="2" className="border border-black px-1 py-1 w-[11%] sticky top-0 bg-white z-20">Date<br />Acquired</th>
                                                                    <th colSpan="2" className="border border-black px-1 py-1 w-[15%] sticky top-0 bg-white z-20">Status</th>
                                                                    <th rowSpan="2" className="border border-black px-1 py-1 w-[14%] sticky top-0 bg-white z-20">Type of<br />Equipment/tools</th>
                                                                    <th colSpan="2" className="border border-black px-1 py-1 w-[14%] sticky top-0 bg-white z-20">Breakdown</th>
                                                                    <th colSpan="2" className="border border-black px-1 py-1 w-[11%] sticky top-0 bg-white z-20">Availability<br />&amp;<br />Utilization</th>
                                                                    <th rowSpan="2" className="border border-black px-1 py-1 w-[10%] sticky top-0 bg-white z-20">Remarks</th>
                                                                </tr>
                                                                <tr className="text-[8px] font-bold text-center">
                                                                    <th className="border border-black px-1 py-1 sticky top-[26px] bg-white z-20">Serviceable</th>
                                                                    <th className="border border-black px-1 py-1 sticky top-[26px] bg-white z-20">Non<br />Serviceable</th>
                                                                    <th className="border border-black px-1 py-1 sticky top-[26px] bg-white z-20">No.</th>
                                                                    <th className="border border-black px-1 py-1 sticky top-[26px] bg-white z-20">Duration</th>
                                                                    <th className="border border-black px-1 py-1 sticky top-[26px] bg-white z-20">Yes</th>
                                                                    <th className="border border-black px-1 py-1 sticky top-[26px] bg-white z-20">No</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {allRows.map((item) => (
                                                                    <tr key={item.id} className="text-[9px] text-center h-[32px]">
                                                                        <td className="border border-black px-1 py-1">{item.codeNo?.trim() || ""}</td>
                                                                        <td className="border border-black px-1 py-1">{item.name || ""}</td>
                                                                        <td className="border border-black px-1 py-1">{item.dateAcquired || ""}</td>
                                                                        <td className="border border-black text-center align-middle">
                                                                            {item.serviceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                        </td>
                                                                        <td className="border border-black text-center align-middle">
                                                                            {item.nonServiceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                        </td>
                                                                        <td className="border border-black px-1 py-1">{item.type || ""}</td>
                                                                        <td className="border border-black px-1 py-1">{item.breakdownNo || ""}</td>
                                                                        <td className="border border-black px-1 py-1 text-[8px]">{item.breakdownDuration || ""}</td>
                                                                        <td className="border border-black text-center align-middle">
                                                                            {item.availYes ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                        </td>
                                                                        <td className="border border-black text-center align-middle">
                                                                            {item.availNo ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                        </td>
                                                                        <td className="border border-black px-1 py-1">{item.remarks || ""}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                <div className="mt-6 grid grid-cols-3 gap-8 text-[10px] shrink-0">
                                                    {["Prepared", "Attested", "Approved"].map((label) => (
                                                        <div key={label}>
                                                            <div className="mb-6 font-medium">{label}:</div>
                                                            <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">{"\u00A0"}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* TAB CONTENT — PMS002 (LANDSCAPE gaya ng BiPSUPMS002App) */}
                            {activeTab === "PMS002" && (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 w-full max-w-[1123px]">
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-sm">
                                            PMS002
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            Maintenance Activity — {officeName || "PMS"} (Landscape)
                                        </span>
                                        {pms002PerformedBy && (
                                            <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">
                                                Performed by:{" "}
                                                <strong>
                                                    {[pms002PerformedBy.FirstName, pms002PerformedBy.Middle, pms002PerformedBy.LastName]
                                                        .filter(Boolean)
                                                        .join(" ") || pms002PerformedBy.username || "N/A"}
                                                </strong>
                                            </span>
                                        )}
                                    </div>

                                    {pms002Error && (
                                        <div className="w-full max-w-[1123px] bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                                            <AlertCircle className="w-4 h-4 inline mr-1" />
                                            {pms002Error}
                                        </div>
                                    )}

                                    {labPms002Loading || pms002Loading ? (
                                        <div className="w-full max-w-[1123px] text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                            <p className="text-sm text-slate-500 mt-3">
                                                Loading PMS002 records...
                                            </p>
                                        </div>
                                    ) : allRows002.length === 0 ? (
                                        <div className="w-full max-w-[1123px] text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500 font-medium">
                                                No PMS002 records found.
                                            </p>
                                            <button
                                                onClick={() => loadPms002(selectedLab)}
                                                className="mt-3 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="bg-white w-[1123px] max-w-full border border-slate-400 shadow-xl text-black flex flex-col"
                                            style={{ minHeight: `${A4L_HEIGHT_PX}px` }}
                                        >
                                            <div className="p-[35px] flex flex-col" style={{ minHeight: `${A4L_HEIGHT_PX}px` }}>
                                                {/* HEADER */}
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
                                                            <div className="text-[8px] leading-tight mb-0.5">Type:</div>
                                                            <div className="text-center text-[11px] font-bold leading-tight break-words">
                                                                QUALITY MANAGEMENT SYSTEM
                                                            </div>
                                                            <div className="text-center text-[11px] font-bold leading-tight break-words">
                                                                PERIODIC MAINTENANCE SYSTEM - FORM
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 px-2 py-1 flex flex-col justify-center">
                                                            <div className="text-[8px] leading-tight mb-0.5">Title:</div>
                                                            <div className="text-center text-[11px] font-bold leading-tight break-words">
                                                                EQUIPMENT/TOOL HISTORY FILE
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 flex flex-col text-[9px]">
                                                        <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                                            <span className="leading-tight">Document No.:</span>
                                                            <span className="block text-center font-bold text-[10px] leading-tight break-words">
                                                                BiPSU-QAA-PMS-002
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                                                            <span>Page:</span>
                                                            <span className="font-bold">
                                                                {totalPdfPages002 > 1
                                                                    ? `1 of ${totalPdfPages002} (view)`
                                                                    : `1 of ${totalPdfPages002}`}
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
                                                <div className="mt-5 mb-3 flex items-center justify-center gap-1 shrink-0">
                                                    <Building2 className="w-3 h-3" />
                                                    <span className="text-[12px] font-bold">SCHOOL/OFFICE OF</span>
                                                    <span
                                                        className="border-b border-black text-center font-bold text-[12px] px-2 inline-block"
                                                        style={{
                                                            width: `${Math.max(
                                                                260,
                                                                (officeName?.length || 0) * 7 + 20
                                                            )}px`,
                                                            paddingBottom: "4px",
                                                            minHeight: "16px",
                                                        }}
                                                    >
                                                        {officeName || "\u00A0"}
                                                    </span>
                                                </div>

                                                {/* TABLE */}
                                                <div className="flex-1 min-h-0 overflow-auto">
                                                    <table className="w-full border-collapse border border-black table-fixed">
                                                        <thead>
                                                            <tr className="text-[9px] font-bold text-center bg-white">
                                                                <th rowSpan="2" className="border border-black px-1 py-1 w-[8%]">Code<br />No.</th>
                                                                <th rowSpan="2" className="border border-black px-1 py-1 w-[18%]">Name of<br />Equipment/Tools</th>
                                                                <th colSpan="8" className="border border-black px-1 py-1">MAINTENANCE ACTIVITY</th>
                                                                <th rowSpan="2" className="border border-black px-1 py-1 w-[10%]">Remarks</th>
                                                            </tr>
                                                            <tr className="text-[8px] font-bold text-center bg-white">
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">Routine<br />Inspection<br />&amp;<br />Cleaning</th>
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">Lubrication</th>
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">Overhauling</th>
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">Minor<br />Adjustment</th>
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">Replace<br />Worn<br />out<br />Parts</th>
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">Repair</th>
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">General<br />Recondition</th>
                                                                <th className="border border-black px-0.5 py-1 w-[7%]">Repair<br />Part</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {allRows002.map((item) => (
                                                                <tr key={item.id} className="text-[9px] text-center h-[32px]">
                                                                    <td className="border border-black px-1 py-1">{item.codeNo || ""}</td>
                                                                    <td className="border border-black px-1 py-1">{item.name || ""}</td>
                                                                    <td className="border border-black px-1 py-1">{item.routineInspection || ""}</td>
                                                                    <td className="border border-black text-center align-middle">
                                                                        {item.lubrication ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                    </td>
                                                                    <td className="border border-black text-center align-middle">
                                                                        {item.overhauling ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                    </td>
                                                                    <td className="border border-black text-center align-middle">
                                                                        {item.minorAdjustment ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                    </td>
                                                                    <td className="border border-black text-center align-middle">
                                                                        {item.replaceWornOutParts ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                    </td>
                                                                    <td className="border border-black text-center align-middle">
                                                                        {item.repair ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                    </td>
                                                                    <td className="border border-black text-center align-middle">
                                                                        {item.generalRecondition ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                    </td>
                                                                    <td className="border border-black text-center align-middle">
                                                                        {item.repairPart ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}
                                                                    </td>
                                                                    <td className="border border-black px-1 py-1">{item.remarks || ""}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* FREQUENCY CODE */}
                                                <div className="border-x border-b border-black p-2 text-[10px] font-semibold bg-white shrink-0">
                                                    <div className="mb-1 font-bold">FREQUENCY CODE</div>
                                                    <div className="grid grid-cols-2 gap-x-4">
                                                        <div><span className="font-bold">D</span> – Daily</div>
                                                        <div><span className="font-bold">SM</span> – Semi-Monthly</div>
                                                        <div><span className="font-bold">M</span> – Monthly</div>
                                                        <div><span className="font-bold">SA</span> – Semi Annually</div>
                                                        <div><span className="font-bold">W</span> – Weekly</div>
                                                        <div><span className="font-bold">Q</span> – Quarterly</div>
                                                        <div className="col-span-2"><span className="font-bold">A</span> – Annually</div>
                                                    </div>
                                                </div>

                                                {/* SIGNATURES */}
                                                <div className="mt-6 grid grid-cols-3 gap-8 text-[10px] shrink-0">
                                                    {["Prepared", "Attested", "Approved"].map((label) => (
                                                        <div key={label}>
                                                            <div className="mb-6 font-medium">{label}:</div>
                                                            <div className="border-b border-black text-center font-bold text-[10px] min-h-[20px]">{"\u00A0"}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>
        </>
    );
}