











// // src/pages/Children.jsx
// import { useEffect, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Loader2, Edit, Trash, Download, Printer, Plus } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// // DOCX and PDF
// import { Document, Packer, Paragraph, Table, TableCell, TableRow } from "docx";
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// // Backend API base
// const API = "http://localhost:5000";

// // Hardcoded class options (you already seeded these on backend)
// const CLASS_OPTIONS = [
//   { id: "all", label: "All Classes" },
//   { id: "Gifted Brains", label: "Gifted Brains (0–3)" },
//   { id: "Beginners", label: "Beginners (3–6)" },
//   { id: "Shinners", label: "Shinners (6–9)" },
//   { id: "Conquerors", label: "Conquerors (9–13)" },
//   { id: "Teens", label: "Teens (13+)" },
// ];

// // Helper: fallback class by age if backend doesn't provide
// function getClassForAge(age) {
//   const a = Number(age);
//   if (isNaN(a)) return "";
//   if (a < 3) return "Gifted Brains";
//   if (a < 6) return "Beginners";
//   if (a < 9) return "Shinners";
//   if (a < 13) return "Conquerors";
//   return "Teens";
// }

// export default function Children({ role = "teacher" }) {
//   // ---------------- State ----------------
//   const [children, setChildren] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // search & pagination
//   const [search, setSearch] = useState("");
//   const [classFilter, setClassFilter] = useState("all");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // Add/Edit modals
//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);

//   // Add/Edit form
//   const blankForm = { name: "", age: "", gender: "", parent: "", contact: "" };
//   const [form, setForm] = useState(blankForm);
//   const [editingId, setEditingId] = useState(null);

//   // Attendance & Offerings aggregated states
//   // todayAttendanceMap: { child_id: boolean } (true => present)
//   const [todayAttendanceMap, setTodayAttendanceMap] = useState({});
//   // monthlyAttendanceCount: { child_id: number }
//   const [monthlyAttendanceMap, setMonthlyAttendanceMap] = useState({});
//   // classOfferingsToday: { class_name_or_id: amount }
//   const [classOfferingsToday, setClassOfferingsToday] = useState({});
//   // monthly offerings by class
//   const [classOfferingsMonth, setClassOfferingsMonth] = useState({});

//   // UI helper: new class offering input for the selected class
//   const [classOfferingInput, setClassOfferingInput] = useState("");

//   // date helpers
//   const today = new Date().toISOString().split("T")[0];
//   const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
//   const lastOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0];

//   // ---------------- Fetch children ----------------
//   const fetchChildren = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//         search,
//         page: String(page),
//         class: classFilter === "all" ? "" : classFilter,
//       });
//       const res = await fetch(`${API}/children?${params.toString()}`);
//       if (!res.ok) throw new Error("Failed to fetch children");
//       const data = await res.json();
//       setChildren(data.items || []);
//       setTotalPages(data.total_pages || 1);
//     } catch (err) {
//       console.error("fetchChildren:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- Fetch attendance & offerings ----------------
//   // This fetches:
//   // - today's attendance entries (returns list of attendance records)
//   // - monthly attendance records (aggregates per child)
//   // - today's class offerings (per-class)
//   // - monthly class offerings (per-class)
//   const fetchAttendanceAndOfferings = async () => {
//     try {
//       // Attendance for today (returns array of attendance records)
//       const todayRes = await fetch(`${API}/children/attendance?start=${today}&end=${today}`);
//       if (todayRes.ok) {
//         const todayRows = await todayRes.json();
//         const todayMap = {};
//         // expecting rows with { child_id, present }
//         (todayRows || []).forEach((r) => {
//           todayMap[r.child_id] = !!r.present;
//         });
//         setTodayAttendanceMap(todayMap);
//       } else {
//         setTodayAttendanceMap({});
//       }

//       // Monthly attendance (aggregate per child)
//       const monthRes = await fetch(`${API}/children/attendance?start=${firstOfMonth}&end=${lastOfMonth}`);
//       if (monthRes.ok) {
//         const monthRows = await monthRes.json();
//         const monthMap = {};
//         (monthRows || []).forEach((r) => {
//           monthMap[r.child_id] = (monthMap[r.child_id] || 0) + (r.present ? 1 : 0);
//         });
//         setMonthlyAttendanceMap(monthMap);
//       } else {
//         setMonthlyAttendanceMap({});
//       }

