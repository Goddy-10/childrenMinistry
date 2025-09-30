



// import { useState, useEffect } from "react";
// import AddTeacherDialog from "../components/AddTeacherDialog";

// export default function Teachers() {
//   const [teachers, setTeachers] = useState([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // ✅ Fetch teachers from backend
//   useEffect(() => {
//     fetch("http://localhost:8000/teachers")
//       .then((res) => res.json())
//       .then((data) => setTeachers(data))
//       .catch((err) => console.error("Error fetching teachers:", err));
//   }, []);

//   // ✅ Add teacher to backend
//   const handleAddTeacher = (newTeacher) => {
//     fetch("http://localhost:8000/teachers", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newTeacher),
//     })
//       .then((res) => res.json())
//       .then((savedTeacher) => {
//         setTeachers([...teachers, savedTeacher]);
//       })
//       .catch((err) => console.error("Error adding teacher:", err));
//   };

//   // ✅ Remove teacher (delete from backend)
//   const handleRemoveTeacher = (id) => {
//     fetch(`http://localhost:8000/teachers/${id}`, {
//       method: "DELETE",
//     })
//       .then(() => {
//         setTeachers(teachers.filter((teacher) => teacher.id !== id));
//       })
//       .catch((err) => console.error("Error deleting teacher:", err));
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
//             {teachers.map((teacher) => (
//               <li
//                 key={teacher.id}
//                 className="flex justify-between items-center border p-3 rounded-lg"
//               >
//                 <div>
//                   <p className="font-medium">{teacher.name}</p>
//                   <p className="text-sm text-gray-600">{teacher.phone}</p>
//                   <p className="text-sm text-gray-500 italic">
//                     {teacher.username}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => handleRemoveTeacher(teacher.id)}
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
//       <AddTeacherDialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         onSave={handleAddTeacher}
//       />
//     </div>
//   );
// }








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
        <h1 className="text-2xl font-bold text-pink-600">Teachers</h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg"
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
                  <p className="text-sm text-gray-500">
                    Username:{" "}
                    <span className="font-mono">{teacher.username}</span>
                  </p>
                  {/* Password is hidden intentionally */}
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
      {isDialogOpen && (
        <AddTeacherDialog
          onSubmit={(newTeacher) => {
            handleAddTeacher(newTeacher);
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}