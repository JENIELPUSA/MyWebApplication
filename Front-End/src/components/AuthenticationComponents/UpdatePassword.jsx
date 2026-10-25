import React, { useContext, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaLock } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { UpdateDisplayContext } from "../../contexts/UpdateContext/updateContext";

const UpdatePassword = () => {
    const { UpdatePasswordData, customError, setCustomError } =
        useContext(UpdateDisplayContext);

    const [values, setValues] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [loading, setLoading] = useState(false);

    // ============================================================
    // ✅ Reset form on mount (para malinis lagi pag pinasok)
    // ============================================================
    useEffect(() => {
        setValues({
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        });
        setCustomError?.("");
    }, [setCustomError]);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (values.newPassword !== values.confirmNewPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        if (values.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            if (typeof UpdatePasswordData === "function") {
                await UpdatePasswordData(values);
            }

            if (customError) {
                toast.error(customError);
                setCustomError("");
                setValues({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
            } else {
                toast.success("Password updated successfully! 🎉");
                setValues({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ I-effect ang customError mula sa context
    useEffect(() => {
        if (customError) {
            toast.error(customError);
            setCustomError("");
        }
    }, [customError, setCustomError]);

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg ring-1 ring-black/5">

                {/* ✅ Blue top accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500" />

                <div className="p-6 sm:p-8">
                    <div className="mb-6 text-center">
                        {/* ✅ Blue lock icon with glow */}
                        <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
                                <FaLock className="text-2xl text-white" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#0a3d62] dark:text-blue-400">
                            Update Password
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Enter your current and new password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="currentPassword"
                                className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-500"
                            >
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                id="currentPassword"
                                value={values.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter your current password"
                                required
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 px-4 py-2.5 text-sm font-medium outline-none transition-all
                                           focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="newPassword"
                                className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-500"
                            >
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                value={values.newPassword}
                                onChange={handleChange}
                                placeholder="Enter your new password"
                                required
                                minLength={6}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 px-4 py-2.5 text-sm font-medium outline-none transition-all
                                           focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="confirmNewPassword"
                                className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-500"
                            >
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                id="confirmNewPassword"
                                value={values.confirmNewPassword}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                required
                                minLength={6}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 px-4 py-2.5 text-sm font-medium outline-none transition-all
                                           focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Update Password button — BLUE */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-lg
                                       bg-gradient-to-br from-blue-600 to-blue-800
                                       hover:from-blue-700 hover:to-blue-900
                                       py-2.5 text-sm font-bold text-white
                                       shadow-[0_4px_14px_-4px_rgba(59,130,246,0.6)]
                                       hover:shadow-[0_6px_20px_-4px_rgba(59,130,246,0.8)]
                                       transition-all duration-300 active:scale-[0.98]
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Shimmer effect */}
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                            {loading ? (
                                <svg
                                    className="h-5 w-5 animate-spin text-white relative z-10"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    ></path>
                                </svg>
                            ) : (
                                <span className="relative z-10">Update Password</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <ToastContainer position="bottom-right" theme="colored" />
        </div>
    );
};

export default UpdatePassword;