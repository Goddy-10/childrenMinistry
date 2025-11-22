

import { useState } from "react";
import ProgramsTab from "@/components/ProgramsTab"; // 👈 import the new ProgramsTab

export default function ClassesPage() {
  const tabs = [
    
    { id: "teachers", label: "Teachers" },
    { id: "gifted-brains", label: "Gifted Brains (0–3 yrs)" },
    { id: "beginners", label: "Beginners (3–6 yrs)" },
    { id: "shinners", label: "Shinners (6–9 yrs)" },
    { id: "conquerors", label: "Conquerors (9–13 yrs)" },
    { id: "teens", label: "Teens (13-16)" },

    // 👈 Programs tab
  ];

  const [activeTab, setActiveTab] = useState("gifted-brains");

  return (
    <div className="min-h-screen bg-gray-500 flex pt-4 px-4 md:px-6 items-center justify-center">
      {/* Floating Card */}
      <div className="bg-white w-full md:w-3/4 min-h-[80vh] rounded-2xl shadow-2xl overflow-hidden">
        {/* Title strip */}
        <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-bold">
            Children Ministry Classes
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-neutral/40 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? "bg-pink-600 text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-6">
            {activeTab === "gifted-brains" && (
              <div>
                <h3 className="text-lg font-semibold text-pink-600">
                  Gifted Brains
                </h3>
                <p className="mt-2 text-gray-700">
                  This class is for children aged 0–3 years. It focuses on
                  nurturing faith through songs, play, and simple Bible stories.
                </p>
              </div>
            )}

            {activeTab === "beginners" && (
              <div>
                <h3 className="text-lg font-semibold text-pink-600">
                  Beginners
                </h3>
                <p className="mt-2 text-gray-700">
                  This class is for ages 3–6 years. Children are introduced to
                  Bible basics with fun stories, crafts, and memory verses.
                </p>
              </div>
            )}

            {activeTab === "shinners" && (
              <div>
                <h3 className="text-lg font-semibold text-pink-600">
                  Shinners
                </h3>
                <p className="mt-2 text-gray-700">
                  This class is for ages 6–9 years. Children dive deeper into
                  Bible knowledge through discussions, activities, and group
                  lessons.
                </p>
              </div>
            )}

            {activeTab === "conquerors" && (
              <div>
                <h3 className="text-lg font-semibold text-pink-600">
                  Conquerors
                </h3>
                <p className="mt-2 text-gray-700">
                  This class is for ages 9–13 years. Focus is on building a
                  strong spiritual foundation and leadership skills through
                  Bible study and service.
                </p>
              </div>
            )}

            {activeTab === "teens" && (
              <div>
                <h3 className="text-lg font-semibold text-pink-600">Teens</h3>
                <p className="mt-2 text-gray-700">
                  This class is for ages 13-16 years. Focus is on teaching
                  Christian doctrines and Godly service through introduction to
                  ministry service
                </p>
              </div>
            )}

            {activeTab === "teachers" && (
              <div>
                <h3 className="text-lg font-semibold text-pink-600">
                  Teachers
                </h3>
                <p className="mt-2 text-gray-700">
                  This section is for Sunday School teachers. It includes
                  resources, lesson plans, and attendance records for managing
                  classes effectively.
                </p>
              </div>
            )}

            
          </div>
        </div>
      </div>
    </div>
  );
}