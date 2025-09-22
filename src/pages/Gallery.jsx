// src/pages/Gallery.jsx
import { useState, useEffect } from "react";

export default function Gallery() {
  const [activeTab, setActiveTab] = useState("photos"); // photos | videos
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch gallery items from backend
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`/api/gallery/${activeTab}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMedia(data); // expect [{ id, url, description }]
      } catch (err) {
        console.error(err);
      }
    };
    fetchMedia();
  }, [activeTab]);

  // Upload new media
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("type", activeTab); // backend can separate photos/videos

    try {
      setLoading(true);
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setFile(null);
      setDescription("");
      // refresh list
      const updated = await res.json();
      setMedia((prev) => [updated, ...prev]);
    } catch (err) {
      console.error(err);
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

          {/* Upload Form */}
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
