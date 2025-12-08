




import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AddTeacherDialog({ onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!name || !phone || !username || !password) return;

    // ✅ Send all fields to parent (Teachers.jsx → backend later)
    onSubmit({ name, phone, username, password });

    // Reset form
    setName("");
    setPhone("");
    setUsername("");
    setPassword("");
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="mb-4 bg-purple-600 hover:bg-purple-700 text-white"
      >
        Add Teacher
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a Teacher</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <input
              type="text"
              placeholder="Teacher Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md p-2 w-full"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-md p-2 w-full"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border rounded-md p-2 w-full"
            />
            <input
              type="password"
              placeholder="Initial Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-md p-2 w-full"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}