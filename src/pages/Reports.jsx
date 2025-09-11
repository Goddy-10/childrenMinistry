import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CLASS_TABS = [
  { id: "gifted", label: "Gifted Brains (0–3)" },
  { id: "beginners", label: "Beginners (3–6)" },
  { id: "shinners", label: "Shinners (6–9)" },
  { id: "conquerors", label: "Conquerors (9–13)" },
  { id: "teens", label: "Teens (13+)" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("gifted");
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    date: "",
    topic: "",
    bibleRefs: "",
    resources: "",
    remarks: "",
  });

  const handleAddReport = (e) => {
    e.preventDefault();
    console.log("New Report:", { ...form, class: activeTab });
    setForm({ date: "", topic: "", bibleRefs: "", resources: "", remarks: "" });
    setOpenAdd(false);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">Reports</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tabs */}
        <TabsList className="bg-purple-100 mb-6 flex flex-wrapflex">
          {CLASS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="px-4 py-2 rounded-t-lg text-sm font-medium text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white
            data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Per-class content */}
        {CLASS_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today’s Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">--</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Today’s Offering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">--</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">--</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month Offering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-pink-600">--</p>
                </CardContent>
              </Card>
            </div>

            {/* Table + Add button */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-pink-600">
                  Weekly Reports
                </h2>

                {/* Add Report Modal */}
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                  <DialogTrigger asChild>
                    <Button className="bg-pink-600 hover:bg-purple-700 text-white">
                      Add Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Weekly Report</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddReport} className="grid gap-3">
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm({ ...form, date: e.target.value })
                        }
                        required
                      />
                      <Input
                        placeholder="Topic / Lesson"
                        value={form.topic}
                        onChange={(e) =>
                          setForm({ ...form, topic: e.target.value })
                        }
                        required
                      />
                      <Input
                        placeholder="Bible References"
                        value={form.bibleRefs}
                        onChange={(e) =>
                          setForm({ ...form, bibleRefs: e.target.value })
                        }
                        required
                      />
                      <Input
                        placeholder="Resources"
                        value={form.resources}
                        onChange={(e) =>
                          setForm({ ...form, resources: e.target.value })
                        }
                      />
                      <Textarea
                        placeholder="Remarks"
                        value={form.remarks}
                        onChange={(e) =>
                          setForm({ ...form, remarks: e.target.value })
                        }
                      />
                      <Button
                        type="submit"
                        className="bg-pink-600 hover:bg-purple-700 text-white"
                      >
                        Save Report
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Topic/Lesson</th>
                      <th className="px-3 py-2 text-left">Bible References</th>
                      <th className="px-3 py-2 text-left">Resources</th>
                      <th className="px-3 py-2 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder row */}
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-pink-600 py-4"
                      >
                        No reports yet.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
