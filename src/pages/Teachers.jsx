import { useState } from "react";
import AddTeacherDialog from "../components/AddTeacherDialog";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // simulate add teacher (will connect to backend later)
  const handleAddTeacher = (newTeacher) => {
    setTeachers([...teachers, newTeacher]);
  };

  const handleRemoveTeacher = (index) => {
    const updated = teachers.filter((_, i) => i !== index);
    setTeachers(updated);
  };

  return (
    <div className="p-6 bg-gray-300 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Teachers</h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Add Teacher
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        {teachers.length === 0 ? (
          <p className="text-gray-500">No teachers yet.</p>
        ) : (
          <ul className="space-y-3">
            {teachers.map((teacher, index) => (
              <li
                key={index}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.phone}</p>
                </div>
                <button
                  onClick={() => handleRemoveTeacher(index)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal dialog */}
      <AddTeacherDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleAddTeacher}
      />
    </div>
  );
}
