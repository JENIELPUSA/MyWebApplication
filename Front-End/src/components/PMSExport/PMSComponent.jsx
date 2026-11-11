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
    FolderOpen,
    GraduationCap,
    Wrench,
    Download,
    Loader2,
    ArrowLeft,
    Search,
    X,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { PMSContext } from "../../contexts/PMS/pmsContext";
import { PMS002Context } from "../../contexts/PMS/pmsContext002";
import { PMS004Context } from "../../contexts/PMS/pmsContext004";
import { PMS005Context } from "../../contexts/PMS/pmsContext005";
import { PMS006Context } from "../../contexts/PMS/pmsContext006";
import { PMS007Context } from "../../contexts/PMS/pmsContext007";

// ============================================================
// VIEWERS + PDF PAGES
// ============================================================
import { PMS001Viewer, PMS001PdfPage } from "./pdfs/PMS001PdfPage";
import { PMS002Viewer, PMS002PdfPage } from "./pdfs/PMS002PdfPage";
import { PMS004Viewer, PMS004PdfPage } from "./pdfs/PMS004PdfPage";
import { PMS005Viewer, PMS005PdfPage } from "./pdfs/PMS005PdfPage";
import { PMS006Viewer, PMS006PdfPage } from "./pdfs/PMS006PdfPage";
import { PMS007Viewer, PMS007PdfPage } from "./pdfs/PMS007PdfPage";

// ============================================================
// CONSTANTS
// ============================================================
const A4P_WIDTH_PX = 794;
const A4P_HEIGHT_PX = 1123;
const A4P_WIDTH_MM = 210;
const A4P_HEIGHT_MM = 297;

const A4L_WIDTH_PX = 1123;
const A4L_HEIGHT_PX = 794;
const A4L_WIDTH_MM = 297;
const A4L_HEIGHT_MM = 210;

const ROW_HEIGHT_PX = 32;
const A4L_CONTENT_HEIGHT = A4L_HEIGHT_PX - 80;
const DEFAULT_ROWS_PER_PAGE = 10;

const DEFAULT_SIGNATURES = {
    prepared: "",
    attested: "",
    approved: "",
};

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

const CHECKBOX_FIELDS_004 = [
    "routineInspection",
    "lubrication",
    "minorAdjustment",
    "repair",
];

const PMS_META = {
    PMS001: { title: "PMS001", subtitle: "Equipment Maintenance Log" },
    PMS002: { title: "PMS002", subtitle: "Inspection & Maintenance" },
    PMS004: { title: "PMS004", subtitle: "Repair & Adjustment" },
    PMS005: { title: "PMS005", subtitle: "Spare Parts & Man-Hours" },
    PMS006: { title: "PMS006", subtitle: "Troubleshooting & Analysis" },
    PMS007: { title: "PMS007", subtitle: "Calibration Record" },
};

// ============================================================
// HELPERS
// ============================================================
const extractYear = (dateValue) => {
    if (!dateValue) return "";
    try {
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return String(dateValue).slice(0, 4);
        return String(d.getFullYear());
    } catch {
        return String(dateValue).slice(0, 4);
    }
};

// ============================================================
// MAPPERS
// ============================================================
const mapPmsRecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};
    const year = eq?.DateAcquired
        ? String(eq.DateAcquired).slice(0, 4)
        : "";
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

const generatePms002RowId = (record, index) => {
    const pms002Id =
        record?.pms002Id || record?.pms002?._id || record?._id || null;
    if (pms002Id) return `pms002-row-${pms002Id}`;
    const pmsNo = record?.pmsNo || record?.pms002?.pmsNo;
    const eqId =
        record?.equipmentId?._id ||
        record?.equipmentId ||
        record?.equipment?._id;
    if (pmsNo && eqId) return `pms002-row-${eqId}-${pmsNo}`;
    return `pms002-row-idx${index}`;
};

const mapPms002RecordToRow = (record, index) => {
    const pms002Id =
        record?.pms002Id || record?.pms002?._id || record?._id || null;
    const p2 =
        record?.pms002 || (record?.pmsNo !== undefined ? record : {}) || {};
    const eq =
        record?.equipment ||
        (record?.equipmentId && typeof record.equipmentId === "object"
            ? record.equipmentId
            : null) ||
        {};
    const p1 = record?.pms001 || {};
    const dateAcquiredRaw = p1?.DateAcquired || eq?.DateAcquired || null;
    const year = dateAcquiredRaw
        ? String(dateAcquiredRaw).slice(0, 4)
        : "";
    const name =
        p1?.equipmentName ||
        (eq?.Brand && eq?.Specification
            ? `${eq.Brand} ${eq.Specification}`.trim()
            : eq?.Brand || "") ||
        "";
    const codeNo = p1?.code || eq?.code || "";
    return {
        id: generatePms002RowId(record, index),
        rowIndex: index + 1,
        pmsNo: p2?.pmsNo || record?.pmsNo || 0,
        pmsId: pms002Id,
        equipmentId: eq?._id || record?.equipmentId || null,
        laboratoryId:
            (record?.laboratoryId &&
            typeof record.laboratoryId === "object"
                ? record.laboratoryId._id
                : record?.laboratoryId) || null,
        codeNo,
        name,
        dateAcquired: year,
        remarks: p2?.remarks || "",
        routineInspection: p2?.routineInspection ?? false,
        lubrication: p2?.lubrication ?? false,
        overhauling: p2?.overhauling ?? false,
        minorAdjustment: p2?.minorAdjustment ?? false,
        replaceWornOutParts: p2?.replaceWornOutParts ?? false,
        repair: p2?.repair ?? false,
        generalRecondition: p2?.generalRecondition ?? false,
        repairPart: p2?.repairPart ?? false,
    };
};

const mapPms004RecordToRow = (record, index) => {
    const eq =
        record?.equipment ||
        (record?.equipmentId && typeof record.equipmentId === "object"
            ? record.equipmentId
            : null) ||
        {};
    const year = eq?.DateAcquired
        ? String(eq.DateAcquired).slice(0, 4)
        : "";
    const name =
        (eq?.Brand && eq?.Specification
            ? `${eq.Brand} ${eq.Specification}`.trim()
            : eq?.Brand || "") || "";
    return {
        id: record?._id
            ? `pms004-row-${record._id}`
            : `pms004-row-idx${index}`,
        rowIndex: index + 1,
        pmsId: record?._id || null,
        equipmentId: eq?._id || null,
        laboratoryId:
            (record?.laboratoryId &&
            typeof record.laboratoryId === "object"
                ? record.laboratoryId._id
                : record?.laboratoryId) || null,
        codeNo: eq?.code || "",
        name,
        dateAcquired: year,
        remarks: record?.remarks || "",
        routineInspection: record?.routineInspection ?? false,
        lubrication: record?.lubrication ?? false,
        minorAdjustment: record?.minorAdjustment ?? false,
        repair: record?.repair ?? false,
        performedBy: record?.performedBy || "",
    };
};

const mapPms005RecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};
    return {
        id: record?._id || `pms005-row-idx${index}`,
        rowIndex: index + 1,
        pmsId: record?._id || null,
        equipmentId: eq?._id || record?.equipmentId || null,
        laboratoryId:
            typeof record?.laboratoryId === "string"
                ? record.laboratoryId
                : record?.laboratoryId?._id || null,
        codeNo: eq?.code || "",
        name: eq?.Brand || "",
        period: extractYear(eq?.DateAcquired),
        Spare_Parts: record?.Spare_Parts || "",
        Man_hour_used: record?.Man_hour_used || "",
        Problem_Encounter: record?.Problem_Encounter || "",
        Tech_InCharge: record?.Tech_InCharge || record?.incharge || "",
        Date: record?.Date
            ? String(record.Date).slice(0, 10)
            : record?.createdAt
            ? String(record.createdAt).slice(0, 10)
            : "",
    };
};

