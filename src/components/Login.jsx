import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Zap,
  Database,
  Upload,
  Download,
  Scissors,
  Layers,
  ArrowRight,
  Loader2,
  Info,
  FolderLock,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function Sidebar() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  function handleLogin() {
    setIsLoading(true);
    setLoadingText("Connecting to GitHub...");
    window.location.href = `${BACKEND_URL}/auth/github`;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F1F3F5] border-8 border-white">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_2px,transparent_2px),linear-gradient(to_bottom,#e2e8f0_2px,transparent_2px)] bg-[size:3rem_3rem] opacity-75 pointer-events-none" />

      {/* Decorative geometry */}
      <div className="fixed top-16 left-10 w-8 h-8 border-4 border-slate-900 rotate-45 opacity-10" />
      <div className="fixed bottom-20 right-12 w-12 h-12 bg-[#0052FF] opacity-10" />
      <div className="fixed top-1/3 right-10 w-4 h-4 bg-slate-900 opacity-10" />

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-6xl"
        >

          {/* =====================================================
              MAIN CARD
          ===================================================== */}

          <div className="bg-white border-4 border-slate-950 shadow-[14px_14px_0px_#000000] overflow-hidden relative">

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#0052FF]" />

            <div className="grid lg:grid-cols-[1.3fr_0.7fr]">

              {/* =================================================
                  LEFT — PRODUCT
              ================================================= */}

              <section className="p-7 md:p-10 lg:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-slate-950">

                {/* BRAND */}

                <div className="flex items-center gap-4 mb-10">

                  <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-black shrink-0">
                    <div className="w-4 h-4 bg-white rotate-45" />
                  </div>

                  <div>
                    <div className="text-xl font-black uppercase tracking-widest">
                      GitStore
                    </div>

                    <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      GitHub-powered file storage
                    </div>
                  </div>

                </div>


                {/* HERO */}

                <div className="mb-10">

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-blue-50 border-2 border-blue-600 text-blue-700 text-[9px] font-black uppercase tracking-widest">

                    <Database className="w-3.5 h-3.5" />

                    Store beyond GitHub's file limit

                  </div>


                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] text-slate-950 uppercase">

                    Your files.
                    <br />

                    <span className="text-[#0052FF]">
                      Your GitHub.
                    </span>

                  </h1>


                  <div className="w-24 h-2 bg-slate-950 mt-7 mb-6" />


                  <p className="text-sm md:text-base leading-7 text-slate-600 max-w-2xl">

                    GitStore turns GitHub repositories into a simple file
                    storage layer. Large files are automatically split into
                    smaller chunks, stored in your repository, and seamlessly
                    recombined when you download them.

                  </p>

                </div>


                {/* =================================================
                    CHUNKING VISUALIZATION
                ================================================= */}

                <div className="border-4 border-slate-950 bg-slate-50 p-5 md:p-6 mb-8">

                  <div className="flex items-center justify-between mb-6">

                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        How it works
                      </div>

                      <div className="text-sm font-black uppercase mt-1">
                        Automatic file chunking
                      </div>
                    </div>

                    <Scissors className="w-5 h-5 text-[#0052FF]" />

                  </div>


                  <div className="grid md:grid-cols-[1fr_auto_1.5fr_auto_1fr] items-center gap-4">

                    {/* Original */}

                    <div className="border-2 border-slate-950 bg-white p-4 text-center">

                      <Upload className="w-5 h-5 mx-auto mb-3 text-[#0052FF]" />

                      <div className="text-[9px] font-black uppercase tracking-wider">
                        Large file
                      </div>

                      <div className="text-lg font-black mt-1">
                        100 GB
                      </div>

                    </div>


                    <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />


                    {/* Chunks */}

                    <div className="border-2 border-slate-950 bg-white p-4">

                      <div className="flex items-center gap-2 mb-3">

                        <Layers className="w-4 h-4 text-[#0052FF]" />

                        <span className="text-[9px] font-black uppercase tracking-wider">
                          GitStore splits it
                        </span>

                      </div>


                      <div className="grid grid-cols-4 gap-1">

                        {[1, 2, 3, 4].map((chunk) => (
                          <motion.div
                            key={chunk}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: chunk * 0.1,
                              duration: 0.3,
                            }}
                            className="h-8 bg-[#0052FF] border-2 border-slate-950 flex items-center justify-center"
                          >
                            <span className="text-[8px] font-black text-white">
                              {String(chunk).padStart(3, "0")}
                            </span>
                          </motion.div>
                        ))}

                      </div>

                      <div className="text-[8px] text-slate-400 font-bold mt-2 uppercase">
                        ...and more chunks
                      </div>

                    </div>


                    <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />


                    {/* GitHub */}

                    <div className="border-2 border-slate-950 bg-white p-4 text-center">

                      <FaGithub className="w-5 h-5 mx-auto mb-3" />

                      <div className="text-[9px] font-black uppercase tracking-wider">
                        GitHub
                      </div>

                      <div className="text-[8px] text-slate-400 mt-1 uppercase">
                        Repository
                      </div>

                    </div>

                  </div>


                  {/* Download explanation */}

                  <div className="mt-5 pt-4 border-t-2 border-slate-200 flex items-center gap-3">

                    <Download className="w-4 h-4 text-[#0052FF]" />

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      On download, GitStore fetches the chunks and automatically
                      reconstructs your original file.
                    </p>

                  </div>

                </div>


                {/* =================================================
                    FEATURES
                ================================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <div className="border-2 border-slate-950 p-4 bg-white">

                    <Zap className="w-5 h-5 mb-3 text-[#0052FF]" />

                    <h2 className="text-[10px] font-black uppercase tracking-wider mb-2">
                      Automatic
                    </h2>

                    <p className="text-[10px] leading-5 text-slate-500">
                      No manual splitting. GitStore handles chunking for you.
                    </p>

                  </div>


                  <div className="border-2 border-slate-950 p-4 bg-white">

                    <ShieldCheck className="w-5 h-5 mb-3 text-[#0052FF]" />

                    <h2 className="text-[10px] font-black uppercase tracking-wider mb-2">
                      GitHub Powered
                    </h2>

                    <p className="text-[10px] leading-5 text-slate-500">
                      Your files are stored through your GitHub account.
                    </p>

                  </div>


                  <div className="border-2 border-slate-950 p-4 bg-white">

                    <FolderLock className="w-5 h-5 mb-3 text-[#0052FF]" />

                    <h2 className="text-[10px] font-black uppercase tracking-wider mb-2">
                      Seamless
                    </h2>

                    <p className="text-[10px] leading-5 text-slate-500">
                      Download the original file without managing chunks.
                    </p>

                  </div>

                </div>

              </section>


              {/* =================================================
                  RIGHT — LOGIN
              ================================================= */}

              <section className="p-8 md:p-10 flex flex-col justify-center">

                <div className="mb-8">

                  <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                    Get started
                  </div>

                  <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950">
                    Welcome to GitStore
                  </h2>

                  <p className="text-sm text-slate-500 mt-3 leading-6">
                    Connect your GitHub account and start storing your files.
                  </p>

                </div>


                {/* ERROR */}

                <AnimatePresence>

                  {errorMsg && (

                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-rose-50 border-2 border-rose-500 flex items-start gap-3 text-rose-900 text-xs font-bold uppercase tracking-wider"
                    >

                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />

                      <span>{errorMsg}</span>

                    </motion.div>

                  )}

                </AnimatePresence>


                {/* LOGIN BUTTON */}

                <motion.button
                  type="button"
                  id="github-login-btn"
                  onClick={handleLogin}
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-[#0052FF] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-colors duration-150 border-2 border-slate-900 shadow-[4px_4px_0px_#000000] cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
                >

                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaGithub className="w-4 h-4" />
                  )}

                  <span>
                    {isLoading
                      ? "Connecting..."
                      : "Continue with GitHub"}
                  </span>

                  {!isLoading && (
                    <ArrowRight className="w-4 h-4" />
                  )}

                </motion.button>


                {/* AUTH INFO */}

                <div className="mt-6 p-4 border-2 border-slate-200 bg-slate-50">

                  <div className="flex items-start gap-3">

                    <ShieldCheck className="w-4 h-4 text-[#0052FF] shrink-0 mt-0.5" />

                    <p className="text-[10px] leading-5 text-slate-500">

                      Sign in using GitHub OAuth. No additional GitStore
                      password or account is required.

                    </p>

                  </div>

                </div>


                {/* MINI STATS */}

                <div className="grid grid-cols-2 gap-3 mt-6">

                  <div className="border-2 border-slate-200 p-3">

                    <div className="text-lg font-black">
                      ~100 GB
                    </div>

                    <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                      Designed capacity
                    </div>

                  </div>


                  <div className="border-2 border-slate-200 p-3">

                    <div className="text-lg font-black">
                      1 → 1
                    </div>

                    <div className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                      File reconstruction
                    </div>

                  </div>

                </div>


                {/* FOOTER */}

                <div className="mt-8 pt-5 border-t-2 border-slate-200">

                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 text-center">
                    GitHub powered · Automatic chunking · Seamless downloads
                  </p>

                </div>

              </section>

            </div>

          </div>


          {/* Bottom label */}

          <div className="mt-6 flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">

            <span>
              GitStore / File Storage Infrastructure
            </span>

            <span>
              v1.0
            </span>

          </div>

        </motion.div>

      </main>


      {/* =========================================================
          GITHUB LOADING OVERLAY
      ========================================================= */}

      <AnimatePresence>

        {isLoading && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center"
          >

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-slate-900 p-8 max-w-sm w-full mx-4 shadow-[16px_16px_0px_rgba(0,0,0,0.15)] text-center flex flex-col items-center"
            >

              <div className="relative flex items-center justify-center w-16 h-16 bg-slate-100 border-2 border-slate-900 text-slate-900 mb-6">

                <FaGithub className="w-7 h-7" />

                <div className="absolute -inset-1 border-2 border-dashed border-indigo-600 animate-spin" />

              </div>


              <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 mb-2">
                GitHub Authorization
              </h3>


              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-6">
                {loadingText}
              </p>


              <div className="w-full border-2 border-slate-950 h-4 bg-slate-100 p-0.5 overflow-hidden">

                <motion.div
                  className="bg-black h-full"
                  initial={{ width: "10%" }}
                  animate={{ width: "45%" }}
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