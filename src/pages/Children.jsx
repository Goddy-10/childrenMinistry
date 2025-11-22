
 



// src/pages/Children.jsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Edit, Trash, Download, Printer, Plus, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// DOCX and PDF
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const API = "http://localhost:5000";

// Hardcoded class options
const CLASS_OPTIONS = [
  { id: "all", label: "All Classes" },
  { id: "Gifted Brains", label: "Gifted Brains (0–3)" },
  { id: "Beginners", label: "Beginners (3–6)" },
  { id: "Shinners", label: "Shinners (6–9)" },
  { id: "Conquerors", label: "Conquerors (9–13)" },
  { id: "Teens", label: "Teens (13+)" },
];

// Helper: fallback class by age
function getClassForAge(age) {
  const a = Number(age);
  if (isNaN(a)) return "";
  if (a < 3) return "Gifted Brains";
  if (a < 6) return "Beginners";
  if (a < 9) return "Shinners";
  if (a < 13) return "Conquerors";
  return "Teens";
}

export default function Children({ role = "teacher" }) {
  // ---------------- State ----------------
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  // search & pagination
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add Child modal
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Add/Edit form
  const blankForm = { name: "", age: "", gender: "", parent: "", contact: "" };
  const [form, setForm] = useState(blankForm);

  // Inline row editing state
  const [editingRowId, setEditingRowId] = useState(null);
  const [rowFormMap, setRowFormMap] = useState({}); // { [childId]: {name, age, gender, parent, contact} }

  // Attendance structures:
  // attendanceMap: { childId: { "YYYY-MM-DD": true/false, ... } }
  // todayAttendanceMap: { childId: true/false } (quick map for today's checkbox UI)
  const [attendanceMap, setAttendanceMap] = useState({});
  const [todayAttendanceMap, setTodayAttendanceMap] = useState({});

  // Global list of last attendance dates (most recent first) displayed as columns (max 4)
  const [lastAttendanceDates, setLastAttendanceDates] = useState([]); // array of "YYYY-MM-DD" strings, newest first

  // Offerings
  const [classOfferingsToday, setClassOfferingsToday] = useState({});
  const [classOfferingsMonth, setClassOfferingsMonth] = useState({});
  const [classOfferingInput, setClassOfferingInput] = useState("");

  // date helpers
  const todayISO = new Date().toISOString().split("T")[0];

  // ---------------- Fetch children ----------------
  const fetchChildren = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: String(page),
        class: classFilter === "all" ? "" : classFilter,
      });
      
      // your backend route (you used /api/children/ earlier)
      const res = await fetch(`${API}/api/children/?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch children");
      // backend returns an array or an object with items - we handle both
      const data = await res.json();
      // If backend returned array directly:
      const items = Array.isArray(data) ? data : (data.items || []);
      setChildren(items);
      setTotalPages(data.total_pages || 1);

      // initialize rowFormMap for inline editing
      const map = {};
      (items || []).forEach((c) => {
        map[c.id] = {
          name: c.name || "",
          age: c.age || "",
          gender: c.gender || "",
          parent: c.parent_name || c.parent || "",
          contact: c.parent_contact || c.contact || "",
        };
      });
      setRowFormMap(map);
    } catch (err) {
      console.error("fetchChildren:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Fetch attendance & offerings ----------------
  // We fetch attendance records across a reasonable window (e.g. last 90 days)
  // then compute the last distinct dates (global, newest first) and build attendanceMap.
  const fetchAttendanceAndOfferings = async () => {
    try {
      // Fetch attendance for last 90 days (should include recent Sundays)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const startStr = startDate.toISOString().slice(0, 10);

      // NOTE: backend needs to support this endpoint returning attendance rows:
      // [{ id, child_id, date: "YYYY-MM-DD", present: true/false }, ...]
      const attRes = await fetch(`${API}/api/children/attendance?start=${startStr}&end=${todayISO}`);
      let attendanceRows = [];
      if (attRes.ok) {
        attendanceRows = await attRes.json();
      } else {
        // try a fallback if your backend returns array from another path
        console.warn("fetchAttendanceAndOfferings: attendance endpoint returned non-ok");
      }

      // build per-child map and gather distinct dates
      const attMap = {};
      const dateSet = new Set();

      (attendanceRows || []).forEach((r) => {
        if (!r) return;
        const cid = r.child_id ?? r.childId ?? r.child_id;
        const dt = r.date || r.dt || r.date_iso;
        if (!cid || !dt) return;
        attMap[cid] = attMap[cid] || {};
        attMap[cid][dt] = !!r.present;
        dateSet.add(dt);
      });

      // Build sorted distinct dates (newest first)
      const dates = Array.from(dateSet)
        .sort((a, b) => (a < b ? 1 : -1));

      // Keep top 4 most recent past dates (these will be the past columns)
      const top4 = dates.slice(0, 4);

      setAttendanceMap(attMap);
      setLastAttendanceDates(top4);

      // populate today's attendance map (if an attendance record exists for today)
      const todayMap = {};
      Object.keys(attMap).forEach((cid) => {
        if (attMap[cid] && attMap[cid][todayISO] !== undefined) {
          todayMap[cid] = !!attMap[cid][todayISO];
        }
      });
      setTodayAttendanceMap(todayMap);

      // Offerings: today's and monthly
      const todayOfferRes = await fetch(`${API}/api/children/offerings?start=${todayISO}&end=${todayISO}`);
      if (todayOfferRes.ok) {
        const rows = await todayOfferRes.json();
        const map = {};
        (Array.isArray(rows) ? rows : []).forEach((o) => {
          map[o.class_id] = Number(o.amount || 0);
        });
        setClassOfferingsToday(map);
      } else {
        setClassOfferingsToday({});
      }

      // offerings this month: first and last of month
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
      const lastOfMonth = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).toISOString().slice(0,10);
      const monthOfferRes = await fetch(`${API}/api/children/offerings?start=${firstOfMonth}&end=${lastOfMonth}`);
      if (monthOfferRes.ok) {
        const rows = await monthOfferRes.json();
        const map = {};
        (Array.isArray(rows) ? rows : []).forEach((o) => {
          map[o.class_id] = (map[o.class_id] || 0) + Number(o.amount || 0);
        });
        setClassOfferingsMonth(map);
      } else {
        setClassOfferingsMonth({});
      }
    } catch (err) {
      console.error("fetchAttendanceAndOfferings:", err);
    }
  };

  // ---------------- Effects ----------------
  useEffect(() => {
    fetchChildren();
  }, [search, page, classFilter]);

  // after children load, fetch attendance & offerings
  useEffect(() => {
    if (children.length) fetchAttendanceAndOfferings();
  }, [children]);

  // ---------------- Add Child ----------------
  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/children/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Failed to add child");
      }
      setForm(blankForm);
      setOpenAdd(false);
      await fetchChildren();
    } catch (err) {
      console.error("handleAdd:", err);
      alert(err.message || "Failed to add child");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Delete Child ----------------
  const confirmDelete = async (childId) => {
    try {
      setDeletingId(childId);
      const res = await fetch(`${API}/api/children/${childId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Delete failed");
      }
      await fetchChildren();
    } catch (err) {
      console.error("confirmDelete:", err);
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ---------------- Inline Edit/Save Row ----------------
  const handleRowEdit = (childId) => setEditingRowId(childId);
  const handleRowCancel = () => setEditingRowId(null);

  const handleRowSave = async (childId) => {
    setSaving(true);
    try {
      const formData = rowFormMap[childId];
      const res = await fetch(`${API}/api/children/${childId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Failed to save row");
      }
      setEditingRowId(null);
      await fetchChildren();
    } catch (err) {
      console.error("handleRowSave:", err);
      alert(err.message || "Failed to save row");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Toggle historical attendance - READ ONLY (no backend changes) ----------------
  // Past columns are read-only per your request. We keep the handler but do nothing.
  const handleHistoricalToggle = (childId, date, checked) => {
    // no-op: past records are read-only in the UI
    // kept for future extension if you want to allow edits
  };

  // ---------------- Mark Today attendance (editable) ----------------
  // When marking today's attendance we:
  // 1) format today's date (YYYY-MM-DD)
  // 2) POST to backend /api/children/:id/attendance with { date, present }
  // 3) update local maps: todayAttendanceMap, attendanceMap, lastAttendanceDates (ensure newest-first, max 4)
  const markTodayAttendance = async (childId, status) => {
    try {
      // 1) format today's date
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      // Optimistically update UI
      setTodayAttendanceMap((prev) => ({
        ...prev,
        [childId]: status,
      }));
      setAttendanceMap((prev) => ({
        ...prev,
        [childId]: { ...(prev[childId] || {}), [formattedDate]: status },
      }));

      // 2) send to backend
      const token = localStorage.getItem("token") || null;
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const res = await fetch(`${API}/api/children/${childId}/attendance`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          date: formattedDate,
          present: !!status,
        }),
      });

      if (!res.ok) {
        // revert optimistic updates on error
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Failed to save today's attendance");
      }

      // 3) update the global lastAttendanceDates list (newest first, max 4).
      setLastAttendanceDates((prev) => {
        // include formattedDate (ensure unique), then sort newest-first and trim to 4
        const set = new Set([formattedDate, ...(prev || [])]);
        const arr = Array.from(set).sort((a, b) => (a < b ? 1 : -1));
        return arr.slice(0, 4);
      });
    } catch (err) {
      console.error("Error marking today's attendance:", err);
      alert(err.message || "Failed to save today's attendance");
      // optional: force refresh from server to restore consistent state
      await fetchAttendanceAndOfferings();
    }
  };

  // ---------------- Class offering save ----------------
  const handleSaveClassOffering = async (classIdOrName) => {
    try {
      const token = localStorage.getItem("token") || null;
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const res = await fetch(`${API}/api/children/offerings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          class_id: classIdOrName,
          date: todayISO,
          amount: Number(classOfferingInput || 0),
        }),
      });
      if (!res.ok) throw new Error("Failed to save offering");
      await fetchAttendanceAndOfferings();
      alert("Offering saved");
    } catch (err) {
      console.error("handleSaveClassOffering:", err);
      alert(err.message || "Failed to save offering");
    }
  };

  // ---------------- Export to DOCX ----------------
  const exportToDocx = async () => {
    if (displayChildren.length === 0) {
      alert("No children to export");
      return;
    }

    // Create table rows for DOCX (header + rows)
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("No.")] }),
          new TableCell({ children: [new Paragraph("Name")] }),
          new TableCell({ children: [new Paragraph("Age")] }),
          new TableCell({ children: [new Paragraph("Gender")] }),
          new TableCell({ children: [new Paragraph("Class")] }),
          new TableCell({ children: [new Paragraph("Parent")] }),
          new TableCell({ children: [new Paragraph("Contact")] }),
          ...lastAttendanceDates.map((m) => new TableCell({ children: [new Paragraph(m)] })),
        ],
      }),
      ...displayChildren.map((c, idx) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(idx + 1))] }),
            new TableCell({ children: [new Paragraph(c.name || "")] }),
            new TableCell({ children: [new Paragraph(String(c.age || ""))] }),
            new TableCell({ children: [new Paragraph(c.gender || "")] }),
            new TableCell({ children: [new Paragraph(c.className || "")] }),
            new TableCell({ children: [new Paragraph(c.parent || "")] }),
            new TableCell({ children: [new Paragraph(c.contact || "")] }),
            ...lastAttendanceDates.map((m) =>
              new TableCell({ children: [new Paragraph(attendanceMap[c.id]?.[m] ? "✔" : "✘")] })
            ),
          ],
        })
      ),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: "Children Attendance Report", heading: "Heading1" }),
            new Table({ rows: tableRows, width: { size: 100, type: "pct" } }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `children_report_${new Date().toISOString().slice(0, 10)}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- Export to PDF ----------------
  const exportToPdf = async () => {
    if (displayChildren.length === 0) {
      alert("No children to export");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([1000, 800]);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = height - 40;
    page.drawText("Children Attendance Report", { x: 50, y, size: 16, font });
    y -= 24;

    // headers
    const headers = ["No.", "Name", "Age", "Gender", "Class", "Parent", "Contact", ...lastAttendanceDates];
    let x = 50;
    headers.forEach((h) => {
      page.drawText(h, { x, y, size: 10, font });
      x += 120;
    });
    y -= 18;

    // rows
    displayChildren.forEach((c, idx) => {
      x = 50;
      const cells = [
        String(idx + 1),
        c.name || "",
        String(c.age || ""),
        c.gender || "",
        c.className || "",
        c.parent || "",
        c.contact || "",
        ...lastAttendanceDates.map((d) => (attendanceMap[c.id]?.[d] ? "✔" : "✘")),
      ];
      cells.forEach((txt) => {
        page.drawText(txt, { x, y, size: 9, font });
        x += 120;
      });
      y -= 16;
      if (y < 60) {
        // add another page
        page = pdfDoc.addPage([1000, 800]);
        y = page.getSize().height - 40;
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `children_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- Derived display data ----------------
  // displayChildren is the array shown in table/cards; apply any computed fields
  const displayChildren = useMemo(() => {
    return children.map((c) => ({
      ...c,
      className: c.class_name || c.className || getClassForAge(c.age),
      parent: c.parent_name || c.parent || "",
      contact: c.parent_contact || c.contact || "",
    }));
  }, [children]);

  // ---------------- Helpers for UI ----------------
  // format short date for column header (e.g. "20 Nov" or "Nov 20")
  const fmtColLabel = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
    } catch {
      return iso;
    }
  };

  // ---------------- Render JSX ----------------
  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-6">
      {/* Title + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-pink-600">Children</h1>
        <div className="flex flex-wrap gap-2">
          {/* Class filter */}
          <Select value={classFilter} onValueChange={(v) => setClassFilter(v)}>
            <SelectTrigger className="w-56 border-pink-300">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Exports */}
          <Button variant="outline" className="border-pink-600 text-pink-600" onClick={exportToDocx}>
            <Download className="w-4 h-4 mr-2" /> DOCX
          </Button>
          <Button variant="outline" className="border-pink-600 text-pink-600" onClick={exportToPdf}>
            <Printer className="w-4 h-4 mr-2" /> PDF
          </Button>

          {/* Add child */}
          <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => setOpenAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Child
          </Button>
        </div>
      </div>

      {/* Add Modal (kept intact) */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Child</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Parent" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} />
            <Input placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="w-full md:w-80 border-pink-300"
        />
        {loading && <Loader2 className="w-5 h-5 animate-spin text-pink-600" />}
      </div>

      {/* KPI Cards (now showing values for current toggled class by read from offer maps / attendance maps) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">Today's Attendance ({classFilter === "all" ? "All" : classFilter})</h3>
          <p className="text-2xl font-bold text-pink-600">
            {/* count today's attendance only for displayed children */}
            {displayChildren.filter((c) => todayAttendanceMap[c.id]).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">Today's Offering</h3>
          <p className="text-2xl font-bold text-pink-600">
            {/* show total for currently filtered class only */}
            {displayChildren.length > 0
              ? displayChildren.reduce((acc, c) => {
                  const key = c.className || c.class_id;
                  return acc + (classOfferingsToday[key] || 0);
                }, 0)
              : 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">Recent Attendance (shown cols)</h3>
          <p className="text-2xl font-bold text-pink-600">{lastAttendanceDates.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">This Month Offering</h3>
          <p className="text-2xl font-bold text-pink-600">
            {displayChildren.length > 0
              ? displayChildren.reduce((acc, c) => {
                  const key = c.className || c.class_id;
                  return acc + (classOfferingsMonth[key] || 0);
                }, 0)
              : 0}
          </p>
        </div>
      </div>

      {/* Class offering input for single class */}
      {classFilter !== "all" && (
        <div className="bg-white rounded-lg shadow p-4 mt-4 flex items-center gap-3">
          <div>
            <div className="text-sm text-gray-600 font-medium">{`${classFilter} - Today's Offering`}</div>
            <div className="text-lg font-bold text-pink-600">
              {classOfferingsToday[classFilter] ?? 0}
            </div>
            <div className="text-xs text-gray-500">This month's total: {classOfferingsMonth[classFilter] ?? 0}</div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Input type="number" className="w-36" placeholder="Amount" value={classOfferingInput} onChange={(e) => setClassOfferingInput(e.target.value)} />
            <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => handleSaveClassOffering(classFilter)}>Save</Button>
          </div>
        </div>
      )}

      {/* Children Table */}
      <div className="overflow-x-auto w-full bg-white rounded-lg shadow mt-4">
        <table className="w-full min-w-[700px] border-collapse hidden sm:table">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Gender</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Parent</th>
              <th className="p-2 border">Contact</th>

              {/* Today (editable) */}
              <th className="p-2 border text-center">Today</th>

              {/* Past columns (up to 4) - read-only */}
              {lastAttendanceDates.map((d) => (
                <th key={d} className="p-2 border text-center">{fmtColLabel(d)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8 + lastAttendanceDates.length} className="text-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-pink-600" />
                </td>
              </tr>
            ) : displayChildren.length === 0 ? (
              <tr>
                <td colSpan={8 + lastAttendanceDates.length} className="text-center p-4 text-pink-600">No children found</td>
              </tr>
            ) : (
              // numbering: index + 1 (when filtered by class the list was already retrieved from backend by class)
              displayChildren.map((c, idx) => {
                const isEditing = editingRowId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{idx + 1}</td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input value={rowFormMap[c.id]?.name || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], name: e.target.value } })} />
                      ) : c.name}
                    </td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input type="number" value={rowFormMap[c.id]?.age || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], age: e.target.value } })} />
                      ) : c.age}
                    </td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Select value={rowFormMap[c.id]?.gender || ""} onValueChange={(v) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], gender: v } })}>
                          <SelectTrigger className="w-full border"><SelectValue placeholder="Gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : c.gender}
                    </td>
                    <td className="p-2 border">{c.className}</td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input value={rowFormMap[c.id]?.parent || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], parent: e.target.value } })} />
                      ) : c.parent}
                    </td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input value={rowFormMap[c.id]?.contact || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], contact: e.target.value } })} />
                      ) : c.contact}
                    </td>

                    {/* Today column - editable checkbox */}
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={!!todayAttendanceMap[c.id]}
                        onChange={(e) => markTodayAttendance(c.id, e.target.checked)}
                      />
                    </td>

                    {/* Past columns - read-only checkboxes */}
                    {lastAttendanceDates.map((d) => (
                      <td key={d} className="p-2 border text-center">
                        <input
                          type="checkbox"
                          checked={!!attendanceMap[c.id]?.[d]}
                          readOnly
                          onChange={() => handleHistoricalToggle(c.id, d, !attendanceMap[c.id]?.[d])}
                        />
                      </td>
                    ))}

                    {/* Actions column (edit/delete) - kept intact */}
                    <td className="p-2 border text-center space-x-1">
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleRowSave(c.id)} className="text-green-700 border-green-300" disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleRowCancel} className="text-gray-600 border-gray-300">Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleRowEdit(c.id)} className="text-pink-700 border-pink-300"><Edit className="w-4 h-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-300" disabled={deletingId === c.id}>
                                {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => confirmDelete(c.id)} disabled={saving}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ---------------- Mobile Cards (kept intact with Today option D) ---------------- */}
        <div className="sm:hidden flex flex-col gap-4 mt-4">
          {displayChildren.length === 0 ? (
            <div className="text-center text-pink-600">No children found</div>
          ) : (
            displayChildren.map((c, idx) => {
              const isEditing = editingRowId === c.id;
              return (
                <div key={c.id} className="bg-white rounded-lg shadow p-4 space-y-2 border border-pink-100">
                  <div className="space-y-1 pb-2 border-b border-pink-100">
                    <div className="text-xs font-semibold text-pink-600">Child Info</div>
                    <div><strong>{idx + 1}. Name:</strong> {isEditing ? <Input value={rowFormMap[c.id]?.name || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], name: e.target.value } })} /> : c.name}</div>
                    <div><strong>Age:</strong> {isEditing ? <Input type="number" value={rowFormMap[c.id]?.age || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], age: e.target.value } })} /> : c.age}</div>
                    <div><strong>Gender:</strong> {isEditing ? (
                      <Select value={rowFormMap[c.id]?.gender || ""} onValueChange={(v) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], gender: v } })}>
                        <SelectTrigger className="w-full border"><SelectValue placeholder="Gender" /></SelectTrigger>
                        <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                      </Select>
                    ) : c.gender}</div>
                    <div><strong>Class:</strong> {c.className}</div>
                    <div><strong>Parent:</strong> {isEditing ? <Input value={rowFormMap[c.id]?.parent || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], parent: e.target.value } })} /> : c.parent}</div>
                    <div><strong>Contact:</strong> {isEditing ? <Input value={rowFormMap[c.id]?.contact || ""} onChange={(e) => setRowFormMap({ ...rowFormMap, [c.id]: { ...rowFormMap[c.id], contact: e.target.value } })} /> : c.contact}</div>
                  </div>

                  <div className="space-y-2 pb-2 border-b border-pink-100">
                    <div className="text-xs font-semibold text-pink-600">Attendance (Recent)</div>

                    <div className="flex flex-wrap gap-2">
                      {/* Past columns (read-only) */}
                      {lastAttendanceDates.map((d) => (
                        <label key={d} className="flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs text-pink-700">
                          <input type="checkbox" checked={!!attendanceMap[c.id]?.[d]} readOnly />
                          {fmtColLabel(d)}
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-semibold text-pink-600">Mark Today</div>
                      <div className="flex gap-2">
                        <Button size="sm" className={`flex-1 ${todayAttendanceMap[c.id] ? "bg-green-700" : "bg-green-600"} text-white`} onClick={() => markTodayAttendance(c.id, true)}>Present</Button>
                        <Button size="sm" variant="outline" className="flex-1 border-red-300 text-red-600" onClick={() => markTodayAttendance(c.id, false)}>Absent</Button>
                      </div>
                      <div className="text-xs text-gray-600">Status today: <span className="font-semibold ml-1 text-pink-700">{todayAttendanceMap[c.id] === undefined ? "Not Marked" : (todayAttendanceMap[c.id] ? "Present" : "Absent")}</span></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" className="text-green-700 border-green-300" onClick={() => handleRowSave(c.id)}><Save className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" className="text-gray-600 border-gray-300" onClick={handleRowCancel}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="text-pink-700 border-pink-300" onClick={() => handleRowEdit(c.id)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300"><Trash className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => confirmDelete(c.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      )}
    </div>
  );
}






