const mapPms006RecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};
    return {
        id: record?._id || `pms006-row-idx${index}`,
        rowIndex: index + 1,
        pmsId: record?._id || null,
        equipmentId: eq?._id || record?.equipmentId || null,
        laboratoryId:
            typeof record?.laboratoryId === "string"
                ? record.laboratoryId
                : record?.laboratoryId?._id || null,
        codeNo: record?.codeNo || eq?.code || "",
        name: record?.name || eq?.Brand || "",
        analysisTrouble: record?.analysisTrouble || "",
        adjustmentSetting: record?.adjustmentSetting || "",
        manHourUse: record?.manHourUse || record?.Man_hour_used || "",
        counterMeasures: record?.counterMeasures || "",
        improvementRepairProcedure:
            record?.improvementRepairProcedure || "",
        sparePartsMaterialsUsed: record?.sparePartsMaterialsUsed || "",
        incharge: record?.incharge || record?.Tech_InCharge || "",
        maintenanceDate: record?.maintenanceDate
            ? String(record.maintenanceDate).slice(0, 10)
            : record?.Date
            ? String(record.Date).slice(0, 10)
            : record?.createdAt
            ? String(record.createdAt).slice(0, 10)
            : "",
    };
};

const mapPms007RecordToRow = (record, index) => {
    const eq = record?.equipmentId || {};
    return {
        id: record?._id || `pms007-row-idx${index}`,
        rowIndex: index + 1,
        pmsId: record?._id || null,
        equipmentId: eq?._id || record?.equipmentId || null,
        laboratoryId:
            typeof record?.laboratoryId === "string"
                ? record.laboratoryId
                : record?.laboratoryId?._id || null,
        codeNo: record?.codeNo || eq?.code || "",
        instrumentName: record?.instrumentName || eq?.Brand || "",
        instrumentType: record?.instrumentType || eq?.Type || "",
        accuracy: record?.accuracy || "",
        errorObserved: record?.errorObserved || "",
        errorCorrected: record?.errorCorrected || "",
        calibratedBy: record?.calibratedBy || "",
        date: record?.date
            ? String(record.date).slice(0, 10)
            : record?.createdAt
            ? String(record.createdAt).slice(0, 10)
            : "",
        remarks: record?.remarks || "",
    };
};

// ============================================================
// NORMALIZERS
// ============================================================
const normalizePms001Response = (result) => {
    if (!result) return { records: [], performedBy: null, total: 0 };
    let records = [];
    if (Array.isArray(result?.pmsRecord) && result.pmsRecord.length > 0)
        records = result.pmsRecord;
    else if (Array.isArray(result?.data) && result.data.length > 0)
        records = result.data;
    else if (Array.isArray(result?.data?.pmsRecord))
        records = result.data.pmsRecord;
    else if (Array.isArray(result?.laboratory)) records = result.laboratory;
    const performedBy =
        (result?.laboratory && !Array.isArray(result.laboratory)
            ? result.laboratory.performedBy
            : null) ||
        result?.data?.performedBy ||
        result?.performedBy ||
        null;
    const total =
        typeof result?.totalRecords === "number"
            ? result.totalRecords
            : typeof result?.total === "number"
            ? result.total
            : records.length;
    return { records, performedBy, total };
};

