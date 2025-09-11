import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { toast } from "@/components/ui/toast";
import { Loader2, Edit, Trash, Download, Printer, Plus } from "lucide-react";

// If you prefer env: const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = "http://localhost:5000"; // adjust later to VITE_API_URL

const CLASS_OPTIONS = [
  { id: "all", label: "All Classes" },
  { id: "Gifted Brains", label: "Gifted Brains (0–3)" },
  { id: "Beginners", label: "Beginners (3–6)" },
  { id: "Shinners", label: "Shinners (6–9)" },
  { id: "Conquerors", label: "Conquerors (9–13)" },
  { id: "Teens", label: "Teens (13+)" },
];

// Fallback mapping if backend hasn’t assigned class yet
function getClassForAge(age) {
  const a = Number(age);
  if (isNaN(a)) return "";
  if (a < 3) return "Gifted Brains";
  if (a < 6) return "Beginners";
  if (a < 9) return "Shinners";
  if (a < 13) return "Conquerors";
  return "Teens";
}

export default function Children() {
//   const { toast } = useToast();

  // list state
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  // search / filter / pagination
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // modal : add/edit
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // form state (shared by add/edit)
  const blankForm = { name: "", age: "", gender: "", parent: "", contact: "" };
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);

  // Fetch children from backend (supports search + pagination)
  const fetchChildren = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: String(page),
        class: classFilter === "all" ? "" : classFilter,
      });
      const res = await fetch(`${API}/children?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch children");
      const data = await res.json();
      // Expecting { items, total_pages } from backend
      setChildren(data.items || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, classFilter]);

  // Derived, just in case the backend doesn’t send class
  const displayChildren = useMemo(() => {
    return children.map((c) => ({
      ...c,
      className: c.className || getClassForAge(c.age),
    }));
  }, [children]);

  // ADD
  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add child");
    //   toast({ title: "Success", description: "Child added successfully!" });
      setForm(blankForm);
      setOpenAdd(false);
      // refresh
      fetchChildren();
    } catch (err) {
    //   toast({
    //     title: "Error",
    //     description: err.message,
    //     variant: "destructive",
    //   });
    } finally {
      setSaving(false);
    }
  };

  // OPEN EDIT
  const openEditModal = (child) => {
    setEditingId(child.id);
    setForm({
      name: child.name ?? "",
      age: child.age ?? "",
      gender: child.gender ?? "",
      parent: child.parent ?? child.guardian ?? "",
      contact: child.contact ?? "",
    });
    setOpenEdit(true);
  };

  // SAVE EDIT
  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/children/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update child");
    //   toast({ title: "Updated", description: "Child updated successfully." });
      setOpenEdit(false);
      setEditingId(null);
      setForm(blankForm);
      fetchChildren();
    } catch (err) {
    //   toast({
    //     title: "Error",
    //     description: err.message,
    //     variant: "destructive",
    //   });
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`${API}/children/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete child");
    //   toast({ title: "Deleted", description: "Child removed successfully." });
      setDeletingId(null);
      fetchChildren();
    } catch (err) {
    //   toast({
    //     title: "Error",
    //     description: err.message,
    //     variant: "destructive",
    //   });
    }
  };

  // EXPORT CSV for current class filter (or all)
  const handleDownloadCSV = () => {
    const rows = displayChildren
      .filter(
        (c) => classFilter === "all" || (c.className || "") === classFilter
      )
      .map((c) => ({
        Name: c.name,
        Age: c.age,
        Gender: c.gender,
        Class: c.className,
        Parent: c.parent || c.guardian || "",
        Contact: c.contact || "",
      }));

    const header = Object.keys(
      rows[0] || {
        Name: "",
        Age: "",
        Gender: "",
        Class: "",
        Parent: "",
        Contact: "",
      }
    );
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        header
          .map((key) => {
            const val = (r[key] ?? "").toString().replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const label =
      classFilter === "all"
        ? "all-classes"
        : classFilter.replace(/\s+/g, "-").toLowerCase();
    a.href = url;
    a.download = `children-${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PRINT current class filter (or all)
  const handlePrint = () => {
    const rows = displayChildren.filter(
      (c) => classFilter === "all" || (c.className || "") === classFilter
    );

    const win = window.open("", "_blank");
    if (!win) return;

    const title =
      classFilter === "all" ? "All Classes" : `${classFilter} Class`;

    win.document.write(`
      <html>
        <head>
          <title>Children - ${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; }
            h1 { color: #7e22ce; } /* purple-800 */
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f3f4f6; } /* gray-100 */
            tr:nth-child(even) { background: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Children – ${title}</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Age</th><th>Gender</th><th>Class</th><th>Parent</th><th>Contact</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (c) => `<tr>
                    <td>${c.name ?? ""}</td>
                    <td>${c.age ?? ""}</td>
                    <td>${c.gender ?? ""}</td>
                    <td>${c.className ?? ""}</td>
                    <td>${c.parent ?? c.guardian ?? ""}</td>
                    <td>${c.contact ?? ""}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
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
      {/* Page Title + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-pink-600">Children</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-56 border-purple-300">
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

          {/* Export & Print */}
          <Button
            variant="outline"
            className="border-pink-600 text-pink-600"
            onClick={handleDownloadCSV}
          >
            <Download className="w-4 h-4 mr-2 bg-pink-600 hover:bg-purple-700 text-white" />
            Download CSV
          </Button>
          <Button
            variant="outline"
            className="border-pink-600 text-pink-600"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2 bg-pink-600 hover:bg-purple-700 text-white" />
            Print
          </Button>

          {/* Add Child (Dialog) */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Child</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="grid gap-3">
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Parent/Guardian"
                  value={form.parent}
                  onChange={(e) => setForm({ ...form, parent: e.target.value })}
                  required
                />
                <Input
                  placeholder="Contact"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  required
                />
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Child
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full md:w-80 border-purple-300"
        />
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {displayChildren.length === 0 && !loading ? (
          <p className="text-gray-600">No children found.</p>
        ) : (
          displayChildren.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between bg-white rounded-xl border border-purple-200 p-4"
            >
              <div>
                <p className="font-semibold text-purple-700">{child.name}</p>
                <p className="text-sm text-gray-600">
                  Age: {child.age} | Gender: {child.gender} | Class:{" "}
                  {child.className || "-"}
                </p>
                <p className="text-sm text-gray-600">
                  Parent: {child.parent || child.guardian || "-"} | Contact:{" "}
                  {child.contact || "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700"
                  onClick={() => openEditModal(child)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600"
                      onClick={() => setDeletingId(child.id)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {child.name}?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletingId(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDelete}>
                        Yes, Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="border-purple-300 bg-pink-600 hover:bg-purple-700 text-white"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          className="border-purple-300 bg-pink-600 hover:bg-purple-700 text-white"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* Edit Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Child</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="grid gap-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
            />
            <Select
              value={form.gender}
              onValueChange={(v) => setForm({ ...form, gender: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Parent/Guardian"
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
              required
            />
            <Input
              placeholder="Contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEdit(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}







  