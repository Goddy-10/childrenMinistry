


// import React, { useState } from "react";
// import FinanceSummary from "../components/FinanceSummary";

// export default function Adults() {
//   const [activeTab, setActiveTab] = useState("membership");

//   // Membership & New Believers
//   const [members, setMembers] = useState([]);
//   const [newBelievers, setNewBelievers] = useState([]);
//   const [memberForm, setMemberForm] = useState({
//     name: "",
//     phone: "",
//     residence: "",
//   });

//   const addMember = (type) => {
//     if (!memberForm.name || !memberForm.phone || !memberForm.residence) return;
//     if (type === "member") setMembers([...members, memberForm]);
//     if (type === "believer") setNewBelievers([...newBelievers, memberForm]);
//     setMemberForm({ name: "", phone: "", residence: "" });
//   };

//   const deleteMember = (type, index) => {
//     if (type === "member") setMembers(members.filter((_, i) => i !== index));
//     if (type === "believer")
//       setNewBelievers(newBelievers.filter((_, i) => i !== index));
//   };

//   // Finance
//   const [finance, setFinance] = useState([]);
//   const [financeForm, setFinanceForm] = useState({
//     date: "",
//     amount: "",
//     service: "",
//   });

//   const addFinance = () => {
//     if (!financeForm.date || !financeForm.amount || !financeForm.service)
//       return;
//     setFinance([...finance, financeForm]);
//     setFinanceForm({ date: "", amount: "", service: "" });
//   };

//   const deleteFinance = (index) => {
//     setFinance(finance.filter((_, i) => i !== index));
//   };

//   // Development
//   const [projects, setProjects] = useState([]);
//   const [projectForm, setProjectForm] = useState({
//     name: "",
//     status: "",
//     deadline: "",
//   });

//   const addProject = () => {
//     if (!projectForm.name || !projectForm.status || !projectForm.deadline)
//       return;
//     setProjects([...projects, projectForm]);
//     setProjectForm({ name: "", status: "", deadline: "" });
//   };

//   const deleteProject = (index) => {
//     setProjects(projects.filter((_, i) => i !== index));
//   };

//   // Missions
//   const [missions, setMissions] = useState([]);
//   const [missionForm, setMissionForm] = useState({
//     date: "",
//     activity: "",
//     partner: "",
//     support: "",
//     phone: "",
//   });

//   const addMission = () => {
//     if (!missionForm.date || !missionForm.activity) return;
//     setMissions([...missions, missionForm]);
//     setMissionForm({
//       date: "",
//       activity: "",
//       partner: "",
//       support: "",
//       phone: "",
//     });
//   };

//   const deleteMission = (index) => {
//     setMissions(missions.filter((_, i) => i !== index));
//   };

//   // Departments
//   const [departments, setDepartments] = useState([]);
//   const [departmentForm, setDepartmentForm] = useState({
//     deptName: "",
//     members: [],
//   });
//   const [deptMemberForm, setDeptMemberForm] = useState({
//     name: "",
//     position: "",
//     phone: "",
//   });

//   const addDepartment = () => {
//     if (!departmentForm.deptName) return;
//     setDepartments([...departments, departmentForm]);
//     setDepartmentForm({ deptName: "", members: [] });
//   };

//   const addDeptMember = (deptIndex) => {
//     if (!deptMemberForm.name) return;
//     const updated = [...departments];
//     updated[deptIndex].members.push(deptMemberForm);
//     setDepartments(updated);
//     setDeptMemberForm({ name: "", position: "", phone: "" });
//   };

//   const deleteDeptMember = (deptIndex, memberIndex) => {
//     const updated = [...departments];
//     updated[deptIndex].members = updated[deptIndex].members.filter(
//       (_, i) => i !== memberIndex
//     );
//     setDepartments(updated);
//   };

//   // Download + Print
//   const downloadData = (data, filename) => {
//     const blob = new Blob([JSON.stringify(data, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = filename;
//     link.click();
//   };

//   const printData = (data) => {
//     const w = window.open();
//     w.document.write("<pre>" + JSON.stringify(data, null, 2) + "</pre>");
//     w.print();
//     w.close();
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-pink-600 mb-4">Adults Ministry</h1>

