// src/pages/Events.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// ==================== ADD EVENT MODAL COMPONENT ====================
function AddEventModal({ onClose, onSave, isLoading }) {
  const [headline, setHeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia(files);

    const previews = files.map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setMediaPreviews(previews);
  };

  const handleSubmit = async () => {
    if (!headline || !startDate) {
      alert("Headline and Start Date are required");
      return;
    }

    // If multi-day, ensure end_date >= start_date
    if (endDate && new Date(endDate) < new Date(startDate)) {
      alert("End date must be after start date");
      return;
    }

    await onSave({
      headline,
      start_date: startDate,
      end_date: endDate || startDate, // Use start_date if no end_date
      message,
      media,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-pink-600">
          Add New Event
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {/* Headline Input */}
          <input
            type="text"
            placeholder="Event Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-600 disabled:bg-gray-100"
          />

          {/* Start Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-600 disabled:bg-gray-100"
            />
          </div>

          {/* End Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
              min={startDate}
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-600 disabled:bg-gray-100"
            />
          </div>

          {/* Message/Description */}
          <textarea
            placeholder="Event Description / Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-600 disabled:bg-gray-100 resize-none"
          />

          {/* File Upload */}
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            multiple
            onChange={handleFileChange}
            disabled={isLoading}
            className="w-full text-sm disabled:opacity-50"
          />

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="border-t border-gray-200 pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Selected Files ({mediaPreviews.length})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {mediaPreviews.map((file, i) =>
                  file.type.startsWith("image/") ? (
                    <div
                      key={i}
                      className="relative bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  ) : file.type.startsWith("video/") ? (
                    <div
                      key={i}
                      className="relative bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <video
                        src={file.url}
                        className="w-full h-16 sm:h-20 rounded-lg border border-gray-200 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="text-white text-lg">▶️</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="bg-gray-100 p-2 rounded-lg border border-gray-200 flex flex-col items-center justify-center h-16 sm:h-20"
                    >
                      <p className="text-lg sm:text-xl">📄</p>
                      <p className="text-xs text-gray-600 truncate text-center max-w-16">
                        {file.name}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition text-sm sm:text-base font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Saving...</span>
              </>
            ) : (
              "Save Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN EVENTS PAGE COMPONENT ====================
export default function Events() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("current");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/events`);
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // ✅ Categorize events into Current, Upcoming, and Past
  const categorizeEvents = () => {
    const now = new Date();
    let current = [];
    let upcoming = [];
    let past = [];

    events.forEach((event) => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date || event.start_date);

      if (startDate <= now && now <= endDate) {
        // Event is currently happening
        current.push(event);
      } else if (startDate > now) {
        // Event is in the future
        upcoming.push(event);
      } else {
        // Event is in the past
        past.push(event);
      }
    });

    // Sort each category
    current.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    upcoming.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    past.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    return { current, upcoming, past };
  };

  const { current, upcoming, past } = categorizeEvents();

  const getFilteredEvents = () => {
    switch (filter) {
      case "current":
        return current;
      case "upcoming":
        return upcoming;
      case "past":
        return past;
      default:
        return [];
    }
  };

  const handleSaveEvent = async (eventData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("headline", eventData.headline);
      formData.append("start_date", eventData.start_date);
      formData.append("end_date", eventData.end_date);
      formData.append("message", eventData.message);

      if (eventData.media && eventData.media.length > 0) {
        eventData.media.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetch(`${API}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save event");
      }

      const savedEvent = await response.json();
      setEvents([...events, savedEvent]);
      setIsModalOpen(false);
      alert("Event saved successfully! ✅");
    } catch (err) {
      console.error("Error saving event:", err);
      setError(err.message || "Error saving event");
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${API}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents(events.filter((e) => e.id !== eventId));
      alert("Event deleted successfully! ✅");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const filteredEvents = getFilteredEvents();

  // Helper function to format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate || startDate);

    if (start.toDateString() === end.toDateString()) {
      return start.toDateString();
    }
    return `${start.toDateString()} - ${end.toDateString()}`;
  };

  // Helper function to get event status badge
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || event.start_date);

    if (startDate <= now && now <= endDate) {
      return (
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
          🔴 LIVE NOW
        </span>
      );
    } else if (startDate > now) {
      return (
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
          📅 Upcoming
        </span>
      );
    } else {
      return (
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
          ✓ Completed
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16 sm:pt-20 px-4 sm:px-6 pb-10">
      <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xl">
        {/* Title and Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-600">
            Events
          </h2>
          {user?.role === "admin" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-pink-600 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-700 transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
            >
              <span>+</span>
              <span>Add Event</span>
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setFilter("current")}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
              filter === "current"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            🔴 Current ({current.length})
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
              filter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            📅 Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
              filter === "past"
                ? "bg-gray-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            ✓ Past ({past.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoadingEvents && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p className="text-gray-600 text-sm sm:text-base">
                Loading events...
              </p>
            </div>
          </div>
        )}

        {/* Events List */}
        {!isLoadingEvents && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                No {filter} events.
              </p>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg p-4 shadow-sm transition ${
                    filter === "current"
                      ? "bg-green-50 hover:bg-green-100 border-green-200"
                      : filter === "upcoming"
                        ? "bg-blue-50 hover:bg-blue-100 border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  {/* Event Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-pink-700 line-clamp-2">
                        {event.headline}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        📅 {formatDateRange(event.start_date, event.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEventStatus(event)}
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition text-lg flex-shrink-0"
                          title="Delete event"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Event Message */}
                  {event.message && (
                    <p className="text-gray-700 text-sm sm:text-base line-clamp-3 mb-3">
                      {event.message}
                    </p>
                  )}

                  {/* Media Preview */}
                  {event.media && event.media.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                        Media ({event.media.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {event.media.map((media, i) =>
                          media.mimetype?.startsWith("image/") ? (
                            <img
                              key={i}
                              src={`${API}${ media.url }`}
                              alt={media.filename}
                              className="w-full h-20 sm:h-24 lg:h-32 object-cover rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                              onClick={() => window.open(`${API}${media.url}`, "_blank")}
                            />
                          ) : media.mimetype?.startsWith("video/") ? (
                            <video
                              key={i}
                              src={`${API}${media.url}`}
                              controls
                              className="w-full h-20 sm:h-24 lg:h-32 rounded-lg shadow object-cover"
                            />
                          ) : (
                            <a
                              key={i}
                              href={`${API}${media.url}`}
                              download={media.filename}
                              className="flex items-center justify-center bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition p-2 text-xs sm:text-sm"
                              title={media.filename}
                            >
                              <span>📄</span>
                            </a>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Event Meta */}
                  <p className="text-xs text-gray-500 mt-3">
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <AddEventModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
