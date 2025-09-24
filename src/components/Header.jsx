import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth(); // 🔹 Get user from context
  const role = user?.role || "guest"; // fallback to guest

  const toggleMenu = () => setIsOpen(!isOpen);

  // ✅ Define all possible items
  const allItems = [
    { name: "Home", path: "/" },
    { name: "Main Church", path: "/adults" },
    { name: "Children Ministry", path: "/children-ministry" },
    { name: "Church Gallery", path: "/gallery" },
    { name: "Visitors", path: "/visitor-qr" },
    { name: "Events", path: "/events" },
  ];

  // ✅ Filter items based on role
  let menuItems = [];
  if (role === "admin") {
    menuItems = allItems; // full access
  } else if (role === "teacher") {
    menuItems = [
      allItems[0], // Home
      allItems[2], // Children Ministry
      allItems[5], // Events
      allItems[3], // Gallery
    ];
  } else {
    // guest
    menuItems = [
      allItems[0], // Home
      allItems[5], // Events
      allItems[3], // Gallery
    ];
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-500 text-white shadow-md z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-5">
        <h1 className="text-xl font-bold text-pink-900">
          Welcome to GCC Karama Church
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="hover:text-purple-800 text-xl font-bold text-pink-900 transition"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-purple-600" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu with Slide Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-600 flex flex-col gap-4 px-4 py-3"
          >
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="hover:text-purple-600 transition"
              >
                {item.name}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
