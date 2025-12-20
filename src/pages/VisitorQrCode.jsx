

// src/pages/VisitorManagement.jsx
import React, { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VisitorManagement() {
  const [form, setForm] = useState({ name: "", phone: "", residence: "", prayer_request: "" });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const containerRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch visitors from backend
  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${API}/api/visitors`);
      const data = await res.json();
      setVisitors(data.map(v => ({ ...v, followedUp: v.follow_up_status !== "pending" })));
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Handle form input
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit visitor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/api/visitors`, {
        method: "POST",
        headers: { "Authorization":`Bearer ${token}`, "Content-Type": "application/json", },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const newVisitor = await res.json();

      setVisitors([ { ...newVisitor, followedUp: false }, ...visitors ]);
      setForm({ name: "", phone: "", residence: "", prayer_request: "" });
      setMessage({ type: "success", text: "Visitor saved successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save visitor." });
    } finally {
      setLoading(false);
    }
  };

  // Toggle follow-up status
  const toggleFollowUp = async (id) => {
    const updatedVisitors = visitors.map(v => v.id === id ? { ...v, followedUp: !v.followedUp } : v);
    setVisitors(updatedVisitors);

    

    const visitor = updatedVisitors.find(v => v.id === id);
    try {
      await fetch(`${API}/api/visitors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" ,"Authorization":`Bearer ${token}`},
        body: JSON.stringify({ follow_up_status: visitor.followedUp ? "contacted" : "pending" }),
      });
    } catch (err) {
      console.error("Failed to update follow-up:", err);
    }
  };

  // Delete visitor
  const deleteVisitor = async (id) => {

    
    try {
      await fetch(`${API}/api/visitors/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setVisitors(visitors.filter(v => v.id !== id));
    } catch (err) {
      console.error("Failed to delete visitor:", err);
    }
  };

  // Clear all followed visitors
  const clearFollowed = async () => {
    const followedIds = visitors.filter((v) => v.followedUp).map((v) => v.id);
    

    try {
      for (const id of followedIds) {
        await fetch(`${API}/api/visitors/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      setVisitors(visitors.filter((v) => !v.followedUp));
    } catch (err) {
      console.error("Failed to clear followed visitors:", err);
    }
  };




const visitorFormUrl = "https://gcc-karama.vercel.app/visitor-form";


// const visitorFormUrl = import.meta.env.VITE_VISITOR_FORM_URL;
  
  //Local Dev
  // VITE_VISITOR_FORM_URL=http://localhost:5173/visitor-form


  // const visitorFormUrl = `${window.location.origin}/visitor-form`;

//TESTING QR CODE LAN IP
  // const visitorFormUrl = `http://10.121.183.239:5173/visitor-form`;

  // QR Code utilities
  const downloadQR = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return alert("QR not ready yet.");
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "visitor-qr.png";
    a.click();
  };

  const printQR = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return alert("QR not ready yet.");
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) return alert("Pop-up blocked.");
    w.document.write(`
      <html><head><title>Print QR</title></head>
      <body style="display:flex; flex-direction:column; align-items:center; font-family:system-ui;">
        <h1 style="color:#be185d;">Visitor QR</h1>
        <img src="${dataUrl}" style="margin-top:12px; max-width:80vw;" />
        <p>Scan or visit: <a href="${visitorFormUrl}">${visitorFormUrl}</a></p>
        <script>window.onload=()=>{ setTimeout(()=>window.print(),300); window.onafterprint=()=>window.close(); }</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-20 flex gap-6">
      {/* Left: Visitor Form + Table */}
      <div className="flex-1 space-y-6">
        {/* Visitor Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">Register Visitor</h2>
          {message && (
            <div className={`p-3 rounded mb-4 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="w-full border p-2 rounded" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required className="w-full border p-2 rounded" />
            <input name="residence" value={form.residence} onChange={handleChange} placeholder="Residence" className="w-full border p-2 rounded" />
            <textarea name="prayer_request" value={form.prayer_request} onChange={handleChange} placeholder="Prayer Request or Feedback (optional)" className="w-full border p-2 rounded" />
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="bg-pink-600 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Submit"}</button>
              <button type="button" onClick={()=>setForm({ name:"", phone:"", residence:"", prayer_request:"" })} className="bg-gray-200 px-4 py-2 rounded">Clear</button>
            </div>
          </form>
        </div>

        {/* Visitor Table */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
          <h2 className="text-xl font-bold text-pink-600 mb-4">Visitors</h2>
          <button onClick={clearFollowed} className="mb-2 px-3 py-1 bg-pink-600 text-white rounded">Clear Followed Visitors</button>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-pink-100">
                <th className="border p-2">Followed</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Residence</th>
                <th className="border p-2">Prayer Request/Feedback</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v.id} className={`${v.followedUp ? "bg-gray-200" : "bg-white"}`}>
                  <td className="text-center border p-1">
                    <input type="checkbox" checked={v.followedUp} onChange={()=>toggleFollowUp(v.id)} />
                  </td>
                  <td className="border p-2">{v.full_name}</td>
                  <td className="border p-2">{v.phone}</td>
                  <td className="border p-2">{v.residence}</td>
                  <td className="border p-2">{v.prayer_request || "-"}</td>
                  <td className="border p-2">
                    <button onClick={()=>deleteVisitor(v.id)} className="text-red-600 px-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: QR Code */}
      <div ref={containerRef} className="w-80 bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-pink-600">Visitor QR Code</h2>
        <QRCodeCanvas value={visitorFormUrl} size={220} />
        <p className="text-sm text-gray-600 break-words text-center">{visitorFormUrl}</p>
        <div className="flex gap-3">
          <button onClick={downloadQR} className="bg-pink-600 text-white px-4 py-2 rounded">Download</button>
          <button onClick={printQR} className="bg-gray-700 text-white px-4 py-2 rounded">Print</button>
        </div>
      </div>
    </div>
  );
}