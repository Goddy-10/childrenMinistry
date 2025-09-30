// src/pages/Profile.jsx
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth(); // ✅ get current user from context
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    bio: "",
  });
  const [profilePic, setProfilePic] = useState(null);

  // ✅ Pre-fill form when user is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        username: user.username || "",
        bio: user.bio || "",
      });
      setProfilePic(user.profilePic || null);
    }
  }, [user]);

  // handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle file upload
  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  // submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated profile:", formData, profilePic);
    // 🔹 send to backend with fetch/axios (PATCH /api/users/:id)
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile picture */}
        <div className="flex items-center gap-4">
          <img
            src={
              profilePic
                ? typeof profilePic === "string"
                  ? profilePic // already saved pic URL
                  : URL.createObjectURL(profilePic) // preview new upload
                : "/default-avatar.png"
            }
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Name */}
        <div>
          <label className="block font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Change password link */}
        <div>
          <Link
            to="/change-password"
            className="text-purple-700 hover:underline font-medium"
          >
            Change Password
          </Link>
        </div>

        <button
          type="submit"
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
