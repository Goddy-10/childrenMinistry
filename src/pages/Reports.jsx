





import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit, Trash, Download, Loader2 } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, Table, TableCell, TableRow,TextRun } from "docx";




const API = "http://localhost:5000"; // backend API

const CLASS_TABS = [
  { id: "gifted", label: "Gifted Brains (0–3)" },
  { id: "beginners", label: "Beginners (3–6)" },
  { id: "shinners", label: "Shinners (6–9)" },
  { id: "conquerors", label: "Conquerors (9–13)" },
  { id: "teens", label: "Teens (13+)" },
];

export default function Reports() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("gifted");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);


  

  const blankForm = {
    date: "",
    topic: "",
    bibleRefs: "",
    resources: "",
    remarks: "",
  };
  const [form, setForm] = useState(blankForm);

  // KPI from backend
  const [kpi, setKpi] = useState({
    todays_attendance: 0,
    todays_offering: 0,
    month_attendance: 0,
    month_offering: 0,
  });

  // Fetch reports from backend
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/reports/weekly?class_id=${classMap[activeTab]}`
      );
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      const mapped = data.map((r) => ({
        id: r.id,
        date: r.date,
        topic: r.topic || "",
        bible_reference: r.bible_reference || "",
        resources: r.resources || "",
        remarks: r.remarks || "",
      }));
      setReports(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch KPI from backend
  const fetchKpi = async () => {
    try {
      const res = await fetch(`${API}/api/reports/kpi?class_id=${classMap[activeTab]}`);
      if (!res.ok) throw new Error("Failed to fetch KPI");
      const data = await res.json();
      setKpi(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchKpi();
  }, [activeTab]);


  //--------Map class to Integers-----//

  const classMap = {
    gifted: 1,
    beginners: 2,
    shinners: 3,
    conquerors: 4,
    teens: 5,
  };


  // Add report
  const handleAddReport = async (e) => {
    

    e.preventDefault();
    console.log(classMap, activeTab, classMap[activeTab]);
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      // if (!token) {
      //   alert("You are not logged in!");
      //   return;
      // }
      const res = await fetch(`${API}/api/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: form.date,
          topic: form.topic,
          bible_reference: form.bibleRefs,
          resources: form.resources,
          remarks: form.remarks,
          class_id: classMap[activeTab],
          
        }),
      });
      if (!res.ok) throw new Error("Failed to save report");
      setForm(blankForm);
      setOpenAdd(false);
      fetchReports();
      fetchKpi();
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
      bibleRefs: report.bible_reference,
      resources: report.resources,
      remarks: report.remarks,
    });
    setOpenEdit(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/reports/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`,
         },
        body: JSON.stringify({
          date: form.date,
          topic: form.topic,
          bible_reference: form.bibleRefs,
          resources: form.resources,
          remarks: form.remarks,
          class_id: classMap[activeTab],
        }),
      });
      if (!res.ok) throw new Error("Failed to update report");
      setForm(blankForm);
      setEditingId(null);
      setOpenEdit(false);
      fetchReports();
      fetchKpi();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Delete report
  // const handleDelete = async (id) => {
  //   if (!window.confirm("Delete this report?")) return;
  //   try {
  //     const res = await fetch(`${API}/api/reports/${id}`, { method: "DELETE" });
  //     if (!res.ok) throw new Error("Delete failed");
  //     fetchReports();
  //     fetchKpi();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

   // get token from AuthContext

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const res = await fetch(`${API}/api/reports/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ add this
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchReports();
      fetchKpi();
    } catch (err) {
      console.error(err);
    }
  };



  // Export PDF
