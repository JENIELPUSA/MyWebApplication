// src/components/PMSComponent/PMS002Viewer.jsx
import React from "react";
import { FileText, X, ChevronDown, Building2, AlertCircle } from "lucide-react";
import bispulogo from "../../assets/bipsulogo.png";

const A4L_WIDTH_PX = 1123;
const A4L_HEIGHT_PX = 794;

const CHECKBOX_FIELDS = [
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
// PDF PAGE — PMS002 (LANDSCAPE)
// ============================================================
export function PMS002PdfPage({
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
            }}
        >
            <header className="border border-black grid grid-cols-12 min-h-[100px]">
                <div className="col-span-3 border-r border-black flex items-center justify-center px-2 py-2">
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
                        <div className="text-center text-[11px] font-bold leading-tight break-words">GENERAL MAINTENANCE SCHEDULE</div>
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
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[8%]">Code<br />No.</th>
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[20%]">Name of<br />Equipment/Tools</th>
                        <th colSpan="8" className="border border-black px-1 py-1">MAINTENANCE ACTIVITY</th>
                        <th rowSpan="2" className="border border-black px-1 py-1 w-[10%]">Remarks</th>
                    </tr>
                    <tr className="text-[8px] font-bold text-center">
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">Routine<br />Inspection<br />&amp;<br />Cleaning</th>
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">Lubrication</th>
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">Overhauling</th>
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">Minor<br />Adjustment</th>
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">Replace<br />Worn<br />out<br />Parts</th>
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">Repair</th>
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">General<br />Recondition</th>
                        <th className="border border-black px-0.5 py-1 w-[7.5%]">Repair<br />Part</th>
                    </tr>
                </thead>
                <tbody>
                    {pageItems.map((item, idx) => (
                        <tr key={item.id || `row-${idx}`} className="text-[9px] text-center h-[32px]">
                            <td className="border border-black px-1 py-1 text-[9px]">{item.codeNo || ""}</td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.name || ""}</td>
                            {CHECKBOX_FIELDS.map((field) => (
                                <td key={field} className="border border-black text-center align-middle">
                                    {item[field] === true ? (
                                        <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span>
                                    ) : ""}
                                </td>
                            ))}
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

            <div className="border-x border-b border-black p-2 text-[10px] font-semibold bg-white">
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
// MINI + FULL VIEW — PMS002
// ============================================================
export default function PMS002Viewer({
    allRows002,
    officeName,
    performedBy,
    loading,
    error,
    miniExpanded,
    onOpenFull,
    onCloseFull,
    fullFormRef,
    totalPdfPages,
    onRetry,
}) {
    const performedByName = performedBy
        ? [performedBy.FirstName, performedBy.Middle, performedBy.LastName]
              .filter(Boolean)
              .join(" ") || performedBy.username || "N/A"
        : null;

    return (
        <>
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-sm">PMS002</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">General Maintenance Schedule (Landscape)</span>
                    {performedByName && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Performed by: <strong>{performedByName}</strong>
                        </span>
                    )}
                </div>

                {error && (
                    <div className="w-full max-w-[500px] bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 inline mr-1" />{error}
                    </div>
                )}

                {loading ? (
                    <div className="w-full max-w-[500px] text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-slate-500 mt-3">Loading PMS002 records...</p>
                    </div>
                ) : allRows002.length === 0 ? (
                    <div className="w-full max-w-[500px] text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No PMS002 records found.</p>
                        {onRetry && (
                            <button onClick={onRetry} className="mt-3 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Retry</button>
                        )}
                    </div>
                ) : (
                    <>
                        <div
                            onClick={miniExpanded ? onCloseFull : onOpenFull}
                            className={`cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.99] ${miniExpanded ? "ring-2 ring-emerald-500 rounded-md" : ""}`}
                            title={miniExpanded ? "Click to close full form" : "Click to open PMS002 full form"}
                        >
                            <div
                                className="bg-white border border-slate-300 shadow-lg"
                                style={{
                                    width: "380px",
                                    height: "268px",
                                    padding: "12px",
                                    transform: miniExpanded ? "rotate(0deg)" : "rotate(-1deg)",
                                }}
                            >
                                <div className="border border-black grid grid-cols-12 h-[44px] mb-1">
                                    <div className="col-span-3 border-r border-black flex items-center justify-center">
                                        <img src={bispulogo} alt="logo" className="w-8 h-8 object-contain" />
                                    </div>
                                    <div className="col-span-6 border-r border-black flex flex-col justify-center px-0.5">
                                        <div className="text-[3.5px] font-bold text-center leading-tight">QUALITY MANAGEMENT SYSTEM</div>
                                        <div className="text-[3.5px] font-bold text-center leading-tight">PERIODIC MAINTENANCE SYSTEM - FORM</div>
                                        <div className="text-[3.5px] font-bold text-center leading-tight mt-0.5">GENERAL MAINTENANCE SCHEDULE</div>
                                    </div>
                                    <div className="col-span-3 flex flex-col text-[3px] px-0.5">
                                        <div className="border-b border-black flex-1 flex items-center justify-center font-bold">BiPSU-QAA-PMS-002</div>
                                        <div className="border-b border-black flex-1 flex items-center justify-center">Page: 1 of {totalPdfPages}</div>
                                        <div className="border-b border-black flex-1 flex items-center justify-center">October 09, 2020</div>
                                        <div className="flex-1 flex items-center justify-center font-bold">02/01</div>
                                    </div>
                                </div>

                                <div className="text-[4.5px] text-center font-bold mb-1 truncate">
                                    SCHOOL/OFFICE OF <span className="border-b border-black inline-block px-0.5">{officeName || "—"}</span>
                                </div>

                                <div className="border border-black">
                                    <div className="grid grid-cols-11 h-[12px] border-b border-black bg-slate-100">
                                        <div className="col-span-1 border-r border-black text-[3px] font-bold flex items-center justify-center text-center">Code</div>
                                        <div className="col-span-2 border-r border-black text-[3px] font-bold flex items-center justify-center text-center">Name</div>
                                        <div className="col-span-7 border-r border-black text-[3px] font-bold flex items-center justify-center text-center">MAINTENANCE ACTIVITY</div>
                                        <div className="col-span-1 text-[3px] font-bold flex items-center justify-center text-center">Rem</div>
                                    </div>
                                    <div className="grid grid-cols-11 h-[10px] border-b border-black bg-slate-50">
                                        <div className="col-span-3 border-r border-black" />
                                        {["Routine", "Lubric", "Overhaul", "Minor", "Replace", "Repair", "Gen Recon", "Repair Part"].map((h, i) => (
                                            <div key={i} className="border-r border-black last:border-r-0 text-[2.5px] font-bold flex items-center justify-center text-center px-0.5">{h}</div>
                                        ))}
                                    </div>
                                    {Array.from({ length: 8 }).map((_, rowIdx) => (
                                        <div key={rowIdx} className="grid grid-cols-11 h-[12px] border-b border-black last:border-b-0">
                                            <div className="col-span-1 border-r border-black" />
                                            <div className="col-span-2 border-r border-black" />
                                            {Array.from({ length: 8 }).map((_, colIdx) => (
                                                <div key={colIdx} className="border-r border-black last:border-r-0" />
                                            ))}
                                            <div className="col-span-1" />
                                        </div>
                                    ))}
                                </div>

                                <div className="border-x border-b border-black mt-1 p-0.5 text-[3px] bg-white">
                                    <div className="font-bold">FREQUENCY CODE</div>
                                    <div className="grid grid-cols-4 gap-x-1">
                                        <div>D – Daily</div>
                                        <div>SM – Semi-Mo.</div>
                                        <div>M – Monthly</div>
                                        <div>SA – Semi An.</div>
                                        <div>W – Weekly</div>
                                        <div>Q – Quarterly</div>
                                        <div className="col-span-2">A – Annually</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1 mt-1.5">
                                    {["Prepared", "Attested", "Approved"].map((label) => (
                                        <div key={label} className="text-center">
                                            <div className="text-[3px] mb-1">{label}:</div>
                                            <div className="border-b border-black h-1" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={miniExpanded ? onCloseFull : onOpenFull}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            {miniExpanded ? (<><X className="w-3.5 h-3.5" />Close PMS002 form</>) : (<><ChevronDown className="w-3.5 h-3.5" />Open PMS002 form</>)}
                        </button>
                    </>
                )}
            </div>

            {miniExpanded && allRows002.length > 0 && (
                <div ref={fullFormRef} className="flex flex-col items-center gap-3 animate-fade-in-scale">
                    <div className="flex items-center gap-2 w-[1123px] max-w-full">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-sm">PMS002</span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Full Form — {officeName || "PMS"} ({allRows002.length} rows, {totalPdfPages} page{totalPdfPages > 1 ? "s" : ""})
                        </span>
                        <button type="button" onClick={onCloseFull} className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors" title="Close full form">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white w-[1123px] max-w-full p-[35px] border border-slate-400 shadow-xl text-black flex flex-col" style={{ minHeight: `${A4L_HEIGHT_PX}px` }}>
                        <header className="border border-black grid grid-cols-12 min-h-[100px] shrink-0">
                            <div className="col-span-3 border-r border-black flex items-center justify-center px-2 py-2">
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
                                    <div className="text-center text-[11px] font-bold leading-tight break-words">GENERAL MAINTENANCE SCHEDULE</div>
                                </div>
                            </div>
                            <div className="col-span-3 flex flex-col text-[9px]">
                                <div className="flex-1 border-b border-black px-1.5 py-1 flex flex-col justify-center">
                                    <span className="leading-tight">Document No.:</span>
                                    <span className="block text-center font-bold text-[10px] leading-tight break-words">BiPSU-QAA-PMS-002</span>
                                </div>
                                <div className="flex-1 border-b border-black px-1.5 py-1 flex items-center justify-between leading-tight">
                                    <span>Page:</span>
                                    <span className="font-bold">{totalPdfPages > 1 ? `1 of ${totalPdfPages} (view)` : `1 of ${totalPdfPages}`}</span>
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

                        <div className="mt-5 mb-3 flex items-center justify-center gap-1 shrink-0">
                            <Building2 className="w-3 h-3" />
                            <span className="text-[12px] font-bold">SCHOOL/OFFICE OF</span>
                            <span
                                className="border-b border-black text-center font-bold text-[12px] px-2 inline-block"
                                style={{
                                    width: `${Math.max(260, (officeName?.length || 0) * 7 + 20)}px`,
                                    paddingBottom: "4px",
                                    minHeight: "16px",
                                }}
                            >
                                {officeName || "\u00A0"}
                            </span>
                        </div>

                        <div className="pms-view-scroll flex-1 min-h-0 max-h-[420px]">
                            <table className="pms-view-table w-full table-fixed">
                                <thead>
                                    <tr className="text-[9px] font-bold text-center">
                                        <th rowSpan="2" className="border border-black px-1 py-1 w-[8%] sticky top-0 bg-white z-20">Code<br />No.</th>
                                        <th rowSpan="2" className="border border-black px-1 py-1 w-[20%] sticky top-0 bg-white z-20">Name of<br />Equipment/Tools</th>
                                        <th colSpan="8" className="border border-black px-1 py-1 sticky top-0 bg-white z-20">MAINTENANCE ACTIVITY</th>
                                        <th rowSpan="2" className="border border-black px-1 py-1 w-[10%] sticky top-0 bg-white z-20">Remarks</th>
                                    </tr>
                                    <tr className="text-[8px] font-bold text-center">
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">Routine<br />Inspection<br />&amp;<br />Cleaning</th>
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">Lubrication</th>
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">Overhauling</th>
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">Minor<br />Adjustment</th>
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">Replace<br />Worn<br />out<br />Parts</th>
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">Repair</th>
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">General<br />Recondition</th>
                                        <th className="border border-black px-0.5 py-1 w-[7.5%] sticky top-[26px] bg-white z-20">Repair<br />Part</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allRows002.map((item) => (
                                        <tr key={item.id} className="text-[9px] text-center h-[32px]">
                                            <td className="border border-black px-1 py-1">{item.codeNo || ""}</td>
                                            <td className="border border-black px-1 py-1">{item.name || ""}</td>
                                            {CHECKBOX_FIELDS.map((field) => (
                                                <td key={field} className="border border-black text-center align-middle">
                                                    <input type="checkbox" checked={item[field] === true} readOnly className="pms002-checkbox" />
                                                </td>
                                            ))}
                                            <td className="border border-black px-1 py-1">{item.remarks || ""}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

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
    );
}