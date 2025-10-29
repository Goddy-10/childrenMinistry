// src/pages/Events.jsx
import { useState } from "react";
import AddEventModal from "../components/AddEventModal";
import { useAuth } from "@/context/AuthContext";

export default function Events() {
  const { user } = useAuth(); // ✅ get logged-in user
  const [events, setEvents] = useState([]); 
  const [filter, setFilter] = useState("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 Filter events by date
  const now = new Date();
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return filter === "upcoming" ? eventDate >= now : eventDate < now;
  });

  // 🔹 Sort events (by date ascending for upcoming, descending for past)
  filteredEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return filter === "upcoming" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-2xl">
        {/* Title */}
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Events</h2>

        {/* Filter */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "upcoming"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "past"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500">No {filter} events yet.</p>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 shadow-sm bg-gray-50 hover:bg-gray-100 transition"
              >
                <h3 className="text-lg font-semibold text-pink-700">
                  {event.headline}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(event.date).toDateString()}
                </p>
                <p className="mt-2">{event.message}</p>

                {/* Media Preview */}
                <div className="mt-2 flex gap-2 flex-wrap">
                  {event.media?.map((file, i) =>
                    file.type.startsWith("image/") ? (
                      <img
                        key={i}
                        src={file.url}
                        alt="event media"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    ) : file.type.startsWith("video/") ? (
                      <video
                        key={i}
                        src={file.url}
                        controls
                        className="w-48 h-32 rounded-lg"
                      />
                    ) : (
                      <a
                        key={i}
                        href={file.url}
                        download
                        className="text-blue-600 underline"
                      >
                        Download {file.name}
                      </a>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Add Event Button (visible to admins only) */}
        {user?.role === "admin" && (
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg shadow hover:bg-pink-700 transition"
            >
              + Add Event
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddEventModal
          onClose={() => setIsModalOpen(false)}
          onSave={(newEvent) => {
            setEvents([...events, newEvent]);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
