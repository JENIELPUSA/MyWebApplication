import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Cpu,
  Activity,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logobipsu from "../../../public/logo.jpg"

export default function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInput = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(""); // Clear error on typing
  }, [errorMessage]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await login(values.email, values.password);
      if (response && response.success) {
        setTimeout(() => navigate("/dashboardfinal"), 1200);
      } else {
        setErrorMessage(response?.message || "Invalid credentials. Please verify your access identifier.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An unexpected system error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans selection:bg-amber-400 selection:text-blue-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/40 border border-slate-800/60"
      >
        {/* Left Side: Industrial Command Center Branding */}
        <div className="hidden md:flex w-5/12 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />

          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Cpu size={28} className="text-blue-950" />
            </div>

            <div>
              <h1 className="text-3xl font-black mb-1 tracking-tight uppercase leading-none">
                Facility <br />
                <span className="text-amber-400">Registry</span> <br />
                Terminal
              </h1>
              <div className="h-1 w-16 bg-amber-400 mt-4 rounded-full" />
            </div>

            <p className="text-blue-200/80 text-xs font-medium leading-relaxed">
              Standard operating procedures require verified credentials for asset calibration & system maintenance logs.
            </p>
          </div>

          <div className="relative z-10 pt-8">
            <div className="flex items-center gap-3 bg-blue-900/40 backdrop-blur-md px-4 py-3 rounded-xl border border-blue-700/50">
              <Activity size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">
                Uplink Status: Secure & Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form Interface */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center bg-white relative items-center">

          <div className="flex flex-col items-center mb-6">
            <img
              src={logobipsu}
              alt="BIPSU Logo"
              className="w-24 h-24 sm:w-36 sm:h-36 object-contain mb-2 drop-shadow-sm"
            />
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-900" size={15} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                Secure Authentication
              </span>
            </div>
          </div>

          {/* Error Feedback Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-sm mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLoginSubmit} className="space-y-4 w-full max-w-sm">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-900 transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={values.email}
                  onChange={handleInput}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10 outline-none transition-all text-slate-800 font-medium text-sm"
                  placeholder="name@bipsu.edu.ph"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-900 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={values.password}
                  onChange={handleInput}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-3.5 pl-11 pr-11 focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10 outline-none transition-all text-slate-800 font-medium text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 mt-3 rounded-xl font-bold text-white uppercase tracking-wider text-xs transition-all shadow-md
                ${isLoading
                  ? "bg-slate-400 cursor-wait"
                  : "bg-blue-900 hover:bg-blue-800 active:scale-[0.98] shadow-blue-900/20"}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Authenticating...
                </span>
              ) : "LogIn"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center w-full">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center leading-relaxed">
              Biliran Province State University <br />
              <span className="text-slate-500 font-semibold">Maintenance Management Portal</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}