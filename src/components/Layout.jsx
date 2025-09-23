// src/components/Layout.jsx
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header always on top */}
      <Header />

      {/* Main content */}
      <main className="flex-grow pt-6 px-4 md:px-6">
        <Outlet />
      </main>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}
