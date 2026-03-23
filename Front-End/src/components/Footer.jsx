import React from "react";
import { FaShieldAlt, FaCode } from "react-icons/fa";

function Footer() {
  return (
    <footer className="w-full bg-[#1e3a8a] border-t-4 border-yellow-500 font-mono">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-8 md:px-16 lg:px-40">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* LEFT: System Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FaCode className="text-yellow-400 w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xs tracking-widest uppercase leading-none">
                BIPSU_AMS_V2
              </span>
              <span className="text-blue-300 text-[10px] font-bold uppercase tracking-tighter">
                Maintenance Management Terminal
              </span>
            </div>
          </div>

          {/* CENTER: Copyright */}
          <div className="text-center">
            <p className="text-blue-100 text-[11px] font-medium uppercase tracking-tight">
              © {new Date().getFullYear()} <span className="text-yellow-400 font-black italic">begginerCode.Ph</span>
            </p>
            <p className="text-blue-400 text-[9px] font-bold tracking-[0.2em] mt-1">
              ENGINEERED FOR EXCELLENCE
            </p>
          </div>

          {/* RIGHT: System Links */}
          <div className="flex items-center gap-4">
            <a
              href="/terms-of-service"
              className="text-white hover:text-yellow-400 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
            >
              <FaShieldAlt className="text-yellow-500" /> Terms
            </a>
            <span className="text-blue-700">|</span>
            <a
              href="/privacy-policy"
              className="text-white hover:text-yellow-400 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              Privacy_Policy
            </a>
          </div>

        </div>
      </div>

      {/* BOTTOM THIN STRIP */}
      <div className="w-full bg-black/20 py-1.5 text-center">
        <p className="text-[8px] text-blue-500 font-bold uppercase tracking-[0.5em]">
          System_Status: Operational_v2.0.6
        </p>
      </div>
    </footer>
  );
}

export default Footer;