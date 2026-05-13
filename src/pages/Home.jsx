import { useEffect, useState } from 'react';
import '../Second.css';
import gitStoreLogo from '../assets/gitStoreLogo.png';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    // GitHub redirects back to: http://localhost:5173/?token=<jwt>
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');

    if (tokenFromURL) {
      setToken(tokenFromURL);
      localStorage.setItem('token', tokenFromURL); // persist it

      // Clean the token from the URL (optional but good practice)
      window.history.replaceState({}, document.title, '/');

      // Decode the JWT payload to get user info (no verification on frontend)
      const payload = JSON.parse(atob(tokenFromURL.split('.')[1]));
      setUser(payload);
      navigate('/logged');
    } else {
      // Check localStorage if already logged in
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser(payload);
        navigate('/logged');
      }
    }
  }, []);

  function handleLogin() {
    window.location.href = `${BACKEND_URL}/auth/github`;
  }

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
    setToken(null);
    setUser(null);

    // Redirect to GitHub logout
    window.location.href = 'https://github.com/logout';
  }
}

  return (
    <div className="container">
      <div>
        
        {user ? (
          <>
            <p>Welcome, {user.username}!</p>
            <button className='btn btn-secondary' onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button className='btn github-login-btn btn-secondary' onClick={handleLogin}>Login with GitHub</button>
        )}
      </div>
    </div>
  );
}
