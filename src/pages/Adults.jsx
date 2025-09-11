// // src/pages/Adults.jsx
// import { useState } from "react";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar"; // if installed, else we’ll adjust
// // import { toast } from "@/components/ui/use-toast";



// const Adults = () => {
//   const [activeTab, setActiveTab] = useState("membership");

//   // Handle Download
//   const handleDownload = async (section) => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/adults/${section}/export`,
//         {
//           method: "GET",
//         }
//       );

//       if (!response.ok) throw new Error("Download failed");

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${section}_data.xlsx`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Download error:", error);
//     }
//   };

//   // Handle Print
//   const handlePrint = () => {
//     window.print();
//   };

//   // Toolbar with Download & Print
//   const Toolbar = ({ section }) => (
//     <div className="flex justify-end space-x-2 mb-4">
//       <button
//         onClick={() => handleDownload(section)}
//         className="px-3 py-1 bg-pink-600 text-white rounded-md"
//       >
//         Download
//       </button>
//       <button
//         onClick={handlePrint}
//         className="px-3 py-1 bg-gray-600 text-white rounded-md"
//       >
//         Print
//       </button>
//     </div>
//   );

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-pink-600 mb-6">Adults Page</h1>

//       {/* Tabs */}
//       <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
//         {[
//           "membership",
//           "new-believers",
//           "finance",
//           "development",
//           "missions",
//           "gcc-schools",
//           "departments",
//         ].map((tab) => (
//           <button
//             key={tab}
//             className={`px-4 py-2 whitespace-nowrap ${
//               activeTab === tab
//                 ? "border-b-2 border-pink-600 font-semibold text-pink-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab.replace("-", " ").toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {/* Content per Tab */}
//       <div>
//         {/* Membership */}
//         {activeTab === "membership" && (
//           <div>
//             <Toolbar section="membership" />
//             <form className="space-y-4">
//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="text"
//                 placeholder="Phone Number"
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="text"
//                 placeholder="Residence"
//                 className="w-full border p-2 rounded"
//               />
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-pink-600 text-white rounded-md"
//               >
//                 Save Member
//               </button>
//             </form>
//           </div>
//         )}

//         {/* New Believers */}
//         {activeTab === "new-believers" && (
//           <div>
//             <Toolbar section="new-believers" />
//             <form className="space-y-4">
//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="text"
//                 placeholder="Phone Number"
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="text"
//                 placeholder="Residence"
//                 className="w-full border p-2 rounded"
//               />
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-pink-600 text-white rounded-md"
//               >
//                 Save New Believer
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Finance */}
//         {activeTab === "finance" && (
//           <div>
//             <Toolbar section="finance" />
//             <div className="mb-4">[Calendar Here]</div>
//             <table className="w-full border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border px-2 py-1">Date</th>
//                   <th className="border px-2 py-1">Amount</th>
//                   <th className="border px-2 py-1">Service Type</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="border px-2 py-1">
//                     <input type="date" className="w-full" />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <input type="number" className="w-full" />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <input
//                       type="text"
//                       placeholder="Service"
//                       className="w-full"
//                     />
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Development */}
//         {activeTab === "development" && (
//           <div>
//             <Toolbar section="development" />
//             <table className="w-full border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border px-2 py-1">Project</th>
//                   <th className="border px-2 py-1">Status</th>
//                   <th className="border px-2 py-1">Deadline</th>
//                   <th className="border px-2 py-1">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="border px-2 py-1">
//                     <input
//                       type="text"
//                       placeholder="Project Name"
//                       className="w-full"
//                     />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <select className="w-full">
//                       <option>Current</option>
//                       <option>Future</option>
//                       <option>Finished</option>
//                     </select>
//                   </td>
//                   <td className="border px-2 py-1">
//                     <input type="date" className="w-full" />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <button className="text-red-600">Delete</button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//             <button className="mt-4 px-3 py-1 bg-red-600 text-white rounded-md">
//               Clear All
//             </button>
//           </div>
//         )}

