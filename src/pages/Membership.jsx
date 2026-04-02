// import React from "react";
// import MembershipForm from "../components/MembershipForm";

// export default function Membership() {
//   return <MembershipForm />;
// }

import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function Membership() {
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    residence: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Fetch helper
  const commonFetch = async (path, opts = {}) => {
    const token = localStorage.getItem("token");

    const headers = { ...(opts.headers || {}) };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const hasBody = opts.body && typeof opts.body === "string";
    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers,
    });

    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Request failed");
    }

    return data;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!memberForm.name || !memberForm.phone || !memberForm.residence) {
      setError("Please fill all fields (Name, Phone, Residence)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: memberForm.name,
        phone: memberForm.phone,
        residence: memberForm.residence,
        type: "member",
      };

      await commonFetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Success!
      setSubmitted(true);
      setMemberForm({ name: "", phone: "", residence: "" });

      // Auto-reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(`Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">
            Welcome to GCC
          </h1>
          <p className="text-gray-700 text-lg">Raising Standards</p>
          <p className="text-gray-600 text-sm mt-2">
            Complete your membership registration below
          </p>
        </div>

        {/* Success Message */}
        {submitted ? (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-4">
              <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Registration Successful! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to the GCC Family! Your membership registration has been
              completed successfully.
            </p>
            <p className="text-pink-600 font-semibold text-lg">
              "Raising Standards"
            </p>
            
            <p className="text-gray-500 text-sm mt-2">
              Thank you for joining us!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                  disabled={loading}
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={memberForm.phone}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                  disabled={loading}
                />
              </div>

              {/* Residence Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Residence *
                </label>
                <input
                  type="text"
                  value={memberForm.residence}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, residence: e.target.value })
                  }
                  placeholder="Enter your residence/address"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-pink-700 hover:to-pink-600 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "✅ Complete Registration"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                By registering, you agree to be part of our church family and
                community
              </p>
            </div>
          </div>
        )}

        {/* Church Info */}
        <div className="mt-8 text-center text-gray-600 text-xs">
          <p>GCC - Growing in Christ Church</p>
          <p className="text-pink-600 font-semibold mt-1">Raising Standards</p>
        </div>
      </div>
    </div>
  );
}