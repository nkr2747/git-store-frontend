import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDisable, setUploadDisable] = useState(true);
  const [progress, setProgress] = useState(0);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const STORAGE_LIMIT_BYTES = 40000;
  const totalStorageUsed = 56;
  // yahan ek useEffect hook lgaenge
  const [token, setToken] = useState(null);
 
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      setToken(tokenFromURL);
      localStorage.setItem("token", tokenFromURL);
      //cleaning token from URL
      window.history.replaceState({}, document.title, "/");
      // Decode the JWT payload to get user info (no verification on frontend)
      const payload = JSON.parse(atob(tokenFromURL.split('.')[1]));
      
      setUser(payload);
    }else {
      // Check localStorage if already logged in
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser(payload);
      }
    }
    
  }, []);

  async function handleLogout() {
    //console.log(token);
    //console.log("Fetched data:", files);
  try {
    const savedToken = localStorage.getItem('token');

    const res = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json'
      }
    });
    const resData = await res.json();
    console.log(resData);

  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local state
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);

    // Redirect to GitHub logout
    window.location.href = 'https://github.com/logout';
  }
}
    
  async function handleAddFile() {
    
  }
  async function handleToggleFavorite() {
    
  }
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Login />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-screen relative"
          >
            {/* Sidebar drawer + desktop persistent navigation */}
            <Sidebar
              user={user}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onLogout={handleLogout}
              totalStorageUsed={totalStorageUsed}
              maxStorageLimit={STORAGE_LIMIT_BYTES}
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            />

            {/* Dashboard Workspace panel */}
            <Dashboard
              activeCategory={activeCategory}
              onAddFile={handleAddFile}

              onToggleFavorite={handleToggleFavorite}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