//         {/* Missions */}
//         {activeTab === "missions" && (
//           <div>
//             <Toolbar section="missions" />
//             <div className="mb-4">[Missions Calendar Here]</div>
//             <table className="w-full border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border px-2 py-1">Partner</th>
//                   <th className="border px-2 py-1">Support</th>
//                   <th className="border px-2 py-1">Phone</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="border px-2 py-1">
//                     <input type="text" placeholder="Name" className="w-full" />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <input
//                       type="text"
//                       placeholder="Support Type/Amount"
//                       className="w-full"
//                     />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <input type="text" placeholder="Phone" className="w-full" />
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* GCC Schools */}
//         {activeTab === "gcc-schools" && (
//           <div>
//             <Toolbar section="gcc-schools" />
//             <p className="text-gray-600">
//               GCC Schools section (structure to be expanded later).
//             </p>
//           </div>
//         )}

//         {/* Departments */}
//         {activeTab === "departments" && (
//           <div>
//             <Toolbar section="departments" />
//             <form className="space-y-4 mb-6">
//               <input
//                 type="text"
//                 placeholder="Department Name"
//                 className="w-full border p-2 rounded"
//               />
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-pink-600 text-white rounded-md"
//               >
//                 Save Department
//               </button>
//             </form>
//             <table className="w-full border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border px-2 py-1">Member Name</th>
//                   <th className="border px-2 py-1">Position</th>
//                   <th className="border px-2 py-1">Phone Number</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="border px-2 py-1">
//                     <input type="text" placeholder="Name" className="w-full" />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <input
//                       type="text"
//                       placeholder="Leader/Member"
//                       className="w-full"
//                     />
//                   </td>
//                   <td className="border px-2 py-1">
//                     <input type="text" placeholder="Phone" className="w-full" />
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Adults;



import React, { useState } from "react";

