import { useEffect } from "react";
import "../Second.css";
import logo from "../assets/logo.png";
import { Files } from "./Files";
import Upload from "./Upload";
import { NavLink, Outlet } from "react-router-dom";

export function LoggedPage() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    async function handleLogout() {
  try {
    const savedToken = localStorage.getItem('token');
    

    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local state
    localStorage.removeItem('token');

    // Redirect to GitHub logout
    window.location.href = 'https://github.com/logout';
  }
}
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
    //console.log("Logged in with token:", token);
    // Component did mount logic
  }, []);

  return (
    <>
      <div className="container-logged">
        <div className="topnav">
          <img
            src={logo}
            alt="GitStore Logo"
            className="logo"
            style={{ width: "140px" }}
          />
          <h1>GitStore</h1>
        </div>
        <div className="main-content">
          <div className="sidebar">
            <div className="sidebar-nav">
              <NavLink
                to="/logged/files"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                📁 Files
              </NavLink>
              <NavLink
                to="/logged/upload"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                ⬆ Upload
              </NavLink>
            </div>
            <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
