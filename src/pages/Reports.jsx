

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit, Trash, Download, Printer, Loader2 } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";

const API = "http://localhost:5000"; // backend API

const CLASS_TABS = [
  { id: "gifted", label: "Gifted Brains (0–3)" },
  { id: "beginners", label: "Beginners (3–6)" },
  { id: "shinners", label: "Shinners (6–9)" },
  { id: "conquerors", label: "Conquerors (9–13)" },
  { id: "teens", label: "Teens (13+)" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("gifted");
  const [reports, setReports] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const blankForm = {
    date: "",
    topic: "",
    bibleRefs: "",
    resources: "",
    remarks: "",
  };
  const [form, setForm] = useState(blankForm);

  // Fetch children & reports
  const fetchChildren = async () => {
    try {
      const res = await fetch(`${API}/children`);
      if (!res.ok) throw new Error("Failed to fetch children");
      const data = await res.json();
      setChildren(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/reports?class=${activeTab}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    fetchReports();
  }, [activeTab]);

  // KPI calculations
  const kpi = useMemo(() => {
    const classChildren = children.filter(
      (c) => c.className?.toLowerCase() === activeTab
    );
    const today = new Date().toISOString().slice(0, 10);
    const todayAttendance = classChildren.filter((c) =>
      c.attendance?.includes(today)
    ).length;
    const todayOffering = classChildren.reduce(
      (sum, c) => sum + (c.offering?.[today] || 0),
      0
    );
    const month = new Date().getMonth();
    const monthAttendance = classChildren.reduce(
      (sum, c) =>
        sum +
        (c.attendance?.filter((d) => new Date(d).getMonth() === month).length ||
          0),
      0
    );
    const monthOffering = classChildren.reduce(
      (sum, c) =>
        sum +
        Object.entries(c.offering || {}).reduce((s, [d, val]) => {
          if (new Date(d).getMonth() === month) s += val;
          return s;
        }, 0),
      0
    );
    return { todayAttendance, todayOffering, monthAttendance, monthOffering };
  }, [children, activeTab]);

  // Add report
  const handleAddReport = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, class: activeTab }),
      });
      if (!res.ok) throw new Error("Failed to save report");
      setForm(blankForm);
      setOpenAdd(false);
      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Edit report
  const openEditModal = (report) => {
    setEditingId(report.id);
    setForm({
      date: report.date,
      topic: report.topic,
      bibleRefs: report.bibleRefs,
      resources: report.resources,
      remarks: report.remarks,
    });
    setOpenEdit(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/reports/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update report");
      setForm(blankForm);
      setEditingId(null);
      setOpenEdit(false);
      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Delete report
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const res = await fetch(`${API}/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  // Export PDF
  const handleDownloadPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    page.drawText(`Weekly Reports - ${activeTab}`, {
      x: 50,
      y: 770,
      size: 20,
      color: rgb(0.6, 0, 0.6),
    });
    let y = 740;
    reports.forEach((r) => {
      page.drawText(
        `${r.date} | ${r.topic} | ${r.bibleRefs} | ${r.resources} | ${r.remarks}`,
        {
          x: 50,
          y,
          size: 12,
        }
      );
      y -= 20;
    });
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${activeTab}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export DOCX
  const handleDownloadDOCX = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: `Weekly Reports - ${activeTab}`,
              heading: "Heading1",
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    "Date",
                    "Topic",
                    "Bible References",
                    "Resources",
                    "Remarks",
                  ].map(
                    (txt) =>
                      new TableCell({
                        children: [new Paragraph({ text: txt, bold: true })],
                      })
                  ),
                }),
                ...reports.map(
                  (r) =>
                    new TableRow({
                      children: [
                        r.date,
                        r.topic,
                        r.bibleRefs,
                        r.resources,
                        r.remarks,
                      ].map(
                        (txt) =>
                          new TableCell({ children: [new Paragraph(txt)] })
                      ),
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });
    const packer = new Packer();
    const buffer = await packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${activeTab}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Reports</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-purple-100 mb-6 flex flex-wrap">
          {CLASS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="px-4 py-2 rounded-t-lg"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CLASS_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today’s Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {kpi.todayAttendance}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Today’s Offering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {kpi.todayOffering}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {kpi.monthAttendance}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month Offering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {kpi.monthOffering}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Add Report */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-pink-600">
                Weekly Reports
              </h2>
              <div className="flex gap-2">
                <Button
                  className="bg-pink-600 text-white"
                  onClick={() => setOpenAdd(true)}
                >
                  Add Report
                </Button>
                <Button
                  variant="outline"
                  className="border-pink-600 text-pink-600"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button
                  variant="outline"
                  className="border-pink-600 text-pink-600"
                  onClick={handleDownloadDOCX}
                >
                  <Download className="w-4 h-4 mr-2" /> DOCX
                </Button>
              </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Topic/Lesson</th>
                    <th className="p-2 border">Bible References</th>
                    <th className="p-2 border">Resources</th>
                    <th className="p-2 border">Remarks</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" />
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-pink-600">
                        No reports yet.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{r.date}</td>
                        <td className="p-2 border">{r.topic}</td>
                        <td className="p-2 border">{r.bibleRefs}</td>
                        <td className="p-2 border">{r.resources}</td>
                        <td className="p-2 border">{r.remarks}</td>
                        <td className="p-2 border space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-700 border-purple-300"
                            onClick={() => openEditModal(r)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300"
                            onClick={() => handleDelete(r.id)}
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Report Modal */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Weekly Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddReport} className="grid gap-3">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <Input
              placeholder="Topic / Lesson"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              required
            />
            <Input
              placeholder="Bible References"
              value={form.bibleRefs}
              onChange={(e) => setForm({ ...form, bibleRefs: e.target.value })}
              required
            />
            <Input
              placeholder="Resources"
              value={form.resources}
              onChange={(e) => setForm({ ...form, resources: e.target.value })}
            />
            <Textarea
              placeholder="Remarks"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAdd(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-purple-700 text-white"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Report Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="grid gap-3">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <Input
              placeholder="Topic / Lesson"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              required
            />
            <Input
              placeholder="Bible References"
              value={form.bibleRefs}
              onChange={(e) => setForm({ ...form, bibleRefs: e.target.value })}
              required
            />
            <Input
              placeholder="Resources"
              value={form.resources}
              onChange={(e) => setForm({ ...form, resources: e.target.value })}
            />
            <Textarea
              placeholder="Remarks"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEdit(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-purple-700 text-white"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}















