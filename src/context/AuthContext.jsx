// // src/context/AuthContext.jsx
// import React, { createContext, useContext, useEffect, useState } from "react";

// /**
//  * AuthContext (frontend-side)
//  *
//  * - Expects a bearer token stored in localStorage under "token" (change name if needed).
//  * - On mount, if token exists, calls /api/auth/me to load user profile (role + id).
//  * - Exposes login(token) and logout() to set/clear token.
//  *
//  * NOTE: replace the fetch endpoints (/api/auth/me) with your Flask endpoints when available.
//  */

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null); // { id, role, name, ... } or null
//   const [loading, setLoading] = useState(true);

//   // helper to read token (change storage strategy as needed)
//   const getToken = () => localStorage.getItem("token");

//   // fetch user profile from backend using token
//   const fetchUser = async (token) => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/me", {
//         headers: {
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//       });
//       if (!res.ok) {
//         // token invalid or no user
//         setUser(null);
//       } else {
//         const data = await res.json();
//         // expected shape: { id, name, role, ... }
//         setUser(data);
//       }
//     } catch (err) {
//       console.error("Auth: fetchUser error", err);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // On mount: try load token and fetch user
//   useEffect(() => {
//     const token = getToken();
//     if (token) {
//       fetchUser(token);
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   // login: store token then fetch user
//   async function login(token) {
//     if (!token) return;
//     localStorage.setItem("token", token);
//     await fetchUser(token);
//   }

//   // logout: clear token and user
//   function logout() {
//     localStorage.removeItem("token");
//     setUser(null);
//   }

//   // helper to check roles
//   function hasRole(requiredRoles) {
//     if (!user) return false;
//     if (!requiredRoles) return true;
//     return requiredRoles.includes(user.role);
//   }

//   const value = {
//     user,
//     loading,
//     login, // call with token (string) after backend auth
//     logout,
//     hasRole, // hasRole(['admin']) etc
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }

// /* ======= Optional dev helper =======
// If you want to quickly test UI for different roles *before* backend is ready,
// you can temporarily run (in console or a dev button):
//   localStorage.setItem('token', 'DEV_TOKEN');
//   // then call auth.login('DEV_TOKEN') with a dev endpoint that returns a fake user
// But prefer NOT to keep mocked tokens in production code.
// ===================================== */





// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, role, name, ... } or null
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // fetch user profile from backend using token
  const fetchUser = async (jwt) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : "",
        },
      });

      if (!res.ok) {
        // token invalid or expired
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      } else {
        const data = await res.json();
        // expected shape: { id, name, role }
        setUser(data);
      }
    } catch (err) {
      console.error("Auth: fetchUser error", err);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // On mount: if token exists, load user
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // login: store token then fetch user
  async function login(jwt) {
    if (!jwt) return;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    await fetchUser(jwt);
  }

  // logout: clear token and user
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  // role helper
  function hasRole(requiredRoles) {
    if (!user) return false;
    if (!requiredRoles) return true;
    return requiredRoles.includes(user.role);
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}