// // src/pages/Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [role, setRole] = useState("teacher"); // default to teacher
//   const [identifier, setIdentifier] = useState(""); // email or phone
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ identifier, password, role }),
//       });

//       if (!res.ok) {
//         let errMsg = "Login failed";
//         try {
//           const errData = await res.json();
//           errMsg = errData.message || errMsg;
//         } catch {}
//         throw new Error(errMsg);
//       }

//       const data = await res.json(); // { token: "JWT..." }
//       await login(data.token); // AuthContext will fetch user automatically

//       navigate("/"); // redirect to home/dashboard
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//       <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
//         <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">
//           Login
//         </h2>

//         {error && (
//           <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Role selector */}
//           <select
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             className="w-full border p-2 rounded-lg"
//           >
//             <option value="admin">Admin</option>
//             <option value="teacher">Teacher</option>
//           </select>

//           {/* Email/Phone */}
//           <input
//             type="text"
//             placeholder="Email or Phone"
//             value={identifier}
//             onChange={(e) => setIdentifier(e.target.value)}
//             required
//             className="w-full border p-2 rounded-lg"
//           />

//           {/* Password */}
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className="w-full border p-2 rounded-lg"
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("teacher"); // default to teacher
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password, role }),
        }
      );

      if (!res.ok) {
        let errMsg = "Login failed";
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json(); // { token: "JWT..." }
      await login(data.token, data.user); // AuthContext will fetch user automatically
      if (data.user.must_change_password) {
        navigate("/change-password");
      } else {
        navigate("/"); // redirect to home/dashboard
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">
          Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
          </select>

          {/* Email/Phone */}
          <input
            type="text"
            placeholder="Email or Phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
