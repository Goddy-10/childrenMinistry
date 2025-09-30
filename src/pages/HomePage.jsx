


















// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


export default function HomePage() {
  // Simulate logged-in role (later will come from backend auth)
  const { user } = useAuth(); // change to "teacher" or "guest" to test restrictions

  const [mediaItems, setMediaItems] = useState([
    { type: "image", url: "/images/sample1.jpg", description: "Sunday Service" },
    { type: "image", url: "/images/sample2.jpg", description: "Youth Meeting" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMedia, setNewMedia] = useState({
    headline: "",
    description: "",
    file: null,
  });

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto slide
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % mediaItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [mediaItems.length, paused]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % mediaItems.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMedia.file) return;

    const fileUrl = URL.createObjectURL(newMedia.file);
    const type = newMedia.file.type.startsWith("video") ? "video" : "image";

    setMediaItems([
      ...mediaItems,
      { type, url: fileUrl, description: newMedia.description },
    ]);

    setNewMedia({ headline: "", description: "", file: null });
    setIsModalOpen(false);

    // ✅ Later: send to backend API
  };

  return (
    <div className="min-h-screen bg-gray-500 pt-4 px-4 md:px-6 flex items-center justify-center">
      {/* Floating Card */}
      <div className="bg-white w-full max-w-7xl min-h-[75vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Title strip */}
        <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold">
            Welcome to Grace Celebration Chapel - Karama
          </h2>

          {/* Admin-only add button */}
          {user?.role === "admin" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-pink-600 px-4 py-2 rounded-lg shadow hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus size={18} /> Add Media
            </button>
          )}
        </div>

        {/* Body: slideshow */}
        <div
          className="relative p-6 md:p-10 flex-grow"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-96 rounded-xl overflow-hidden">
            {mediaItems.map((item, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  idx === current ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.description}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <video
                    controls
                    className="w-full h-full object-cover rounded-xl"
                  >
                    <source src={item.url} />
                    Your browser does not support video.
                  </video>
                )}
                {item.description && (
                  <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {mediaItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full ${
                  current === idx ? "bg-pink-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Add Media */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-pink-600">Add New Media</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-gray-500 hover:text-red-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Headline"
                value={newMedia.headline}
                onChange={(e) =>
                  setNewMedia({ ...newMedia, headline: e.target.value })
                }
                className="border p-2 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={newMedia.description}
                onChange={(e) =>
                  setNewMedia({ ...newMedia, description: e.target.value })
                }
                className="border p-2 rounded-lg"
              />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) =>
                  setNewMedia({ ...newMedia, file: e.target.files[0] })
                }
                className="border p-2 rounded-lg"
              />
              <button
                type="submit"
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
              >
                Save Media
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