//       {/* Tabs */}
//       <div className="flex space-x-2 mb-4">
//         {[
//           "membership",
//           "believers",
//           "finance",
//           "development",
//           "missions",
//           "departments",
//         ].map((tab) => (
//           <button
//             key={tab}
//             className={`px-4 py-2 rounded ${
//               activeTab === tab ? "bg-pink-600 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab.charAt(0).toUpperCase() + tab.slice(1)}
//           </button>
//         ))}
//       </div>

//       {/* Membership */}
//       {activeTab === "membership" && (
//         <div>
//           <h2 className="text-lg font-semibold mb-2">Membership</h2>
//           <input
//             className="border p-2 mr-2"
//             placeholder="Name"
//             value={memberForm.name}
//             onChange={(e) =>
//               setMemberForm({ ...memberForm, name: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Phone"
//             value={memberForm.phone}
//             onChange={(e) =>
//               setMemberForm({ ...memberForm, phone: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Residence"
//             value={memberForm.residence}
//             onChange={(e) =>
//               setMemberForm({ ...memberForm, residence: e.target.value })
//             }
//           />
//           <button
//             onClick={() => addMember("member")}
//             className="bg-pink-600 text-white px-4 py-2 rounded"
//           >
//             Save
//           </button>

//           <ul className="mt-4">
//             {members.map((m, i) => (
//               <li
//                 key={i}
//                 className="flex justify-between items-center border-b py-1"
//               >
//                 {m.name} - {m.phone} - {m.residence}
//                 <button
//                   onClick={() => deleteMember("member", i)}
//                   className="text-red-500"
//                 >
//                   Delete
//                 </button>
//               </li>
//             ))}
//           </ul>

//           <div className="mt-2">
//             <button
//               onClick={() => downloadData(members, "members.json")}
//               className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
//             >
//               Download
//             </button>
//             <button
//               onClick={() => printData(members)}
//               className="bg-gray-500 text-white px-3 py-1 rounded"
//             >
//               Print
//             </button>
//           </div>
//         </div>
//       )}

//       {/* New Believers */}
//       {activeTab === "believers" && (
//         <div>
//           <h2 className="text-lg font-semibold mb-2">New Believers</h2>
//           <input
//             className="border p-2 mr-2"
//             placeholder="Name"
//             value={memberForm.name}
//             onChange={(e) =>
//               setMemberForm({ ...memberForm, name: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Phone"
//             value={memberForm.phone}
//             onChange={(e) =>
//               setMemberForm({ ...memberForm, phone: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Residence"
//             value={memberForm.residence}
//             onChange={(e) =>
//               setMemberForm({ ...memberForm, residence: e.target.value })
//             }
//           />
//           <button
//             onClick={() => addMember("believer")}
//             className="bg-pink-600 text-white px-4 py-2 rounded"
//           >
//             Save
//           </button>

//           <ul className="mt-4">
//             {newBelievers.map((m, i) => (
//               <li
//                 key={i}
//                 className="flex justify-between items-center border-b py-1"
//               >
//                 {m.name} - {m.phone} - {m.residence}
//                 <button
//                   onClick={() => deleteMember("believer", i)}
//                   className="text-red-500"
//                 >
//                   Delete
//                 </button>
//               </li>
//             ))}
//           </ul>

//           <div className="mt-2">
//             <button
//               onClick={() => downloadData(newBelievers, "believers.json")}
//               className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
//             >
//               Download
//             </button>
//             <button
//               onClick={() => printData(newBelievers)}
//               className="bg-gray-500 text-white px-3 py-1 rounded"
//             >
//               Print
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Finance */}

//       {/* Finance */}
//       {activeTab === "finance" && (
//         <div>
//           <h2 className="text-lg font-semibold mb-2">Finance</h2>
//           <input
//             type="date"
//             className="border p-2 mr-2"
//             value={financeForm.date}
//             onChange={(e) =>
//               setFinanceForm({ ...financeForm, date: e.target.value })
//             }
//           />

//           {/* Dropdown for Service Type */}
//           <select
//             className="border p-2 mr-2"
//             value={financeForm.service}
//             onChange={(e) =>
//               setFinanceForm({ ...financeForm, service: e.target.value })
//             }
//           >
//             <option value="">Select Service Type</option>
//             <option value="Sunday Service">Sunday Service</option>
//             <option value="Midweek Service">Midweek Service</option>
//             <option value="Conference/Revival/Kesha">
//               Conference/Revival/Kesha
//             </option>
//           </select>

//           {/* Amount input */}
//           <input
//             className="border p-2 mr-2"
//             placeholder="Amount"
//             value={financeForm.amount}
//             onChange={(e) =>
//               setFinanceForm({ ...financeForm, amount: e.target.value })
//             }
//           />

