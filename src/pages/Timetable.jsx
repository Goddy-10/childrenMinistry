


// src/pages/Timetable.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Download, Printer, Edit, Trash } from "lucide-react";
import { Document, Packer, Paragraph, Table, TableRow, TableCell,TextRun,WidthType } from "docx";
import { useAuth } from "@/context/AuthContext";
import { saveAs } from "file-saver";
// Backend API root
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Timetable() {
  const { user, token } = useAuth();
  const userRole = user?.role;

  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // modal state for timetable entry
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", class_id: "", teacher_id: "" });
  const [editingId, setEditingId] = useState(null);

  // modal state for adding class
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    min_age: "",
    max_age: "",
  });
  const [classSaving, setClassSaving] = useState(false);

  useEffect(() => {
    fetchTimetable();
    fetchMeta(); // fetch classes and teachers when component mounts
  }, []);

  // Fetch timetable entries
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });
      const res = await fetch(`${API}/api/timetable?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      const data = await res.json();
      setEntries(data.items || []);
    } catch (err) {
      console.error("fetchTimetable:", err);
    } finally {
      setLoading(false);
    }
  };


  const fetchMeta = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("fetching teachers from:", `${API}/api/teachers`);

      const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // add token only if it exists
    };

      const [clsRes, teacherRes] = await Promise.all([
      fetch(`${API}/api/classes`, { headers }),
      fetch(`${API}/api/teachers`, { headers }),
    ]);

    if (!clsRes.ok) {
      const err = await clsRes.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch classes");
    }

    if (!teacherRes.ok) {
      const err = await teacherRes.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch teachers");
    }

      const clsData = await clsRes.json();
      const teacherData = await teacherRes.json();

      setClasses(clsData.items || clsData || []);
      setTeachers(teacherData.items || teacherData || []);

      console.log("Fetched classes:", clsData.items);
      console.log("Fetched teachers:", teacherData);
  }   catch (err) {
      console.error("fetchMeta:", err);
  }
};// <- runs once
//   // Open add entry modal
  const openAdd = () => {
    setEditingId(null);
    setForm({ date: "", class_id: "", teacher_id: "" });
    setOpen(true);
    };



  


  // Open edit modal
  const openEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date, // expecting "YYYY-MM-DD" from backend
      class_id: entry.class_id,
      teacher_id: entry.teacher_id,
    });
    setOpen(true);
  };

  // Save timetable entry (POST or PUT)
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API}/api/timetable/${editingId}`
        : `${API}/api/timetable`;

      const headers = { "Content-Type": "application/json" };
      // include token when available (protect admin endpoints)
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Save failed");
      }
      // refresh both entries and meta (in case names changed)
      setOpen(false);
      await fetchTimetable();
      await fetchMeta();
    } catch (err) {
      console.error("handleSave:", err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API}/api/timetable/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Delete failed");
      }
      fetchTimetable();
    } catch (err) {
      console.error("handleDelete:", err);
      alert(err.message);
    }
  };

  // Add new class (admin-only)
  const handleAddClass = async (e) => {
    e.preventDefault();
    setClassSaving(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/classes`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newClass.name,
          min_age: newClass.min_age ? Number(newClass.min_age) : null,
          max_age: newClass.max_age ? Number(newClass.max_age) : null,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to add class");
      }
      setNewClass({ name: "", min_age: "", max_age: "" });
      setClassModalOpen(false);
      await fetchMeta(); // refresh classes dropdown
    } catch (err) {
      console.error("handleAddClass:", err);
      alert(err.message);
    } finally {
      setClassSaving(false);
    }
  };








const handleDownloadDocx = async () => {
  try {
    // Group entries by date
    const grouped = entries.reduce((acc, e) => {
      if (!acc[e.date]) acc[e.date] = {};
      acc[e.date][e.class_name] = e.teacher_name || "";
      return acc;
    }, {});

    // Collect all unique classes
    const allClasses = Array.from(
      new Set(entries.map((e) => e.class_name))
    ).filter(Boolean);

    // Build header row (Date + all classes)
    const headerRow = new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Date", bold: true })],
            }),
          ],
        }),
        ...allClasses.map(
          (cls) =>
            new TableCell({
              width: {
                size: 80 / allClasses.length,
                type: WidthType.PERCENTAGE,
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cls, bold: true })],
                }),
              ],
            })
        ),
      ],
    });

    // Build each date row
    const bodyRows = Object.entries(grouped).map(([date, classMap]) => {
      const cells = [
        new TableCell({
          children: [new Paragraph(date)],
        }),
        ...allClasses.map(
          (cls) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun(classMap[cls] || "")],
                }),
              ],
            })
        ),
      ];
      return new TableRow({ children: cells });
    });

    const table = new Table({
      rows: [headerRow, ...bodyRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Sunday School Timetable",
                  bold: true,
                  size: 32,
                  color: "BE185D",
                }),
              ],
              spacing: { after: 400 },
            }),
            table,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Sunday_School_Timetable.docx");
  } catch (err) {
    console.error("Error generating DOCX:", err);
    alert("Failed to generate timetable document.");
  }
};











const handlePrint = () => {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Allow pop-ups for printing.");
    return;
  }

  // Group entries by date
  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = {};
    acc[e.date][e.class_name] = e.teacher_name || "";
    return acc;
  }, {});

  // Get all unique classes across all entries
  const allClasses = Array.from(
    new Set(entries.map((e) => e.class_name))
  ).filter(Boolean);

  // Build table header row
  const headerRow = `
    <tr>
      <th>Date</th>
      ${allClasses.map((cls) => `<th>${cls}</th>`).join("")}
    </tr>
  `;

  // Build table rows for each date
  const rows = Object.entries(grouped)
    .map(([date, classMap]) => {
      const cells = allClasses
        .map((cls) => `<td>${classMap[cls] || ""}</td>`)
        .join("");
      return `<tr><td>${date}</td>${cells}</tr>`;
    })
    .join("");

  win.document.write(`
    <html>
      <head>
        <title>Sunday School Timetable</title>
        <style>
          body { font-family: sans-serif; padding: 16px; }
          h1 { color: #be185d; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
          td:first-child { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Sunday School Timetable</h1>
        <table>
          <thead>${headerRow}</thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
};

  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-pink-600">Timetable</h1>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by teacher or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-purple-300"
          />
          <Button
            variant="outline"
            className="border-pink-600 text-pink-600"
            onClick={handleDownloadDocx}
          >
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button
            variant="outline"
            className="border-pink-600 text-pink-600"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>

          {/* Add Class button (admin only) */}
          {userRole === "admin" && (
            <Dialog open={classModalOpen} onOpenChange={setClassModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-pink-600 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition">
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Sunday Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddClass} className="space-y-3">
                  <input
                    required
                    placeholder="Class name"
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, name: e.target.value })
                    }
                    className="border p-2 w-full"
                  />
                  <input
                    placeholder="Min age"
                    value={newClass.min_age}
                    onChange={(e) =>
                      setNewClass({ ...newClass, min_age: e.target.value })
                    }
                    className="border p-2 w-full"
                    type="number"
                  />
                  <input
                    placeholder="Max age"
                    value={newClass.max_age}
                    onChange={(e) =>
                      setNewClass({ ...newClass, max_age: e.target.value })
                    }
                    className="border p-2 w-full"
                    type="number"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setClassModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-pink-600 text-white"
                      disabled={classSaving}
                    >
                      {classSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Save Class
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Add timetable entry (admin only) */}
          {userRole === "admin" && (
            <Button
              className="bg-pink-600 hover:bg-purple-700 text-white"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Teacher</th>
              {userRole === "admin" && <th className="p-2 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" />
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No entries
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{e.date}</td>
                  <td className="p-2 border">{e.class_name}</td>
                  <td className="p-2 border">{e.teacher_name}</td>
                  {userRole === "admin" && (
                    <td className="p-2 border space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(e)}
                        className="text-purple-700 border-purple-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(e.id)}
                        className="text-red-600 border-red-300"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Timetable Entry Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Entry" : "Add Entry"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />

            {/* Class dropdown */}
            <select
              value={form.class_id}
              onChange={(e) => setForm({ ...form, class_id: e.target.value })}
              className="border p-2 w-full"
              required
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Teacher dropdown */}
            <select
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              className="border p-2 w-full"
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.username || t.name || t.email}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}



