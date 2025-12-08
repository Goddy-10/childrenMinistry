


// src/components/FinanceDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// ----------------- Finance Dashboard -----------------
const FinanceDashboard = () => {
  const { token } = useAuth();

  const [entries, setEntries] = useState([]); // raw combined entries
  const [filtered, setFiltered] = useState([]); // after search / date / service filters
  const [editingKey, setEditingKey] = useState(null); // composite key: `${type}-${id}`
  const [editForm, setEditForm] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  // Modals
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [incomeForm, setIncomeForm] = useState({
    date: "",
    service_type: "",
    main_church: "",
    children_ministry: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    date: "",
    amount: "",
    details: "",
  });

  // ----------------- common helpers -----------------
  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  };

  const buildUrl = (path) => `${API}${path}`;

  const fetchWithAuth = async (url, opts = {}) => {
    const headers = { ...(opts.headers || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...opts, headers });
  };

  const getJSON = async (path) => {
    const res = await fetchWithAuth(buildUrl(path), { method: "GET" });
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body?.error || body?.message || "Request failed");
    return body;
  };

  const postJSON = async (path, payload) => {
    const res = await fetchWithAuth(buildUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body?.error || body?.message || "Request failed");
    return body;
  };

  const patchJSON = async (path, payload) => {
    const res = await fetchWithAuth(buildUrl(path), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body?.error || body?.message || "Request failed");
    return body;
  };

  const deleteReq = async (path) => {
    const res = await fetchWithAuth(buildUrl(path), { method: "DELETE" });
    const body = await safeJson(res);
    if (!res.ok) throw new Error(body?.error || body?.message || "Delete failed");
    return body;
  };

  // ----------------- API wrappers (corrected paths) -----------------
  const fetchAll = async () => {
    // endpoint on backend: /api/adults/finance/all
    const data = await getJSON("/api/finance/all");
    // Ensure array and add compositeKey if missing
    return (Array.isArray(data) ? data : []).map((d) => ({
      ...d,
      // ensure type is present (backend supplies it). fallback:
      type: d.type || (d.amount ? "expenditure" : "income"),
    }));
  };

  const createIncome = async (payload) => {
    const body = {
      date: payload.date,
      service_type: payload.service_type || null,
      main_church: Number(payload.main_church || 0),
      children_ministry: Number(payload.children_ministry || 0),
    };
    return await postJSON("/api/finance/income", body);
  };

  const createExpenditure = async (payload) => {
    const body = {
      date: payload.date,
      amount: Number(payload.amount || 0),
      details: payload.details || null,
    };
    return await postJSON("/api/finance/expenditure", body);
  };

  const updateEntry = async (id, payload) => {
    // backend route: /api/adults/finance/entry/<id>
    const normalized = { ...payload };
    if ("main_church" in normalized) normalized.main_church = Number(normalized.main_church || 0);
    if ("children_ministry" in normalized) normalized.children_ministry = Number(normalized.children_ministry || 0);
    if ("amount" in normalized) normalized.amount = Number(normalized.amount || 0);
    return await patchJSON(`/api/finance/entry/${id}`, normalized);
  };

  const deleteEntry = async (id) => {
    return await deleteReq(`/api/finance/entry/${id}`);
  };

  // ----------------- export helpers (fetch blob with auth) -----------------
  const exportPdf = async (params = {}) => {
    try {
      const url = new URL(buildUrl("/api/finance/export/pdf"));
      Object.keys(params).forEach((k) => params[k] && url.searchParams.append(k, params[k]));
      const res = await fetchWithAuth(url.toString(), { method: "GET" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Export failed");
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      alert("Export PDF failed: " + (err.message || ""));
    }
  };

  const exportDocx = async (params = {}) => {
    try {
      const url = new URL(buildUrl("/api/finance/export/docx"));
      Object.keys(params).forEach((k) => params[k] && url.searchParams.append(k, params[k]));
      const res = await fetchWithAuth(url.toString(), { method: "GET" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Export failed");
      }
      const blob = await res.blob();
      const filename = `finance_report.${"docx"}`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Export DOCX failed: " + (err.message || ""));
    }
  };

  // ----------------- initial load -----------------
  useEffect(() => {
    let mounted = true;
    if (!token) {
      // do not fetch until token exists
      setEntries([]);
      setFiltered([]);
      return;
    }

    fetchAll()
      .then((data) => {
        if (!mounted) return;
        // normalize and ensure strings for dates (backend should already)
        const normalized = data.map((d) => ({ ...d }));
        normalized.sort((a, b) => (a.date < b.date ? 1 : -1));
        setEntries(normalized);
        setFiltered(normalized);
      })
      .catch((err) => {
        console.error("fetchAll error:", err);
        alert("Load failed: " + (err.message || err));
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ----------------- filters + search -----------------
  useEffect(() => {
    let result = [...entries];

    // Search (service_type or details)
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.service_type || "").toLowerCase().includes(lower) ||
          (e.details || "").toLowerCase().includes(lower)
      );
    }

    // Date range
    if (startDate) {
      result = result.filter((e) => new Date(e.date) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter((e) => new Date(e.date) <= new Date(endDate));
    }

    // Service type exact match
    if (serviceFilter) {
      result = result.filter((e) => e.service_type === serviceFilter);
    }

    // Keep sort by date desc
    result.sort((a, b) => (a.date < b.date ? 1 : -1));

    setFiltered(result);
  }, [entries, search, startDate, endDate, serviceFilter]);

  // ----------------- Summary values (derived from filtered) -----------------
  const totalMain = filtered
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + parseFloat(e.main_church || 0), 0);
  const totalChildren = filtered
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + parseFloat(e.children_ministry || 0), 0);
  const totalIncome = totalMain + totalChildren;
  const totalExpense = filtered
    .filter((e) => e.type === "expenditure")
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // ----------------- handlers -----------------
  const handleAddIncome = async () => {
    if (!incomeForm.date || (!incomeForm.main_church && !incomeForm.children_ministry)) {
      alert("Fill date and at least one income amount");
      return;
    }
    try {
      const newEntry = await createIncome(incomeForm);
      // backend returns created entry (with type)
      setEntries((prev) => {
        const updated = [...prev, newEntry];
        updated.sort((a, b) => (a.date < b.date ? 1 : -1));
        return updated;
      });
      setShowIncomeModal(false);
      setIncomeForm({ date: "", service_type: "", main_church: "", children_ministry: "" });
    } catch (err) {
      console.error("createIncome error:", err);
      alert("Failed to add income: " + (err.message || ""));
    }
  };

  const handleAddExpenditure = async () => {
    if (!expenseForm.date || !expenseForm.amount) {
      alert("Date and amount required");
      return;
    }
    try {
      const newEntry = await createExpenditure(expenseForm);
      setEntries((prev) => {
        const updated = [...prev, newEntry];
        updated.sort((a, b) => (a.date < b.date ? 1 : -1));
        return updated;
      });
      setShowExpenseModal(false);
      setExpenseForm({ date: "", amount: "", details: "" });
    } catch (err) {
      console.error("createExpenditure error:", err);
      alert("Failed to add expenditure: " + (err.message || ""));
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm("Delete this entry permanently?")) return;
    try {
      // entry can be object or id; prefer object
      const id = typeof entry === "number" ? entry : entry.id;
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id || e.type !== entry.type));
      // if IDs collide across tables, backend deletion may remove income when you intended expenditure:
      // (this is a backend limitation). If you need strict disambiguation, the backend must accept type too.
    } catch (err) {
      console.error("delete error:", err);
      alert("Delete failed: " + (err.message || ""));
    }
  };

  // Inline edit handlers (use composite key)
  const startEdit = (entry) => {
    const key = `${entry.type}-${entry.id}`;
    setEditingKey(key);
    setEditForm({
      ...entry,
      main_church: entry.main_church !== undefined ? String(entry.main_church) : "",
      children_ministry: entry.children_ministry !== undefined ? String(entry.children_ministry) : "",
      amount: entry.amount !== undefined ? String(entry.amount) : "",
    });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      if (!editingKey) return;
      const [, idStr] = editingKey.split("-");
      const id = Number(idStr);
      const payload = { ...editForm };
      const updated = await updateEntry(id, payload);
      setEntries((prev) => prev.map((e) => (e.id === updated.id && e.type === updated.type ? updated : e)));
      setEditingKey(null);
      setEditForm({});
    } catch (err) {
      console.error("update error:", err);
      alert("Save failed: " + (err.message || ""));
    }
  };

  // ----------------- UI render -----------------
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Church Finance Manager</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-600">Main Church</p>
          <p className="text-2xl font-bold text-green-700">KES {totalMain.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-600">Children Min.</p>
          <p className="text-2xl font-bold text-blue-600">KES {totalChildren.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-600">Total Income</p>
          <p className="text-2xl font-bold text-green-800">KES {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-600">Expenditure</p>
          <p className="text-2xl font-bold text-red-600">KES {totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-600 font-medium">Net Balance</p>
          <p className={`text-3xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
            KES {netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Search description / service..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">All Services</option>
            <option>Sunday Offering</option>
            <option>Midweek</option>
            <option>Conference</option>
            <option>Thanksgiving</option>
            <option>Other</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowIncomeModal(true)} className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">+ Add Income</button>
          <button onClick={() => setShowExpenseModal(true)} className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-gray-900">+ Add Expenditure</button>

          <button onClick={() => exportPdf({ start: startDate, end: endDate })} className="bg-pink-600 text-white px-6 py-3 rounded-lg">Export PDF</button>
          <button onClick={() => exportDocx({ start: startDate, end: endDate })} className="bg-pink-600 text-white px-6 py-3 rounded-lg">Export Word</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="w-full">
          <thead className="bg-pink-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Description</th>
              <th className="px-6 py-4 text-center">Main Church</th>
              <th className="px-6 py-4 text-center">Children Min.</th>
              <th className="px-6 py-4 text-center">Expenditure</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((entry) => {
              const key = `${entry.type}-${entry.id}`;
              return (
                <tr key={key} className="hover:bg-gray-50">
                  {editingKey === key ? (
                    <>
                      <td>
                        <input type="date" value={editForm.date || ""} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="px-2 py-1 border rounded" />
                      </td>
                      <td>{entry.type === "income" ? "Income" : "Expense"}</td>
                      <td>
                        {entry.type === "income" ? (
                          <select value={editForm.service_type || ""} onChange={(e) => setEditForm({ ...editForm, service_type: e.target.value })} className="px-2 py-1 border rounded">
                            <option>Sunday Offering</option>
                            <option>Midweek</option>
                            <option>Conference</option>
                            <option>Other</option>
                          </select>
                        ) : (
                          <input type="text" value={editForm.details || ""} onChange={(e) => setEditForm({ ...editForm, details: e.target.value })} className="px-2 py-1 border rounded w-full" />
                        )}
                      </td>
                      <td>
                        <input type="number" value={editForm.main_church || ""} onChange={(e) => setEditForm({ ...editForm, main_church: e.target.value })} className="w-24 text-right" disabled={entry.type !== "income"} />
                      </td>
                      <td>
                        <input type="number" value={editForm.children_ministry || ""} onChange={(e) => setEditForm({ ...editForm, children_ministry: e.target.value })} className="w-24 text-right" disabled={entry.type !== "income"} />
                      </td>
                      <td>
                        <input type="number" value={editForm.amount || ""} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="w-28 text-right" disabled={entry.type !== "expenditure"} />
                      </td>
                      <td className="text-center">
                        <button onClick={saveEdit} className="text-green-600 mr-3">Save</button>
                        <button onClick={cancelEdit} className="text-gray-600">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">{entry.date}</td>
                      <td className="px-6 py-4">{entry.type === "income" ? "Income" : "Expense"}</td>
                      <td className="px-6 py-4">{entry.service_type || entry.details || "—"}</td>
                      <td className="px-6 py-4 text-right font-medium">{entry.type === "income" ? `KES ${(entry.main_church || 0).toLocaleString()}` : "—"}</td>
                      <td className="px-6 py-4 text-right font-medium">{entry.type === "income" ? `KES ${(entry.children_ministry || 0).toLocaleString()}` : "—"}</td>
                      <td className="px-6 py-4 text-right font-medium text-red-600">{entry.type === "expenditure" ? `KES ${Number(entry.amount).toLocaleString()}` : "—"}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => startEdit(entry)} className="text-blue-600 hover:underline mr-4">Edit</button>
                        <button onClick={() => handleDelete(entry)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* INCOME MODAL */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add Income</h2>
            <div className="space-y-4">
              <input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              <select value={incomeForm.service_type} onChange={(e) => setIncomeForm({ ...incomeForm, service_type: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select Service Type</option>
                <option>Sunday Offering</option>
                <option>Midweek</option>
                <option>Conference</option>
                <option>Thanksgiving</option>
                <option>Other</option>
              </select>
              <input type="number" placeholder="Main Church Amount" value={incomeForm.main_church} onChange={(e) => setIncomeForm({ ...incomeForm, main_church: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="number" placeholder="Children Ministry Amount" value={incomeForm.children_ministry} onChange={(e) => setIncomeForm({ ...incomeForm, children_ministry: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setShowIncomeModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={handleAddIncome} className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">Save Income</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENDITURE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add Expenditure</h2>
            <div className="space-y-4">
              <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              <input type="text" placeholder="Details (e.g. Rent, Electricity, etc.)" value={expenseForm.details} onChange={(e) => setExpenseForm({ ...expenseForm, details: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setShowExpenseModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={handleAddExpenditure} className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-gray-900">Save Expenditure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;