export default function Adults() {
  const [activeTab, setActiveTab] = useState("membership");

  // Membership & New Believers
  const [members, setMembers] = useState([]);
  const [newBelievers, setNewBelievers] = useState([]);
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    residence: "",
  });

  const addMember = (type) => {
    if (!memberForm.name || !memberForm.phone || !memberForm.residence) return;
    if (type === "member") setMembers([...members, memberForm]);
    if (type === "believer") setNewBelievers([...newBelievers, memberForm]);
    setMemberForm({ name: "", phone: "", residence: "" });
  };

  const deleteMember = (type, index) => {
    if (type === "member") setMembers(members.filter((_, i) => i !== index));
    if (type === "believer")
      setNewBelievers(newBelievers.filter((_, i) => i !== index));
  };

  // Finance
  const [finance, setFinance] = useState([]);
  const [financeForm, setFinanceForm] = useState({
    date: "",
    amount: "",
    service: "",
  });

  const addFinance = () => {
    if (!financeForm.date || !financeForm.amount || !financeForm.service)
      return;
    setFinance([...finance, financeForm]);
    setFinanceForm({ date: "", amount: "", service: "" });
  };

  const deleteFinance = (index) => {
    setFinance(finance.filter((_, i) => i !== index));
  };

  // Development
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    name: "",
    status: "",
    deadline: "",
  });

  const addProject = () => {
    if (!projectForm.name || !projectForm.status || !projectForm.deadline)
      return;
    setProjects([...projects, projectForm]);
    setProjectForm({ name: "", status: "", deadline: "" });
  };

  const deleteProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Missions
  const [missions, setMissions] = useState([]);
  const [missionForm, setMissionForm] = useState({
    date: "",
    activity: "",
    partner: "",
    support: "",
    phone: "",
  });

  const addMission = () => {
    if (!missionForm.date || !missionForm.activity) return;
    setMissions([...missions, missionForm]);
    setMissionForm({
      date: "",
      activity: "",
      partner: "",
      support: "",
      phone: "",
    });
  };

  const deleteMission = (index) => {
    setMissions(missions.filter((_, i) => i !== index));
  };

  // Departments
  const [departments, setDepartments] = useState([]);
  const [departmentForm, setDepartmentForm] = useState({
    deptName: "",
    members: [],
  });
  const [deptMemberForm, setDeptMemberForm] = useState({
    name: "",
    position: "",
    phone: "",
  });

  const addDepartment = () => {
    if (!departmentForm.deptName) return;
    setDepartments([...departments, departmentForm]);
    setDepartmentForm({ deptName: "", members: [] });
  };

  const addDeptMember = (deptIndex) => {
    if (!deptMemberForm.name) return;
    const updated = [...departments];
    updated[deptIndex].members.push(deptMemberForm);
    setDepartments(updated);
    setDeptMemberForm({ name: "", position: "", phone: "" });
  };

  const deleteDeptMember = (deptIndex, memberIndex) => {
    const updated = [...departments];
    updated[deptIndex].members = updated[deptIndex].members.filter(
      (_, i) => i !== memberIndex
    );
    setDepartments(updated);
  };

  // Download + Print
  const downloadData = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const printData = (data) => {
    const w = window.open();
    w.document.write("<pre>" + JSON.stringify(data, null, 2) + "</pre>");
    w.print();
    w.close();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Adults Ministry</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        {[
          "membership",
          "believers",
          "finance",
          "development",
          "missions",
          "departments",
        ].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-pink-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Membership */}
      {activeTab === "membership" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Membership</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Name"
            value={memberForm.name}
            onChange={(e) =>
              setMemberForm({ ...memberForm, name: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Phone"
            value={memberForm.phone}
            onChange={(e) =>
              setMemberForm({ ...memberForm, phone: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Residence"
            value={memberForm.residence}
            onChange={(e) =>
              setMemberForm({ ...memberForm, residence: e.target.value })
            }
          />
          <button
            onClick={() => addMember("member")}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <ul className="mt-4">
            {members.map((m, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b py-1"
              >
                {m.name} - {m.phone} - {m.residence}
                <button
                  onClick={() => deleteMember("member", i)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button
              onClick={() => downloadData(members, "members.json")}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>
            <button
              onClick={() => printData(members)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}

      {/* New Believers */}
      {activeTab === "believers" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">New Believers</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Name"
            value={memberForm.name}
            onChange={(e) =>
              setMemberForm({ ...memberForm, name: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Phone"
            value={memberForm.phone}
            onChange={(e) =>
              setMemberForm({ ...memberForm, phone: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Residence"
            value={memberForm.residence}
            onChange={(e) =>
              setMemberForm({ ...memberForm, residence: e.target.value })
            }
          />
          <button
            onClick={() => addMember("believer")}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <ul className="mt-4">
            {newBelievers.map((m, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b py-1"
              >
                {m.name} - {m.phone} - {m.residence}
                <button
                  onClick={() => deleteMember("believer", i)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button
              onClick={() => downloadData(newBelievers, "believers.json")}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>
            <button
              onClick={() => printData(newBelievers)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}

      {/* Finance */}
      {activeTab === "finance" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Finance</h2>
          <input
            type="date"
            className="border p-2 mr-2"
            value={financeForm.date}
            onChange={(e) =>
              setFinanceForm({ ...financeForm, date: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Amount"
            value={financeForm.amount}
            onChange={(e) =>
              setFinanceForm({ ...financeForm, amount: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Service Type"
            value={financeForm.service}
            onChange={(e) =>
              setFinanceForm({ ...financeForm, service: e.target.value })
            }
          />
          <button
            onClick={addFinance}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <ul className="mt-4">
            {finance.map((f, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b py-1"
              >
                {f.date} - {f.amount} - {f.service}
                <button
                  onClick={() => deleteFinance(i)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button
              onClick={() => downloadData(finance, "finance.json")}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>
            <button
              onClick={() => printData(finance)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}

      {/* Development */}
      {activeTab === "development" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Development Projects</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Project Name"
            value={projectForm.name}
            onChange={(e) =>
              setProjectForm({ ...projectForm, name: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Status"
            value={projectForm.status}
            onChange={(e) =>
              setProjectForm({ ...projectForm, status: e.target.value })
            }
          />
          <input
            type="date"
            className="border p-2 mr-2"
            value={projectForm.deadline}
            onChange={(e) =>
              setProjectForm({ ...projectForm, deadline: e.target.value })
            }
          />
          <button
            onClick={addProject}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <ul className="mt-4">
            {projects.map((p, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b py-1"
              >
                {p.name} - {p.status} - {p.deadline}
                <button
                  onClick={() => deleteProject(i)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button
              onClick={() => downloadData(projects, "projects.json")}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>
            <button
              onClick={() => printData(projects)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}

      {/* Missions */}
      {activeTab === "missions" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Missions</h2>
          <input
            type="date"
            className="border p-2 mr-2"
            value={missionForm.date}
            onChange={(e) =>
              setMissionForm({ ...missionForm, date: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Activity"
            value={missionForm.activity}
            onChange={(e) =>
              setMissionForm({ ...missionForm, activity: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Partner Name"
            value={missionForm.partner}
            onChange={(e) =>
              setMissionForm({ ...missionForm, partner: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Support"
            value={missionForm.support}
            onChange={(e) =>
              setMissionForm({ ...missionForm, support: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Phone"
            value={missionForm.phone}
            onChange={(e) =>
              setMissionForm({ ...missionForm, phone: e.target.value })
            }
          />
          <button
            onClick={addMission}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <ul className="mt-4">
            {missions.map((m, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b py-1"
              >
                {m.date} - {m.activity} - {m.partner} - {m.support} - {m.phone}
                <button
                  onClick={() => deleteMission(i)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button
              onClick={() => downloadData(missions, "missions.json")}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>
            <button
              onClick={() => printData(missions)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}

      {/* Departments */}
      {activeTab === "departments" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Departments</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Department Name"
            value={departmentForm.deptName}
            onChange={(e) =>
              setDepartmentForm({ ...departmentForm, deptName: e.target.value })
            }
          />
          <button
            onClick={addDepartment}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Add Department
          </button>

          {departments.map((dept, deptIndex) => (
            <div key={deptIndex} className="border mt-4 p-2">
              <h3 className="font-bold">{dept.deptName}</h3>

              <div className="mt-2">
                <input
                  className="border p-2 mr-2"
                  placeholder="Name"
                  value={deptMemberForm.name}
                  onChange={(e) =>
                    setDeptMemberForm({
                      ...deptMemberForm,
                      name: e.target.value,
                    })
                  }
                />
                <input
                  className="border p-2 mr-2"
                  placeholder="Position"
                  value={deptMemberForm.position}
                  onChange={(e) =>
                    setDeptMemberForm({
                      ...deptMemberForm,
                      position: e.target.value,
                    })
                  }
                />
                <input
                  className="border p-2 mr-2"
                  placeholder="Phone"
                  value={deptMemberForm.phone}
                  onChange={(e) =>
                    setDeptMemberForm({
                      ...deptMemberForm,
                      phone: e.target.value,
                    })
                  }
                />
                <button
                  onClick={() => addDeptMember(deptIndex)}
                  className="bg-pink-600 text-white px-4 py-2 rounded"
                >
                  Add Member
                </button>
              </div>

              <ul className="mt-2">
                {dept.members.map((m, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center border-b py-1"
                  >
                    {m.name} - {m.position} - {m.phone}
                    <button
                      onClick={() => deleteDeptMember(deptIndex, i)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-2">
            <button
              onClick={() => downloadData(departments, "departments.json")}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>
            <button
              onClick={() => printData(departments)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}