//       // Today's class offerings (per class) - expects array of offerings
//       const todayOfferRes = await fetch(`${API}/children/offerings?start=${today}&end=${today}`);
//       if (todayOfferRes.ok) {
//         const rows = await todayOfferRes.json();
//         const map = {};
//         (rows || []).forEach((o) => {
//           // depending on backend, class identifier could be id or name; we keep it as class_id
//           map[o.class_id || o.class_name || o.class || o.classId] = Number(o.amount || o.value || 0);
//         });
//         setClassOfferingsToday(map);
//       } else {
//         setClassOfferingsToday({});
//       }

//       // Monthly offerings (per class)
//       const monthOfferRes = await fetch(`${API}/children/offerings?start=${firstOfMonth}&end=${lastOfMonth}`);
//       if (monthOfferRes.ok) {
//         const rows = await monthOfferRes.json();
//         const map = {};
//         (rows || []).forEach((o) => {
//           const key = o.class_id || o.class_name || o.class || o.classId;
//           map[key] = (map[key] || 0) + Number(o.amount || o.value || 0);
//         });
//         setClassOfferingsMonth(map);
//       } else {
//         setClassOfferingsMonth({});
//       }
//     } catch (err) {
//       console.error("fetchAttendanceAndOfferings:", err);
//     }
//   };

//   // initial load + dependency updates
//   useEffect(() => {
//     fetchChildren();
//   }, [search, page, classFilter]);

//   // fetch attendance/offering whenever children change (or on mount)
//   useEffect(() => {
//     fetchAttendanceAndOfferings();
//   }, [children]);

//   // ---------------- Derived display data ----------------
//   const displayChildren = useMemo(() => {
//     return children.map((c) => ({
//       ...c,
//       className: c.className || getClassForAge(c.age),
//       todayPresent: todayAttendanceMap[c.id] || false,
//       monthAttendance: monthlyAttendanceMap[c.id] || 0,
//     }));
//   }, [children, todayAttendanceMap, monthlyAttendanceMap]);

//   // aggregated KPI numbers
//   const todaysAttendanceCount = Object.values(todayAttendanceMap).filter(Boolean).length;
//   const todaysOfferingSum = Object.values(classOfferingsToday).reduce((s, a) => s + Number(a || 0), 0);
//   const monthlyAttendanceTotal = Object.values(monthlyAttendanceMap).reduce((s, a) => s + Number(a || 0), 0);
//   const monthlyOfferingSum = Object.values(classOfferingsMonth).reduce((s, a) => s + Number(a || 0), 0);

//   // ---------------- Add Child ----------------
//   const handleAdd = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const res = await fetch(`${API}/children`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) {
//         const b = await res.json().catch(() => ({}));
//         throw new Error(b.error || "Failed to add child");
//       }
//       setForm(blankForm);
//       setOpenAdd(false);
//       await fetchChildren();
//     } catch (err) {
//       console.error("handleAdd:", err);
//       alert(err.message || "Failed to add child");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ---------------- Edit Child ----------------
//   const openEditModal = (child) => {
//     setEditingId(child.id);
//     setForm({
//       name: child.name ?? "",
//       age: child.age ?? "",
//       gender: child.gender ?? "",
//       parent: child.parent ?? child.guardian ?? "",
//       contact: child.contact ?? "",
//     });
//     setOpenEdit(true);
//   };

//   const handleEditSave = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const res = await fetch(`${API}/children/${editingId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) {
//         const b = await res.json().catch(() => ({}));
//         throw new Error(b.error || "Failed to update child");
//       }
//       setOpenEdit(false);
//       setEditingId(null);
//       setForm(blankForm);
//       await fetchChildren();
//     } catch (err) {
//       console.error("handleEditSave:", err);
//       alert(err.message || "Failed to update child");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ---------------- Delete Child ----------------
//   const confirmDelete = async () => {
//     if (!deletingId) return;
//     try {
//       const res = await fetch(`${API}/children/${deletingId}`, { method: "DELETE" });
//       if (!res.ok) {
//         const b = await res.json().catch(() => ({}));
//         throw new Error(b.error || "Delete failed");
//       }
//       setDeletingId(null);
//       await fetchChildren();
//     } catch (err) {
//       console.error("confirmDelete:", err);
//       alert(err.message || "Delete failed");
//     }
//   };

//   // ---------------- Attendance badges (Option B) ----------------
//   // Clicking "Present" sets present=true for today; clicking "Absent" sets present=false for today.
//   const setAttendanceForChild = async (childId, present) => {
//     try {
//       const token = localStorage.getItem("token") || null;
//       const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };

//       const res = await fetch(`${API}/children/${childId}/attendance`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ present, date: today }),
//       });
//       if (!res.ok) {
//         const b = await res.json().catch(() => ({}));
//         throw new Error(b.error || "Failed to save attendance");
//       }
//       // refresh attendance maps
//       await fetchAttendanceAndOfferings();
//     } catch (err) {
//       console.error("setAttendanceForChild:", err);
//       alert(err.message || "Failed to set attendance");
//     }
//   };

