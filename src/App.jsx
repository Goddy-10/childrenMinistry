// src/App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import Teachers from "./pages/Teachers";
import ClassesPage from "./pages/Classes";
import Children from "./pages/Children";
import { Toaster } from "./components/ui/toaster";
import Reports from "./pages/Reports";
import Timetable from "./pages/Timetable";
export default function App() {
  return (
    <>
      <Header />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/members" element={<Teachers />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/children" element={<Children />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/timetable" element={<Timetable />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
}