const normalizePms002Response = (result) => {
    if (!result) return { records: [], performedBy: null, total: 0 };
    let records = [];
    if (
        Array.isArray(result?.pmsRecord002) &&
        result.pmsRecord002.length > 0
    )
        records = result.pmsRecord002;
    else if (Array.isArray(result?.data) && result.data.length > 0)
        records = result.data;
    else if (Array.isArray(result?.data?.pmsRecord002))
        records = result.data.pmsRecord002;
    else if (
        Array.isArray(result?.laboratory) &&
        result.laboratory.length > 0
    )
        records = result.laboratory;
    else if (Array.isArray(result?.pmsRecord)) records = result.pmsRecord;
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

const normalizePms004Response = (result) => {
    if (!result) return { records: [], performedBy: null, total: 0 };
    let records = [];
    if (Array.isArray(result?.pmsRecord)) records = result.pmsRecord;
    else if (Array.isArray(result?.data?.pmsRecord))
        records = result.data.pmsRecord;
    else if (Array.isArray(result?.data)) records = result.data;
    const performedBy =
        result?.data?.performedBy || result?.performedBy || null;
    const total =
        typeof result?.total === "number"
            ? result.total
            : typeof result?.totalRecords === "number"
            ? result.totalRecords
            : records.length;
    return { records, performedBy, total };
};

const normalizePms005Response = (result) => {
    if (!result) return { records: [], performedBy: null, total: 0 };
    let records = [];
    if (Array.isArray(result?.data)) records = result.data;
    else if (Array.isArray(result?.pmsRecord)) records = result.pmsRecord;
    else if (Array.isArray(result?.data?.pmsRecord))
        records = result.data.pmsRecord;
    const performedBy =
        result?.laboratory?.performedBy ||
        result?.data?.performedBy ||
        result?.performedBy ||
        null;
    const total =
        typeof result?.totalRecords === "number"
            ? result.totalRecords
            : typeof result?.total === "number"
            ? result.total
            : records.length;
    return { records, performedBy, total };
};

const normalizePms006Response = (result) => {
    if (!result) return { records: [], performedBy: null, total: 0 };
    let records = [];
    if (Array.isArray(result?.data)) records = result.data;
    else if (Array.isArray(result?.pmsRecord)) records = result.pmsRecord;
    else if (Array.isArray(result?.pmsRecord006))
        records = result.pmsRecord006;
    else if (Array.isArray(result?.data?.pmsRecord006))
        records = result.data.pmsRecord006;
    else if (Array.isArray(result?.data?.pmsRecord))
        records = result.data.pmsRecord;
    const performedBy =
        result?.laboratory?.performedBy ||
        result?.data?.performedBy ||
        result?.performedBy ||
        null;
    const total =
        typeof result?.totalRecords === "number"
            ? result.totalRecords
            : typeof result?.totalPMS006 === "number"
            ? result.totalPMS006
            : typeof result?.total === "number"
            ? result.total
            : records.length;
    return { records, performedBy, total };
};

const normalizePms007Response = (result) => {
    if (!result) return { records: [], performedBy: null, total: 0 };
    let records = [];
    if (Array.isArray(result?.data)) records = result.data;
    else if (Array.isArray(result?.pmsRecord)) records = result.pmsRecord;
    else if (Array.isArray(result?.pmsRecord007))
        records = result.pmsRecord007;
    else if (Array.isArray(result?.data?.pmsRecord007))
        records = result.data.pmsRecord007;
    else if (Array.isArray(result?.data?.pmsRecord))
        records = result.data.pmsRecord;
    const performedBy =
        result?.laboratory?.performedBy ||
        result?.data?.performedBy ||
        result?.performedBy ||
        null;
    const total =
        typeof result?.totalRecords === "number"
            ? result.totalRecords
            : typeof result?.totalPMS007 === "number"
            ? result.totalPMS007
            : typeof result?.total === "number"
            ? result.total
            : records.length;
    return { records, performedBy, total };
};

// ============================================================
// CHUNK + WAIT
// ============================================================
const chunkItemsIntoPages = (
    allItems,
    rowsPerPage = DEFAULT_ROWS_PER_PAGE
) => {
    if (!Array.isArray(allItems) || allItems.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < allItems.length; i += rowsPerPage)
        pages.push(allItems.slice(i, i + rowsPerPage));
    return pages;
};

const waitForImages = (root) => {
    const images = Array.from(root.querySelectorAll("img"));
    return Promise.all(
        images.map((img) => {
            if (img.complete && img.naturalWidth > 0)
                return Promise.resolve();
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
// FOLDER CARD
// ============================================================
function AnimatedFolderCard({
    title,
    code,
    count,
    icon: Icon,
    textColor,
    desc,
    onClick,
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
                            Laboratory
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                            {count || 0} PMS
                        </span>
                    </div>
                    <div className="my-auto py-1">
                        <div className="flex items-center gap-1.5 mb-1">
                            {Icon && (
                                <Icon
                                    className={`w-4 h-4 ${
                                        textColor || "text-blue-600"
                                    }`}
                                />
                            )}
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
                        <span>PMS Records</span>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
                <div className="relative w-full h-[70%] bg-gradient-to-t from-blue-400 to-blue-400/95 dark:from-blue-600 dark:to-blue-600/95 rounded-b-2xl rounded-tr-2xl shadow-lg z-20 transition-all duration-300 flex flex-col justify-end p-4 border-t border-blue-300/50">
                    <div className="bg-blue-500/80 backdrop-blur-sm border border-blue-300/40 rounded-xl p-2.5 flex items-center justify-between text-blue-950 dark:text-blue-100 font-bold text-xs shadow-inner">
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
// MAIN COMPONENT
// ============================================================
export default function PMSComponent() {
    // ---------------- CONTEXTS ----------------
    const {
        departmentsWithLabs,
        fetchDepartmentsWithLabEquipments,
        fetchAllPMS,
        displayAllPMS001,
        loading: pms001Loading,
        error: pms001Error,
    } = useContext(PMSContext);

    const pms002Context = useContext(PMS002Context);
    const {
        displayAllPMS002,
        fetchAllPMS002,
        loading: pms002Loading,
        error: pms002Error,
    } = pms002Context || {};
    const fetchPms002 = useMemo(
        () => displayAllPMS002 || fetchAllPMS002 || null,
        [displayAllPMS002, fetchAllPMS002]
    );

    const pms004Context = useContext(PMS004Context);
    const {
        fetchAllPMS004,
        loading: pms004Loading,
        error: pms004Error,
    } = pms004Context || {};

    const pms005Context = useContext(PMS005Context);
    const {
        fetchAllPMS005,
        performedBy: pms005CtxPerformedBy,
        loading: pms005Loading,
        error: pms005Error,
    } = pms005Context || {};

    const pms006Context = useContext(PMS006Context);
    const {
        fetchAllPMS006,
        performedBy: pms006CtxPerformedBy,
        loading: pms006Loading,
        error: pms006Error,
    } = pms006Context || {};

    const pms007Context = useContext(PMS007Context);
    const {
        fetchAllPMS007,
        performedBy: pms007CtxPerformedBy,
        loading: pms007Loading,
        error: pms007Error,
    } = pms007Context || {};

    // ---------------- STATE ----------------
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedLab, setSelectedLab] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [miniExpanded, setMiniExpanded] = useState(false);
    const [miniExpanded002, setMiniExpanded002] = useState(false);
    const [miniExpanded004, setMiniExpanded004] = useState(false);
    const [miniExpanded005, setMiniExpanded005] = useState(false);
    const [miniExpanded006, setMiniExpanded006] = useState(false);
    const [miniExpanded007, setMiniExpanded007] = useState(false);

    const [labPmsRecords, setLabPmsRecords] = useState([]);
    const [labPms002Records, setLabPms002Records] = useState([]);
    const [labPms004Records, setLabPms004Records] = useState([]);
    const [labPms005Records, setLabPms005Records] = useState([]);
    const [labPms006Records, setLabPms006Records] = useState([]);
    const [labPms007Records, setLabPms007Records] = useState([]);

    const [labPmsLoading, setLabPmsLoading] = useState(false);
    const [labPms002Loading, setLabPms002Loading] = useState(false);
    const [labPms004Loading, setLabPms004Loading] = useState(false);
    const [labPms005Loading, setLabPms005Loading] = useState(false);
    const [labPms006Loading, setLabPms006Loading] = useState(false);
    const [labPms007Loading, setLabPms007Loading] = useState(false);

    const [pms001PerformedBy, setPms001PerformedBy] = useState(null);
    const [pms001Total, setPms001Total] = useState(0);
    const [pms002PerformedBy, setPms002PerformedBy] = useState(null);
    const [pms002Total, setPms002Total] = useState(0);
    const [pms004PerformedBy, setPms004PerformedBy] = useState(null);
    const [pms004LocalTotal, setPms004LocalTotal] = useState(0);
    const [pms005PerformedBy, setPms005PerformedBy] = useState(null);
    const [pms005Total, setPms005Total] = useState(0);
    const [pms006PerformedBy, setPms006PerformedBy] = useState(null);
    const [pms006Total, setPms006Total] = useState(0);
    const [pms007PerformedBy, setPms007PerformedBy] = useState(null);
    const [pms007Total, setPms007Total] = useState(0);

    const [signatures, setSignatures] = useState(DEFAULT_SIGNATURES);

    const [downloadingKey, setDownloadingKey] = useState(null);
    const [notification, setNotification] = useState(null);
    const [computedRowsPerPage, setComputedRowsPerPage] = useState(
        DEFAULT_ROWS_PER_PAGE
    );

    const pdfContainerRef = useRef(null);
    const toastTimerRef = useRef(null);
    const fullFormRef = useRef(null);
    const fullForm002Ref = useRef(null);
    const fullForm004Ref = useRef(null);
    const fullForm005Ref = useRef(null);
    const fullForm006Ref = useRef(null);
    const fullForm007Ref = useRef(null);
    const topAnchorRef = useRef(null);

    // Sidebar transition state
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [sidebarMounted, setSidebarMounted] = useState(false);

    useEffect(() => {
        fetchDepartmentsWithLabEquipments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(
        () => () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        },
        []
    );

    const showToast = useCallback((message) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setNotification(message);
        toastTimerRef.current = setTimeout(
            () => setNotification(null),
            3000
        );
    }, []);

    const handleSignatureChange = (field, value) => {
        setSignatures((prev) => ({ ...prev, [field]: value }));
    };

    // Alinman ang naka-expand
    const isAnyExpanded =
        miniExpanded ||
        miniExpanded002 ||
        miniExpanded004 ||
        miniExpanded005 ||
        miniExpanded006 ||
        miniExpanded007;

    const activeSidebarKey = miniExpanded
        ? "PMS001"
        : miniExpanded002
        ? "PMS002"
        : miniExpanded004
        ? "PMS004"
        : miniExpanded005
        ? "PMS005"
        : miniExpanded006
        ? "PMS006"
        : miniExpanded007
        ? "PMS007"
        : null;
    const activeMeta = activeSidebarKey ? PMS_META[activeSidebarKey] : null;

    // Sidebar mount/unmount + slide animation
    useEffect(() => {
        if (isAnyExpanded) {
            setSidebarMounted(true);
            const raf = requestAnimationFrame(() => {
                requestAnimationFrame(() => setSidebarVisible(true));
            });
            return () => cancelAnimationFrame(raf);
        } else {
            setSidebarVisible(false);
            const t = setTimeout(() => setSidebarMounted(false), 320);
            return () => clearTimeout(t);
        }
    }, [isAnyExpanded]);

    // rows-per-page measurement
    useEffect(() => {
        const measure = () => {
            const firstPage = pdfContainerRef.current?.querySelector(
                ".pdf-page-pms002, .pdf-page-pms004, .pdf-page-pms006, .pdf-page-pms007"
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
            if (!header || !mainTable || !signatureBlock) return;
            const headerH = header.getBoundingClientRect().height;
            const freqH = freqBlock
                ? freqBlock.getBoundingClientRect().height
                : 0;
            const signatureH =
                signatureBlock.getBoundingClientRect().height;
            const theadH = Array.from(
                mainTable.querySelectorAll("thead > tr")
            ).reduce((s, tr) => s + tr.getBoundingClientRect().height, 0);
            let rowH = ROW_HEIGHT_PX;
            const firstDataRow = Array.from(
                mainTable.querySelectorAll("tbody > tr")
            ).find((tr) => !tr.querySelector("td[colspan]"));
            if (firstDataRow) {
                const m = firstDataRow.getBoundingClientRect().height;
                if (m > 0) rowH = m;
            }
            const totalFixed =
                headerH + theadH + freqH + signatureH + 20 + 12 + 24;
            setComputedRowsPerPage(
                Math.max(
                    1,
                    Math.floor((A4L_CONTENT_HEIGHT - totalFixed) / rowH)
                )
            );
        };
        const t = setTimeout(measure, 150);
        return () => clearTimeout(t);
    }, [
        labPms002Records.length,
        labPms004Records.length,
        labPms006Records.length,
        labPms007Records.length,
        labPms002Loading,
        labPms004Loading,
        labPms006Loading,
        labPms007Loading,
    ]);

    // ---------------- LOADERS ----------------
    const loadPms001 = useCallback(
        async (lab) => {
            if (!lab) return;
            const labId = lab.laboratoryId || lab._id;
            setLabPmsLoading(true);
            try {
                let result;
                if (typeof fetchAllPMS === "function")
                    result = await fetchAllPMS({ laboratoryId: labId });
                else if (typeof displayAllPMS001 === "function")
                    result = await displayAllPMS001({ laboratoryId: labId });
                else {
                    setLabPmsRecords([]);
                    setPms001Total(0);
                    return;
                }
                const { records, performedBy, total } =
                    normalizePms001Response(result);
                setLabPmsRecords(records);
                setPms001PerformedBy(performedBy);
                setPms001Total(total);
            } catch (err) {
                console.error(err);
                setLabPmsRecords([]);
                setPms001PerformedBy(null);
                setPms001Total(0);
            } finally {
                setLabPmsLoading(false);
            }
        },
        [fetchAllPMS, displayAllPMS001]
    );

    const loadPms002 = useCallback(
        async (lab) => {
            if (!fetchPms002 || !lab) return;
            const labId = lab.laboratoryId || lab._id;
            setLabPms002Loading(true);
            try {
                const result = await fetchPms002({ laboratoryId: labId });
                const { records, performedBy, total } =
                    normalizePms002Response(result);
                setLabPms002Records(records);
                setPms002PerformedBy(performedBy);
                setPms002Total(total);
            } catch (err) {
                console.error(err);
                setLabPms002Records([]);
                setPms002PerformedBy(null);
                setPms002Total(0);
            } finally {
                setLabPms002Loading(false);
            }
        },
        [fetchPms002]
    );

    const loadPms004 = useCallback(
        async (lab) => {
            if (!fetchAllPMS004 || !lab) return;
            const labId = lab.laboratoryId || lab._id;
            setLabPms004Loading(true);
            try {
                const result = await fetchAllPMS004({
                    laboratoryId: labId,
                });
                const { records, performedBy, total } =
                    normalizePms004Response(result);
                setLabPms004Records(records);
                setPms004PerformedBy(performedBy);
                setPms004LocalTotal(total);
            } catch (err) {
                console.error(err);
                setLabPms004Records([]);
                setPms004PerformedBy(null);
                setPms004LocalTotal(0);
            } finally {
                setLabPms004Loading(false);
            }
        },
        [fetchAllPMS004]
    );

    const loadPms005 = useCallback(
        async (lab) => {
            if (!fetchAllPMS005 || !lab) return;
            const labId = lab.laboratoryId || lab._id;
            setLabPms005Loading(true);
            try {
                const result = await fetchAllPMS005({
                    laboratoryId: labId,
                });
                const { records, performedBy, total } =
                    normalizePms005Response(result);
                const fallbackPerformedBy =
                    performedBy || pms005CtxPerformedBy || null;
                setLabPms005Records(records);
                setPms005PerformedBy(fallbackPerformedBy);
                setPms005Total(total);
            } catch (err) {
                console.error(err);
                setLabPms005Records([]);
                setPms005PerformedBy(null);
                setPms005Total(0);
            } finally {
                setLabPms005Loading(false);
            }
        },
        [fetchAllPMS005, pms005CtxPerformedBy]
    );

    const loadPms006 = useCallback(
        async (lab) => {
            if (!fetchAllPMS006 || !lab) return;
            const labId = lab.laboratoryId || lab._id;
            setLabPms006Loading(true);
            try {
                const result = await fetchAllPMS006({
                    laboratoryId: labId,
                });
                const { records, performedBy, total } =
                    normalizePms006Response(result);
                const fallbackPerformedBy =
                    performedBy || pms006CtxPerformedBy || null;
                setLabPms006Records(records);
                setPms006PerformedBy(fallbackPerformedBy);
                setPms006Total(total);
            } catch (err) {
                console.error(err);
                setLabPms006Records([]);
                setPms006PerformedBy(null);
                setPms006Total(0);
            } finally {
                setLabPms006Loading(false);
            }
        },
        [fetchAllPMS006, pms006CtxPerformedBy]
    );

    const loadPms007 = useCallback(
        async (lab) => {
            if (!fetchAllPMS007 || !lab) return;
            const labId = lab.laboratoryId || lab._id;
            setLabPms007Loading(true);
            try {
                const result = await fetchAllPMS007({
                    laboratoryId: labId,
                });
                const { records, performedBy, total } =
                    normalizePms007Response(result);
                const fallbackPerformedBy =
                    performedBy || pms007CtxPerformedBy || null;
                setLabPms007Records(records);
                setPms007PerformedBy(fallbackPerformedBy);
                setPms007Total(total);
            } catch (err) {
                console.error(err);
                setLabPms007Records([]);
                setPms007PerformedBy(null);
                setPms007Total(0);
            } finally {
                setLabPms007Loading(false);
            }
        },
        [fetchAllPMS007, pms007CtxPerformedBy]
    );

    // ---------------- HANDLERS ----------------
    const handleLabClick = async (lab) => {
        setSelectedLab(lab);
        setLabPmsRecords([]);
        setLabPms002Records([]);
        setLabPms004Records([]);
        setLabPms005Records([]);
        setLabPms006Records([]);
        setLabPms007Records([]);
        setPms001PerformedBy(null);
        setPms001Total(0);
        setPms002PerformedBy(null);
        setPms002Total(0);
        setPms004PerformedBy(null);
        setPms004LocalTotal(0);
        setPms005PerformedBy(null);
        setPms005Total(0);
        setPms006PerformedBy(null);
        setPms006Total(0);
        setPms007PerformedBy(null);
        setPms007Total(0);
        setMiniExpanded(false);
        setMiniExpanded002(false);
        setMiniExpanded004(false);
        setMiniExpanded005(false);
        setMiniExpanded006(false);
        setMiniExpanded007(false);
        await Promise.all([
            loadPms001(lab),
            loadPms002(lab),
            loadPms004(lab),
            loadPms005(lab),
            loadPms006(lab),
            loadPms007(lab),
        ]);
    };

    const closeAllExpanded = () => {
        setMiniExpanded(false);
        setMiniExpanded002(false);
        setMiniExpanded004(false);
        setMiniExpanded005(false);
        setMiniExpanded006(false);
        setMiniExpanded007(false);
    };

    const openOnly = (setter) => {
        closeAllExpanded();
        setter(true);
    };

    const openFullForm = () => openOnly(setMiniExpanded);
    const closeFullForm = () => setMiniExpanded(false);

    const openFullForm002 = () => openOnly(setMiniExpanded002);
    const closeFullForm002 = () => setMiniExpanded002(false);

    const openFullForm004 = () => openOnly(setMiniExpanded004);
    const closeFullForm004 = () => setMiniExpanded004(false);

    const openFullForm005 = () => openOnly(setMiniExpanded005);
    const closeFullForm005 = () => setMiniExpanded005(false);

    const openFullForm006 = () => openOnly(setMiniExpanded006);
    const closeFullForm006 = () => setMiniExpanded006(false);

    const openFullForm007 = () => openOnly(setMiniExpanded007);
    const closeFullForm007 = () => setMiniExpanded007(false);

    // ESC key to close sidebar
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && isAnyExpanded) closeAllExpanded();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAnyExpanded]);

    const getDeptIcon = (n = "") => {
        const u = n.toUpperCase();
        if (u.includes("LAB")) return FlaskConical;
        if (u.includes("NURS")) return Stethoscope;
        if (u.includes("STCS") || u.includes("TECH") || u.includes("COMPUTER"))
            return GraduationCap;
        if (u.includes("ENG") || u.includes("FACIL")) return Settings;
        return FolderOpen;
    };
    const getDeptTextColor = (n = "") => {
        const u = n.toUpperCase();
        if (u.includes("NURS")) return "text-rose-600";
        if (u.includes("STCS") || u.includes("TECH")) return "text-purple-600";
        return "text-blue-600";
    };

    // ---------------- DERIVED ----------------
    const selectedDeptLabs = useMemo(
        () => selectedDept?.laboratories || [],
        [selectedDept]
    );
    const filteredLabs = useMemo(
        () =>
            selectedDeptLabs.filter((l) =>
                (l.LaboratoryName || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            ),
        [selectedDeptLabs, searchQuery]
    );

    const allRows = useMemo(
        () => labPmsRecords.map(mapPmsRecordToRow),
        [labPmsRecords]
    );
    const allRows002 = useMemo(
        () => labPms002Records.map(mapPms002RecordToRow),
        [labPms002Records]
    );
    const allRows004 = useMemo(
        () => labPms004Records.map(mapPms004RecordToRow),
        [labPms004Records]
    );
    const allRows005 = useMemo(
        () => labPms005Records.map(mapPms005RecordToRow),
        [labPms005Records]
    );
    const allRows006 = useMemo(
        () => labPms006Records.map(mapPms006RecordToRow),
        [labPms006Records]
    );
    const allRows007 = useMemo(
        () => labPms007Records.map(mapPms007RecordToRow),
        [labPms007Records]
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
    const pdfPages004 = useMemo(
        () => chunkItemsIntoPages(allRows004, computedRowsPerPage),
        [allRows004, computedRowsPerPage]
    );
    const totalPdfPages004 = pdfPages004.length || 1;
    const pdfPages005 = useMemo(
        () => chunkItemsIntoPages(allRows005, computedRowsPerPage),
        [allRows005, computedRowsPerPage]
    );
    const totalPdfPages005 = pdfPages005.length || 1;
    const pdfPages006 = useMemo(
        () => chunkItemsIntoPages(allRows006, computedRowsPerPage),
        [allRows006, computedRowsPerPage]
    );
    const totalPdfPages006 = pdfPages006.length || 1;
    const pdfPages007 = useMemo(
        () => chunkItemsIntoPages(allRows007, computedRowsPerPage),
        [allRows007, computedRowsPerPage]
    );
    const totalPdfPages007 = pdfPages007.length || 1;

    // Active rows count (para sa download button sa sidebar)
    const activeRowsCount = useMemo(() => {
        if (!activeSidebarKey) return 0;
        switch (activeSidebarKey) {
            case "PMS001":
                return allRows.length;
            case "PMS002":
                return allRows002.length;
            case "PMS004":
                return allRows004.length;
            case "PMS005":
                return allRows005.length;
            case "PMS006":
                return allRows006.length;
            case "PMS007":
                return allRows007.length;
            default:
                return 0;
        }
    }, [
        activeSidebarKey,
        allRows.length,
        allRows002.length,
        allRows004.length,
        allRows005.length,
        allRows006.length,
        allRows007.length,
    ]);

    // ---------------- DOWNLOAD PDF (per PMS) ----------------
    const handleDownloadSingle = useCallback(
        async (formTag) => {
            if (!pdfContainerRef.current)
                return showToast("PDF container not found.");

            const isPMS002 = formTag === "PMS002";
            const isPMS004 = formTag === "PMS004";
            const isPMS005 = formTag === "PMS005";
            const isPMS006 = formTag === "PMS006";
            const isPMS007 = formTag === "PMS007";
            const isLandscape =
                isPMS002 || isPMS004 || isPMS006 || isPMS007;

            const rowsCount = isPMS002
                ? allRows002.length
                : isPMS004
                ? allRows004.length
                : isPMS005
                ? allRows005.length
                : isPMS006
                ? allRows006.length
                : isPMS007
                ? allRows007.length
                : allRows.length;
            if (rowsCount === 0)
                return showToast(`Walang ${formTag} records para i-download.`);

            setDownloadingKey(formTag);
            try {
                const selector = isPMS002
                    ? ".pdf-page-pms002"
                    : isPMS004
                    ? ".pdf-page-pms004"
                    : isPMS005
                    ? ".pdf-page-pms005"
                    : isPMS006
                    ? ".pdf-page-pms006"
                    : isPMS007
                    ? ".pdf-page-pms007"
                    : ".pdf-page-pms001";
                const pageNodes = Array.from(
                    pdfContainerRef.current.querySelectorAll(selector)
                );
                if (pageNodes.length === 0)
                    return showToast("No pages to export.");
                if (document.fonts && document.fonts.ready)
                    await document.fonts.ready;
                await waitForImages(pdfContainerRef.current);
                await new Promise((r) =>
                    requestAnimationFrame(() =>
                        requestAnimationFrame(r)
                    )
                );

                const pdf = new jsPDF({
                    orientation: isLandscape ? "landscape" : "portrait",
                    unit: "mm",
                    format: "a4",
                    compress: true,
                });
                const widthPx = isLandscape ? A4L_WIDTH_PX : A4P_WIDTH_PX;
                const heightPx = isLandscape ? A4L_HEIGHT_PX : A4P_HEIGHT_PX;
                const widthMm = isLandscape ? A4L_WIDTH_MM : A4P_WIDTH_MM;
                const heightMm = isLandscape ? A4L_HEIGHT_MM : A4P_HEIGHT_MM;

                for (let i = 0; i < pageNodes.length; i++) {
                    const canvas = await html2canvas(pageNodes[i], {
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
                    pdf.addImage(
                        image,
                        "PNG",
                        0,
                        0,
                        widthMm,
                        heightMm,
                        undefined,
                        "FAST"
                    );
                }

                const safeOffice = (officeName || "PMS")
                    .trim()
                    .replace(/[^a-zA-Z0-9_-]/g, "_");
                pdf.save(`${formTag}_${safeOffice}_${Date.now()}.pdf`);
                showToast(
                    `${formTag} PDF generated (${pageNodes.length} page${
                        pageNodes.length > 1 ? "s" : ""
                    }).`
                );
            } catch (err) {
                console.error("PDF generation error:", err);
                showToast(`Failed to generate ${formTag} PDF.`);
            } finally {
                setDownloadingKey(null);
            }
        },
        [
            allRows.length,
            allRows002.length,
            allRows004.length,
            allRows005.length,
            allRows006.length,
            allRows007.length,
            officeName,
            showToast,
        ]
    );

    // ---------------- DOWNLOAD ALL ----------------
    const handleDownloadAll = useCallback(async () => {
        if (!pdfContainerRef.current)
            return showToast("PDF container not found.");

        const groups = [
            { code: "PMS001", selector: ".pdf-page-pms001", rows: allRows.length, landscape: false },
            { code: "PMS002", selector: ".pdf-page-pms002", rows: allRows002.length, landscape: true },
            { code: "PMS004", selector: ".pdf-page-pms004", rows: allRows004.length, landscape: true },
            { code: "PMS005", selector: ".pdf-page-pms005", rows: allRows005.length, landscape: false },
            { code: "PMS006", selector: ".pdf-page-pms006", rows: allRows006.length, landscape: true },
            { code: "PMS007", selector: ".pdf-page-pms007", rows: allRows007.length, landscape: true },
        ].filter((g) => g.rows > 0);

        if (groups.length === 0)
            return showToast("Walang records para i-download.");

        setDownloadingKey("ALL");
        try {
            if (document.fonts && document.fonts.ready)
                await document.fonts.ready;
            await waitForImages(pdfContainerRef.current);
            await new Promise((r) =>
                requestAnimationFrame(() => requestAnimationFrame(r))
            );

            let pdf = null;
            let firstAdded = false;

            for (const g of groups) {
                const pageNodes = Array.from(
                    pdfContainerRef.current.querySelectorAll(g.selector)
                );
                const widthPx = g.landscape ? A4L_WIDTH_PX : A4P_WIDTH_PX;
                const heightPx = g.landscape ? A4L_HEIGHT_PX : A4P_HEIGHT_PX;
                const widthMm = g.landscape ? A4L_WIDTH_MM : A4P_WIDTH_MM;
                const heightMm = g.landscape ? A4L_HEIGHT_MM : A4P_HEIGHT_MM;

                for (const node of pageNodes) {
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
                    if (!pdf) {
                        pdf = new jsPDF({
                            orientation: g.landscape ? "landscape" : "portrait",
                            unit: "mm",
                            format: "a4",
                            compress: true,
                        });
                    } else {
                        pdf.addPage("a4", g.landscape ? "landscape" : "portrait");
                    }
                    const pageW = g.landscape ? A4L_WIDTH_MM : A4P_WIDTH_MM;
                    const pageH = g.landscape ? A4L_HEIGHT_MM : A4P_HEIGHT_MM;
                    const x = (pageW - widthMm) / 2;
                    const y = (pageH - heightMm) / 2;
                    pdf.addImage(image, "PNG", x, y, widthMm, heightMm, undefined, "FAST");
                    firstAdded = true;
                }
            }

            if (!pdf || !firstAdded) {
                showToast("Walang pages na na-generate.");
                return;
            }

            const safeOffice = (officeName || "PMS")
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "_");
            pdf.save(`ALL_PMS_${safeOffice}_${Date.now()}.pdf`);
            showToast("All PMS PDF generated successfully.");
        } catch (err) {
            console.error("PDF generation error:", err);
            showToast("Failed to generate ALL PMS PDF.");
        } finally {
            setDownloadingKey(null);
        }
    }, [
        allRows.length,
        allRows002.length,
        allRows004.length,
        allRows005.length,
        allRows006.length,
        allRows007.length,
        officeName,
        showToast,
    ]);

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
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {pms001Error}
                    </p>
                </div>
            </div>
        );
    }

    // ---------------- RENDER ----------------
    return (
        <>
            <style>{`
                @keyframes slideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
                .animate-slide-up { animation: slideUp .3s ease-out; }
                .pdf-render-container { position:fixed; left:-10000px; top:0; pointer-events:none; z-index:-1; }
                .pms-view-table { border-collapse:separate !important; border-spacing:0 !important; }
                .pms-view-table th, .pms-view-table td { border:1px solid #000 !important; }
                .pms-view-table thead th { background-color:#fff !important; position:sticky; z-index:20; }
                .pms-view-table thead tr:first-child th { top:0; }
                .pms-view-table thead tr:last-child th { top:26px; }
                .pms-view-scroll { overflow-y:auto; overflow-x:hidden; }
                .pms-view-scroll::-webkit-scrollbar { width:8px; }
                .pms-view-scroll::-webkit-scrollbar-track { background:#f1f5f9; border-radius:4px; }
                .pms-view-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
                .pms-view-scroll::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
                .pms002-checkbox, .pms004-checkbox {
                    appearance:none; -webkit-appearance:none; width:16px; height:16px;
                    border:1.5px solid #000; border-radius:2px; background:#fff;
                    cursor:default; position:relative; display:inline-block; vertical-align:middle; margin:0; padding:0; outline:none;
                }
                .pms002-checkbox:checked, .pms004-checkbox:checked { background:#000; border-color:#000; }
                .pms002-checkbox:checked::after, .pms004-checkbox:checked::after {
                    content:''; position:absolute; left:4.5px; top:1px; width:4px; height:9px;
                    border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg);
                }
                .sidebar-scroll { overflow-y:auto; overflow-x:hidden; }
                .sidebar-scroll::-webkit-scrollbar { width:8px; }
                .sidebar-scroll::-webkit-scrollbar-track { background:#f1f5f9; border-radius:4px; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover { background:#94a3b8; }

                /* ===== Sidebar slide transitions ===== */
                .sidebar-backdrop {
                    opacity: 0;
                    transition: opacity 0.3s ease-out;
                }
                .sidebar-backdrop.open {
                    opacity: 1;
                }
                .sidebar-panel {
                    transform: translateX(100%);
                    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                }
                .sidebar-panel.open {
                    transform: translateX(0);
                }
                /* Inner content: subtle slide-up para sumabay sa drawer */
                .sidebar-content {
                    opacity: 0;
                    transform: translateX(16px);
                    transition: opacity 0.28s ease-out 0.08s, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1) 0.08s;
                }
                .sidebar-content.open {
                    opacity: 1;
                    transform: translateX(0);
                }
            `}</style>

            {notification && (
                <div className="fixed top-5 right-5 z-[70] bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-medium">{notification}</span>
                </div>
            )}

            {/* HIDDEN PDF RENDER CONTAINER */}
            <div ref={pdfContainerRef} className="pdf-render-container">
                {pdfPages.map((pageItems, idx) => (
                    <PMS001PdfPage
                        key={`pdf-001-${idx}`}
                        pageItems={pageItems}
                        pageNumber={idx + 1}
                        totalPages={totalPdfPages}
                        officeName={officeName}
                        signatures={signatures}
                        emptyRowCount={Math.max(
                            0,
                            computedRowsPerPage - pageItems.length
                        )}
                        widthPx={A4P_WIDTH_PX}
                        heightPx={A4P_HEIGHT_PX}
                    />
                ))}
                {allRows002.length > 0 &&
                    pdfPages002.map((pageItems, idx) => (
                        <PMS002PdfPage
                            key={`pdf-002-${idx}`}
                            pageItems={pageItems}
                            pageNumber={idx + 1}
                            totalPages={totalPdfPages002}
                            officeName={officeName}
                            signatures={signatures}
                            emptyRowCount={Math.max(
                                0,
                                computedRowsPerPage - pageItems.length
                            )}
                            widthPx={A4L_WIDTH_PX}
                            heightPx={A4L_HEIGHT_PX}
                            checkboxFields={CHECKBOX_FIELDS}
                        />
                    ))}
                {allRows004.length > 0 &&
                    pdfPages004.map((pageItems, idx) => (
                        <PMS004PdfPage
                            key={`pdf-004-${idx}`}
                            pageItems={pageItems}
                            pageNumber={idx + 1}
                            totalPages={totalPdfPages004}
                            officeName={officeName}
                            signatures={signatures}
                            emptyRowCount={Math.max(
                                0,
                                computedRowsPerPage - pageItems.length
                            )}
                            widthPx={A4L_WIDTH_PX}
                            heightPx={A4L_HEIGHT_PX}
                            checkboxFields={CHECKBOX_FIELDS_004}
                        />
                    ))}
                {allRows005.length > 0 &&
                    pdfPages005.map((pageItems, idx) => (
                        <PMS005PdfPage
                            key={`pdf-005-${idx}`}
                            pageItems={pageItems}
                            pageNumber={idx + 1}
                            totalPages={totalPdfPages005}
                            officeName={officeName}
                            signatures={signatures}
                            emptyRowCount={Math.max(
                                0,
                                computedRowsPerPage - pageItems.length
                            )}
                            widthPx={A4P_WIDTH_PX}
                            heightPx={A4P_HEIGHT_PX}
                        />
                    ))}
                {allRows006.length > 0 &&
                    pdfPages006.map((pageItems, idx) => (
                        <PMS006PdfPage
                            key={`pdf-006-${idx}`}
                            pageItems={pageItems}
                            pageNumber={idx + 1}
                            totalPages={totalPdfPages006}
                            officeName={officeName}
                            signatures={signatures}
                            emptyRowCount={Math.max(
                                0,
                                computedRowsPerPage - pageItems.length
                            )}
                            widthPx={A4L_WIDTH_PX}
                            heightPx={A4L_HEIGHT_PX}
                        />
                    ))}
                {allRows007.length > 0 &&
                    pdfPages007.map((pageItems, idx) => (
                        <PMS007PdfPage
                            key={`pdf-007-${idx}`}
                            pageItems={pageItems}
                            pageNumber={idx + 1}
                            totalPages={totalPdfPages007}
                            officeName={officeName}
                            signatures={signatures}
                            emptyRowCount={Math.max(
                                0,
                                computedRowsPerPage - pageItems.length
                            )}
                            widthPx={A4L_WIDTH_PX}
                            heightPx={A4L_HEIGHT_PX}
                        />
                    ))}
            </div>

            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
                <main
                    ref={topAnchorRef}
                    className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 flex-wrap">
                        <button
                            onClick={() => {
                                setSelectedDept(null);
                                setSelectedLab(null);
                                setLabPmsRecords([]);
                                setLabPms002Records([]);
                                setLabPms004Records([]);
                                setLabPms005Records([]);
                                setLabPms006Records([]);
                                setLabPms007Records([]);
                                closeAllExpanded();
                            }}
                            className={`flex items-center gap-1.5 hover:text-blue-500 transition-colors ${
                                !selectedDept
                                    ? "font-semibold text-slate-900 dark:text-white"
                                    : ""
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
                                        setLabPms004Records([]);
                                        setLabPms005Records([]);
                                        setLabPms006Records([]);
                                        setLabPms007Records([]);
                                        closeAllExpanded();
                                    }}
                                    className={`hover:text-blue-500 transition-colors ${
                                        !selectedLab
                                            ? "font-semibold text-slate-900 dark:text-white"
                                            : ""
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

                    {/* STEP 1: DEPARTMENTS */}
                    {!selectedDept && (
                        <section className="space-y-8">
                            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Select a Department Folder
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Hover over a folder to reveal the
                                    department details.
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
                                        const totalPms = (
                                            dept.laboratories || []
                                        ).reduce(
                                            (s, lab) =>
                                                s +
                                                (lab.pmsRecords?.length ||
                                                    0),
                                            0
                                        );
                                        return (
                                            <AnimatedFolderCard
                                                key={dept._id}
                                                title={dept.DepartmentName}
                                                code={
                                                    dept.DepartmentName?.split(
                                                        " "
                                                    )[0] || "DEPT"
                                                }
                                                count={totalPms}
                                                icon={getDeptIcon(
                                                    dept.DepartmentName
                                                )}
                                                textColor={getDeptTextColor(
                                                    dept.DepartmentName
                                                )}
                                                desc={`${
                                                    dept.laboratories
                                                        ?.length || 0
                                                } Laboratories`}
                                                onClick={() =>
                                                    setSelectedDept(dept)
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* STEP 2: LABS */}
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
                                            Click a laboratory folder to view
                                            ALL PMS records.
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
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
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
                                            code={
                                                lab.LaboratoryName?.split(
                                                    " "
                                                )
                                                    .slice(0, 2)
                                                    .join(" ") || "LAB"
                                            }
                                            count={
                                                lab.pmsRecords?.length || 0
                                            }
                                            icon={Wrench}
                                            textColor="text-blue-600"
                                            desc={
                                                lab.Encharge?.FullName ||
                                                "No Encharge"
                                            }
                                            onClick={() =>
                                                handleLabClick(lab)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* STEP 3: MINI GRID */}
                    {selectedLab && (
                        <section className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setSelectedLab(null);
                                            setLabPmsRecords([]);
                                            setLabPms002Records([]);
                                            setLabPms004Records([]);
                                            setLabPms005Records([]);
                                            setLabPms006Records([]);
                                            setLabPms007Records([]);
                                            closeAllExpanded();
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
                                            Encharge:{" "}
                                            {selectedLab.Encharge?.FullName ||
                                                "N/A"}{" "}
                                            · Click any card to open sidebar
                                            view
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDownloadAll}
                                    disabled={
                                        downloadingKey === "ALL" ||
                                        (!allRows.length &&
                                            !allRows002.length &&
                                            !allRows004.length &&
                                            !allRows005.length &&
                                            !allRows006.length &&
                                            !allRows007.length)
                                    }
                                    className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors self-start sm:self-auto"
                                >
                                    {downloadingKey === "ALL" ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Generating ALL...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-3.5 h-3.5" />
                                            Download ALL PMS
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* MINI GRID */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                                <div id="pms-001" className="scroll-mt-24 min-w-0 xl:col-span-1">
                                    <PMS001Viewer
                                        allRows={allRows}
                                        officeName={officeName}
                                        performedBy={pms001PerformedBy}
                                        loading={labPmsLoading}
                                        miniExpanded={false}
                                        onOpenFull={openFullForm}
                                        onCloseFull={closeFullForm}
                                        fullFormRef={fullFormRef}
                                        totalPdfPages={totalPdfPages}
                                        signatures={signatures}
                                        onSignatureChange={handleSignatureChange}
                                    />
                                </div>

                                <div id="pms-005" className="scroll-mt-24 min-w-0 xl:col-span-1">
                                    <PMS005Viewer
                                        allRows005={allRows005}
                                        officeName={officeName}
                                        performedBy={pms005PerformedBy}
                                        loading={labPms005Loading || pms005Loading}
                                        error={pms005Error}
                                        miniExpanded={false}
                                        onOpenFull={openFullForm005}
                                        onCloseFull={closeFullForm005}
                                        fullFormRef={fullForm005Ref}
                                        totalPdfPages={totalPdfPages005}
                                        onRetry={() => loadPms005(selectedLab)}
                                        signatures={signatures}
                                        onSignatureChange={handleSignatureChange}
                                    />
                                </div>

                                <div id="pms-002" className="scroll-mt-24 min-w-0 xl:col-span-2">
                                    <PMS002Viewer
                                        allRows002={allRows002}
                                        officeName={officeName}
                                        performedBy={pms002PerformedBy}
                                        loading={labPms002Loading || pms002Loading}
                                        error={pms002Error}
                                        miniExpanded={false}
                                        onOpenFull={openFullForm002}
                                        onCloseFull={closeFullForm002}
                                        fullFormRef={fullForm002Ref}
                                        totalPdfPages={totalPdfPages002}
                                        onRetry={() => loadPms002(selectedLab)}
                                        signatures={signatures}
                                        onSignatureChange={handleSignatureChange}
                                    />
                                </div>

                                <div id="pms-004" className="scroll-mt-24 min-w-0 xl:col-span-2">
                                    <PMS004Viewer
                                        allRows004={allRows004}
                                        officeName={officeName}
                                        performedBy={pms004PerformedBy}
                                        loading={labPms004Loading || pms004Loading}
                                        error={pms004Error}
                                        miniExpanded={false}
                                        onOpenFull={openFullForm004}
                                        onCloseFull={closeFullForm004}
                                        fullFormRef={fullForm004Ref}
                                        totalPdfPages={totalPdfPages004}
                                        onRetry={() => loadPms004(selectedLab)}
                                        signatures={signatures}
                                        onSignatureChange={handleSignatureChange}
                                    />
                                </div>

                                <div id="pms-006" className="scroll-mt-24 min-w-0 xl:col-span-2">
                                    <PMS006Viewer
                                        allRows006={allRows006}
                                        officeName={officeName}
                                        performedBy={pms006PerformedBy}
                                        loading={labPms006Loading || pms006Loading}
                                        error={pms006Error}
                                        miniExpanded={false}
                                        onOpenFull={openFullForm006}
                                        onCloseFull={closeFullForm006}
                                        fullFormRef={fullForm006Ref}
                                        totalPdfPages={totalPdfPages006}
                                        onRetry={() => loadPms006(selectedLab)}
                                        signatures={signatures}
                                        onSignatureChange={handleSignatureChange}
                                    />
                                </div>

                                <div id="pms-007" className="scroll-mt-24 min-w-0 xl:col-span-2">
                                    <PMS007Viewer
                                        allRows007={allRows007}
                                        officeName={officeName}
                                        performedBy={pms007PerformedBy}
                                        loading={labPms007Loading || pms007Loading}
                                        error={pms007Error}
                                        miniExpanded={false}
                                        onOpenFull={openFullForm007}
                                        onCloseFull={closeFullForm007}
                                        fullFormRef={fullForm007Ref}
                                        totalPdfPages={totalPdfPages007}
                                        onRetry={() => loadPms007(selectedLab)}
                                        signatures={signatures}
                                        onSignatureChange={handleSignatureChange}
                                    />
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* ================================================================
                SIDEBAR DRAWER — with DOWNLOAD button sa header
               ================================================================ */}
            {sidebarMounted && (
                <div className="fixed inset-0 z-[60] flex">
                    {/* Backdrop — fade in/out */}
                    <div
                        className={`flex-1 bg-slate-900/50 backdrop-blur-[2px] sidebar-backdrop ${
                            sidebarVisible ? "open" : ""
                        }`}
                        onClick={closeAllExpanded}
                        aria-hidden="true"
                    />

                    {/* Drawer — slide in/out */}
                    <aside
                        className={`relative w-full sm:w-[92vw] lg:w-[75vw] xl:w-[68vw] max-w-[1400px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700 sidebar-panel ${
                            sidebarVisible ? "open" : ""
                        }`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={
                            activeMeta
                                ? `${activeMeta.title} — ${activeMeta.subtitle}`
                                : "PMS Full View"
                        }
                    >
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                    <Wrench className="w-4.5 h-4.5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                            {activeMeta?.title || "PMS"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                            · {officeName}
                                        </span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                                        {activeMeta?.subtitle || "Full Form View"}
                                    </h3>
                                </div>
                            </div>

                            {/* === Action buttons: DOWNLOAD + CLOSE === */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* DOWNLOAD BUTTON */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        activeSidebarKey &&
                                        handleDownloadSingle(activeSidebarKey)
                                    }
                                    disabled={
                                        !activeSidebarKey ||
                                        activeRowsCount === 0 ||
                                        downloadingKey === activeSidebarKey
                                    }
                                    className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                                    title={
                                        activeRowsCount === 0
                                            ? "Walang records para i-download"
                                            : `Download ${activeSidebarKey} PDF`
                                    }
                                >
                                    {downloadingKey === activeSidebarKey ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span className="hidden sm:inline">
                                                Generating...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">
                                                Download
                                            </span>
                                            <span className="sm:hidden">
                                                DL
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* CLOSE BUTTON */}
                                <button
                                    type="button"
                                    onClick={closeAllExpanded}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                    aria-label="Close sidebar"
                                    title="Close (Esc)"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Body — content slides in too */}
                        <div className="flex-1 sidebar-scroll p-3 sm:p-4 bg-slate-50 dark:bg-slate-900">
                            <div
                                className={`sidebar-content ${
                                    sidebarVisible ? "open" : ""
                                }`}
                            >
                                {miniExpanded && (
                                    <div ref={fullFormRef} className="scroll-mt-24">
                                        <PMS001Viewer
                                            allRows={allRows}
                                            officeName={officeName}
                                            performedBy={pms001PerformedBy}
                                            loading={labPmsLoading}
                                            miniExpanded={true}
                                            onOpenFull={openFullForm}
                                            onCloseFull={closeFullForm}
                                            fullFormRef={fullFormRef}
                                            totalPdfPages={totalPdfPages}
                                            signatures={signatures}
                                            onSignatureChange={handleSignatureChange}
                                        />
                                    </div>
                                )}

                                {miniExpanded002 && (
                                    <div ref={fullForm002Ref} className="scroll-mt-24">
                                        <PMS002Viewer
                                            allRows002={allRows002}
                                            officeName={officeName}
                                            performedBy={pms002PerformedBy}
                                            loading={labPms002Loading || pms002Loading}
                                            error={pms002Error}
                                            miniExpanded={true}
                                            onOpenFull={openFullForm002}
                                            onCloseFull={closeFullForm002}
                                            fullFormRef={fullForm002Ref}
                                            totalPdfPages={totalPdfPages002}
                                            onRetry={() => loadPms002(selectedLab)}
                                            signatures={signatures}
                                            onSignatureChange={handleSignatureChange}
                                        />
                                    </div>
                                )}

                                {miniExpanded004 && (
                                    <div ref={fullForm004Ref} className="scroll-mt-24">
                                        <PMS004Viewer
                                            allRows004={allRows004}
                                            officeName={officeName}
                                            performedBy={pms004PerformedBy}
                                            loading={labPms004Loading || pms004Loading}
                                            error={pms004Error}
                                            miniExpanded={true}
                                            onOpenFull={openFullForm004}
                                            onCloseFull={closeFullForm004}
                                            fullFormRef={fullForm004Ref}
                                            totalPdfPages={totalPdfPages004}
                                            onRetry={() => loadPms004(selectedLab)}
                                            signatures={signatures}
                                            onSignatureChange={handleSignatureChange}
                                        />
                                    </div>
                                )}

                                {miniExpanded005 && (
                                    <div ref={fullForm005Ref} className="scroll-mt-24">
                                        <PMS005Viewer
                                            allRows005={allRows005}
                                            officeName={officeName}
                                            performedBy={pms005PerformedBy}
                                            loading={labPms005Loading || pms005Loading}
                                            error={pms005Error}
                                            miniExpanded={true}
                                            onOpenFull={openFullForm005}
                                            onCloseFull={closeFullForm005}
                                            fullFormRef={fullForm005Ref}
                                            totalPdfPages={totalPdfPages005}
                                            onRetry={() => loadPms005(selectedLab)}
                                            signatures={signatures}
                                            onSignatureChange={handleSignatureChange}
                                        />
                                    </div>
                                )}

                                {miniExpanded006 && (
                                    <div ref={fullForm006Ref} className="scroll-mt-24">
                                        <PMS006Viewer
                                            allRows006={allRows006}
                                            officeName={officeName}
                                            performedBy={pms006PerformedBy}
                                            loading={labPms006Loading || pms006Loading}
                                            error={pms006Error}
                                            miniExpanded={true}
                                            onOpenFull={openFullForm006}
                                            onCloseFull={closeFullForm006}
                                            fullFormRef={fullForm006Ref}
                                            totalPdfPages={totalPdfPages006}
                                            onRetry={() => loadPms006(selectedLab)}
                                            signatures={signatures}
                                            onSignatureChange={handleSignatureChange}
                                        />
                                    </div>
                                )}

                                {miniExpanded007 && (
                                    <div ref={fullForm007Ref} className="scroll-mt-24">
                                        <PMS007Viewer
                                            allRows007={allRows007}
                                            officeName={officeName}
                                            performedBy={pms007PerformedBy}
                                            loading={labPms007Loading || pms007Loading}
                                            error={pms007Error}
                                            miniExpanded={true}
                                            onOpenFull={openFullForm007}
                                            onCloseFull={closeFullForm007}
                                            fullFormRef={fullForm007Ref}
                                            totalPdfPages={totalPdfPages007}
                                            onRetry={() => loadPms007(selectedLab)}
                                            signatures={signatures}
                                            onSignatureChange={handleSignatureChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}