









// import { useState } from "react";
// import AddTeacherDialog from "../components/AddTeacherDialog";

// export default function Teachers() {
//   const [teachers, setTeachers] = useState([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // simulate add teacher (will connect to backend later)
//   const handleAddTeacher = (newTeacher) => {
//     setTeachers([...teachers, newTeacher]);
//   };

//   const handleRemoveTeacher = (index) => {
//     const updated = teachers.filter((_, i) => i !== index);
//     setTeachers(updated);
//   };

//   return (
//     <div className="p-6 bg-gray-300 min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-pink-600">Teachers</h1>
//         <button
//           onClick={() => setIsDialogOpen(true)}
//           className="px-4 py-2 bg-pink-600 text-white rounded-lg"
//         >
//           Add Teacher
//         </button>
//       </div>

//       <div className="bg-white shadow rounded-lg p-4">
//         {teachers.length === 0 ? (
//           <p className="text-gray-500">No teachers yet.</p>
//         ) : (
//           <ul className="space-y-3">
//             {teachers.map((teacher, index) => (
//               <li
//                 key={index}
//                 className="flex justify-between items-center border p-3 rounded-lg"
//               >
//                 <div>
//                   <p className="font-medium">{teacher.name}</p>
//                   <p className="text-sm text-gray-600">{teacher.phone}</p>
//                   <p className="text-sm text-gray-500">
//                     Username:{" "}
//                     <span className="font-mono">{teacher.username}</span>
//                   </p>
//                   {/* Password is hidden intentionally */}
//                 </div>
//                 <button
//                   onClick={() => handleRemoveTeacher(index)}
//                   className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg"
//                 >
//                   Remove
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Modal dialog */}
//       {isDialogOpen && (
//         <AddTeacherDialog
//           onSubmit={(newTeacher) => {
//             handleAddTeacher(newTeacher);
//             setIsDialogOpen(false);
//           }}
//         />
//       )}
//     </div>
//   );
// }










// src/pages/Teachers.jsx
import { useEffect, useState } from "react";
import AddTeacherDialog from "../components/AddTeacherDialog";
import { useAuth } from "../context/AuthContext";

/**
 * Teachers page
 * - Fetches teachers (admin-only endpoint)
 * - Adds teacher using AddTeacherDialog (POST /teachers/)
 * - Edits teacher using a small inline modal (PUT /teachers/:id)
 * - Deletes teacher (DELETE /teachers/:id)
 *
 * NOTE: backend endpoints used here:
 *   GET  {API}/teachers/
 *   POST {API}/teachers/
 *   PUT  {API}/teachers/:id
 *   DELETE {API}/teachers/:id
 *
 * The backend you shared registers the teachers blueprint at /teachers,
 * so we call `${API}/teachers/...`. If your app registers teachers under
 * a different prefix (e.g. /api/teachers), change API_TEACHERS accordingly.
 */

export default function Teachers() {
  const { token } = useAuth(); // use token from AuthContext
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const API_TEACHERS = `${API}/api/teachers`;

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Edit modal state ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null); // { id, name, username, phone, bio }

  // fetch teachers list
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_TEACHERS}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        // read text or json for better debugging
        let errText;
        try {
          const json = await res.json();
          errText = json.error || JSON.stringify(json);
        } catch {
          errText = await res.text();
        }
        console.error("Failed fetching teachers:", res.status, errText);
        return;
      }

      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle add teacher (called by AddTeacherDialog via onSubmit)
  const handleAddTeacher = async (newTeacher) => {
    // newTeacher: { name, phone, username, password }
    const formData = new FormData();
    formData.append("name", newTeacher.name);
    formData.append("username", newTeacher.username);
    formData.append("phone", newTeacher.phone || "");
    formData.append("password", newTeacher.password);

    try {
      const res = await fetch(`${API_TEACHERS}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // do NOT set Content-Type when using FormData
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || data?.message || "Failed to add teacher";
        alert(`❌ ${msg}`);
        return;
      }

      // our backend returns { message, id }
      alert("✅ Teacher added successfully!");
      // refresh the list (safe and simple)
      await fetchTeachers();
    } catch (err) {
      console.error("Add teacher error:", err);
      alert("Network error while adding teacher");
    }
  };

  // open edit modal prefilled
  const openEdit = (teacher) => {
    setEditTeacher({
      id: teacher.id,
      name: teacher.name || "",
      username: teacher.username || "",
      phone: teacher.phone || "",
      bio: teacher.bio || "",
    });
    setIsEditOpen(true);
  };

  // save edited teacher
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTeacher || !editTeacher.id) return;

    const formData = new FormData();
    formData.append("name", editTeacher.name);
    formData.append("username", editTeacher.username);
    formData.append("phone", editTeacher.phone || "");
    formData.append("bio", editTeacher.bio || "");

    try {
      const res = await fetch(`${API_TEACHERS}${editTeacher.id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || data?.message || "Failed to update teacher";
        alert(`❌ ${msg}`);
        return;
      }

      alert("✅ Teacher updated");
      setIsEditOpen(false);
      setEditTeacher(null);
      await fetchTeachers();
    } catch (err) {
      console.error("Error updating teacher:", err);
      alert("Network error while updating teacher");
    }
  };

  // delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const res = await fetch(`${API_TEACHERS}${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || data?.message || "Failed to delete teacher";
        alert(`❌ ${msg}`);
        return;
      }

      alert("🗑️ Teacher deleted");
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting teacher:", err);
      alert("Network error while deleting teacher");
    }
  };

  return (
    <div className="p-6 bg-gray-300 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-pink-600">Teachers</h1>
        {/* Keep your AddTeacherDialog and pass the real handler */}
        <AddTeacherDialog
          onSubmit={(newTeacher) => {
            handleAddTeacher(newTeacher);
          }}
        />
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        {loading ? (
          <p className="text-gray-500">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-gray-500">No teachers yet.</p>
        ) : (
          <ul className="space-y-3">
            {teachers.map((teacher, index) => (
              <li
                key={teacher.id || index}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.phone}</p>
                  <p className="text-sm text-gray-500">
                    Username: <span className="font-mono">{teacher.username}</span>
                  </p>
                  {teacher.must_change_password && (
                    <p className="text-sm text-yellow-700">Must change password on first login</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(teacher)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ------------------------
          Simple Edit Modal (keeps AddTeacherDialog unchanged)
          ------------------------ */}
      {isEditOpen && editTeacher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Edit Teacher</h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editTeacher.name}
                onChange={(e) => setEditTeacher({ ...editTeacher, name: e.target.value })}
                className="border p-2 rounded"
                placeholder="Full name"
                required
              />
              <input
                type="text"
                value={editTeacher.username}
                onChange={(e) => setEditTeacher({ ...editTeacher, username: e.target.value })}
                className="border p-2 rounded"
                placeholder="Username"
                required
              />
              <input
                type="text"
                value={editTeacher.phone}
                onChange={(e) => setEditTeacher({ ...editTeacher, phone: e.target.value })}
                className="border p-2 rounded"
                placeholder="Phone"
              />
              <textarea
                value={editTeacher.bio}
                onChange={(e) => setEditTeacher({ ...editTeacher, bio: e.target.value })}
                className="border p-2 rounded"
                placeholder="Bio (optional)"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditTeacher(null);
                }}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}