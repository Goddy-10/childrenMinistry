


// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [mediaItems, setMediaItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch featured media for homepage slideshow
  useEffect(() => {
    const fetchFeaturedMedia = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/media/slides", {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch featured media");
        const data = await res.json();
        setMediaItems(data);
      } catch (err) {
        console.error("Error fetching featured media:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMedia();
  }, [token]);

  // Auto-slide logic
  useEffect(() => {
    if (paused || mediaItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % mediaItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [mediaItems.length, paused]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % mediaItems.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);

  return (
    <div className="min-h-screen bg-gray-500 pt-4 px-4 md:px-6 flex items-center justify-center">
      {/* Floating Card */}
      <div className="bg-white w-full max-w-7xl min-h-[84vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Title strip */}
        <div className="bg-pink-600 text-white px-6 py-4 md:py-6 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-center flex-1">
            THE POTTER`S CENTER
          </h2>

          {/* Admin-only buttons */}
          {user?.role === "admin" && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/gallery")}
                className="bg-white text-pink-600 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              >
                Add Media
              </button>
              <button
                onClick={() => navigate("/gallery")}
                className="bg-white text-pink-600 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              >
                View All
              </button>
            </div>
          )}
        </div>

        {/* Body: slideshow */}
        <div
          className="relative p-6 md:p-10 flex-grow"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loading ? (
            <p className="text-center text-gray-500">Loading media...</p>
          ) : mediaItems.length === 0 ? (
            <p className="text-center text-gray-600">
              No featured media yet. Admins can mark media as featured in the Gallery.
            </p>
          ) : (
            <div className="relative h-[28rem] rounded-xl overflow-hidden">
              {mediaItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    idx === current ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.media_type === "image" ? (
                    <img
                      src={item.file_url || item.url}
                      alt={item.description || "Media"}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <video
                      src={item.file_url || item.url}
                      controls
                      className="w-full h-full object-cover rounded-xl"
                    />
                  )}
                  {item.description && (
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigation arrows */}
          {mediaItems.length > 1 && (
            <>
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
            </>
          )}

          {/* Dots */}
          {mediaItems.length > 1 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
