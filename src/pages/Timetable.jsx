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

// If you prefer env var later
const API = "http://localhost:5000";

const CLASSES = [
  "Gifted Brains",
  "Beginners",
  "Shinners",
  "Conquerors",
  "Teens",
];

export default function Timetable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", teachers: {} });
  const [editingId, setEditingId] = useState(null);

  // fetch entries
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });
      const res = await fetch(`${API}/timetable?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      const data = await res.json();
      setEntries(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [search]);

  // open add
  const openAdd = () => {
    setEditingId(null);
    setForm({ date: "", teachers: {} });
    setOpen(true);
  };

  // open edit
  const openEdit = (entry) => {
    setEditingId(entry.id);
    setForm({ date: entry.date, teachers: entry.teachers || {} });
    setOpen(true);
  };

  // save
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API}/timetable/${editingId}`
        : `${API}/timetable`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setOpen(false);
      fetchTimetable();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`${API}/timetable/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchTimetable();
    } catch (err) {
      console.error(err);
    }
  };

  // export CSV
  const handleDownloadCSV = () => {
    if (entries.length === 0) return;

    const header = ["Date", ...CLASSES];
    const rows = entries.map((e) => [
      e.date,
      ...CLASSES.map((c) => e.teachers?.[c] || ""),
    ]);

    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // print
  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Timetable</title>
          <style>
            body { font-family: sans-serif; padding: 16px; }
            h1 { color: #7e22ce; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Sunday School Timetable</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                ${CLASSES.map((c) => `<th>${c}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${entries
                .map(
                  (e) => `
                <tr>
                  <td>${e.date}</td>
                  ${CLASSES.map(
                    (c) => `<td>${e.teachers?.[c] || ""}</td>`
                  ).join("")}
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-purple-700">Timetable</h1>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by teacher or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-purple-300"
          />
          <Button
            variant="outline"
            className="border-purple-300 text-purple-700"
            onClick={handleDownloadCSV}
          >
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button
            variant="outline"
            className="border-purple-300 text-purple-700"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={openAdd}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              {CLASSES.map((c) => (
                <th key={c} className="p-2 border">
                  {c}
                </th>
              ))}
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={CLASSES.length + 2} className="text-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" />
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={CLASSES.length + 2} className="text-center p-4">
                  No entries
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{e.date}</td>
                  {CLASSES.map((c) => (
                    <td key={c} className="p-2 border">
                      {e.teachers?.[c] || ""}
                    </td>
                  ))}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
            {CLASSES.map((c) => (
              <Input
                key={c}
                placeholder={`${c} teacher`}
                value={form.teachers[c] || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    teachers: { ...form.teachers, [c]: e.target.value },
                  })
                }
              />
            ))}
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
