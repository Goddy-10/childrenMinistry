

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