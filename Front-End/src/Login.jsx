import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./components/Context/AuthContext";
import {
  Settings,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Cpu,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInput = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(values.email, values.password);
      if (response && response.success) {
        setTimeout(() => navigate("/dashboardfinal"), 1500);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans selection:bg-yellow-400 selection:text-blue-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-slate-800"
      >
        {/* Left Side: Industrial Command Center */}
        <div className="hidden md:flex w-5/12 bg-[#1e3a8a] p-10 flex-col justify-between text-white relative min-h-full">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400 opacity-80" />

          <div className="relative z-10 space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20"
            >
              <Cpu size={32} className="text-[#1e3a8a]" />
            </motion.div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-black mb-1 tracking-tighter uppercase leading-none">
                Facility <br />
                <span className="text-yellow-400 italic">Registry</span> <br />
                Terminal
              </h1>
              <div className="h-1 w-20 bg-yellow-400 mt-4" />
            </div>

            <p className="text-blue-200 text-[10px] lg:text-xs font-bold uppercase tracking-widest leading-relaxed">
              Standard operating procedures require valid credentials for asset calibration & maintenance logs.
            </p>
          </div>

          <div className="relative z-10 pt-8">
            <div className="flex items-center gap-3 bg-blue-950/50 p-3 rounded-xl border border-blue-800">
              <Activity size={16} className="text-green-400 animate-pulse" />
              <span className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em]">
                Status: Uplink Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Interface */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-white relative items-center min-h-fit">
          
          {/* Logo and Header Grouped Tightly - Responsive Height Adjustments */}
          <div className="flex flex-col items-center -space-y-4 mb-6 sm:mb-8"> 
            <img 
              src="/Image/logo-login.png" 
              alt="BIPSU Logo" 
              className="w-32 h-32 sm:w-44 sm:h-44 object-contain" 
            />
            
            <div className="text-center flex flex-col items-center space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#1e3a8a]" size={14} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  System Security
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5 w-full max-w-sm">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Access Identifier
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a] transition-colors" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  value={values.email}
                  onChange={handleInput}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 focus:border-[#1e3a8a] focus:bg-white outline-none transition-all text-slate-700 font-bold text-sm"
                  placeholder="ID@BIPSU.EDU.PH"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Security Cipher
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a] transition-colors" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={values.password}
                  onChange={handleInput}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 sm:py-4 pl-11 pr-11 focus:border-[#1e3a8a] focus:bg-white outline-none transition-all text-slate-700 font-bold text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1e3a8a] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 sm:py-4 mt-2 rounded-xl font-black text-white uppercase tracking-[0.3em] text-[10px] transition-all shadow-lg
                ${isLoading 
                  ? "bg-slate-400 cursor-wait" 
                  : "bg-[#1e3a8a] hover:bg-blue-900 active:scale-95 shadow-blue-900/20"}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Settings className="animate-spin" size={14} /> Syncing...
                </span>
              ) : "Initialize Login"}
            </button>
          </form>

          <div className="mt-8 sm:mt-12 pt-6 border-t border-slate-50 flex flex-col items-center w-full">
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] text-center leading-relaxed">
                Biliran Province State University <br/> Maintenance Management Portal
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
