

// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // 🟩 For inactivity warning toast

  // 🟩 Auto logout timer setup (3 hours)
  const AUTO_LOGOUT_TIME = 3 * 60 * 60 * 1000; // 3 hours
  const WARNING_TIME = AUTO_LOGOUT_TIME - 60 * 1000; // Show toast 1 min before logout
  let logoutTimer;
  let warningTimer;

  const resetTimer = () => {
    clearTimeout(logoutTimer);
    clearTimeout(warningTimer);

    // 🟩 schedule warning toast 1 min before logout
    warningTimer = setTimeout(() => {
      setToast("You’ll be logged out in 1 minute due to inactivity.");
      setTimeout(() => setToast(null), 60000); // hide toast after 1 min
    }, WARNING_TIME);

    // 🟩 schedule actual logout
    logoutTimer = setTimeout(() => {
      console.log("Auto logout: inactive for 3 hours");
      logout();
    }, AUTO_LOGOUT_TIME);
  };

  const setupInactivityListeners = () => {
    ["mousemove", "click", "keydown"].forEach((event) =>
      window.addEventListener(event, resetTimer)
    );
  };

  const removeInactivityListeners = () => {
    ["mousemove", "click", "keydown"].forEach((event) =>
      window.removeEventListener(event, resetTimer)
    );
  };

  // 🟩 Helper toast component
  const Toast = ({ message }) => (
    <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn">
      {message}
    </div>
  );

  // Fetch current user using token
  const fetchUser = async (jwtToken) => {
    if (!jwtToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Failed to parse /auth/me JSON:", err, await res.text());
        data = null;
      }

      if (res.ok && data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data)); // 🟩 persist user
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (jwtToken, userData = null) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);

    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData)); // 🟩 save user
      setLoading(false);
    } else {
      await fetchUser(jwtToken);
    }

    // 🟩 start inactivity tracking after login
    resetTimer();
    setupInactivityListeners();
  };

  // Logout function
  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    removeInactivityListeners(); // 🟩 clean up listeners
    clearTimeout(logoutTimer);
    clearTimeout(warningTimer);
    setToast(null);
  };

  // On mount, fetch user if token exists
  useEffect(() => {
    if (token) {
      fetchUser(token);
      resetTimer(); // 🟩 start timer
      setupInactivityListeners();
    } else {
      setLoading(false);
    }

    return () => {
      removeInactivityListeners();
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
      {toast && <Toast message={toast} />} {/* 🟩 render toast */}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);





















