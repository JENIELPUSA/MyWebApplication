import { motion } from "framer-motion";
import { FaTools, FaChevronRight } from "react-icons/fa";

const UserDashboard = ({ onSelect, laboratoryData }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="relative overflow-hidden group py-16 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-blue-700/30 dark:border-yellow-400/30 flex flex-col items-center text-center shadow-2xl shadow-blue-700/10"
    >
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <FaTools size={120} className="text-blue-700 dark:text-yellow-400" />
        </div>
        <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-yellow-400 mb-6 shadow-lg shadow-blue-700/30">
            <FaTools size={24} />
        </div>
        <h3 className="text-2xl font-black text-blue-700 dark:text-yellow-400 uppercase tracking-tighter mb-2">Equipment Management</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 font-medium italic">
            "Access and update your department's asset list for maintenance and tracking."
        </p>
        <button
            onClick={() => onSelect(laboratoryData)}
            className="px-12 py-4 bg-blue-700 hover:bg-blue-800 text-yellow-400 font-black rounded-2xl shadow-xl shadow-blue-700/30 hover:shadow-blue-700/50 transition-all uppercase tracking-[0.2em] text-xs flex items-center gap-3"
        >
            Initialize Equipment List <FaChevronRight />
        </button>
    </motion.div>
);

export default UserDashboard;