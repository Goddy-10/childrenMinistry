// src/pages/VisitorQRCode.jsx
import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function VisitorQRCode() {
  const containerRef = useRef(null);
  // builds the link to the visitor form relative to current origin
  const visitorFormUrl = `${window.location.origin}/visitor-form`;

  // download canvas as PNG
  const downloadPNG = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) {
      alert("QR not ready yet, try again in a moment.");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "visitor-qr.png";
    a.click();
  };

  // open a print-only window containing the QR and auto-print
  const printQR = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) {
      alert("QR not ready yet, try again in a moment.");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) {
      alert("Pop-up blocked. Allow pop-ups or use the Download button.");
      return;
    }

    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Visitor QR</title>
          <style>
            body { font-family: system-ui, sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; color:#111827; }
            h1 { color:#be185d; } /* pink-600-ish */
            p { color:#374151; }
            img { margin-top:12px; max-width:80vw; }
            a { color:#7c3aed; text-decoration:underline; }
          </style>
        </head>
        <body>
          <h1>Visitor Registration</h1>
          <p>Scan this QR or open the link: <a href="${visitorFormUrl}">${visitorFormUrl}</a></p>
          <img src="${dataUrl}" alt="Visitor QR" />
          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); }, 300);
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center p-6 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Visitor QR Code
        </h2>

        <div
          ref={containerRef}
          className="inline-block bg-white p-4 rounded-lg border border-gray-200"
        >
          {/* renderAs="canvas" so we can export as PNG */}
          <QRCodeCanvas value={"http://10.217.201.239:5173/visitor-form"} size={220} />
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Point visitors to this QR (or copy the link below):
        </p>

        <p className="text-xs text-gray-500 break-words mt-2">
          {visitorFormUrl}
        </p>

        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={downloadPNG}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:brightness-95"
          >
            Download PNG
          </button>

          <button
            onClick={printQR}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:brightness-95"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
