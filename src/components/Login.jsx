import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderLock,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Info,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
export default function Sidebar() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  function handleLogin() {
    setIsLoading(true);
    window.location.href = `${BACKEND_URL}/auth/github`;
    setLoadingText(false);
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-[#F1F3F5] border-8 border-white">
      {/* Background grid lines to emphasize geometric blueprint theme */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_2px,transparent_2px),linear-gradient(to_bottom,#e2e8f0_2px,transparent_2px)] bg-[size:3rem_3rem] opacity-75" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md z-10"
        id="login-card-container"
      >
        <div className="bg-white rounded-none border-4 border-slate-900 p-8 md:p-10 shadow-[12px_12px_0px_#000000] relative">
          {/* Top aesthetic accent line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#0052FF]" />

          {/* Header/Branding */}
          <div className="flex flex-col items-center text-center mb-8 mt-2">
            {/* Geometric custom brand logo */}
            <div className="w-12 h-12 bg-black flex items-center justify-center mb-4 border-2 border-black">
              <div className="w-4 h-4 bg-white rotate-45"></div>
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 font-sans">
              GitStore
            </h1>
            <div className="w-16 h-1 bg-slate-900 my-3"></div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-rose-50 border-2 border-rose-500 rounded-none flex items-start gap-3 text-rose-900 text-xs font-bold uppercase tracking-wider"
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulated Credentials Form */}

          {/* Simulated GitHub Login Button */}
          <motion.button
            type="button"
            id="github-login-btn"
            onClick={handleLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-none bg-[#0052FF] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-colors duration-150 border-2 border-slate-900 shadow-[4px_4px_0px_#000000] cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FaGithub className="w-4 h-4" />
            )}
            <span>Login with GitHub</span>
          </motion.button>

          {/* Disclaimer / Secure Banner */}
        </div>

        {/* Informative Footer */}
      </motion.div>

      {/* Loading Full Screen Overlay for GitHub Sign-In Flow */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-none border-4 border-slate-900 p-8 max-w-sm w-full mx-4 shadow-[16px_16px_0px_rgba(0,0,0,0.15)] text-center flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center w-16 h-16 bg-slate-100 border-2 border-slate-900 text-slate-900 mb-6">
                <Github className="w-7 h-7" />
                <div className="absolute -inset-1 border-2 border-dashed border-indigo-600 animate-spin" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 mb-2">
                GitHub Authorization
              </h3>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-6">
                {loadingText}
              </p>

              {/* Progress bar with geometric border */}
              <div className="w-full border-2 border-slate-950 h-4 bg-slate-100 rounded-none p-0.5 overflow-hidden">
                <motion.div
                  className="bg-black h-full rounded-none"
                  initial={{ width: "10%" }}
                  animate={{
                    width: loadingText.includes("Connecting")
                      ? "35%"
                      : loadingText.includes("permissions")
                        ? "70%"
                        : "100%",
                  }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
