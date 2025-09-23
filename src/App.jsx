// // src/App.jsx
// import { Routes, Route , Router,Navigate} from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import Header from "./components/Header";
// import Teachers from "./pages/Teachers";
// import ClassesPage from "./pages/Classes";
// import Children from "./pages/Children";
// import { Toaster } from "./components/ui/toaster";
// import Reports from "./pages/Reports";
// import Timetable from "./pages/Timetable";
// import Adults from "./pages/Adults";
// import ChildrenMinistry from "./pages/ChildrenMinistry";
// export default function App() {
//   return (
//     <>
//       <Header />
//       <div className="pt-16">
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/members" element={<Teachers />} />
//           <Route path="/classes" element={<ClassesPage />} />
//           <Route path="/children" element={<Children />} />
//           <Route path="/reports" element={<Reports />} />
//           <Route path="/timetable" element={<Timetable />} />
//           <Route path="/timetable" element={<Timetable />} />
//           <Route path="/adults" element={<Adults />} />
//           <Route path="/children-ministry" element={<ChildrenMinistry />} />
//         </Routes>
//       </div>
//       <Toaster />
//     </>
//   );
// }


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
import Adults from "./pages/Adults";
import ChildrenMinistry from "./pages/ChildrenMinistry";
import VisitorQRCode from "./pages/VisitorQrCode";
import VisitorForm from "./pages/VisitorForm";
import Gallery from "./pages/Gallery";
import ProgramsTab from "./components/ProgramsTab";
import Events from "./pages/Events";

export default function App() {
  return (
    <>
      <Header />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/adults" element={<Adults />} />
          <Route path="/visitor-qr" element={<VisitorQRCode />} />
          <Route path="/visitor-form" element={<VisitorForm />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/events" element={<Events />} />
          {/* ✅ Children Ministry with nested tabs */}
          <Route path="/children-ministry" element={<ChildrenMinistry />}>
            <Route path="timetable" element={<Timetable />} />
            <Route path="reports" element={<Reports />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="children" element={<Children />} />
            <Route path="programs" element={<ProgramsTab />} />
          </Route>
        </Routes>
      </div>
      <Toaster />
    </>
  );
}