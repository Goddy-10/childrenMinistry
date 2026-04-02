// import React, { useRef } from "react";
// import QRCode from "react-qr-code";

// export default function MembershipQR() {
//   const qrRef = useRef();

//     // Get the full URL for the membership page
//     const membershipURL = "https://gcc-karama.vercel.app/membership"; //production
// //   const membershipURL = `http://10.122.254.239:5173/membership`; local dev mobile

//   // Convert SVG to Canvas and download
//   const downloadQRCode = () => {
//     try {
//       const svg = qrRef.current?.querySelector("svg");
//       if (!svg) {
//         alert("QR Code not found. Please refresh the page.");
//         return;
//       }

//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       const svgData = new XMLSerializer().serializeToString(svg);
//       const img = new Image();

//       // Set canvas size to match SVG
//       const svgRect = svg.getBoundingClientRect();
//       canvas.width = svgRect.width;
//       canvas.height = svgRect.height;

//       img.onload = () => {
//         ctx.fillStyle = "white";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(img, 0, 0);

//         const link = document.createElement("a");
//         link.href = canvas.toDataURL("image/png");
//         link.download = "membership-qr-code.png";
//         link.click();
//       };

//       img.onerror = () => {
//         alert("Failed to convert QR code to image");
//       };

//       img.src =
//         "data:image/svg+xml;base64," +
//         btoa(unescape(encodeURIComponent(svgData)));
//     } catch (error) {
//       console.error("Download error:", error);
//       alert("Error downloading QR code: " + error.message);
//     }
//   };

//   // Print QR code
//   const printQRCode = () => {
//     try {
//       const svg = qrRef.current?.querySelector("svg");
//       if (!svg) {
//         alert("QR Code not found. Please refresh the page.");
//         return;
//       }

//       const svgData = new XMLSerializer().serializeToString(svg);
//       const img = new Image();

//       img.onload = () => {
//         const printWindow = window.open("", "", "width=800,height=600");
//         if (!printWindow) {
//           alert("Please allow popups for this site to print.");
//           return;
//         }

//         printWindow.document.write(`
//           <html>
//             <head>
//               <title>Membership QR Code</title>
//               <style>
//                 body {
//                   display: flex;
//                   justify-content: center;
//                   align-items: center;
//                   min-height: 100vh;
//                   margin: 0;
//                   font-family: Arial, sans-serif;
//                   background: white;
//                   padding: 20px;
//                 }
//                 .container {
//                   text-align: center;
//                   background: white;
//                   padding: 40px;
//                   border-radius: 10px;
//                   box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//                 }
//                 img {
//                   width: 350px;
//                   height: 350px;
//                   margin: 20px 0;
//                   border: 4px solid #ec4899;
//                   padding: 20px;
//                   background: white;
//                 }
//                 h2 {
//                   margin: 0 0 10px 0;
//                   color: #333;
//                   font-size: 28px;
//                 }
//                 p {
//                   color: #666;
//                   margin: 8px 0;
//                   font-size: 16px;
//                 }
//                 .link {
//                   color: #0066cc;
//                   word-break: break-all;
//                   font-size: 14px;
//                   margin-top: 15px;
//                 }
//                 @media print {
//                   body {
//                     background: white;
//                   }
//                   .container {
//                     box-shadow: none;
//                   }
//                 }
//               </style>
//             </head>
//             <body>
//               <div class="container">
//                 <h2>Church Membership Registration</h2>
//                 <p><strong>Scan this QR code to register as a member</strong></p>
//                 <img src="${img.src}" alt="Membership QR Code" />
//                 <p class="link"><strong>URL:</strong> ${membershipURL}</p>
//               </div>
//             </body>
//           </html>
//         `);
//         printWindow.document.close();
//         printWindow.focus();
//         setTimeout(() => {
//           printWindow.print();
//         }, 300);
//       };

//       img.onerror = () => {
//         alert("Failed to convert QR code for printing");
//       };

//       img.src =
//         "data:image/svg+xml;base64," +
//         btoa(unescape(encodeURIComponent(svgData)));
//     } catch (error) {
//       console.error("Print error:", error);
//       alert("Error printing QR code: " + error.message);
//     }
//   };

//   // Copy QR link to clipboard
//   const copyToClipboard = () => {
//     navigator.clipboard
//       .writeText(membershipURL)
//       .then(() => {
//         alert("✅ Membership link copied to clipboard!");
//       })
//       .catch(() => {
//         alert("Failed to copy link");
//       });
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg p-8 mb-8">
//         <h1 className="text-4xl font-bold mb-2">🔗 Membership QR Code</h1>
//         <p className="text-pink-100 text-lg">
//           Share this QR code for members to register online
//         </p>
//       </div>

