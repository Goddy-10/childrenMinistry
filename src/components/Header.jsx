// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Menu, X } from "lucide-react"; // hamburger + close icons

// function Header() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo / Brand */}
//           <Link to="/" className="text-xl font-bold text-blue-600">
//             ChurchMS
//           </Link>

//           {/* Desktop Menu */}
//           <nav className="hidden md:flex space-x-6">
//             <Link to="/" className="hover:text-blue-600">
//               Home
//             </Link>
//             <Link to="/members" className="hover:text-blue-600">
//               Members
//             </Link>
//             <Link to="/reports" className="hover:text-blue-600">
//               Reports
//             </Link>
//           </nav>

//           {/* Mobile Hamburger Button */}
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="md:hidden focus:outline-none"
//           >
//             {isOpen ? <X size={28} /> : <Menu size={28} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu (Dropdown) */}
//       {isOpen && (
//         <div className="md:hidden bg-white shadow-lg">
//           <nav className="flex flex-col space-y-2 px-4 py-4">
//             <Link
//               to="/"
//               className="hover:text-blue-600"
//               onClick={() => setIsOpen(false)}
//             >
//               Home
//             </Link>
//             <Link
//               to="/members"
//               className="hover:text-blue-600"
//               onClick={() => setIsOpen(false)}
//             >
//               Members
//             </Link>
//             <Link
//               to="/reports"
//               className="hover:text-blue-600"
//               onClick={() => setIsOpen(false)}
//             >
//               Reports
//             </Link>
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// }

// export default Header;





import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Main Church", path: "/adults" },
    { name: " CM Timetable", path: "/timetable" },
    { name: "Reports", path: "/reports" },
    { name: "Teachers", path: "/members" },
    { name: "Classes", path: "/classes" },
    { name: "Children", path: "/children" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-500 text-white shadow-md z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <h1 className="text-xl font-bold text-pink-900"> Welcome to GCC Karama Church </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="hover:text-purple-800 hover text-xl font-bold: text-pink-900 transition"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-purple-600 " onClick={toggleMenu}>
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
                onClick={() => setIsOpen(false)} // close after click
                className="hover:text-purple-600 hover:text-purple-600 transition"
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