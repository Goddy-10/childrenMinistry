







// // src/pages/Gallery.jsx
// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext"; // adjust path if your context is elsewhere

// export default function Gallery() {
//   const { user, token } = useAuth();
//   const [activeTab, setActiveTab] = useState("photos"); // photos | videos
//   const [media, setMedia] = useState([]);
//   const [file, setFile] = useState(null);
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Fetch gallery items from backend
//   useEffect(() => {
//     const fetchMedia = async () => {
//       try {
//         const res = await fetch(`/api/gallery/${activeTab}`);
//         if (!res.ok) throw new Error("Failed to fetch gallery");
//         const data = await res.json();
//         setMedia(data);
//       } catch (err) {
//         console.error("Gallery fetch error:", err);
//       }
//     };
//     fetchMedia();
//   }, [activeTab]);

//   // Upload media (admin only)
//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!file) return;

//     if (!user || user.role !== "admin") {
//       alert("Only admins can upload files.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("description", description);
//     formData.append("type", activeTab);

//     try {
//       setLoading(true);
//       const res = await fetch("/api/gallery/upload", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`, // send JWT
//         },
//         body: formData,
//       });

//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.error || "Upload failed");
//       }

//       const newMedia = await res.json();
//       setMedia((prev) => [newMedia, ...prev]);
//       setFile(null);
//       setDescription("");
//     } catch (err) {
//       console.error("Gallery upload error:", err);
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-500 flex pt-20 px-4 md:px-6 items-start justify-center">
//       <div className="bg-white w-full md:w-3/4 max-w-6xl min-h-[70vh] rounded-2xl shadow-2xl overflow-hidden">
//         {/* Title */}
//         <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6">
//           <h2 className="text-xl md:text-2xl font-bold">Gallery</h2>
//         </div>

//         <div className="p-6 md:p-8">
//           {/* Tabs */}
//           <div className="flex gap-4 border-b border-neutral/40 pb-2 mb-4">
//             <button
//               onClick={() => setActiveTab("photos")}
//               className={`px-4 py-2 rounded-lg font-medium transition ${
//                 activeTab === "photos"
//                   ? "bg-pink-600 text-white shadow"
//                   : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//               }`}
//             >
//               Photos
//             </button>
//             <button
//               onClick={() => setActiveTab("videos")}
//               className={`px-4 py-2 rounded-lg font-medium transition ${
//                 activeTab === "videos"
//                   ? "bg-pink-600 text-white shadow"
//                   : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//               }`}
//             >
//               Videos
//             </button>
//           </div>

//           {/* Upload Form (admin only) */}
//           {user?.role === "admin" && (
//             <form
//               onSubmit={handleUpload}
//               className="flex flex-col md:flex-row gap-4 items-start mb-6"
//             >
//               <input
//                 type="file"
//                 accept={activeTab === "photos" ? "image/*" : "video/*"}
//                 onChange={(e) => setFile(e.target.files[0])}
//                 className="block w-full md:w-auto"
//               />
//               <input
//                 type="text"
//                 placeholder="Short description..."
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//               />
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
//               >
//                 {loading ? "Uploading..." : "Upload"}
//               </button>
//             </form>
//           )}

//           {/* Media Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {media.length === 0 && (
//               <p className="text-gray-600">No {activeTab} uploaded yet.</p>
//             )}
//             {media.map((item) => (
//               <div
//                 key={item.id}
//                 className="bg-gray-100 rounded-lg overflow-hidden shadow"
//               >
//                 {activeTab === "photos" ? (
//                   <img
//                     src={item.url}
//                     alt={item.description}
//                     className="w-full h-48 object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={item.url}
//                     controls
//                     className="w-full h-48 object-cover"
//                   />
//                 )}
//                 <div className="p-3 text-sm text-gray-700">
//                   {item.description}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

















// src/pages/Gallery.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Gallery() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("photos"); // photos | videos
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch gallery items from backend
  useEffect(() => {
    if (!token) return; // wait until token exists

    const fetchMedia = async () => {
      try {
        const res = await fetch(`/api/gallery/${activeTab}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch gallery");
        }

        const data = await res.json();
        setMedia(data);
      } catch (err) {
        console.error("Gallery fetch error:", err);
      }
    };

    fetchMedia();
  }, [activeTab, token]);

  // Upload media (admin only)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    if (!user || user.role !== "admin") {
      alert("Only admins can upload files.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("type", activeTab);

    try {
      setLoading(true);
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // send JWT
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const newMedia = await res.json();
      setMedia((prev) => [newMedia, ...prev]);
      setFile(null);
      setDescription("");
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 flex pt-20 px-4 md:px-6 items-start justify-center">
      <div className="bg-white w-full md:w-3/4 max-w-6xl min-h-[70vh] rounded-2xl shadow-2xl overflow-hidden">
        {/* Title */}
        <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-bold">Gallery</h2>
        </div>

        <div className="p-6 md:p-8">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-neutral/40 pb-2 mb-4">
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "photos"
                  ? "bg-pink-600 text-white shadow"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "videos"
                  ? "bg-pink-600 text-white shadow"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Videos
            </button>
          </div>

          {/* Upload Form (admin only) */}
          {user?.role === "admin" && (
            <form
              onSubmit={handleUpload}
              className="flex flex-col md:flex-row gap-4 items-start mb-6"
            >
              <input
                type="file"
                accept={activeTab === "photos" ? "image/*" : "video/*"}
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full md:w-auto"
              />
              <input
                type="text"
                placeholder="Short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>
          )}

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {media.length === 0 && (
              <p className="text-gray-600">No {activeTab} uploaded yet.</p>
            )}
            {media.map((item) => (
              <div
                key={item.id}
                className="bg-gray-100 rounded-lg overflow-hidden shadow"
              >
                {activeTab === "photos" ? (
                  <img
                    src={item.url}
                    alt={item.description}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-3 text-sm text-gray-700">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}