// src/components/AddEventModal.jsx
import { useState } from "react";

export default function AddEventModal({ onClose, onSave }) {
  const [headline, setHeadline] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileObjs = files.map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file), // local preview
    }));
    setMedia(fileObjs);
  };

  const handleSubmit = () => {
    if (!headline || !date) {
      alert("Headline and Date are required");
      return;
    }

    const newEvent = { headline, date, message, media };
    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4 text-pink-600">Add New Event</h3>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          <textarea
            placeholder="Event Description / Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />

          {/* Media Preview */}
          <div className="flex flex-wrap gap-2 mt-2">
            {media.map((file, i) =>
              file.type.startsWith("image/") ? (
                <img
                  key={i}
                  src={file.url}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : file.type.startsWith("video/") ? (
                <video
                  key={i}
                  src={file.url}
                  className="w-24 h-20 rounded-lg"
                  controls
                />
              ) : (
                <p key={i} className="text-sm text-gray-600">
                  {file.name}
                </p>
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
}
