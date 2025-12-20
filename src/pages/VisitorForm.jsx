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
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Friendly validation (before hitting backend)
    if (!form.name.trim()) {
      setMessage({
        type: "error",
        text: "Please fill out your name before submitting.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API}/api/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      // ✅ Success
      setSubmitted(true);
      setForm({
        name: "",
        phone: "",
        residence: "",
        prayer_request: "",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ THANK YOU SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">Thank You!</h2>
          <p className="text-gray-700 leading-relaxed">
            Thank you for your feedback. <br />
            We love visitors. <br />
            God bless you and welcome again.
          </p>
        </div>
      </div>
    );
  }

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
            placeholder="Full Name *"
            className="w-full border p-2 rounded"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
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
            value={form.prayer_request}
            onChange={handleChange}
            placeholder="Prayer Request or Feedback (optional)"
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
