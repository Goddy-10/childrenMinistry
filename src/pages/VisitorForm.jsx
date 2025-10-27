// // src/pages/VisitorForm.jsx
// import React, { useState } from "react";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function VisitorForm() {
//   const [form, setForm] = useState({ name: "", phone: "", residence: "" });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(null);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage(null);

//     try {
//       const res = await fetch(`${API}/visitors`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) {
//         throw new Error(`Server returned ${res.status}`);
//       }

//       setMessage({
//         type: "success",
//         text: "Thank you,your visit has been appreciated.",
//       });
//       setForm({ name: "", phone: "", residence: "" });
//     } catch (err) {
//       // fallback behavior: store locally so data isn't lost
//       console.error("Submit failed:", err);
//       const pending = JSON.parse(
//         localStorage.getItem("pendingVisitors") || "[]"
//       );
//       pending.push({ ...form, createdAt: new Date().toISOString() });
//       localStorage.setItem("pendingVisitors", JSON.stringify(pending));
//       setMessage({
//         type: "warning",
//         text: "Could not reach server. we have saved your submission locally and will be synced when server is available.",
//       });
//       setForm({ name: "", phone: "", residence: "" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-500 flex items-center justify-center p-6 pt-20">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//         <h2 className="text-2xl font-bold text-pink-600 mb-4 text-center">
//           Visitor Registration
//         </h2>

//         {message && (
//           <div
//             className={`p-3 rounded mb-4 ${
//               message.type === "success"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-yellow-50 text-yellow-700"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Full name
//             </label>
//             <input
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               required
//               className="w-full border p-2 rounded"
//               placeholder="e.g. Jane Doe"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Phone
//             </label>
//             <input
//               name="phone"
//               value={form.phone}
//               onChange={handleChange}
//               required
//               className="w-full border p-2 rounded"
//               placeholder="+254 7xx xxx xxx"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Residence
//             </label>
//             <input
//               name="residence"
//               value={form.residence}
//               onChange={handleChange}
//               className="w-full border p-2 rounded"
//               placeholder="estate / town"
//             />
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-pink-600 text-white px-4 py-2 rounded"
//             >
//               {loading ? "Saving..." : "Submit"}
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 setForm({ name: "", phone: "", residence: "" });
//                 setMessage(null);
//               }}
//               className="bg-gray-200 px-4 py-2 rounded"
//             >
//               Clear
//             </button>
//           </div>
//         </form>

//         <p className="mt-4 text-sm text-gray-500">
//           Note: When backend is available set <code>VITE_API_URL</code> in{" "}
//           <code>.env</code> to point to your Flask server.
//         </p>
//       </div>
//     </div>
//   );
// }












// // src/pages/VisitorForm.jsx
// import React, { useState } from "react";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default function VisitorForm() {
//   const [form, setForm] = useState({
//     full_name: "",
//     phone: "",
//     residence: "",
//     prayer_request: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(null);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage(null);

//     try {
//       const res = await fetch(`${API}/visitors`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) throw new Error(`Server returned ${res.status}`);

//       setMessage({
//         type: "success",
//         text: "Thank you, your visit has been appreciated.",
//       });

//       setForm({ full_name: "", phone: "", residence: "", prayer_request: "" });
//     } catch (err) {
//       console.error("Submit failed:", err);

//       // fallback: save locally
//       const pending = JSON.parse(localStorage.getItem("pendingVisitors") || "[]");
//       pending.push({ ...form, createdAt: new Date().toISOString() });
//       localStorage.setItem("pendingVisitors", JSON.stringify(pending));

//       setMessage({
//         type: "warning",
//         text: "Could not reach server. Submission saved locally and will sync when server is available.",
//       });

//       setForm({ full_name: "", phone: "", residence: "", prayer_request: "" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-500 flex items-center justify-center p-6 pt-20">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//         <h2 className="text-2xl font-bold text-pink-600 mb-4 text-center">
//           Visitor Registration
//         </h2>

//         {message && (
//           <div
//             className={`p-3 rounded mb-4 ${
//               message.type === "success"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-yellow-50 text-yellow-700"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Full Name
//             </label>
//             <input
//               name="full_name"
//               value={form.full_name}
//               onChange={handleChange}
//               required
//               className="w-full border p-2 rounded"
//               placeholder="e.g. Jane Doe"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Phone
//             </label>
//             <input
//               name="phone"
//               value={form.phone}
//               onChange={handleChange}
//               className="w-full border p-2 rounded"
//               placeholder="+254 7xx xxx xxx"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Residence
//             </label>
//             <input
//               name="residence"
//               value={form.residence}
//               onChange={handleChange}
//               className="w-full border p-2 rounded"
//               placeholder="estate / town"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Prayer Request
//             </label>
//             <textarea
//               name="prayer_request"
//               value={form.prayer_request}
//               onChange={handleChange}
//               className="w-full border p-2 rounded"
//               placeholder="Optional prayer request"
//             />
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-pink-600 text-white px-4 py-2 rounded"
//             >
//               {loading ? "Saving..." : "Submit"}
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 setForm({ full_name: "", phone: "", residence: "", prayer_request: "" });
//                 setMessage(null);
//               }}
//               className="bg-gray-200 px-4 py-2 rounded"
//             >
//               Clear
//             </button>
//           </div>
//         </form>

//         <p className="mt-4 text-sm text-gray-500">
//           Note: When backend is available, set <code>VITE_API_URL</code> in <code>.env</code> to point to your Flask server.
//         </p>
//       </div>
//     </div>
//   );
// }