const handleDownloadPDF = async () => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);

  //-------church logo here------#

  // ✅ Load church logo
  try {
    const logoUrl =
      "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/80a862e1f2bbb064e527baa285917059~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=705fe0c1&x-expires=1764000000&x-signature=%2Fdskb6riGVSiFPzodVdU%2BX4%2FrFY%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva";

    const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedJpg(logoBytes); // ✅ keep as JPG
    const logoDims = logoImage.scale(0.38); // shrink so it fits

    // ✅ Draw logo at the top center
    page.drawImage(logoImage, {
      x: (600 - logoDims.width) / 5,
      y: 745, // slightly below top
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (err) {
    console.warn("⚠️ Logo failed to load:", err);
  }

  //-------church logo here------#

  const fontSize = 10;
  const rowHeight = 40; // taller to allow wrapped text

  // Title
  page.drawText(`Weekly Reports - ${activeTab}`, {
    x: 180,
    y: 770,
    size: 20,
    color: rgb(0.6, 0, 0.6),
  });

  // Starting Y
  let y = 740;

  // Column widths
  const colWidths = [70, 110, 120, 110, 120]; // ADJUST HERE IF NEEDED
  const colX = [50, 120, 230, 350, 460];

  // Helper to wrap text
  const wrapText = (text, maxChars) => {
    if (!text) return [""];
    const words = text.split(" ");
    const lines = [];
    let line = "";

    words.forEach((w) => {
      if ((line + w).length > maxChars) {
        lines.push(line.trim());
        line = w + " ";
      } else {
        line += w + " ";
      }
    });
    lines.push(line.trim());
    return lines;
  };

  // ✅ Draw header row with borders
  const headers = ["Date", "Topic", "Bible Ref", "Resources", "Remarks"];

  headers.forEach((h, i) => {
    // border
    page.drawRectangle({
      x: colX[i],
      y: y - rowHeight,
      width: colWidths[i],
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // text
    page.drawText(h, {
      x: colX[i] + 4,
      y: y - 15,
      size: fontSize,
    });
  });

  y -= rowHeight;

  // ✅ Table rows
  reports.forEach((r) => {
    if (y < 60) {
      page = pdfDoc.addPage([600, 800]);
      y = 750;
    }

    const rowValues = [
      r.date || "",
      r.topic || "",
      r.bible_reference || "",
      r.resources || "",
      r.remarks || "",
    ];

    rowValues.forEach((val, i) => {
      const lines = wrapText(val, 20); // wrap limit per cell

      // border
      page.drawRectangle({
        x: colX[i],
        y: y - rowHeight,
        width: colWidths[i],
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // text
      lines.slice(0, 2).forEach((line, li) => {
        page.drawText(line, {
          x: colX[i] + 4,
          y: y - 15 - li * 12,
          size: fontSize,
        });
      });
    });

    y -= rowHeight;
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

  //----Export DOCX-----#

 const handleDownloadDOCX = async () => {
   try {
     // ✅ Build rows FIRST (like your working example)
     const tableRows = [
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
               children: [
                 new Paragraph({
                   children: [
                     new TextRun({ text: txt, bold: true }), // ✅ REAL bold
                   ],
                 }),
               ],
             })
         ),
       }),

       ...reports.map(
         (r) =>
           new TableRow({
             children: [
               r.date,
               r.topic,
               r.bible_reference,
               r.resources,
               r.remarks,
             ].map(
               (txt) =>
                 new TableCell({
                   children: [new Paragraph(txt || "")],
                 })
             ),
           })
       ),
     ];

     // ✅ Same as working snippet
     const doc = new Document({
       sections: [
         {
           properties: {},
           children: [
             new Paragraph({
               text: `Weekly Reports - ${activeTab}`,
               heading: "Heading1",
             }),
             new Table({
               rows: tableRows,
               width: { size: 100, type: "pct" }, // ✅ matching working code
             }),
           ],
         },
       ],
     });

     const blob = await Packer.toBlob(doc);
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = `reports-${activeTab}.docx`;
     a.click();
     window.URL.revokeObjectURL(url);
   } catch (err) {
     console.error("DOCX download failed:", err);
   }
 };
  //------RETURN JSX--------#

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
                    {kpi.todays_attendance}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Today’s Offering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {kpi.todays_offering}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {kpi.month_attendance}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month Offering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">
                    {kpi.month_offering}
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
                        <td className="p-2 border">{r.bible_reference}</td>
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