//   // ---------------- Class offering save (shown only when single class selected) ----------------
//   const handleSaveClassOffering = async (classIdOrName) => {
//     try {
//       const token = localStorage.getItem("token") || null;
//       const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };

//       const res = await fetch(`${API}/children/offerings`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           class_id: classIdOrName,
//           date: today,
//           amount: Number(classOfferingInput || 0),
//         }),
//       });
//       if (!res.ok) {
//         const b = await res.json().catch(() => ({}));
//         throw new Error(b.error || "Failed to save offering");
//       }
//       // refresh
//       await fetchAttendanceAndOfferings();
//       alert("Offering saved");
//     } catch (err) {
//       console.error("handleSaveClassOffering:", err);
//       alert(err.message || "Failed to save offering");
//     }
//   };

//   // ---------------- Export DOCX (children list) ----------------
//   const handleDownloadDocx = async () => {
//     try {
//       const doc = new Document({
//         sections: [
//           {
//             children: [
//               new Paragraph({ text: "Children List", heading: "Heading1" }),
//               new Table({
//                 rows: [
//                   new TableRow({
//                     children: [
//                       "Name",
//                       "Age",
//                       "Gender",
//                       "Class",
//                       "Parent",
//                       "Contact",
//                       "Attendance",
//                       "Offering",
//                     ].map((h) => new TableCell({ children: [new Paragraph(h)] })),
//                   }),
//                   ...displayChildren.map((c) =>
//                     new TableRow({
//                       children: [
//                         c.name,
//                         String(c.age || ""),
//                         c.gender || "",
//                         c.className || "",
//                         c.parent || "",
//                         c.contact || "",
//                         c.todayPresent ? "Present" : "Absent",
//                         String(c.offering || ""),
//                       ].map((d) => new TableCell({ children: [new Paragraph(d)] })),
//                     })
//                   ),
//                 ],
//               }),
//             ],
//           },
//         ],
//       });

//       const blob = await Packer.toBlob(doc);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "children.docx";
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("handleDownloadDocx:", err);
//       alert("Export failed");
//     }
//   };

//   // ---------------- Export PDF ----------------
//   const handleDownloadPDF = async () => {
//     try {
//       const pdfDoc = await PDFDocument.create();
//       const page = pdfDoc.addPage([800, 600]);
//       const { height } = page.getSize();
//       const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//       let y = height - 40;
//       page.drawText("Children List", { x: 50, y, size: 18, font });
//       y -= 25;
//       displayChildren.forEach((c) => {
//         const line = `${c.name} | ${c.age} | ${c.gender} | ${c.className} | ${c.parent || ""} | ${c.contact || ""} | ${c.todayPresent ? "P" : "A"}`;
//         page.drawText(line, { x: 50, y, size: 11, font });
//         y -= 18;
//         if (y < 40) {
//           // add page
//           // (very simple; not handling multi-page layout in detail)
//         }
//       });
//       const pdfBytes = await pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: "application/pdf" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "children.pdf";
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("handleDownloadPDF:", err);
//       alert("PDF export failed");
//     }
//   };

//   // ---------------- Render JSX ----------------
//   return (
//     <div className="p-6 min-h-screen bg-gray-100 space-y-6">
//       {/* Title + Actions */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//         <h1 className="text-2xl font-bold text-pink-600">Children</h1>
//         <div className="flex flex-wrap gap-2">
//           {/* Class filter */}
//           <Select value={classFilter} onValueChange={(v) => setClassFilter(v)}>
//             <SelectTrigger className="w-56 border-pink-300">
//               <SelectValue placeholder="Filter by class" />
//             </SelectTrigger>
//             <SelectContent>
//               {CLASS_OPTIONS.map((opt) => (
//                 <SelectItem key={opt.id} value={opt.id}>
//                   {opt.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* Exports */}
//           <Button variant="outline" className="border-pink-600 text-pink-600" onClick={handleDownloadDocx}>
//             <Download className="w-4 h-4 mr-2" /> DOCX
//           </Button>
//           <Button variant="outline" className="border-pink-600 text-pink-600" onClick={handleDownloadPDF}>
//             <Printer className="w-4 h-4 mr-2" /> PDF
//           </Button>