//           {/* Save button */}
//           <button
//             onClick={addFinance}
//             className="bg-pink-600 text-white px-4 py-2 rounded"
//           >
//             Save
//           </button>

//           {/* Finance entries list */}
//           <ul className="mt-4">
//             {finance.map((f, i) => (
//               <li
//                 key={i}
//                 className="flex justify-between items-center border-b py-1"
//               >
//                 {f.date} - {f.amount} - {f.service}
//                 <button
//                   onClick={() => deleteFinance(i)}
//                   className="text-red-500"
//                 >
//                   Delete
//                 </button>
//               </li>
//             ))}
//           </ul>

//           {/* Download + Print */}
//           <div className="mt-2">
//             <button
//               onClick={() => downloadData(finance, "finance.json")}
//               className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
//             >
//               Download
//             </button>
//             <button
//               onClick={() => printData(finance)}
//               className="bg-gray-500 text-white px-3 py-1 rounded"
//             >
//               Print
//             </button>
//           </div>

//           {/* Finance Summary Component (monthly + yearly totals) */}
//           <FinanceSummary finance={finance} />
//         </div>
//       )}

//       {/* Development */}
//       {activeTab === "development" && (
//         <div>
//           <h2 className="text-lg font-semibold mb-2">Development Projects</h2>
//           <input
//             className="border p-2 mr-2"
//             placeholder="Project Name"
//             value={projectForm.name}
//             onChange={(e) =>
//               setProjectForm({ ...projectForm, name: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Status"
//             value={projectForm.status}
//             onChange={(e) =>
//               setProjectForm({ ...projectForm, status: e.target.value })
//             }
//           />
//           <input
//             type="date"
//             className="border p-2 mr-2"
//             value={projectForm.deadline}
//             onChange={(e) =>
//               setProjectForm({ ...projectForm, deadline: e.target.value })
//             }
//           />
//           <button
//             onClick={addProject}
//             className="bg-pink-600 text-white px-4 py-2 rounded"
//           >
//             Save
//           </button>

//           <ul className="mt-4">
//             {projects.map((p, i) => (
//               <li
//                 key={i}
//                 className="flex justify-between items-center border-b py-1"
//               >
//                 {p.name} - {p.status} - {p.deadline}
//                 <button
//                   onClick={() => deleteProject(i)}
//                   className="text-red-500"
//                 >
//                   Delete
//                 </button>
//               </li>
//             ))}
//           </ul>

//           <div className="mt-2">
//             <button
//               onClick={() => downloadData(projects, "projects.json")}
//               className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
//             >
//               Download
//             </button>
//             <button
//               onClick={() => printData(projects)}
//               className="bg-gray-500 text-white px-3 py-1 rounded"
//             >
//               Print
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Missions */}
//       {activeTab === "missions" && (
//         <div>
//           <h2 className="text-lg font-semibold mb-2">Missions</h2>
//           <input
//             type="date"
//             className="border p-2 mr-2"
//             value={missionForm.date}
//             onChange={(e) =>
//               setMissionForm({ ...missionForm, date: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Activity"
//             value={missionForm.activity}
//             onChange={(e) =>
//               setMissionForm({ ...missionForm, activity: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Partner Name"
//             value={missionForm.partner}
//             onChange={(e) =>
//               setMissionForm({ ...missionForm, partner: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Support"
//             value={missionForm.support}
//             onChange={(e) =>
//               setMissionForm({ ...missionForm, support: e.target.value })
//             }
//           />
//           <input
//             className="border p-2 mr-2"
//             placeholder="Phone"
//             value={missionForm.phone}
//             onChange={(e) =>
//               setMissionForm({ ...missionForm, phone: e.target.value })
//             }
//           />
//           <button
//             onClick={addMission}
//             className="bg-pink-600 text-white px-4 py-2 rounded"
//           >
//             Save
//           </button>

//           <ul className="mt-4">
//             {missions.map((m, i) => (
//               <li
//                 key={i}
//                 className="flex justify-between items-center border-b py-1"
//               >
//                 {m.date} - {m.activity} - {m.partner} - {m.support} - {m.phone}
//                 <button
//                   onClick={() => deleteMission(i)}
//                   className="text-red-500"
//                 >
//                   Delete
//                 </button>
//               </li>
//             ))}
//           </ul>

