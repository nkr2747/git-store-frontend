import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  HardDrive,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
export default function Sidebar({
  user,
  onLogout,
  isOpen,
  onClose,
}) {
  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r-2 border-slate-200 select-none">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="px-4 pt-5">

        <div className="flex items-center justify-between px-2 mb-7">

          <div className="flex items-center gap-3">

            {/* GitStore logo */}
            <div className="w-9 h-9 bg-black flex items-center justify-center shrink-0">
              <div className="w-3 h-3 bg-white rotate-45" />
            </div>

            <div>
              <div className="font-black text-lg tracking-tight uppercase">
                GitStore
              </div>

              <div className="text-[7px] font-bold tracking-[0.2em] uppercase text-slate-400">
                File Storage
              </div>
            </div>

          </div>


          {/* Mobile close */}
          <button
            onClick={onClose}
            className="
              lg:hidden
              w-9 h-9
              flex items-center justify-center
              border-2 border-slate-900
              hover:bg-slate-900
              hover:text-white
              transition-colors
              cursor-pointer
            "
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>

        </div>


        {/* =================================================
            USER CARD
        ================================================= */}

        <div className="border-2 border-slate-900 bg-slate-50 p-3 mb-6">

          <div className="flex items-center gap-3">

            <img
              src={user?.avatarURL}
              alt={user?.displayName || "GitHub user"}
              referrerPolicy="no-referrer"
              className="w-11 h-11 border-2 border-slate-900 object-cover shrink-0"
            />

            <div className="min-w-0">

              <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.15em] mb-1">
                Signed in as
              </p>

              <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-wide">
                {user?.displayName || "GitHub User"}
              </h4>

              <p className="text-[9px] text-slate-500 truncate font-mono mt-1">
                @{user?.username || "github-user"}
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            CONNECTION STATUS
        ================================================= */}

        <div className="mb-6">

          <div className="px-1 mb-2">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
              Storage
            </span>
          </div>


          <div className="border-2 border-slate-200">

            {/* GitHub connection */}
            <div className="flex items-center gap-3 p-3 border-b-2 border-slate-200">

              <div className="w-8 h-8 bg-slate-950 text-white flex items-center justify-center">
                <FaGithub className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">

                <div className="text-[9px] font-black uppercase tracking-wider">
                  GitHub
                </div>

                <div className="text-[8px] text-slate-400 uppercase mt-0.5">
                  Storage backend
                </div>

              </div>

              <div className="flex items-center gap-1.5">

                <span className="w-2 h-2 bg-emerald-500 rounded-full" />

                <span className="text-[7px] font-black uppercase text-emerald-600">
                  Connected
                </span>

              </div>

            </div>


            {/* Chunking */}
            <div className="flex items-center gap-3 p-3">

              <div className="w-8 h-8 bg-blue-50 border-2 border-[#0052FF] text-[#0052FF] flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">

                <div className="text-[9px] font-black uppercase tracking-wider">
                  GitStore
                </div>

                <div className="text-[8px] text-slate-400 uppercase mt-0.5">
                  Automatic chunking
                </div>

              </div>

              <ShieldCheck className="w-4 h-4 text-[#0052FF]" />

            </div>

          </div>

        </div>


        {/* =================================================
            INFO
        ================================================= */}

        <div className="border-l-2 border-[#0052FF] pl-3 pr-2">

          <p className="text-[8px] leading-4 text-slate-400 uppercase font-medium">
            Large files are automatically split into smaller chunks and
            stored in your GitHub repository.
          </p>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ================================================= */}

      <div className="mt-auto px-4 pb-5 pt-6">

        <div className="border-t-2 border-slate-200 pt-4">

          <button
            onClick={onLogout}
            id="logout-btn"
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              py-3.5
              border-2
              border-slate-900
              bg-white
              hover:bg-slate-900
              hover:text-white
              text-[9px]
              font-black
              uppercase
              tracking-[0.15em]
              transition-colors
              duration-150
              cursor-pointer
            "
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>


          <div className="flex justify-between mt-3 px-1">

            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
              GitStore
            </span>

            <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
              v1.0
            </span>

          </div>

        </div>

      </div>

    </div>
  );


  return (
    <>
      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950 backdrop-blur-[1px]"
            />


            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 220,
              }}
              className="
                absolute
                top-0
                bottom-0
                left-0
                w-72
                max-w-[85vw]
                bg-white
                shadow-2xl
              "
            >
              {sidebarContent}
            </motion.div>

          </div>
        )}
      </AnimatePresence>


      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}