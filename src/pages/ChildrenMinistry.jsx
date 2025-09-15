// src/pages/ChildrenMinistry.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function ChildrenMinistry() {
  const tabs = [
    { id: "timetable", label: "CM Timetable", to: "timetable" },
    { id: "reports", label: "Reports", to: "reports" },
    { id: "teachers", label: "Teachers", to: "teachers" },
    { id: "classes", label: "Classes", to: "classes" },
    { id: "children", label: "Children", to: "children" },
  ];

  const tabClass = ({ isActive }) =>
    isActive
      ? "px-4 py-2 rounded-lg font-medium transition bg-pink-600 text-white shadow"
      : "px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <div className="min-h-screen bg-gray-500 flex pt-20 px-4 md:px-6 items-start justify-center">
      {/* Card */}
      <div className="bg-white w-full md:w-3/4 max-w-6xl min-h-[70vh] rounded-2xl shadow-2xl overflow-hidden">
        {/* Title */}
        <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-bold">Children Ministry</h2>
        </div>

        <div className="p-6 md:p-8">
          {/* Tabs (use NavLink so clicks change route) */}
          <div className="flex flex-wrap gap-2 border-b border-neutral/40 pb-2">
            {tabs.map((tab) => (
              <NavLink key={tab.id} to={tab.to} className={tabClass}>
                {tab.label}
              </NavLink>
            ))}
          </div>

          {/* Content area: the nested route will render here */}
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