//           {/* Add child */}
//           <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => setOpenAdd(true)}>
//             <Plus className="w-4 h-4 mr-2" /> Add Child
//           </Button>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="flex items-center gap-2">
//         <Input
//           placeholder="Search by name..."
//           value={search}
//           onChange={(e) => {
//             setPage(1);
//             setSearch(e.target.value);
//           }}
//           className="w-full md:w-80 border-pink-300"
//         />
//         {loading && <Loader2 className="w-5 h-5 animate-spin text-pink-600" />}
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-sm font-medium text-gray-600">Today's Attendance</h3>
//           <p className="text-2xl font-bold text-pink-600">{todaysAttendanceCount}</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-sm font-medium text-gray-600">Today's Offering</h3>
//           <p className="text-2xl font-bold text-pink-600">{todaysOfferingSum}</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-sm font-medium text-gray-600">This Month Attendance</h3>
//           <p className="text-2xl font-bold text-pink-600">{monthlyAttendanceTotal}</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-sm font-medium text-gray-600">This Month Offering</h3>
//           <p className="text-2xl font-bold text-pink-600">{monthlyOfferingSum}</p>
//         </div>
//       </div>

//       {/* When a specific class is selected, show an offering input for that class in the KPI area */}
//       {classFilter !== "all" && (
//         <div className="bg-white rounded-lg shadow p-4 mt-4 flex items-center gap-3">
//           <div>
//             <div className="text-sm text-gray-600 font-medium">{`${classFilter} - Today's Offering`}</div>
//             <div className="text-lg font-bold text-pink-600">
//               {classOfferingsToday[classFilter] ?? 0}
//             </div>
//             <div className="text-xs text-gray-500">This month's total: {classOfferingsMonth[classFilter] ?? 0}</div>
//           </div>

//           <div className="flex items-center gap-2 ml-auto">
//             <Input
//               type="number"
//               className="w-36"
//               placeholder="Amount"
//               value={classOfferingInput}
//               onChange={(e) => setClassOfferingInput(e.target.value)}
//             />
//             <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => handleSaveClassOffering(classFilter)}>
//               Save
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
//         <table className="w-full border-collapse">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border">Name</th>
//               <th className="p-2 border">Age</th>
//               <th className="p-2 border">Gender</th>
//               <th className="p-2 border">Class</th>
//               <th className="p-2 border">Parent</th>
//               <th className="p-2 border">Contact</th>
//               <th className="p-2 border text-center">Attendance</th>
//               <th className="p-2 border text-center">Month Attendance</th>
//               <th className="p-2 border">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={9} className="text-center p-4">
//                   <Loader2 className="w-5 h-5 animate-spin mx-auto text-pink-600" />
//                 </td>
//               </tr>
//             ) : displayChildren.length === 0 ? (
//               <tr>
//                 <td colSpan={9} className="text-center p-4 text-pink-600">
//                   No children found
//                 </td>
//               </tr>
//             ) : (
//               displayChildren.map((c) => (
//                 <tr key={c.id} className="hover:bg-gray-50">
//                   <td className="p-2 border">{c.name}</td>
//                   <td className="p-2 border">{c.age}</td>
//                   <td className="p-2 border">{c.gender}</td>
//                   <td className="p-2 border">{c.className}</td>
//                   <td className="p-2 border">{c.parent}</td>
//                   <td className="p-2 border">{c.contact}</td>

//                   {/* Attendance badges (Option B) */}
//                   <td className="p-2 border text-center">
//                     <div className="inline-flex gap-2 items-center">
//                       {/* Present badge */}
//                       <button
//                         type="button"
//                         onClick={() => setAttendanceForChild(c.id, true)}
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${c.todayPresent ? "bg-green-500 text-white" : "bg-green-100 text-green-800"}`}
//                         title="Mark present"
//                       >
//                         Present
//                       </button>

//                       {/* Absent badge */}
//                       <button
//                         type="button"
//                         onClick={() => setAttendanceForChild(c.id, false)}
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${c.todayPresent === false ? "bg-red-500 text-white" : "bg-red-100 text-red-800"}`}
//                         title="Mark absent"
//                       >
//                         Absent
//                       </button>
//                     </div>
//                   </td>

//                   <td className="p-2 border text-center">{c.monthAttendance}</td>

//                   <td className="p-2 border space-x-2 text-center">
//                     <Button variant="outline" size="sm" onClick={() => openEditModal(c)} className="text-pink-700 border-pink-300">
//                       <Edit className="w-4 h-4" />
//                     </Button>

//                     <AlertDialog>
//                       <AlertDialogTrigger asChild>
//                         <Button variant="outline" size="sm" className="text-red-600 border-red-300">
//                           <Trash className="w-4 h-4" />
//                         </Button>
//                       </AlertDialogTrigger>

