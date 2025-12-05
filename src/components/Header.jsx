


// src/components/Header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth(); // ✅ get user + logout
  const role = user?.role || "guest"; // fallback to guest
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  // ✅ Define all possible items
  const allItems = [
    { name: "Home", path: "/" },
    { name: "Main ", path: "/adults" },
    { name: "CM", path: "/children-ministry" },
    { name: "Gallery", path: "/gallery" },
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

  // ✅ Add Profile for logged-in users
  if (user) {
    menuItems.push({ name: "Profile", path: "/profile" });
  }

  // ✅ Add Login/Logout as the last option
  const authItem = user
    ? { name: "Logout", action: () => { logout(); navigate("/"); } }
    : { name: "Login", path: "/login" };

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

          {/* Login/Logout button */}
          {authItem.path ? (
            <Link
              to={authItem.path}
              className="hover:text-purple-800 text-xl font-bold text-pink-900 transition"
            >
              {authItem.name}
            </Link>
          ) : (
            <button
              onClick={authItem.action}
              className="hover:text-purple-800 text-xl font-bold text-pink-900 transition"
            >
              {authItem.name}
            </button>
          )}
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

            {/* Mobile Login/Logout */}
            {authItem.path ? (
              <Link
                to={authItem.path}
                onClick={() => setIsOpen(false)}
                className="hover:text-purple-600 transition"
              >
                {authItem.name}
              </Link>
            ) : (
              <button
                onClick={() => {
                  authItem.action();
                  setIsOpen(false);
                }}
                className="text-left hover:text-purple-600 transition"
              >
                {authItem.name}
              </button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}