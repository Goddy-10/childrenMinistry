import React, { useState } from "react";

const ProgramsTab = () => {
  const [rows, setRows] = useState([{ id: Date.now(), text: "", files: [] }]);

  const handleTextChange = (id, value) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, text: value } : row)));
  };

  const handleFileChange = (id, files) => {
    const fileArray = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file), // Temporary preview URL
    }));
    setRows(
      rows.map((row) => (row.id === id ? { ...row, files: fileArray } : row))
    );
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), text: "", files: [] }]);
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const saveData = async () => {
    // 🔹 Backend ready: send with FormData
    const formData = new FormData();
    rows.forEach((row, idx) => {
      formData.append(`programs[${idx}][text]`, row.text);
      row.files.forEach((f, fIdx) => {
        formData.append(`programs[${idx}][files][${fIdx}]`, f.file);
      });
    });

    // Example: POST to backend (Flask route later)
    // await fetch("http://localhost:5000/api/programs", {
    //   method: "POST",
    //   body: formData,
    // });

    console.log("Data ready to send:", rows);
    alert("Data prepared for backend upload!");
  };

  const downloadData = () => {
    const csvRows = [
      ["Description", "Files"],
      ...rows.map((row) => [
        `"${row.text}"`,
        row.files.map((f) => f.file.name).join("; "),
      ]),
    ];
    const csvString = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "programs.csv";
    a.click();
  };

  const printTable = () => {
    const printContent = document.getElementById("programs-table").outerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Programs</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #000; padding: 8px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderPreview = (fileObj) => {
    const file = fileObj.file;
    const url = fileObj.url;
    if (file.type.startsWith("image/")) {
      return (
        <img src={url} alt={file.name} className="h-20 mt-2 border rounded" />
      );
    } else if (file.type.startsWith("audio/")) {
      return <audio controls src={url} className="mt-2 w-40" />;
    } else if (file.type.startsWith("video/")) {
      return <video controls src={url} className="mt-2 w-40 h-24" />;
    } else if (file.type === "application/pdf") {
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline mt-2 block"
        >
          Preview PDF
        </a>
      );
    } else {
      return (
        <a
          href={url}
          download={file.name}
          className="text-blue-600 underline mt-2 block"
        >
          Download {file.name}
        </a>
      );
    }
  };

  return (
    <div className="programs-tab">
      <h2 className="text-lg font-bold mb-4">Programs</h2>

      <table id="programs-table" className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Files</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={row.text}
                  onChange={(e) => handleTextChange(row.id, e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="Enter program details..."
                />
              </td>

              <td className="border px-4 py-2">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(row.id, e.target.files)}
                />
                {row.files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {row.files.map((f, i) => (
                      <div key={i}>{renderPreview(f)}</div>
                    ))}
                  </div>
                )}
              </td>

              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => deleteRow(row.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-3 flex-wrap">
        <button
          onClick={addRow}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add Row
        </button>

        <button
          onClick={saveData}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save
        </button>

        <button
          onClick={downloadData}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          Download
        </button>

        <button
          onClick={printTable}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default ProgramsTab;
