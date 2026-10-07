import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromURL = params.get("token");

        const token = tokenFromURL || localStorage.getItem("token");

        if (!token) {
          return;
        }

        // Store token if it came from the OAuth callback
        if (tokenFromURL) {
          localStorage.setItem("token", token);

          // Remove token from browser URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        // Decode JWT payload
        // Verification is handled by the backend.
        const payload = JSON.parse(
          atob(token.split(".")[1])
        );

        setUser(payload);
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    initializeAuth();
  }, []);

  async function handleLogout() {
    try {
      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        await fetch(`${BACKEND_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");

      // Leave the React app directly.
      window.location.replace("https://github.com/logout");
    }
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
            transition={{ duration: 0.25 }}
          >
            <Login />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-screen"
          >
            <Sidebar
              user={user}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onLogout={handleLogout}
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            />

            <Dashboard
              activeCategory={activeCategory}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}