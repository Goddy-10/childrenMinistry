
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

  // ### ADDED: deptMemberForm state (was referenced in logic earlier)
  const [deptMemberForm, setDeptMemberForm] = useState({
    name: "",
    position: "",
    phone: "",
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

  // -------------------------
  // ### ADDED HELPERS: Download / Print helpers
  // -------------------------

  // Build an HTML table string from columns + rows
  const buildHtmlTable = (title, columns, rows) => {
    const head = `<thead><tr>${columns
      .map(
        (c) =>
          `<th style="padding:6px 8px;border:1px solid #ccc;text-align:left">${c}</th>`
      )
      .join("")}</tr></thead>`;
    const body = `<tbody>${rows
      .map(
        (r) =>
          `<tr>${columns
            .map((c) => {
              const key = c.key || c;
              let val = r[key];
              if (val === null || val === undefined) val = "";
              return `<td style="padding:6px 8px;border:1px solid #ccc">${val}</td>`;
            })
            .join("")}</tr>`
      )
      .join("")}</tbody>`;

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
        </head>
        <body>
          <h2 style="font-family: Arial, Helvetica, sans-serif">${title}</h2>
          <table style="border-collapse: collapse; font-family: Arial, Helvetica, sans-serif; width:100%">${head}${body}</table>
        </body>
      </html>
    `;
  };

  // Download "Word" doc by sending HTML content with MS Word mimetype (widely supported)
  const downloadDocFromRows = (filename, title, columns, rows) => {
    const html = buildHtmlTable(title, columns, rows);
    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open print window for user to print/save as PDF
  const printRows = (title, columns, rows) => {
    const html = buildHtmlTable(title, columns, rows);
    const w = window.open("", "_blank");
    if (!w) {
      alert("Please allow popups for this site to print the report.");
      return;
    }
    w.document.write(html);
    // Add a small stylesheet for print clarity
    w.document.write(
      `<style>table{border-collapse:collapse} th, td{font-family: Arial, Helvetica, sans-serif; font-size:12px}</style>`
    );
    w.document.close();
    w.focus();
    // Give the new window a moment to render
    setTimeout(() => {
      w.print();
      // do not immediately close — user may cancel
      // w.close();
    }, 200);
  };

  // Backend finance export (download docx/pdf). Returns void; will open blob or new tab.
  const downloadFinanceBackend = async (format = "pdf", params = {}) => {
    try {
      // build URL with query params
      const url = new URL(`${API}/api/finance/export/${format}`);
      Object.keys(params || {}).forEach((k) => {
        if (params[k]) url.searchParams.append(k, params[k]);
      });

      // For PDF we can open in a new tab (so browser shows PDF or download)
      if (format === "pdf") {
        // include token by opening fetch then blob to download (can't set headers with window.open)
        // So we fetch blob with Authorization header and open it in a new tab
        const res = await fetch(url.toString(), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || "Export failed");
        }
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        // optionally revoke after short delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      }

      // For docx, fetch blob and trigger download
      if (format === "docx") {
        const res = await fetch(url.toString(), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || "Export failed");
        }
        const blob = await res.blob();
        const ext = "docx";
        const filename = `finance_report.${ext}`;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl);
        return;
      }

      throw new Error("Unknown format");
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // -------------------------
  // Fetch initial data
  // -------------------------
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
        const bm = await commonFetch("/api/adults/new-members");
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
        if (type === "member")
          setMembers((s) => s.filter((_, i) => i !== idOrIndex));
        else setNewBelievers((s) => s.filter((_, i) => i !== idOrIndex));
        return;
      }
      if (!confirm("Delete this entry?")) return;
      await commonFetch(`/api/members/${item.id}`, { method: "DELETE" });
      if (type === "member")
        setMembers((s) => s.filter((m) => m.id !== item.id));
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
      const item =
        finance.find((it) => it.id === idOrIndex) || finance[idOrIndex];
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
      const item =
        projects.find((it) => it.id === idOrIndex) || projects[idOrIndex];
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
      setMissionForm({
        title: "",
        partners: "",
        support: "",
        contact: "",
        start_date: "",
        end_date: "",
      });
    } catch (err) {
      alert(`Failed to add mission: ${err.message}`);
    }
  };

  const deleteMission = async (idOrIndex) => {
    try {
      const item =
        missions.find((it) => it.id === idOrIndex) || missions[idOrIndex];
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
  // const addDepartment = async () => {
  //   if (!departmentForm.name) {
  //     alert("Please enter department name.");
  //     return;
  //   }
  //   try {
  //     const payload = { ...departmentForm };
  //     const created = await commonFetch("/api/departments", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  //     setDepartments((s) => [created, ...s]);
  //     setDepartmentForm({ name: "", description: "", contact_person: "", contact_phone: "", contact_email: "" });
  //   } catch (err) {
  //     alert(`Failed to add department: ${err.message}`);
  //   }
  // };

  // const addDeptMember = (deptIndex) => {

  //   if (!deptMemberForm.name) return;
  //   const updated = [...departments];
  //   if (!updated[deptIndex].members) updated[deptIndex].members = [];
  //   updated[deptIndex].members.push(deptMemberForm);
  //   setDepartments(updated);
  //   setDeptMemberForm({ name: "", position: "", phone: "" });
  // };

  // const deleteDeptMember = (deptIndex, memberIndex) => {
  //   const updated = [...departments];
  //   updated[deptIndex].members = updated[deptIndex].members.filter((_, i) => i !== memberIndex);
  //   setDepartments(updated);
  // };

  // // -------------------------
  // // EDIT modal (popup) - used by Projects, Missions, Departments, Finance entries etc.
  // // -------------------------
  // const openEdit = (type, item) => {
  //   setEditType(type);
  //   setEditItem(item);
  //   setIsEditOpen(true);
  // };

  // const closeEdit = () => {
  //   setIsEditOpen(false);
  //   setEditItem(null);
  //   setEditType(null);
  // };

  // const saveEdit = async () => {
  //   if (!editItem || !editType) return;
  //   try {
  //     const payload = { ...editItem }; // assume server accepts these fields
  //     // normalize endpoint & id
  //     let path = "";
  //     if (editType === "project") path = `/api/projects/${editItem.id}`;
  //     else if (editType === "mission") path = `/api/missions/${editItem.id}`;
  //     else if (editType === "finance") path = `/api/finance/${editItem.id}`;
  //     else if (editType === "department") path = `/api/departments/${editItem.id}`;
  //     else if (editType === "member") path = `/api/members/${editItem.id}`;
  //     else if (editType === "newmember") path = `/api/new-members/${editItem.id}`;
  //     else throw new Error("Unknown edit type");

  //     const updated = await commonFetch(path, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     // update local lists
  //     if (editType === "project") setProjects((s) => s.map((p) => (p.id === updated.id ? updated : p)));
  //     if (editType === "mission") setMissions((s) => s.map((m) => (m.id === updated.id ? updated : m)));
  //     if (editType === "finance") setFinance((s) => s.map((f) => (f.id === updated.id ? updated : f)));
  //     if (editType === "department") setDepartments((s) => s.map((d) => (d.id === updated.id ? updated : d)));
  //     if (editType === "member") setMembers((s) => s.map((m) => (m.id === updated.id ? updated : m)));
  //     if (editType === "newmember") setNewBelievers((s) => s.map((m) => (m.id === updated.id ? updated : m)));

  //     closeEdit();
  //   } catch (err) {
  //     alert(`Failed to save: ${err.message}`);
  //   }
  // };

  // // -------------------------
  // // Rendering UI (kept layout intact; buttons now call backend)
  // // -------------------------
  // return (
  //   <div className="p-6">
  //     <h1 className="text-2xl font-bold text-pink-600 mb-4">Adults Ministry</h1>

  //     {/* Tabs */}
  //     <div className="flex space-x-2 mb-4">
  //       {[
  //         "membership",
  //         "believers",
  //         "finance",
  //         "development",
  //         "missions",
  //         "departments",
  //       ].map((tab) => (
  //         <button
  //           key={tab}
  //           className={`px-4 py-2 rounded ${activeTab === tab ? "bg-pink-600 text-white" : "bg-gray-200"}`}
  //           onClick={() => setActiveTab(tab)}
  //         >
  //           {tab.charAt(0).toUpperCase() + tab.slice(1)}
  //         </button>
  //       ))}
  //     </div>






  // -------------------- DEPARTMENTS --------------------
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
      setDepartmentForm({
        name: "",
        description: "",
        contact_person: "",
        contact_phone: "",
        contact_email: "",
      });
    } catch (err) {
      alert(`Failed to add department: ${err.message}`);
    }
  };

  const deleteDepartment = async (deptId) => {
    try {
      await commonFetch(`/api/departments/${deptId}`, { method: "DELETE" });
      setDepartments((s) => s.filter((d) => d.id !== deptId));
    } catch (err) {
      alert(`Failed to delete department: ${err.message}`);
    }
  };

  // -------------------- DEPARTMENT MEMBERS --------------------
  const addDeptMember = async (deptId, deptIndex) => {
    if (!deptMemberForm.name) return;

    try {
      const payload = { ...deptMemberForm, department_id: deptId };
      const created = await commonFetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setDepartments((prev) => {
        const updated = [...prev];
        if (!updated[deptIndex].members) updated[deptIndex].members = [];
        updated[deptIndex].members.push(created);
        return updated;
      });

      setDeptMemberForm({ name: "", position: "", phone: "" });
    } catch (err) {
      alert(`Failed to add member: ${err.message}`);
    }
  };

  const deleteDeptMember = async (deptId, memberId, deptIndex) => {
    try {
      await commonFetch(`/api/members/${memberId}`, { method: "DELETE" });
      setDepartments((prev) => {
        const updated = [...prev];
        updated[deptIndex].members = updated[deptIndex].members.filter(
          (m) => m.id !== memberId
        );
        return updated;
      });
    } catch (err) {
      alert(`Failed to delete member: ${err.message}`);
    }
  };

  // -------------------- EDIT MODAL --------------------
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
      const payload = { ...editItem };
      let path = "";

      if (editType === "project") path = `/api/projects/${editItem.id}`;
      else if (editType === "mission") path = `/api/missions/${editItem.id}`;
      else if (editType === "finance") path = `/api/finance/${editItem.id}`;
      else if (editType === "department")
        path = `/api/departments/${editItem.id}`;
      else if (editType === "member") path = `/api/members/${editItem.id}`;
      else if (editType === "newmember")
        path = `/api/new-members/${editItem.id}`;
      else throw new Error("Unknown edit type");

      const updated = await commonFetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // update local state
      if (editType === "project")
        setProjects((s) => s.map((p) => (p.id === updated.id ? updated : p)));
      if (editType === "mission")
        setMissions((s) => s.map((m) => (m.id === updated.id ? updated : m)));
      if (editType === "finance")
        setFinance((s) => s.map((f) => (f.id === updated.id ? updated : f)));
      if (editType === "department")
        setDepartments((s) =>
          s.map((d) => (d.id === updated.id ? updated : d))
        );
      if (editType === "member") {
        setDepartments((prev) =>
          prev.map((d) => {
            if (!d.members) return d;
            const updatedMembers = d.members.map((m) =>
              m.id === updated.id ? updated : m
            );
            return { ...d, members: updatedMembers };
          })
        );
      }
      if (editType === "newmember")
        setNewBelievers((s) =>
          s.map((m) => (m.id === updated.id ? updated : m))
        );

      closeEdit();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  // -------------------- RENDER UI --------------------
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

      {/* ------------Membership ---------------*/}

      {/* Membership */}
      {activeTab === "membership" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Membership</h2>

          {/* Form to add member */}
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
            onClick={async () => {
              if (!memberForm.name) return alert("Enter member name");
              try {
                const created = await commonFetch("/api/members", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(memberForm),
                });
                setMembers((s) => [created, ...s]);
                setMemberForm({ name: "", phone: "", residence: "" });
              } catch (err) {
                alert(`Failed to add member: ${err.message}`);
              }
            }}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          {/* Members list */}
          <ul className="mt-4">
            {members.map((m, i) => (
              <li
                key={m.id ?? i}
                className="flex justify-between items-center border-b py-1"
              >
                <div>
                  {m.name} - {m.phone} - {m.residence || ""}
                </div>
                <div>
                  <button
                    onClick={() => openEdit("member", m)}
                    className="text-sm mr-2 text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!m.id) return alert("Member ID missing");
                      try {
                        await commonFetch(`/api/members/${m.id}`, {
                          method: "DELETE",
                        });
                        setMembers((s) => s.filter((mem) => mem.id !== m.id));
                      } catch (err) {
                        alert(`Failed to delete member: ${err.message}`);
                      }
                    }}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Download / Print */}
          <div className="mt-2">
            <button
              onClick={() => {
                const rows = members.map((m) => ({
                  name: m.name,
                  phone: m.phone,
                  residence: m.residence || "",
                }));
                downloadDocFromRows(
                  "members.doc",
                  "Members",
                  ["Name", "Phone", "Residence"],
                  rows
                );
              }}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>

            <button
              onClick={() => {
                const rows = members.map((m) => ({
                  Name: m.name,
                  Phone: m.phone,
                  Residence: m.residence || "",
                }));
                printRows("Members", ["Name", "Phone", "Residence"], rows);
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}







      {/* -------------New Believers ----------------------*/}

      {activeTab === "believers" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">New Believers</h2>

          {/* Form to add new believer */}
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
            onClick={async () => {
              if (!memberForm.name) return alert("Enter name");
              try {
                const created = await commonFetch("/api/new-members", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(memberForm),
                });
                setNewBelievers((s) => [created, ...s]);
                setMemberForm({ name: "", phone: "", residence: "" });
              } catch (err) {
                alert(`Failed to add: ${err.message}`);
              }
            }}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          {/* List of new believers */}
          <ul className="mt-4">
            {newBelievers.map((m, i) => (
              <li
                key={m.id ?? i}
                className="flex justify-between items-center border-b py-1"
              >
                <div>
                  {m.name} - {m.phone} - {m.residence || ""}
                </div>
                <div>
                  <button
                    onClick={() => openEdit("newmember", m)}
                    className="text-sm mr-2 text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!m.id) return alert("ID missing");
                      try {
                        await commonFetch(`/api/new-members/${m.id}`, {
                          method: "DELETE",
                        });
                        setNewBelievers((s) => s.filter((b) => b.id !== m.id));
                      } catch (err) {
                        alert(`Failed to delete: ${err.message}`);
                      }
                    }}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Download / Print */}
          <div className="mt-2">
            <button
              onClick={() => {
                const rows = newBelievers.map((m) => ({
                  Name: m.name,
                  Phone: m.phone,
                  Residence: m.residence || "",
                }));
                downloadDocFromRows(
                  "new_believers.doc",
                  "New Believers",
                  ["Name", "Phone", "Residence"],
                  rows
                );
              }}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>

            <button
              onClick={() => {
                const rows = newBelievers.map((m) => ({
                  Name: m.name,
                  Phone: m.phone,
                  Residence: m.residence || "",
                }));
                printRows(
                  "New Believers",
                  ["Name", "Phone", "Residence"],
                  rows
                );
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>
        </div>
      )}

      





      {/* ----------------Finance---------------- */}

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
          <select
            className="border p-2 mr-2"
            value={financeForm.service}
            onChange={(e) =>
              setFinanceForm({ ...financeForm, service: e.target.value })
            }
          >
            <option value="">Select Service Type</option>
            <option value="Sunday Service">Sunday Service</option>
            <option value="Midweek Service">Midweek Service</option>
            <option value="Conference/Revival/Kesha">
              Conference/Revival/Kesha
            </option>
          </select>
          <input
            className="border p-2 mr-2"
            placeholder="Amount"
            value={financeForm.amount}
            onChange={(e) =>
              setFinanceForm({ ...financeForm, amount: e.target.value })
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
                key={f.id ?? i}
                className="flex justify-between items-center border-b py-1"
              >
                {f.date} - {f.amount} - {f.service_type || f.service}
                <div>
                  <button
                    onClick={() => openEdit("finance", f)}
                    className="text-sm mr-2 text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFinance(f.id ?? i)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            {/* Finance: prefer backend export (docx/pdf). For PDF open a new tab with fetched blob so token can be used. */}
            <button
              onClick={() => {
                // Download backend docx
                downloadFinanceBackend("docx", {}); // optional params: service_type, start, end
              }}
              className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
            >
              Download
            </button>
            <button
              onClick={() => {
                // Open backend PDF (will fetch then open blob in new tab)
                downloadFinanceBackend("pdf", {});
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Print
            </button>
          </div>

          <FinanceSummary finance={finance} />
        </div>
      )}

      {/*------------------------ Development--------------------- */}

      {activeTab === "development" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Development Projects</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Project Name"
            value={projectForm.title}
            onChange={(e) =>
              setProjectForm({ ...projectForm, title: e.target.value })
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
            value={projectForm.end_date}
            onChange={(e) =>
              setProjectForm({ ...projectForm, end_date: e.target.value })
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
                key={p.id ?? i}
                className="flex justify-between items-center border-b py-1"
              >
                {p.title} - {p.status} - {p.end_date || p.deadline}
                <div>
                  <button
                    onClick={() => openEdit("project", p)}
                    className="text-sm mr-2 text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProject(p.id ?? i)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      



      {/* -------------------Missions---------------------- */}
      {activeTab === "missions" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Missions</h2>
          <input
            type="date"
            className="border p-2 mr-2"
            value={missionForm.start_date}
            onChange={(e) =>
              setMissionForm({ ...missionForm, start_date: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Activity/Title"
            value={missionForm.title}
            onChange={(e) =>
              setMissionForm({ ...missionForm, title: e.target.value })
            }
          />
          <input
            className="border p-2 mr-2"
            placeholder="Partner Name"
            value={missionForm.partners}
            onChange={(e) =>
              setMissionForm({ ...missionForm, partners: e.target.value })
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
            placeholder="Contact"
            value={missionForm.contact}
            onChange={(e) =>
              setMissionForm({ ...missionForm, contact: e.target.value })
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
                key={m.id ?? i}
                className="flex justify-between items-center border-b py-1"
              >
                {m.start_date || m.date} - {m.title} - {m.partners}
                <div>
                  <button
                    onClick={() => openEdit("mission", m)}
                    className="text-sm mr-2 text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMission(m.id ?? i)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --------------------Departments ------------------------------*/}
      {activeTab === "departments" && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Departments</h2>
          <input
            className="border p-2 mr-2"
            placeholder="Department Name"
            value={departmentForm.name}
            onChange={(e) =>
              setDepartmentForm({ ...departmentForm, name: e.target.value })
            }
          />
          <button
            onClick={addDepartment}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Add Department
          </button>

          {departments.map((dept, deptIndex) => (
            <div key={dept.id ?? deptIndex} className="border mt-4 p-2">
              <h3 className="font-bold">{dept.name}</h3>

              <div className="mt-2">
                <input
                  className="border p-2 mr-2"
                  placeholder="Name"
                  value={/* deptMemberForm usage preserved earlier */ ""}
                  readOnly
                />
                <input
                  className="border p-2 mr-2"
                  placeholder="Position"
                  value={""}
                  readOnly
                />
                <input
                  className="border p-2 mr-2"
                  placeholder="Phone"
                  value={""}
                  readOnly
                />
                <button
                  onClick={() => {
                    /* kept local addDeptMember for now */ alert(
                      "Use department edit to manage members (future)."
                    );
                  }}
                  className="bg-pink-600 text-white px-4 py-2 rounded"
                >
                  Add Member
                </button>
              </div>

              <ul className="mt-2">
                {(dept.members || []).map((m, i) => (
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

              {/* Department-level export buttons (downloads department's members) */}
              <div className="mt-2">
                <button
                  onClick={() => {
                    const rows = (dept.members || []).map((m) => ({
                      Name: m.name,
                      Position: m.position || "",
                      Phone: m.phone || "",
                    }));
                    downloadDocFromRows(
                      `${dept.name || "department"}_members.doc`,
                      `${dept.name || "Department"} Members`,
                      ["Name", "Position", "Phone"],
                      rows
                    );
                  }}
                  className="bg-pink-600 text-white px-3 py-1 rounded mr-2"
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    const rows = (dept.members || []).map((m) => ({
                      Name: m.name,
                      Position: m.position || "",
                      Phone: m.phone || "",
                    }));
                    printRows(
                      `${dept.name || "Department"} Members`,
                      ["Name", "Position", "Phone"],
                      rows
                    );
                  }}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Print
                </button>
              </div>
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
                if (["id", "created_at", "createdBy", "creator"].includes(k))
                  return null;
                const value = editItem[k] ?? "";
                return (
                  <div key={k} className="flex flex-col">
                    <label className="text-sm font-medium">{k}</label>
                    <input
                      className="border p-2"
                      value={value}
                      onChange={(e) =>
                        setEditItem((prev) => ({
                          ...prev,
                          [k]: e.target.value,
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeEdit} className="px-3 py-1 rounded border">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1 rounded bg-pink-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