//           <div className="mt-2">
//             <button
//               onClick={() => downloadData(missions, "missions.json")}
//               className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
//             >
//               Download
//             </button>
//             <button
//               onClick={() => printData(missions)}
//               className="bg-gray-500 text-white px-3 py-1 rounded"
//             >
//               Print
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Departments */}
//       {activeTab === "departments" && (
//         <div>
//           <h2 className="text-lg font-semibold mb-2">Departments</h2>
//           <input
//             className="border p-2 mr-2"
//             placeholder="Department Name"
//             value={departmentForm.deptName}
//             onChange={(e) =>
//               setDepartmentForm({ ...departmentForm, deptName: e.target.value })
//             }
//           />
//           <button
//             onClick={addDepartment}
//             className="bg-pink-600 text-white px-4 py-2 rounded"
//           >
//             Add Department
//           </button>

//           {departments.map((dept, deptIndex) => (
//             <div key={deptIndex} className="border mt-4 p-2">
//               <h3 className="font-bold">{dept.deptName}</h3>

//               <div className="mt-2">
//                 <input
//                   className="border p-2 mr-2"
//                   placeholder="Name"
//                   value={deptMemberForm.name}
//                   onChange={(e) =>
//                     setDeptMemberForm({
//                       ...deptMemberForm,
//                       name: e.target.value,
//                     })
//                   }
//                 />
//                 <input
//                   className="border p-2 mr-2"
//                   placeholder="Position"
//                   value={deptMemberForm.position}
//                   onChange={(e) =>
//                     setDeptMemberForm({
//                       ...deptMemberForm,
//                       position: e.target.value,
//                     })
//                   }
//                 />
//                 <input
//                   className="border p-2 mr-2"
//                   placeholder="Phone"
//                   value={deptMemberForm.phone}
//                   onChange={(e) =>
//                     setDeptMemberForm({
//                       ...deptMemberForm,
//                       phone: e.target.value,
//                     })
//                   }
//                 />
//                 <button
//                   onClick={() => addDeptMember(deptIndex)}
//                   className="bg-pink-600 text-white px-4 py-2 rounded"
//                 >
//                   Add Member
//                 </button>
//               </div>

//               <ul className="mt-2">
//                 {dept.members.map((m, i) => (
//                   <li
//                     key={i}
//                     className="flex justify-between items-center border-b py-1"
//                   >
//                     {m.name} - {m.position} - {m.phone}
//                     <button
//                       onClick={() => deleteDeptMember(deptIndex, i)}
//                       className="text-red-500"
//                     >
//                       Delete
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}

//           <div className="mt-2">
//             <button
//               onClick={() => downloadData(departments, "departments.json")}
//               className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
//             >
//               Download
//             </button>
//             <button
//               onClick={() => printData(departments)}
//               className="bg-gray-500 text-white px-3 py-1 rounded"
//             >
//               Print
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

