//       {/* Main Content */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* QR Code Section */}
//         <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
//           <div
//             ref={qrRef}
//             className="bg-white p-6 rounded-lg border-4 border-pink-600 mb-6"
//           >
//             <QRCode
//               value={membershipURL}
//               size={256}
//               level="H"
//               includeMargin={true}
//               fgColor="#000000"
//               bgColor="#ffffff"
//             />
//           </div>

//         </div>

//         {/* Actions Section */}
//         <div className="space-y-6">
//           {/* Download Options */}
//           <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
//             <h2 className="text-xl font-bold text-blue-900 mb-4">
//               📥 Download QR Code
//             </h2>
//             <p className="text-blue-700 text-sm mb-4">
//               Download the QR code image to print or share digitally
//             </p>
//             <button
//               onClick={downloadQRCode}
//               className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition active:scale-95"
//             >
//               💾 Download QR Code
//             </button>
//           </div>

//           {/* Print Option */}
//           <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
//             <h2 className="text-xl font-bold text-green-900 mb-4">
//               🖨️ Print QR Code
//             </h2>
//             <p className="text-green-700 text-sm mb-4">
//               Print the QR code to display in your church or venue
//             </p>
//             <button
//               onClick={printQRCode}
//               className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition active:scale-95"
//             >
//               🖨️ Print for Display
//             </button>
//           </div>

//           {/* Link Sharing */}
//           <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
//             <h2 className="text-xl font-bold text-purple-900 mb-4">
//               🔗 Share Direct Link
//             </h2>
//             <p className="text-purple-700 text-sm mb-3">
//               Share this link directly with members via WhatsApp, Email, etc:
//             </p>
//             <div className="bg-white p-3 rounded border border-purple-300 mb-3 break-all text-sm font-mono text-gray-700 max-h-24 overflow-y-auto">
//               {membershipURL}
//             </div>
//             <button
//               onClick={copyToClipboard}
//               className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium transition active:scale-95"
//             >
//               📋 Copy Link to Clipboard
//             </button>
//           </div>

//           {/* Instructions */}
        //   <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        //     <h2 className="text-xl font-bold text-yellow-900 mb-4">
        //       📋 How to Use
        //     </h2>
        //     <ol className="text-yellow-800 text-sm space-y-2 list-decimal list-inside">
        //       <li>Click "Download QR Code" button</li>
        //       <li>Print the downloaded image</li>
        //       <li>Display at church entrance or online</li>
        //       <li>Members scan with phone camera</li>
        //       <li>Fill out membership form</li>
        //       <li>Data saved to database automatically</li>
        //     </ol>
        //   </div>

        //   {/* Placement Tips */}
        //   <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
        //     <h2 className="text-xl font-bold text-gray-900 mb-4">
        //       💡 Best Placement Ideas
        //     </h2>
        //     <ul className="text-gray-700 text-sm space-y-2">
        //       <li>✓ Print at A4 size and place at church entrance</li>
        //       <li>✓ Display on projection screens during service</li>
        //       <li>✓ Share on WhatsApp, Facebook, Telegram</li>
        //       <li>✓ Include in church newsletter/bulletin</li>
        //       <li>✓ Add to welcome packs for new visitors</li>
        //       <li>✓ Post on notice boards or walls</li>
        //     </ul>
        //   </div>
//         </div>
//       </div>

//       {/* Footer Info */}
//       <div className="mt-12 bg-gray-100 rounded-lg p-6 text-center text-gray-600 text-sm">
//         <p className="mb-2">
//           📱 <strong>Mobile-friendly:</strong> Optimized for all devices
//         </p>

//       </div>
//     </div>
//   );
// }

import React, { useRef } from "react";
import { QRCode } from "react-qr-code";