//                       <AlertDialogContent>
//                         <AlertDialogHeader>
//                           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                           <AlertDialogCancel>Cancel</AlertDialogCancel>
//                           <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Add Modal */}
//       <Dialog open={openAdd} onOpenChange={setOpenAdd}>
//         <DialogContent className="sm:max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Add Child</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleAdd} className="space-y-3">
//             <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
//             <Input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
//             <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
//               <SelectTrigger className="w-full border-pink-300">
//                 <SelectValue placeholder="Select Gender" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Male">Male</SelectItem>
//                 <SelectItem value="Female">Female</SelectItem>
//               </SelectContent>
//             </Select>
//             <Input placeholder="Parent/Guardian Name" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} />
//             <Input placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
//             <div className="flex justify-end gap-2">
//               <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
//               <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white" disabled={saving}>
//                 {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Modal */}
//       <Dialog open={openEdit} onOpenChange={setOpenEdit}>
//         <DialogContent className="sm:max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Edit Child</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleEditSave} className="space-y-3">
//             <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
//             <Input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
//             <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
//               <SelectTrigger className="w-full border-pink-300">
//                 <SelectValue placeholder="Select Gender" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Male">Male</SelectItem>
//                 <SelectItem value="Female">Female</SelectItem>
//               </SelectContent>
//             </Select>
//             <Input placeholder="Parent/Guardian Name" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} />
//             <Input placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
//             <div className="flex justify-end gap-2">
//               <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
//               <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white" disabled={saving}>
//                 {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

















