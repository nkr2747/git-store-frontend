import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X
} from 'lucide-react';
export default function Sidebar({
  user,
  activeCategory,
  setActiveCategory,
  onLogout,
  isOpen,
  onClose
}){
    const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r-2 border-slate-200 py-6 px-4 select-none">
      <div>
        {/* Logo and close button for mobile */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <div className="w-3 h-3 bg-white rotate-45"></div>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase font-sans">GitStore</span>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-900 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info Block (Geometric card style) */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-none mb-8">
          <img 
            src={user.avatarURL} 
            alt={user.displayName} 
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-none border border-slate-950 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">User Auth</p>
            <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-wider">
              {user.displayName}
            </h4>
            <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
              github/{user.username}
            </p>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={onLogout}
          id="logout-btn"
          className="w-full py-4 border-2 border-slate-900 hover:border-black text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white rounded-none transition-colors duration-150 cursor-pointer text-center"
        >
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

    return (<>
          {/* Mobile Sidebar overlay */}
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
                />
                
                {/* Drawer */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute top-0 bottom-0 left-0 w-72 max-w-[80vw] bg-white shadow-2xl"
                >
                  {sidebarContent}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
    
          {/* Desktop Persistent Sidebar */}
          <div className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
            {sidebarContent}
          </div>
        </>);
}