// src/pages/Adults.jsx
import React, { useEffect, useState } from "react";
import FinanceSummary from "../components/FinanceSummary";
import { useAuth } from "@/context/AuthContext"; // << CHANGED: use auth token

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function Adults() {
  const { token } = useAuth(); // << CHANGED: token used for authenticated requests
  const [activeTab, setActiveTab] = useState("membership");

  // Membership & New Believers (server-backed)
  const [members, setMembers] = useState([]);
  const [newBelievers, setNewBelievers] = useState([]);
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    residence: "",
  });

  // Finance (server-backed)
  const [finance, setFinance] = useState([]);
  const [financeForm, setFinanceForm] = useState({
    date: "",
    amount: "",
    service: "",
  });

  // Development (projects)
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    title: "",
    status: "",
    end_date: "",
  });

  // Missions
  const [missions, setMissions] = useState([]);
  const [missionForm, setMissionForm] = useState({
    title: "",
    partners: "",
    support: "",
    contact: "",
    start_date: "",
    end_date: "",
  });

  // Departments
  const [departments, setDepartments] = useState([]);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
  });

  // Generic edit modal state (used by multiple tabs)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editType, setEditType] = useState(null);

  // -------------------------
  // Fetch helpers (for tabs)
  // -------------------------
  const commonFetch = async (path, opts = {}) => {
    const headers = opts.headers || {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // for GET don't set Content-Type (avoid preflight mismatch)
     if (opts.method && opts.method !== "GET") {
       headers["Content-Type"] = "application/json";
     }

    const res = await fetch(`${API}${path}`, { ...opts, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error || errData?.message || "Request failed");
    }
    return res.json().catch(() => null);
  };

  useEffect(() => {
    // Fetch data for all tabs on mount (or when token changes)
    if (!token) return;

    // fetch members
    (async () => {
      try {
        const m = await commonFetch("/api/members/");
        setMembers(m || []);
      } catch (err) {
        console.error("Failed to load members:", err);
      }
    })();

    // fetch new believers
    (async () => {
      try {
        const bm = await commonFetch("/api/new-members");
        setNewBelievers(bm || []);
      } catch (err) {
        console.error("Failed to load new believers:", err);
      }
    })();

    // fetch finance entries
    (async () => {
      try {
        const f = await commonFetch("/api/finance");
        setFinance(f || []);
      } catch (err) {
        console.error("Failed to load finance:", err);
      }
    })();

    // fetch projects
    (async () => {
      try {
        const p = await commonFetch("/api/projects");
        setProjects(p || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    })();

    // fetch missions
    (async () => {
      try {
        const ms = await commonFetch("/api/missions");
        setMissions(ms || []);
      } catch (err) {
        console.error("Failed to load missions:", err);
      }
    })();

    // fetch departments
    (async () => {
      try {
        const d = await commonFetch("/api/departments");
        setDepartments(d || []);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    })();
  }, [token]);

  // -------------------------
  // MEMBERS (membership tab)
  // -------------------------
  const addMember = async (type) => {
    if (!memberForm.name || !memberForm.phone || !memberForm.residence) {
      alert("Please fill all member fields.");
      return;
    }

    try {
      const payload = {
        name: memberForm.name,
        phone: memberForm.phone,
        residence: memberForm.residence,
        type: type === "member" ? "member" : "believer",
      };
      const created = await commonFetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (type === "member") setMembers((s) => [created, ...s]);
      else setNewBelievers((s) => [created, ...s]);
      setMemberForm({ name: "", phone: "", residence: "" });
    } catch (err) {
      alert(`Failed to add member: ${err.message}`);
    }
  };

  const deleteMember = async (type, idOrIndex) => {
    // when item from server: we'll pass its id. For compatibility with earlier local lists,
    // if idOrIndex is a number and items have id property, treat as id.
    try {
      const list = type === "member" ? members : newBelievers;
      const item = list.find((it) => it.id === idOrIndex) || list[idOrIndex];
      if (!item) {
        // fallback: just remove from local if it's local only
        if (type === "member") setMembers((s) => s.filter((_, i) => i !== idOrIndex));
        else setNewBelievers((s) => s.filter((_, i) => i !== idOrIndex));
        return;
      }
      if (!confirm("Delete this entry?")) return;
      await commonFetch(`/api/members/${item.id}`, { method: "DELETE" });
      if (type === "member") setMembers((s) => s.filter((m) => m.id !== item.id));
      else setNewBelievers((s) => s.filter((m) => m.id !== item.id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  // -------------------------
  // FINANCE
  // -------------------------
  const addFinance = async () => {
    if (!financeForm.date || !financeForm.amount || !financeForm.service) {
      alert("Please fill all finance fields.");
      return;
    }
    try {
      const payload = {
        date: financeForm.date,
        amount: financeForm.amount,
        service_type: financeForm.service,
      };
      const created = await commonFetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setFinance((s) => [created, ...s]);
      setFinanceForm({ date: "", amount: "", service: "" });
    } catch (err) {
      alert(`Failed to add finance entry: ${err.message}`);
    }
  };

  const deleteFinance = async (idOrIndex) => {
    try {
      const item = finance.find((it) => it.id === idOrIndex) || finance[idOrIndex];
      if (!item) {
        setFinance((s) => s.filter((_, i) => i !== idOrIndex));
        return;
      }
      if (!confirm("Delete this finance entry?")) return;
      await commonFetch(`/api/finance/${item.id}`, { method: "DELETE" });
      setFinance((s) => s.filter((f) => f.id !== item.id));
    } catch (err) {
      alert(`Failed to delete finance: ${err.message}`);
    }
  };

  // -------------------------
  // PROJECTS (development)
  // -------------------------
  const addProject = async () => {
    if (!projectForm.title || !projectForm.status) {
      alert("Please fill project title and status.");
      return;
    }
    try {
      const payload = {
        title: projectForm.title,
        status: projectForm.status,
        end_date: projectForm.end_date || null,
      };
      const created = await commonFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setProjects((s) => [created, ...s]);
      setProjectForm({ title: "", status: "", end_date: "" });
    } catch (err) {
      alert(`Failed to add project: ${err.message}`);
    }
  };

  const deleteProject = async (idOrIndex) => {
    try {
      const item = projects.find((it) => it.id === idOrIndex) || projects[idOrIndex];
      if (!item) {
        setProjects((s) => s.filter((_, i) => i !== idOrIndex));
        return;
      }
      if (!confirm("Delete this project?")) return;
      await commonFetch(`/api/projects/${item.id}`, { method: "DELETE" });
      setProjects((s) => s.filter((p) => p.id !== item.id));
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  // -------------------------
  // MISSIONS
  // -------------------------
  const addMission = async () => {
    if (!missionForm.title) {
      alert("Please provide mission title.");
      return;
    }
    try {
      const payload = {
        title: missionForm.title,
        partners: missionForm.partners,
        support: missionForm.support,
        contact: missionForm.contact,
        start_date: missionForm.start_date || null,
        end_date: missionForm.end_date || null,
      };
      const created = await commonFetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMissions((s) => [created, ...s]);
      setMissionForm({ title: "", partners: "", support: "", contact: "", start_date: "", end_date: "" });
    } catch (err) {
      alert(`Failed to add mission: ${err.message}`);
    }
  };

  const deleteMission = async (idOrIndex) => {
    try {
      const item = missions.find((it) => it.id === idOrIndex) || missions[idOrIndex];
      if (!item) {
        setMissions((s) => s.filter((_, i) => i !== idOrIndex));
        return;
      }
      if (!confirm("Delete this mission?")) return;
      await commonFetch(`/api/missions/${item.id}`, { method: "DELETE" });
      setMissions((s) => s.filter((m) => m.id !== item.id));
    } catch (err) {
      alert(`Failed to delete mission: ${err.message}`);
    }
  };

  // -------------------------
  // DEPARTMENTS
  // -------------------------
  const addDepartment = async () => {
    if (!departmentForm.name) {
      alert("Please enter department name.");
      return;
    }
    try {
      const payload = { ...departmentForm };
      const created = await commonFetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setDepartments((s) => [created, ...s]);
      setDepartmentForm({ name: "", description: "", contact_person: "", contact_phone: "", contact_email: "" });
    } catch (err) {
      alert(`Failed to add department: ${err.message}`);
    }
  };

  const addDeptMember = (deptIndex) => {
    // keep behavior same as before (local) — backend relation management could be added later
    if (!deptMemberForm.name) return;
    const updated = [...departments];
    updated[deptIndex].members.push(deptMemberForm);
    setDepartments(updated);
    setDeptMemberForm({ name: "", position: "", phone: "" });
  };

  const deleteDeptMember = (deptIndex, memberIndex) => {
    const updated = [...departments];
    updated[deptIndex].members = updated[deptIndex].members.filter((_, i) => i !== memberIndex);
    setDepartments(updated);
  };

  // -------------------------
  // EDIT modal (popup) - used by Projects, Missions, Departments, Finance entries etc.
  // -------------------------
  const openEdit = (type, item) => {
    setEditType(type);
    setEditItem(item);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditItem(null);
    setEditType(null);
  };

  const saveEdit = async () => {
    if (!editItem || !editType) return;
    try {
      const payload = { ...editItem }; // assume server accepts these fields
      // normalize endpoint & id
      let path = "";
      if (editType === "project") path = `/api/projects/${editItem.id}`;
      else if (editType === "mission") path = `/api/missions/${editItem.id}`;
      else if (editType === "finance") path = `/api/finance/${editItem.id}`;
      else if (editType === "department") path = `/api/departments/${editItem.id}`;
      else if (editType === "member") path = `/api/members/${editItem.id}`;
      else if (editType === "newmember") path = `/api/new-members/${editItem.id}`;
      else throw new Error("Unknown edit type");

      const updated = await commonFetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // update local lists
      if (editType === "project") setProjects((s) => s.map((p) => (p.id === updated.id ? updated : p)));
      if (editType === "mission") setMissions((s) => s.map((m) => (m.id === updated.id ? updated : m)));
      if (editType === "finance") setFinance((s) => s.map((f) => (f.id === updated.id ? updated : f)));
      if (editType === "department") setDepartments((s) => s.map((d) => (d.id === updated.id ? updated : d)));
      if (editType === "member") setMembers((s) => s.map((m) => (m.id === updated.id ? updated : m)));
      if (editType === "newmember") setNewBelievers((s) => s.map((m) => (m.id === updated.id ? updated : m)));

      closeEdit();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  // -------------------------
  // Rendering UI (kept layout intact; buttons now call backend)
  // -------------------------
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
            className={`px-4 py-2 rounded ${activeTab === tab ? "bg-pink-600 text-white" : "bg-gray-200"}`}
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
          <input className="border p-2 mr-2" placeholder="Name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Phone" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Residence" value={memberForm.residence} onChange={(e) => setMemberForm({ ...memberForm, residence: e.target.value })} />
          <button onClick={() => addMember("member")} className="bg-pink-600 text-white px-4 py-2 rounded">Save</button>

          <ul className="mt-4">
            {members.map((m, i) => (
              <li key={m.id ?? i} className="flex justify-between items-center border-b py-1">
                <div>
                  {m.name} - {m.phone} - {m.residence || m.residence}
                </div>
                <div>
                  <button onClick={() => openEdit("member", m)} className="text-sm mr-2 text-blue-600">Edit</button>
                  <button onClick={() => deleteMember("member", m.id ?? i)} className="text-red-500">Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button onClick={() => { const filename = "members.json"; const blob = new Blob([JSON.stringify(members, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); }} className="bg-pink-600 text-white px-3 py-1 rounded mr-2">Download</button>
            <button onClick={() => { const w = window.open(); w.document.write("<pre>" + JSON.stringify(members, null, 2) + "</pre>"); w.print(); w.close(); }} className="bg-gray-500 text-white px-3 py-1 rounded">Print</button>
          </div>
        </div>
      )}

      {/* New Believers */}
      {activeTab === "believers" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">New Believers</h2>
          <input className="border p-2 mr-2" placeholder="Name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Phone" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Residence" value={memberForm.residence} onChange={(e) => setMemberForm({ ...memberForm, residence: e.target.value })} />
          <button onClick={() => addMember("believer")} className="bg-pink-600 text-white px-4 py-2 rounded">Save</button>

          <ul className="mt-4">
            {newBelievers.map((m, i) => (
              <li key={m.id ?? i} className="flex justify-between items-center border-b py-1">
                <div>
                  {m.name} - {m.phone} - {m.residence}
                </div>
                <div>
                  <button onClick={() => openEdit("newmember", m)} className="text-sm mr-2 text-blue-600">Edit</button>
                  <button onClick={() => deleteMember("believer", m.id ?? i)} className="text-red-500">Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button onClick={() => { const filename = "believers.json"; const blob = new Blob([JSON.stringify(newBelievers, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); }} className="bg-pink-600 text-white px-3 py-1 rounded mr-2">Download</button>
            <button onClick={() => { const w = window.open(); w.document.write("<pre>" + JSON.stringify(newBelievers, null, 2) + "</pre>"); w.print(); w.close(); }} className="bg-gray-500 text-white px-3 py-1 rounded">Print</button>
          </div>
        </div>
      )}

      {/* Finance */}
      {activeTab === "finance" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Finance</h2>
          <input type="date" className="border p-2 mr-2" value={financeForm.date} onChange={(e) => setFinanceForm({ ...financeForm, date: e.target.value })} />
          <select className="border p-2 mr-2" value={financeForm.service} onChange={(e) => setFinanceForm({ ...financeForm, service: e.target.value })}>
            <option value="">Select Service Type</option>
            <option value="Sunday Service">Sunday Service</option>
            <option value="Midweek Service">Midweek Service</option>
            <option value="Conference/Revival/Kesha">Conference/Revival/Kesha</option>
          </select>
          <input className="border p-2 mr-2" placeholder="Amount" value={financeForm.amount} onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })} />
          <button onClick={addFinance} className="bg-pink-600 text-white px-4 py-2 rounded">Save</button>

          <ul className="mt-4">
            {finance.map((f, i) => (
              <li key={f.id ?? i} className="flex justify-between items-center border-b py-1">
                {f.date} - {f.amount} - {f.service_type || f.service}
                <div>
                  <button onClick={() => openEdit("finance", f)} className="text-sm mr-2 text-blue-600">Edit</button>
                  <button onClick={() => deleteFinance(f.id ?? i)} className="text-red-500">Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <button onClick={() => { const filename = "finance.json"; const blob = new Blob([JSON.stringify(finance, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); }} className="bg-pink-600 text-white px-3 py-1 rounded mr-2">Download</button>
            <button onClick={() => { const w = window.open(); w.document.write("<pre>" + JSON.stringify(finance, null, 2) + "</pre>"); w.print(); w.close(); }} className="bg-gray-500 text-white px-3 py-1 rounded">Print</button>
          </div>

          <FinanceSummary finance={finance} />
        </div>
      )}

      {/* Development */}
      {activeTab === "development" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Development Projects</h2>
          <input className="border p-2 mr-2" placeholder="Project Name" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Status" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })} />
          <input type="date" className="border p-2 mr-2" value={projectForm.end_date} onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })} />
          <button onClick={addProject} className="bg-pink-600 text-white px-4 py-2 rounded">Save</button>

          <ul className="mt-4">
            {projects.map((p, i) => (
              <li key={p.id ?? i} className="flex justify-between items-center border-b py-1">
                {p.title} - {p.status} - {p.end_date || p.deadline}
                <div>
                  <button onClick={() => openEdit("project", p)} className="text-sm mr-2 text-blue-600">Edit</button>
                  <button onClick={() => deleteProject(p.id ?? i)} className="text-red-500">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missions */}
      {activeTab === "missions" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Missions</h2>
          <input type="date" className="border p-2 mr-2" value={missionForm.start_date} onChange={(e) => setMissionForm({ ...missionForm, start_date: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Activity/Title" value={missionForm.title} onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Partner Name" value={missionForm.partners} onChange={(e) => setMissionForm({ ...missionForm, partners: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Support" value={missionForm.support} onChange={(e) => setMissionForm({ ...missionForm, support: e.target.value })} />
          <input className="border p-2 mr-2" placeholder="Contact" value={missionForm.contact} onChange={(e) => setMissionForm({ ...missionForm, contact: e.target.value })} />
          <button onClick={addMission} className="bg-pink-600 text-white px-4 py-2 rounded">Save</button>

          <ul className="mt-4">
            {missions.map((m, i) => (
              <li key={m.id ?? i} className="flex justify-between items-center border-b py-1">
                {m.start_date || m.date} - {m.title} - {m.partners}
                <div>
                  <button onClick={() => openEdit("mission", m)} className="text-sm mr-2 text-blue-600">Edit</button>
                  <button onClick={() => deleteMission(m.id ?? i)} className="text-red-500">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Departments */}
      {activeTab === "departments" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Departments</h2>
          <input className="border p-2 mr-2" placeholder="Department Name" value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} />
          <button onClick={addDepartment} className="bg-pink-600 text-white px-4 py-2 rounded">Add Department</button>

          {departments.map((dept, deptIndex) => (
            <div key={dept.id ?? deptIndex} className="border mt-4 p-2">
              <h3 className="font-bold">{dept.name}</h3>

              <div className="mt-2">
                <input className="border p-2 mr-2" placeholder="Name" value={/* deptMemberForm usage preserved earlier */ ""} readOnly />
                <input className="border p-2 mr-2" placeholder="Position" value={""} readOnly />
                <input className="border p-2 mr-2" placeholder="Phone" value={""} readOnly />
                <button onClick={() => { /* kept local addDeptMember for now */ alert("Use department edit to manage members (future)."); }} className="bg-pink-600 text-white px-4 py-2 rounded">Add Member</button>
              </div>

              <ul className="mt-2">
                {(dept.members || []).map((m, i) => (
                  <li key={i} className="flex justify-between items-center border-b py-1">
                    {m.name} - {m.position} - {m.phone}
                    <button onClick={() => deleteDeptMember(deptIndex, i)} className="text-red-500">Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl">
            <h3 className="text-lg font-bold mb-4">Edit {editType}</h3>

            {/* Render a simple dynamic form based on editType */}
            <div className="flex flex-col gap-3">
              {Object.keys(editItem).map((k) => {
                // skip internal fields
                if (["id", "created_at", "createdBy", "creator"].includes(k)) return null;
                const value = editItem[k] ?? "";
                return (
                  <div key={k} className="flex flex-col">
                    <label className="text-sm font-medium">{k}</label>
                    <input
                      className="border p-2"
                      value={value}
                      onChange={(e) => setEditItem((prev) => ({ ...prev, [k]: e.target.value }))}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeEdit} className="px-3 py-1 rounded border">Cancel</button>
              <button onClick={saveEdit} className="px-3 py-1 rounded bg-pink-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}