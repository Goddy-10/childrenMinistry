import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VisitorForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    residence: "",
    prayer_request: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API}/api/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const text = await res.text();
      console.error("RAW RESPONSE:", res.status, text);

      if (!res.ok) {
        throw new Error(text || `Server returned ${res.status}`);
      }
      console.log("Submitting visitor:", form);
      setMessage({ type: "success", text: "Visitor saved successfully!" });
      setForm({ name: "", phone: "", residence: "", prayer_request: "" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save visitor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Register as Visitor
        </h2>
        {message && (
          <div
            className={`p-3 rounded mb-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="residence"
            value={form.residence}
            onChange={handleChange}
            placeholder="Residence"
            className="w-full border p-2 rounded"
          />
          <textarea
            name="prayer_request"
            value={form.prayer_request_or_Feedback}
            onChange={handleChange}
            placeholder="Prayer Request or Feedback (optional)"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-pink-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