// src/pages/Children.jsx - Part 1
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

  // Attendance
  const [attendanceMap, setAttendanceMap] = useState({}); // { child_id: { date1: true, date2: false, ... } }
  const [todayAttendanceMap,setTodayAttendanceMap]=useState({})

  // Offerings
  const [classOfferingsToday, setClassOfferingsToday] = useState({});
  const [classOfferingsMonth, setClassOfferingsMonth] = useState({});
  const [classOfferingInput, setClassOfferingInput] = useState("");

  // date helpers
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];
  const lastOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  // ---------------- Fetch children ----------------
  const fetchChildren = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: String(page),
        class: classFilter === "all" ? "" : classFilter,
      });
      
      const res = await fetch(`${API}/api/children/?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch children");
      const data = await res.json();
      console.log("API response:",data)
      setChildren(data || []);
      setTotalPages(data.total_pages || 1);

      // initialize rowFormMap for inline editing
      const map = {};
      (data || []).forEach((c) => {
        map[c.id] = {
          name: c.name || "",
          age: c.age || "",
          gender: c.gender || "",
          parent: c.parent_name || "",
          contact: c.parent_contact || "",
          class: c.class_name || "",
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
  const fetchAttendanceAndOfferings = async () => {
    try {
      // Attendance for last 5 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 5);
      const startStr = startDate.toISOString().split("T")[0];

      const attRes = await fetch(
        `${API}/children/attendance?start=${startStr}&end=${today}`
      );
      if (attRes.ok) {
        const rows = await attRes.json();
        const map = {};
        (rows || []).forEach((r) => {
          map[r.child_id] = map[r.child_id] || {};
          map[r.child_id][r.date] = !!r.present;
        });
        setAttendanceMap(map);
      } else {
        setAttendanceMap({});
      }

      // Offerings today
      const todayOfferRes = await fetch(
        `${API}/children/offerings?start=${today}&end=${today}`
      );
      if (todayOfferRes.ok) {
        const rows = await todayOfferRes.json();
        const map = {};
        (rows || []).forEach((o) => {
          map[o.class_id] = Number(o.amount || 0);
        });
        setClassOfferingsToday(map);
      } else setClassOfferingsToday({});

      // Offerings this month
      const monthOfferRes = await fetch(
        `${API}/children/offerings?start=${firstOfMonth}&end=${lastOfMonth}`
      );
      if (monthOfferRes.ok) {
        const rows = await monthOfferRes.json();
        const map = {};
        (rows || []).forEach((o) => {
          map[o.class_id] = (map[o.class_id] || 0) + Number(o.amount || 0);
        });
        setClassOfferingsMonth(map);
      } else setClassOfferingsMonth({});
    } catch (err) {
      console.error("fetchAttendanceAndOfferings:", err);
    }
  };

  // ---------------- Effects ----------------
  useEffect(() => {
    fetchChildren();
  }, [search, page, classFilter]);

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
      const res = await fetch(`${API}/children/${childId}`, {
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
      const res = await fetch(`${API}/children/${childId}`, {
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

  // ---------------- Attendance checkbox handler ----------------
  const toggleAttendance = async (childId, date, present) => {
    try {
      const token = localStorage.getItem("token") || null;
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const res = await fetch(`${API}/children/${childId}/attendance`, {
        method: "POST",
        headers,
        body: JSON.stringify({ date, present }),
      });
      if (!res.ok) throw new Error("Failed to save attendance");

      setAttendanceMap((prev) => ({
        ...prev,
        [childId]: { ...prev[childId], [date]: present },
      }));
    } catch (err) {
      console.error("toggleAttendance:", err);
      alert(err.message || "Failed to save attendance");

    }
  };

  //---------------TODAYS ATTENDANCE------------#

  const markTodayAttendance = async (childId, status) => {
    try {
      // Update frontend instantly
      setTodayAttendanceMap((prev) => ({
        ...prev,
        [childId]: status,
      }));

      // Send to backend
      await fetch(`${API}/attendance/today`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          status: status,
        }),
      });
    } catch (err) {
      console.error("Error marking today's attendance:", err);
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

      const res = await fetch(`${API}/children/offerings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          class_id: classIdOrName,
          date: today,
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

    // Create table rows for DOCX
    const tableRows = [
      // Header row
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Name")] }),
          new TableCell({ children: [new Paragraph("Age")] }),
          new TableCell({ children: [new Paragraph("Gender")] }),
          new TableCell({ children: [new Paragraph("Class")] }),
          new TableCell({ children: [new Paragraph("Parent")] }),
          new TableCell({ children: [new Paragraph("Contact")] }),
          ...lastFiveMonths.map(
            (m) => new TableCell({ children: [new Paragraph(m.label)] })
          ),
        ],
      }),
      // Data rows
      ...displayChildren.map(
        (c) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(c.name)] }),
              new TableCell({ children: [new Paragraph(String(c.age))] }),
              new TableCell({ children: [new Paragraph(c.gender)] }),
              new TableCell({ children: [new Paragraph(c.className)] }),
              new TableCell({ children: [new Paragraph(c.parent)] }),
              new TableCell({ children: [new Paragraph(c.contact)] }),
              ...lastFiveMonths.map(
                (m) =>
                  new TableCell({
                    children: [
                      new Paragraph(attendanceMap[c.id]?.[m.key] ? "✔" : "✘"),
                    ],
                  })
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
            new Paragraph({
              text: "Children Attendance Report",
              heading: "Heading1",
            }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: "pct" },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);

    // trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `children_report_${new Date()
      .toISOString()
      .slice(0, 10)}.docx`;
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
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 10;

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    const title = "Children Attendance Report";
    page.drawText(title, {
      x: 50,
      y: height - 40,
      size: 16,
      font: timesRomanFont,
      color: rgb(0.7, 0, 0.5),
    });

    // Table starting position
    let x = 50;
    let y = height - 60;
    const rowHeight = 20;

    // Headers
    const headers = [
      "Name",
      "Age",
      "Gender",
      "Class",
      "Parent",
      "Contact",
      ...lastFiveMonths.map((m) => m.label),
    ];

    headers.forEach((text, i) => {
      page.drawText(text, { x: x, y, size: fontSize, font: timesRomanFont });
      x += 80; // column width
    });

    y -= rowHeight;

    // Rows
    displayChildren.forEach((c) => {
      x = 50;
      const cells = [
        c.name,
        String(c.age),
        c.gender,
        c.class_name,
        c.parent,
        c.contact,
        ...lastFiveMonths.map((m) =>
          attendanceMap[c.id]?.[m.key] ? "✔" : "✘"
        ),
      ];

      cells.forEach((text, i) => {
        page.drawText(text, { x, y, size: fontSize, font: timesRomanFont });
        x += 80;
      });

      y -= rowHeight;

      // Add new page if necessary
      if (y < 50) {
        y = height - 50;
        pdfDoc.addPage();
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `children_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // src/pages/Children.jsx - Part 2 (Table & JSX) - Corrected
  // ---------------- Derived display data ----------------
  const displayChildren = useMemo(() => {
    
    return children.map((c) => ({
      ...c,
      className: c.class_name || getClassForAge(c.age),
    }));
  }, [children]);
  console.log("displayChildren:", displayChildren);

  // Generate last 5 months for attendance headers
  const lastFiveMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7); // "YYYY-MM"
      months.push({
        key,
        label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      });
    }
    return months;
  }, []);

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
          <Button
            variant="outline"
            className="border-pink-600 text-pink-600"
            onClick={exportToDocx}
          >
            <Download className="w-4 h-4 mr-2" /> DOCX
          </Button>
          <Button
            variant="outline"
            className="border-pink-600 text-pink-600"
            onClick={exportToPdf}
          >
            <Printer className="w-4 h-4 mr-2" /> PDF
          </Button>

          {/* Add child */}
          <Button
            className="bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => setOpenAdd(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Child
          </Button>
        </div>
      </div>

      {/* ---------------- Add Child Modal ---------------- */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Child</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Parent"
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
            />
            <Input
              placeholder="Contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAdd(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add
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
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full md:w-80 border-pink-300"
        />
        {loading && <Loader2 className="w-5 h-5 animate-spin text-pink-600" />}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">
            Today's Attendance
          </h3>
          <p className="text-2xl font-bold text-pink-600">
            {Object.values(attendanceMap).filter((m) => m[today]).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">
            Today's Offering
          </h3>
          <p className="text-2xl font-bold text-pink-600">
            {Object.values(classOfferingsToday).reduce(
              (s, a) => s + Number(a || 0),
              0
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">
            This Month Attendance
          </h3>
          <p className="text-2xl font-bold text-pink-600">
            {Object.values(attendanceMap).reduce(
              (sum, m) => sum + Object.values(m).filter(Boolean).length,
              0
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-600">
            This Month Offering
          </h3>
          <p className="text-2xl font-bold text-pink-600">
            {Object.values(classOfferingsMonth).reduce(
              (s, a) => s + Number(a || 0),
              0
            )}
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
            <div className="text-xs text-gray-500">
              This month's total: {classOfferingsMonth[classFilter] ?? 0}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Input
              type="number"
              className="w-36"
              placeholder="Amount"
              value={classOfferingInput}
              onChange={(e) => setClassOfferingInput(e.target.value)}
            />
            <Button
              className="bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => handleSaveClassOffering(classFilter)}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Children Table */}
      <div className="overflow-x-auto w-full bg-white rounded-lg shadow mt-4">
        <table className="w-full min-w-[700px] border-collapse hidden sm:table">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Gender</th>

              <th className="p-2 border">Class</th>
              <th className="p-2 border">Parent</th>

              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Today</th>

              {lastFiveMonths.map((m) => (
                <th key={m.key} className="p-2 border text-center">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6 + lastFiveMonths.length}
                  className="text-center p-4"
                >
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-pink-600" />
                </td>
              </tr>
            ) : displayChildren.length === 0 ? (
              <tr>
                <td
                  colSpan={6 + lastFiveMonths.length}
                  className="text-center p-4 text-pink-600"
                >
                  No children found
                </td>
              </tr>
            ) : (
              displayChildren.map((c) => {
                const isEditing = editingRowId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input
                          value={rowFormMap[c.id].name}
                          onChange={(e) =>
                            setRowFormMap({
                              ...rowFormMap,
                              [c.id]: {
                                ...rowFormMap[c.id],
                                name: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        c.name
                      )}
                    </td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={rowFormMap[c.id].age}
                          onChange={(e) =>
                            setRowFormMap({
                              ...rowFormMap,
                              [c.id]: {
                                ...rowFormMap[c.id],
                                age: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        c.age
                      )}
                    </td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Select
                          value={rowFormMap[c.id].gender}
                          onValueChange={(v) =>
                            setRowFormMap({
                              ...rowFormMap,
                              [c.id]: { ...rowFormMap[c.id], gender: v },
                            })
                          }
                        >
                          <SelectTrigger className="w-full border">
                            <SelectValue placeholder="Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        c.gender
                      )}
                    </td>
                    <td className="p-2 border">{c.className}</td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input
                          value={rowFormMap[c.id].parent}
                          onChange={(e) =>
                            setRowFormMap({
                              ...rowFormMap,
                              [c.id]: {
                                ...rowFormMap[c.id],
                                parent: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        c.parent
                      )}
                    </td>
                    <td className="p-2 border">
                      {isEditing ? (
                        <Input
                          value={rowFormMap[c.id].contact}
                          onChange={(e) =>
                            setRowFormMap({
                              ...rowFormMap,
                              [c.id]: {
                                ...rowFormMap[c.id],
                                contact: e.target.value,
                              },
                            })
                          }
                        />
                      ) : (
                        c.contact
                      )}
                    </td>
                    {lastFiveMonths.map((m) => (
                      <td key={m.key} className="p-2 border text-center">
                        <input
                          type="checkbox"
                          checked={attendanceMap[c.id]?.[m.key] || false}
                          onChange={(e) =>
                            toggleAttendance(c.id, m.key, e.target.checked)
                          }
                        />
                      </td>
                    ))}
                    <td className="p-2 border text-center space-x-1">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRowSave(c.id)}
                            className="text-green-700 border-green-300"
                            disabled={saving}
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRowCancel}
                            className="text-gray-600 border-gray-300"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRowEdit(c.id)}
                            className="text-pink-700 border-pink-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300"
                                disabled={deletingId === c.id}
                              >
                                {deletingId === c.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => confirmDelete(c.id)}
                                  disabled={saving}
                                >
                                  Delete
                                </AlertDialogAction>
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

        {/* ---------------- Mobile Cards ---------------- */}
        <div className="sm:hidden flex flex-col gap-4 mt-4">
          {displayChildren.length === 0 ? (
            <div className="text-center text-pink-600">No children found</div>
          ) : (
            displayChildren.map((c) => {
              const isEditing = editingRowId === c.id;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-lg shadow p-4 space-y-2"
                >
                  {/* Basic info */}
                  <div>
                    <strong>Name:</strong>{" "}
                    {isEditing ? (
                      <Input
                        value={rowFormMap[c.id].name}
                        onChange={(e) =>
                          setRowFormMap({
                            ...rowFormMap,
                            [c.id]: {
                              ...rowFormMap[c.id],
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      c.name
                    )}
                  </div>
                  <div>
                    <strong>Age:</strong>{" "}
                    {isEditing ? (
                      <Input
                        type="number"
                        value={rowFormMap[c.id].age}
                        onChange={(e) =>
                          setRowFormMap({
                            ...rowFormMap,
                            [c.id]: {
                              ...rowFormMap[c.id],
                              age: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      c.age
                    )}
                  </div>
                  <div>
                    <strong>Gender:</strong>{" "}
                    {isEditing ? (
                      <Select
                        value={rowFormMap[c.id].gender}
                        onValueChange={(v) =>
                          setRowFormMap({
                            ...rowFormMap,
                            [c.id]: { ...rowFormMap[c.id], gender: v },
                          })
                        }
                      >
                        <SelectTrigger className="w-full border">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      c.gender
                    )}
                  </div>
                  <div>
                    <strong>Class:</strong> {c.className}
                  </div>
                  <div>
                    <strong>Parent:</strong>{" "}
                    {isEditing ? (
                      <Input
                        value={rowFormMap[c.id].parent}
                        onChange={(e) =>
                          setRowFormMap({
                            ...rowFormMap,
                            [c.id]: {
                              ...rowFormMap[c.id],
                              parent: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      c.parent
                    )}
                  </div>
                  <div>
                    <strong>Contact:</strong>{" "}
                    {isEditing ? (
                      <Input
                        value={rowFormMap[c.id].contact}
                        onChange={(e) =>
                          setRowFormMap({
                            ...rowFormMap,
                            [c.id]: {
                              ...rowFormMap[c.id],
                              contact: e.target.value,
                            },
                          })
                        }
                      />
                    ) : (
                      c.contact
                    )}
                  </div>

                  {/* Attendance */}
                  {/* ---------------- Attendance ---------------- */}
                  <div className="space-y-3 pb-2 border-b border-pink-100">
                    <div className="text-xs font-semibold text-pink-600">
                      Attendance (Last 5 Months)
                    </div>

                    {/* ---- Historical last 5 months summary ---- */}
                    <div className="flex flex-wrap gap-2">
                      {lastFiveMonths.map((m) => (
                        <label
                          key={m.key}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs text-pink-700"
                        >
                          <input
                            type="checkbox"
                            checked={attendanceMap[c.id]?.[m.key] || false}
                            onChange={(e) =>
                              toggleAttendance(c.id, m.key, e.target.checked)
                            }
                          />
                          {m.label.slice(0, 3)}
                        </label>
                      ))}
                    </div>

                    {/* ---- TODAY attendance (Option D) ---- */}
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-semibold text-pink-600">
                        Mark Today
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => markTodayAttendance(c.id, "Present")}
                        >
                          Present
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600"
                          onClick={() => markTodayAttendance(c.id, "Absent")}
                        >
                          Absent
                        </Button>
                      </div>

                      {/* TODAY STATUS */}
                      <div className="text-xs text-gray-600">
                        Status today:
                        <span className="font-semibold ml-1 text-pink-700">
                          {todayAttendanceMap[c.id] || "Not Marked"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-700 border-green-300"
                          onClick={() => handleRowSave(c.id)}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 border-gray-300"
                          onClick={handleRowCancel}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-pink-700 border-pink-300"
                          onClick={() => handleRowEdit(c.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => confirmDelete(c.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
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
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

 
  
  
