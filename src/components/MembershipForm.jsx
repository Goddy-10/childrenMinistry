import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function MembershipForm() {
  const [members, setMembers] = useState([]);
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    residence: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch helpers
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

  // Load members on mount
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const m = await commonFetch("/api/members");
      setMembers(m || []);
    } catch (err) {
      console.error("Failed to load members:", err);
      alert(`Error loading members: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add Member
  const addMember = async () => {
    if (!memberForm.name || !memberForm.phone || !memberForm.residence) {
      alert("Please fill all member fields (Name, Phone, Residence).");
      return;
    }

    try {
      const payload = {
        name: memberForm.name,
        phone: memberForm.phone,
        residence: memberForm.residence,
        type: "member",
      };
      const created = await commonFetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMembers((s) => [created, ...s]);
      setMemberForm({ name: "", phone: "", residence: "" });
      alert("Member added successfully!");
    } catch (err) {
      alert(`Failed to add member: ${err.message}`);
    }
  };

  // Delete Member
  const deleteMember = async (memberId) => {
    if (!confirm("Delete this member?")) return;
    try {
      await commonFetch(`/api/members/${memberId}`, { method: "DELETE" });
      setMembers((s) => s.filter((m) => m.id !== memberId));
      alert("Member deleted successfully!");
    } catch (err) {
      alert(`Failed to delete member: ${err.message}`);
    }
  };

  // Edit Member
  const openEdit = (member) => {
    setEditItem({ ...member });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditItem(null);
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      const updated = await commonFetch(`/api/members/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });
      setMembers((s) => s.map((m) => (m.id === updated.id ? updated : m)));
      closeEdit();
      alert("Member updated successfully!");
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  // Download helper
  const buildHtmlTable = (title, columns, rows) => {
    const head = `<thead><tr>${columns
      .map(
        (c) =>
          `<th style="padding:6px 8px;border:1px solid #ccc;text-align:left">${c}</th>`,
      )
      .join("")}</tr></thead>`;
    const body = `<tbody>${rows
      .map(
        (r) =>
          `<tr>${columns
            .map((c) => {
              const key = c.key || c;
              let val = r[key];
              if (val === null || val === undefined) val = "";
              return `<td style="padding:6px 8px;border:1px solid #ccc">${val}</td>`;
            })
            .join("")}</tr>`,
      )
      .join("")}</tbody>`;

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
        </head>
        <body>
          <h2 style="font-family: Arial, Helvetica, sans-serif">${title}</h2>
          <table style="border-collapse: collapse; font-family: Arial, Helvetica, sans-serif; width:100%">${head}${body}</table>
        </body>
      </html>
    `;
  };

  const downloadMembers = () => {
    const html = buildHtmlTable(
      "Members Report",
      ["Name", "Phone", "Residence"],
      members.map((m) => ({
        Name: m.full_name || m.name,
        Phone: m.phone,
        Residence: m.residence || "",
      })),
    );
    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printMembers = () => {
    const html = buildHtmlTable(
      "Members Report",
      ["Name", "Phone", "Residence"],
      members.map((m) => ({
        Name: m.full_name || m.name,
        Phone: m.phone,
        Residence: m.residence || "",
      })),
    );
    const w = window.open("", "_blank");
    if (!w) {
      alert("Please allow popups for this site to print the report.");
      return;
    }
    w.document.write(html);
    w.document.write(
      `<style>table{border-collapse:collapse} th, td{font-family: Arial, Helvetica, sans-serif; font-size:12px}</style>`,
    );
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
    }, 200);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Membership Registration</h1>
        <p className="text-pink-100">
          Add and manage church members with their contact information
        </p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Add New Member
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter member name"
              value={memberForm.name}
              onChange={(e) =>
                setMemberForm({ ...memberForm, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter phone number"
              value={memberForm.phone}
              onChange={(e) =>
                setMemberForm({ ...memberForm, phone: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Residence *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter residence"
              value={memberForm.residence}
              onChange={(e) =>
                setMemberForm({ ...memberForm, residence: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={addMember}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 font-medium transition"
        >
          ➕ Add Member
        </button>
      </div>

      {/* Members List Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Members ({members.length})
          </h2>
          <div className="space-x-2">
            <button
              onClick={downloadMembers}
              disabled={members.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              📥 Download
            </button>
            <button
              onClick={printMembers}
              disabled={members.length === 0}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No members found</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 border">#</th>
                    <th className="text-left p-3 border">Name</th>
                    <th className="text-left p-3 border">Phone</th>
                    <th className="text-left p-3 border">Residence</th>
                    <th className="text-center p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={m.id ?? i} className="hover:bg-gray-50 border-b">
                      <td className="p-3 border">{i + 1}</td>
                      <td className="p-3 border font-medium">
                        {m.full_name || m.name}
                      </td>
                      <td className="p-3 border">{m.phone}</td>
                      <td className="p-3 border">{m.residence || "-"}</td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => openEdit(m)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMember(m.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {members.map((m, i) => (
                <div
                  key={m.id ?? i}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">
                      {i + 1}. {m.full_name || m.name}
                    </h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMember(m.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📞 {m.phone}</p>
                    <p>📍 {m.residence || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Edit Member
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editItem.name || editItem.full_name || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      name: e.target.value,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editItem.phone || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Residence
                </label>
                <input
                  type="text"
                  value={editItem.residence || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, residence: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
