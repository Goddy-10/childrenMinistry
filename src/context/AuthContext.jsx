

// // src/context/AuthContext.jsx
// import React, { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("token") || null);
//   const [loading, setLoading] = useState(true);

//   // Fetch current user from backend
//   const fetchUser = async (jwt) => {
//     if (!jwt) return;

//     setLoading(true);
//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
//         headers: {
//           Authorization: `Bearer ${jwt}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) {
//         // token invalid or expired
//         setUser(null);
//         setToken(null);
//         localStorage.removeItem("token");
//         console.error("Auth: fetchUser failed", res.status);
//         return;
//       }

//       const data = await res.json(); // { id, username, name, role, ... }
//       setUser(data);
//     } catch (err) {
//       console.error("Auth: fetchUser error", err);
//       setUser(null);
//       setToken(null);
//       localStorage.removeItem("token");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // On mount, fetch user if token exists
//   useEffect(() => {
//     if (token) fetchUser(token);
//     else setLoading(false);
//   }, [token]);

//   // Login: store token and fetch user
//   const login = async ({ token: jwt }) => {
//     if (!jwt) return;
//     localStorage.setItem("token", jwt);
//     setToken(jwt);
//     await fetchUser(jwt);
//   };

//   // Logout: clear everything
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("token");
//   };

//   // Role helper
//   const hasRole = (allowedRoles) => {
//     if (!user) return false;
//     if (!allowedRoles) return true;
//     return allowedRoles.includes(user.role);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         login,
//         logout,
//         hasRole,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }








// src/context/AuthContext.jsx
// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });
//   const [token, setToken] = useState(() => localStorage.getItem("token"));
//   const [loading, setLoading] = useState(true);

//   // login function
//   const login = async (jwtToken, userData) => {
//     console.log("Storing token and user:", jwtToken, userData); // debug
//     localStorage.setItem("token", jwtToken);
//     localStorage.setItem("user", JSON.stringify(userData));
//     setToken(jwtToken);
//     setUser(userData);
//   };

//   // logout
//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setToken(null);
//     setUser(null);
//   };

//   // fetch current user (if token exists)
//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!token) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });
//         if (!res.ok) throw new Error("Failed to fetch user");
//         const data = await res.json();
//         console.log("Fetched user:", data); // debug
//         setUser(data);
//       } catch (err) {
//         console.error("fetchUser error:", err);
//         logout();
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUser();
//   }, [token]);

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);














//src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

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

      // Check if response is JSON
      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Failed to parse /auth/me JSON:", err, await res.text());
        data = null;
      }

      if (res.ok && data) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
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
      setLoading(false);
    } else {
      await fetchUser(jwtToken);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // On mount, fetch user if token exists
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);