export default function MembershipQR() {
  const qrRef = useRef();

  // ✅ PRODUCTION - Hardcoded (currently active)
  const membershipURL = "https://gcc-karama.vercel.app/membership";

  // ✅ DEVELOPMENT - Use one of these by commenting/uncommenting:

  // For local dev (desktop only):
  // const membershipURL = `${window.location.origin}/membership`;

  // For mobile testing on LAN IP:
  // const membershipURL = "http://10.122.254.239:5173/membership";

  // For environment variable (add to .env):
  // const membershipURL = import.meta.env.VITE_MEMBERSHIP_URL || "https://gcc-karama.vercel.app/membership";

  // Download QR code
  const downloadQRCode = () => {
    try {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) {
        alert("QR Code not found. Please refresh the page.");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      const svgRect = svg.getBoundingClientRect();
      canvas.width = svgRect.width;
      canvas.height = svgRect.height;

      img.onload = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "membership-qr-code.png";
        link.click();
      };

      img.onerror = () => {
        alert("Failed to convert QR code to image");
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading QR code: " + error.message);
    }
  };

  // Print QR code
  const printQRCode = () => {
    try {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) {
        alert("QR Code not found. Please refresh the page.");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        const printWindow = window.open("", "", "width=800,height=600");
        if (!printWindow) {
          alert("Please allow popups for this site to print.");
          return;
        }

        printWindow.document.write(`
          <html>
            <head>
              <title>Membership QR Code</title>
              <style>
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  font-family: Arial, sans-serif;
                  background: white;
                  padding: 20px;
                }
                .container {
                  text-align: center;
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                img {
                  width: 350px;
                  height: 350px;
                  margin: 20px 0;
                  border: 4px solid #ec4899;
                  padding: 20px;
                  background: white;
                }
                h2 {
                  margin: 0 0 10px 0;
                  color: #333;
                  font-size: 28px;
                }
                p {
                  color: #666;
                  margin: 8px 0;
                  font-size: 16px;
                }
                .link {
                  color: #0066cc;
                  word-break: break-all;
                  font-size: 14px;
                  margin-top: 15px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Church Membership Registration</h2>
                <p><strong>Scan this QR code to register as a member</strong></p>
                <img src="${img.src}" alt="Membership QR Code" />
                <p class="link"><strong>URL:</strong> ${membershipURL}</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      };

      img.onerror = () => {
        alert("Failed to convert QR code for printing");
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error("Print error:", error);
      alert("Error printing QR code: " + error.message);
    }
  };

  // Copy QR link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(membershipURL)
      .then(() => {
        alert("✅ Membership link copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy link");
      });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-2">🔗 Membership QR Code</h1>
        <p className="text-pink-100 text-lg">
          Share this QR code for members to register online
        </p>
      </div>

      {/* URL Display */}
      <div className="bg-blue-100 border-l-4 border-blue-600 p-4 mb-6">
        <p className="text-blue-900 font-medium">
          📍 QR Code URL:{" "}
          <code className="bg-white px-2 py-1 rounded">{membershipURL}</code>
        </p>
        <p className="text-blue-700 text-sm mt-2">
          ✅ This URL points to the membership registration form
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
          <div
            ref={qrRef}
            className="bg-white p-6 rounded-lg border-4 border-pink-600 mb-6"
          >
            <QRCode
              value={membershipURL}
              size={256}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          <p className="text-center text-gray-600 mb-4 text-sm font-medium">
            📱 High-quality QR code for long-distance scanning
          </p>

          <div className="text-center text-xs text-gray-500 mb-6 space-y-1">
            <p>✅ Scannable from 5+ meters away</p>
            <p>✅ Works on all smartphones</p>
            <p>✅ No app installation required</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="space-y-6">
          {/* Download Options */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              📥 Download QR Code
            </h2>
            <p className="text-blue-700 text-sm mb-4">
              Download the QR code image to print or share digitally
            </p>
            <button
              onClick={downloadQRCode}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              💾 Download QR Code
            </button>
          </div>

          {/* Print Option */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">
              🖨️ Print QR Code
            </h2>
            <p className="text-green-700 text-sm mb-4">
              Print the QR code to display in your church or venue
            </p>
            <button
              onClick={printQRCode}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition"
            >
              🖨️ Print for Display
            </button>
          </div>

          {/* Link Sharing */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">
              🔗 Share Direct Link
            </h2>
            <p className="text-purple-700 text-sm mb-3">
              Share this link directly with members via WhatsApp, Email, etc:
            </p>
            <div className="bg-white p-3 rounded border border-purple-300 mb-3 break-all text-sm font-mono text-gray-700 max-h-24 overflow-y-auto">
              {membershipURL}
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium transition"
            >
              📋 Copy Link to Clipboard
            </button>
          </div>
          {/* Placement Tips */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              💡 Best Placement Ideas
            </h2>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>✓ Print at A4 size and place at church entrance</li>
              <li>✓ Display on projection screens during service</li>
              <li>✓ Share on WhatsApp, Facebook, Telegram</li>
              <li>✓ Include in church newsletter/bulletin</li>
              <li>✓ Add to welcome packs for new visitors</li>
              <li>✓ Post on notice boards or walls</li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-yellow-900 mb-4">
                📋 How to Use
              </h2>
              <ol className="text-yellow-800 text-sm space-y-2 list-decimal list-inside">
                <li>Click "Download QR Code" button</li>
                <li>Print the downloaded image</li>
                <li>Display at church entrance or online</li>
                <li>Members scan with phone camera</li>
                <li>Fill out membership form</li>
                <li>Data saved to database automatically</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 bg-gray-100 rounded-lg p-6 text-center text-gray-600 text-sm">
        <p className="mb-2">
          📱 <strong>Mobile-friendly:</strong> Optimized for all devices
        </p>
        <p>
          ✅ <strong>Current URL:</strong> {membershipURL}
        </p>
      </div>
    </div>
  );
}