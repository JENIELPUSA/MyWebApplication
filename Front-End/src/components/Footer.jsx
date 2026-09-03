import React from "react";
import { FaShieldAlt, FaUniversity } from "react-icons/fa";
import { MdOutlineSchool } from "react-icons/md";

function Footer() {
  return (
    <footer className="w-full bg-[#003366] border-t-4 border-[#FFD700] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-8 md:px-16 lg:px-40">
        <div className="flex flex-col items-center gap-4">
          
          {/* CENTER: Copyright */}
          <div className="text-center">
            <p className="text-blue-100 text-xs font-light uppercase tracking-wide">
              © {new Date().getFullYear()} <span className="text-[#FFD700] font-semibold">Biliran Province State University</span>
            </p>
            <p className="text-blue-300 text-[10px] font-light tracking-[0.15em] mt-1">
              COMMITTED TO EXCELLENCE AND SERVICE
            </p>
          </div>

        </div>
      </div>

      {/* BOTTOM THIN STRIP */}
      <div className="w-full bg-black/20 py-1.5 text-center">
        <p className="text-[9px] text-blue-300 font-light uppercase tracking-[0.3em]">
          BiPSU — Inspiring Minds, Shaping Futures
        </p>
      </div>
    </footer>
  );
}

export default Footer;