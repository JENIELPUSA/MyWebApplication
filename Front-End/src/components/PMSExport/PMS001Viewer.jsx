// src/components/PMSComponent/PMS001Viewer.jsx
import React from "react";
import { FileText, X, ChevronDown, Building2 } from "lucide-react";
import bispulogo from "../../assets/bipsulogo.png";

const A4P_WIDTH_PX = 794;
const A4P_HEIGHT_PX = 1123;

// ============================================================
// PDF PAGE — PMS001 (PORTRAIT)
// ============================================================
export function PMS001PdfPage({
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
                            <td className="border border-black text-center align-middle">{item.serviceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
                            <td className="border border-black text-center align-middle">{item.nonServiceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.type || ""}</td>
                            <td className="border border-black px-1 py-1 text-[9px]">{item.breakdownNo || ""}</td>
                            <td className="border border-black px-1 py-1 text-[8px]">{item.breakdownDuration || ""}</td>
                            <td className="border border-black text-center align-middle">{item.availYes ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
                            <td className="border border-black text-center align-middle">{item.availNo ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
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
// MINI + FULL VIEW — PMS001
// ============================================================
export default function PMS001Viewer({
    allRows,
    officeName,
    performedBy,
    loading,
    miniExpanded,
    onOpenFull,
    onCloseFull,
    fullFormRef,
    totalPdfPages,
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
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm">
                        PMS001
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Equipment/Tool History File
                    </span>
                    {performedByName && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Performed by: <strong>{performedByName}</strong>
                        </span>
                    )}
                </div>

                <div
                    onClick={miniExpanded ? onCloseFull : onOpenFull}
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.99] ${miniExpanded ? "ring-2 ring-blue-500 rounded-md" : ""}`}
                    title={miniExpanded ? "Click to close full form" : "Click to open PMS001 full form"}
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
                                <div className="text-[4px] font-bold text-center leading-tight">QUALITY MANAGEMENT SYSTEM</div>
                                <div className="text-[4px] font-bold text-center leading-tight">PERIODIC MAINTENANCE SYSTEM - FORM</div>
                                <div className="text-[4px] font-bold text-center leading-tight mt-0.5">EQUIPMENT/TOOL HISTORY FILE</div>
                            </div>
                            <div className="col-span-3 flex flex-col text-[3.5px] px-0.5">
                                <div className="border-b border-black flex-1 flex items-center justify-center font-bold">BiPSU-QAA-PMS-001</div>
                                <div className="border-b border-black flex-1 flex items-center justify-center">Page: 1 of 1</div>
                                <div className="border-b border-black flex-1 flex items-center justify-center">October 09, 2020</div>
                                <div className="flex-1 flex items-center justify-center font-bold">02/01</div>
                            </div>
                        </div>

                        <div className="text-[5px] text-center font-bold mb-1.5 truncate">
                            SCHOOL/OFFICE OF <span className="border-b border-black inline-block px-0.5">{officeName || "—"}</span>
                        </div>

                        <div className="border border-black">
                            <div className="grid grid-cols-11 h-[14px] border-b border-black bg-slate-100">
                                {["Code", "Name", "Date", "Svc", "NSvc", "Type", "BD", "Dur", "Y", "N", "Rem"].map((h, i) => (
                                    <div key={i} className="border-r border-black last:border-r-0 text-[3.5px] font-bold flex items-center justify-center text-center">{h}</div>
                                ))}
                            </div>
                            {Array.from({ length: 7 }).map((_, rowIdx) => (
                                <div key={rowIdx} className="grid grid-cols-11 h-[14px] border-b border-black last:border-b-0">
                                    {Array.from({ length: 11 }).map((_, colIdx) => (
                                        <div key={colIdx} className="border-r border-black last:border-r-0" />
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
                    onClick={miniExpanded ? onCloseFull : onOpenFull}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    {miniExpanded ? (<><X className="w-3.5 h-3.5" />Close PMS001 form</>) : (<><ChevronDown className="w-3.5 h-3.5" />Open PMS001 form</>)}
                </button>
            </div>

            {miniExpanded && (
                <div ref={fullFormRef} className="flex flex-col items-center gap-3 animate-fade-in-scale">
                    <div className="flex items-center gap-2 w-[794px] max-w-full">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm">PMS001</span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Full Form — {officeName || "PMS"} ({allRows.length} rows)
                        </span>
                        <button type="button" onClick={onCloseFull} className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors" title="Close full form">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white w-[794px] max-w-full p-[35px] border border-slate-400 shadow-xl text-black flex flex-col" style={{ minHeight: `${A4P_HEIGHT_PX}px` }}>
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
                                    <span className="font-bold">1 of 1</span>
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

                        {loading ? (
                            <div className="text-center py-16 border border-black">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-sm text-slate-500 mt-3">Loading PMS001 records...</p>
                            </div>
                        ) : allRows.length === 0 ? (
                            <div className="text-center py-16 border border-black">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No PMS001 records found.</p>
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
                                                <td className="border border-black text-center align-middle">{item.serviceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
                                                <td className="border border-black text-center align-middle">{item.nonServiceable ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
                                                <td className="border border-black px-1 py-1">{item.type || ""}</td>
                                                <td className="border border-black px-1 py-1">{item.breakdownNo || ""}</td>
                                                <td className="border border-black px-1 py-1 text-[8px]">{item.breakdownDuration || ""}</td>
                                                <td className="border border-black text-center align-middle">{item.availYes ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
                                                <td className="border border-black text-center align-middle">{item.availNo ? <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: 1 }}>&#10003;</span> : ""}</td>
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
    );
}