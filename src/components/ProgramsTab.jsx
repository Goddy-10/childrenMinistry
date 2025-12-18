// src/components/ProgramsTab.jsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button"; // if you have these; else replace with <button>
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext"; // optional; used for token
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Import } from "lucide-react";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDateIso(d) {
  if (!d) return "";
  if (typeof d === "string") return d;
  return new Date(d).toISOString().slice(0, 10);
}

export default function ProgramsTab() {
  const { token } = useAuth(); // optional; useAuth must be provided in your app
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      text: "",
      date: formatDateIso(new Date()),
      coordinator: "",
      files: [],
      saving: false,
      saved: false,
      editing: true,
    },
  ]);
  const [materials, setMaterials] = useState([]); // persisted materials loaded from backend
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const dropRefs = useRef({}); // for multiple row drop zones

  // Fetch existing materials from backend on mount
  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const res = await fetch(`${API}/api/programs/`);
      if (!res.ok) {
        console.warn("Failed to fetch programs");
        setMaterials([]);
        return;
      }
      const data = await res.json();
      // Expect array of { id, text, date, coordinator, files: [{id, url, name, mime}], created_at }
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchMaterials:", err);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Helpers for file previews
  function fileToPreview(file) {
    // file: actual File (local) or server file object with url
    if (!file) return null;
    if (file.url) return file.url; // server-side file object
    return URL.createObjectURL(file);
  }

  const addRow = () => {
    setRows((s) => [
      ...s,
      {
        id: Date.now() + Math.random(),
        text: "",
        date: formatDateIso(new Date()),
        coordinator: "",
        files: [],
        saving: false,
        saved: false,
        editing: true,
      },
    ]);
  };

  const deleteLocalRow = (id) => {
    setRows((s) => s.filter((r) => r.id !== id));
  };

  const handleTextChange = (id, value) => {
    setRows((s) => s.map((r) => (r.id === id ? { ...r, text: value } : r)));
  };
  const handleDateChange = (id, value) => {
    setRows((s) => s.map((r) => (r.id === id ? { ...r, date: value } : r)));
  };
  const handleCoordinatorChange = (id, value) => {
    setRows((s) =>
      s.map((r) => (r.id === id ? { ...r, coordinator: value } : r))
    );
  };

  // Drop handlers
  const onDropFiles = (id, files) => {
    const fileArray = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    })); // wrap so we can access .file easily when sending
    setRows((s) =>
      s.map((r) =>
        r.id === id ? { ...r, files: [...(r.files || []), ...fileArray] } : r
      )
    );
  };

  const handleFileChange = (id, fileList) => {
    onDropFiles(id, fileList);
  };

  const removeLocalFile = (rowId, idx) => {
    setRows((s) =>
      s.map((r) =>
        r.id === rowId
          ? { ...r, files: r.files.filter((_, i) => i !== idx) }
          : r
      )
    );
  };

  // Inline save per row (POST single program)
  const saveRow = async (row) => {
    const { id, text, date, coordinator, files } = row;
    if (!text || text.trim() === "") {
      alert("Description is required");
      return;
    }

    try {
      setRows((s) => s.map((r) => (r.id === id ? { ...r, saving: true } : r)));
      const form = new FormData();
      form.append("text", text);
      if (date) form.append("date", date);
      if (coordinator) form.append("coordinator", coordinator);
      // append files
      (files || []).forEach((f, idx) => {
        // f might be {file, preview} for local; or server files in materials won't be in local row
        if (f.file) {
          form.append("files", f.file, f.file.name);
        }
      });

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/programs/`, {
        method: "POST",
        headers,
        body: form,
      });
      if (!res.ok) {
        const textErr = await res.text();
        throw new Error(textErr || "Failed to save program");
      }

      const saved = await res.json(); // expect saved resource: { id, text, date, coordinator, files: [] }
      // push to materials
      setMaterials((m) => [saved, ...m]);
      // mark row as saved (or remove local row)
      setRows((s) =>
        s.map((r) =>
          r.id === id ? { ...r, saving: false, saved: true, editing: false } : r
        )
      );
    } catch (err) {
      console.error("saveRow:", err);
      alert("Failed to save program: " + (err.message || ""));
      setRows((s) => s.map((r) => (r.id === id ? { ...r, saving: false } : r)));
    }
  };

  // Edit existing material: populate an editable row (create a local row prefilled)
  const startEditMaterial = (material) => {
    const localId = Date.now() + Math.random();
    // convert material.files to local preview objects? keep as server files with url
    const localFiles = (material.files || []).map((f) => ({
      serverId: f.id,
      preview: f.url,
      name: f.name,
      url: f.url,
    }));
    const newRow = {
      id: localId,
      text: material.text || "",
      date: material.date || formatDateIso(new Date()),
      coordinator: material.coordinator || "",
      files: localFiles,
      saving: false,
      saved: false,
      editing: true,
      _editingMaterialId: material.id, // track that this row is editing an existing material
    };
    setRows((s) => [newRow, ...s]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update existing material (PUT)
  const updateRow = async (row) => {
    if (!row._editingMaterialId) {
      // no remote id -> just save as new
      return saveRow(row);
    }

    const materialId = row._editingMaterialId;
    try {
      setRows((s) =>
        s.map((r) => (r.id === row.id ? { ...r, saving: true } : r))
      );
      const form = new FormData();
      form.append("description", row.text);
      if (row.date) form.append("date", row.date);
      if (row.coordinator) form.append("coordinator", row.coordinator);
      // For files: append new files only (server files have serverId)
      (row.files || []).forEach((f) => {
        if (f.file) form.append("files", f.file, f.file.name);
      });

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/programs/${materialId}`, {
        method: "PUT",
        headers,
        body: form,
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const updated = await res.json();
      // replace in materials
      setMaterials((m) => m.map((x) => (x.id === updated.id ? updated : x)));
      // mark row saved or remove
      setRows((s) => s.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error("updateRow:", err);
      alert("Failed to update program: " + (err.message || ""));
      setRows((s) =>
        s.map((r) => (r.id === row.id ? { ...r, saving: false } : r))
      );
    }
  };

  // Delete saved material
  const deleteMaterial = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API}/api/programs/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Delete failed");
      setMaterials((m) => m.filter((mat) => mat.id !== id));
    } catch (err) {
      console.error("deleteMaterial:", err);
      alert("Failed to delete material");
    }
  };

  // Generate DOCX for a material (client-side)
  const downloadDocx = async (material) => {
    try {
      const doc = new DocxDocument({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Program Material`,
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              new Paragraph({ text: `Date: ${material.date || ""}` }),
              new Paragraph({
                text: `Coordinator: ${material.coordinator || ""}`,
              }),
              new Paragraph({ text: `\nDescription:` }),
              new Paragraph({ text: material.text || "" }),
              new Paragraph({ text: `\nAttached files:` }),
              ...(material.files || []).map(
                (f) =>
                  new Paragraph({
                    text: `${f.name || f.filename || f.url || f.path || ""}`,
                  })
              ),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `program-${material.id || "export"}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("downloadDocx:", err);
      alert("Failed to generate DOCX");
    }
  };

  // Generate simple PDF for a material (client-side)
  const downloadPdf = async (material) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let y = 760;
      const draw = (txt, size = 12) => {
        page.drawText(txt, {
          x: 40,
          y,
          size,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        y -= size + 6;
      };
      draw(`Program Material`, 18);
      draw(`Date: ${material.date || ""}`, 12);
      draw(`Coordinator: ${material.coordinator || ""}`, 12);
      draw(``, 8);
      draw(`Description:`, 12);
      // wrap description into lines of ~80 chars
      const desc = (material.text || "").split("\n").join(" ");
      const wrap = (str, n = 80) => {
        const parts = [];
        for (let i = 0; i < str.length; i += n) parts.push(str.slice(i, i + n));
        return parts;
      };
      wrap(desc, 90).forEach((line) => draw(line, 10));
      draw(``, 8);
      draw(`Attached files:`, 12);
      (material.files || []).forEach((f) =>
        draw(`${f.name || f.filename || f.url || ""}`, 10)
      );
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `program-${material.id || "export"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("downloadPdf:", err);
      alert("Failed to generate PDF");
    }
  };

  // Render
  return (
    <div className="p-4 bg-gray-50">
      <h2 className="text-xl font-bold text-pink-600 mb-4">Programs</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
        <table className="w-full border-collapse min-w-[900px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Description</th>
              <th className="p-2 border text-left">Date</th>
              <th className="p-2 border text-left">Coordinator</th>
              <th className="p-2 border text-left">Files</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="align-top hover:bg-gray-50">
                <td className="p-2 border align-top">
                  <Textarea
                    value={row.text}
                    onChange={(e) => handleTextChange(row.id, e.target.value)}
                    className="w-full"
                    placeholder="Enter program details..."
                  />
                </td>
                <td className="p-2 border align-top w-40">
                  <Input
                    type="date"
                    value={row.date}
                    onChange={(e) => handleDateChange(row.id, e.target.value)}
                  />
                </td>
                <td className="p-2 border align-top w-40">
                  <Input
                    value={row.coordinator}
                    onChange={(e) =>
                      handleCoordinatorChange(row.id, e.target.value)
                    }
                    placeholder="Coordinator (optional)"
                  />
                </td>
                <td className="p-2 border align-top">
                  <div
                    ref={(el) => (dropRefs.current[row.id] = el)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onDropFiles(row.id, e.dataTransfer.files);
                    }}
                    className="border-dashed border-2 border-gray-200 p-2 rounded cursor-pointer"
                  >
                    <div className="text-sm text-gray-600 mb-1">
                      Drag & drop files here or
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileChange(row.id, e.target.files)}
                    />
                    {row.files && row.files.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {row.files.map((f, i) => (
                          <div key={i} className="p-1 border rounded">
                            {f.preview ? (
                              // local preview
                              f.file && f.file.type.startsWith("image/") ? (
                                <img
                                  src={f.preview}
                                  alt={f.file.name}
                                  className="h-20 object-cover"
                                />
                              ) : (
                                <div className="text-sm">
                                  {f.file ? f.file.name : f.name}
                                </div>
                              )
                            ) : f.url ? (
                              // server file preview
                              f.url.endsWith(".pdf") ? (
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600"
                                >
                                  Preview PDF
                                </a>
                              ) : (
                                <img
                                  src={f.url}
                                  alt={f.name}
                                  className="h-20 object-cover"
                                />
                              )
                            ) : (
                              <div className="text-sm">File</div>
                            )}
                            <div className="mt-1 text-right">
                              <button
                                className="text-xs text-red-600"
                                onClick={() => removeLocalFile(row.id, i)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2 border text-center align-top">
                  {!row._editingMaterialId ? (
                    <>
                      <button
                        className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
                        onClick={() => saveRow(row)}
                        disabled={row.saving}
                      >
                        {row.saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="bg-gray-200 px-2 py-1 rounded"
                        onClick={() => deleteLocalRow(row.id)}
                      >
                        Discard
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
                        onClick={() => updateRow(row)}
                        disabled={row.saving}
                      >
                        {row.saving ? "Saving..." : "Update"}
                      </button>
                      <button
                        className="bg-gray-200 px-2 py-1 rounded"
                        onClick={() =>
                          setRows((s) => s.filter((r) => r.id !== row.id))
                        }
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 flex gap-3">
          <button
            onClick={addRow}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            + Add Row
          </button>
        </div>
      </div>

      {/* Grid of saved materials */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Materials</h3>
        {loadingMaterials ? (
          <div>Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="text-gray-500">No materials yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {materials.map((m) => (
              <div key={m.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">{m.date}</div>
                    <div className="text-lg font-semibold text-pink-600">
                      {m.coordinator || "—"}
                    </div>
                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {m.description}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(m.files || []).map((f, i) => {
                        const fileUrl = `${API}/uploads/${f.filename}`;
                        const ext = f.file_type;

                        return (
                          <a
                            key={i}
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            {f.filename}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    className="bg-gray-100 px-1 py-1 rounded"
                    onClick={() => startEditMaterial(m)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-50 text-red-600 px-1 py-1 rounded"
                    onClick={() => deleteMaterial(m.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-white border px-1 py-1 rounded"
                    onClick={() => downloadDocx(m)}
                  >
                    Download Dox
                  </button>
                  <button
                    className="bg-white border px-1 py-1 rounded"
                    onClick={() => downloadPdf(m)}
                  >
                    Download Pdf
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
