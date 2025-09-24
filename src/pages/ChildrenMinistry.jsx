// // src/pages/ChildrenMinistry.jsx
// import { NavLink, Outlet } from "react-router-dom";
// import ProgramsTab from "@/components/ProgramsTab";

// export default function ChildrenMinistry() {
//   const tabs = [
//     { id: "timetable", label: "CM Timetable", to: "timetable" },
//     { id: "reports", label: "Reports", to: "reports" },
//     { id: "teachers", label: "Teachers", to: "teachers" },
//     { id: "classes", label: "Classes", to: "classes" },
//     { id: "children", label: "Children", to: "children" },
//     { id: "programs", label: "Programs", to: "programs" },
//   ];

//   const tabClass = ({ isActive }) =>
//     isActive
//       ? "px-4 py-2 rounded-lg font-medium transition bg-pink-600 text-white shadow"
//       : "px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300";

//   return (
//     <div className="min-h-screen bg-gray-500 flex pt-20 px-4 md:px-6 items-start justify-center">
//       {/* Card */}
//       <div className="bg-white w-full lg:w-100 max-w-8xl min-h-[75vh] rounded-2xl shadow-2xl overflow-hidden">
//         {/* Title */}
//         <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6">
//           <h2 className="text-xl md:text-2xl font-bold">Children Ministry</h2>
//         </div>

//         <div className="p-6 md:p-8">
//           {/* Tabs (use NavLink so clicks change route) */}
//           <div className="flex flex-wrap gap-2 border-b border-neutral/40 pb-2">
//             {tabs.map((tab) => (
//               <NavLink key={tab.id} to={tab.to} className={tabClass}>
//                 {tab.label}
//               </NavLink>
//             ))}
//           </div>

//           {/* Content area: the nested route will render here */}
//           <div className="mt-6">
//             <Outlet />
//             {activeTab === "programs" && (
//               <ProgramsTab />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






// // src/pages/ChildrenMinistry.jsx
// import { NavLink, Outlet } from "react-router-dom";

// export default function ChildrenMinistry() {
//   const tabs = [
//     { id: "timetable", label: "CM Timetable", to: "timetable" },
//     { id: "reports", label: "Reports", to: "reports" },
//     { id: "teachers", label: "Teachers", to: "teachers" },
//     { id: "classes", label: "Classes", to: "classes" },
//     { id: "children", label: "Children", to: "children" },
//     { id: "programs", label: "Programs", to: "programs" }, // 👈 lowercase path
//   ];

//   const tabClass = ({ isActive }) =>
//     isActive
//       ? "px-4 py-2 rounded-lg font-medium transition bg-pink-600 text-white shadow"
//       : "px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300";

//   return (
//     <div className="min-h-screen  bg-gray-500 flex pt-20 px-4 md:px-6 items-start justify-center">
//       {/* Card */}
//       <div className="bg-white w-full lg:w-100 max-w-8xl min-h-[75vh] rounded-2xl shadow-2xl overflow-hidden">
//         {/* Title */}
//         <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6">
//           <h2 className="text-xl md:text-2xl font-bold">Children Ministry</h2>
//         </div>

//         <div className="p-6 md:p-8">
//           {/* Tabs */}
//           <div className="flex flex-wrap gap-2 border-b border-neutral/40 pb-2">
//             {tabs.map((tab) => (
//               <NavLink key={tab.id} to={tab.to} className={tabClass}>
//                 {tab.label}
//               </NavLink>
//             ))}
//           </div>

//           {/* Nested content */}
//           <div className="mt-6">
//             <Outlet />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





// src/pages/ChildrenMinistry.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ChildrenMinistry() {
  const { user } = useAuth();
  const role = user?.role || "guest";

  // ✅ Define all possible tabs
  const allTabs = [
    { name: "Timetable", path: "timetable", roles: ["admin", "teacher"] },
    { name: "Reports", path: "reports", roles: ["admin", "teacher"] },
    { name: "Teachers", path: "teachers", roles: ["admin"] },
    { name: "Classes", path: "classes", roles: ["admin", "teacher"] },
    { name: "Children", path: "children", roles: ["admin", "teacher"] },
    { name: "Programs", path: "programs", roles: ["admin"] },
  ];

  // ✅ Filter tabs for role
  const visibleTabs = allTabs.filter((tab) =>
    tab.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Children Ministry
        </h2>

        {/* Tabs Navigation */}
        <div className="flex gap-4 border-b mb-6">
          {visibleTabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 py-2 font-medium ${
                  isActive
                    ? "border-b-2 border-pink-600 text-pink-600"
                    : "text-gray-600 hover:text-pink-600"
                }`
              }
            >
              {tab.name}
            </NavLink>
          ))}
        </div>

        {/* Tab content (nested route) */}
        <Outlet />
      </div>
    </div>
  );
}