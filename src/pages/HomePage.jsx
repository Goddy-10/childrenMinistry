
















// export default function Homepage() {
//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Header */}
//       <header className="bg-[#6c89b8] text-white py-4 md:py-6 shadow-md flex justify-between items-center px-4 md:px-12">
//         <h1 className="text-xl md:text-3xl font-bold text-purple-200 text-center md:text-left">
//           Welcome to GCC Karama Children Ministry
//         </h1>

//         {/* Navigation Buttons (we'll connect these later) */}
//         <nav className="hidden md:flex gap-4">
//           <button className="bg-white text-[#6c89b8] px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
//             Home
//           </button>
//           <button className="bg-white text-[#6c89b8] px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
//             Timetable
//           </button>
//           <button className="bg-white text-[#6c89b8] px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
//             Reports
//           </button>
//         </nav>
//       </header>

//       {/* Body */}
//       <main className="flex-grow flex justify-center bg-[#6c89b8] p-4 md:p-6 pt-8 md:pt-12">
//         {/* Floating Card */}
//         <div
//           className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm md:max-w-lg 
//                      transition-transform transform hover:scale-105 hover:shadow-3xl"
//         >
//           <h2 className="text-lg md:text-2xl font-bold text-purple-600 mb-4 bg-gray-200 px-2 py-1 rounded-md text-center">
//             Home
//           </h2>
//           <p className="text-gray-600 mb-6 text-sm md:text-base text-center">
//             This is a floating panel styled with Tailwind CSS. Resize the screen
//             to see responsive behavior.
//           </p>

//           {/* Button */}
//           <button
//             className="w-full bg-[#6c89b8] text-white py-2 md:py-3 rounded-xl font-semibold 
//                        shadow-md hover:bg-[#58729c] hover:shadow-lg 
//                        transition duration-300 ease-in-out"
//           >
//             Get Started
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// }



// import { Card, CardContent } from "@/components/ui/card";

// export default function HomePage() {
//   return (
//     <div className="pt-20 flex justify-center">
//       <Card className="w-80 shadow-lg">
//         <CardContent className="p-6 text-center">
//           <h2 className="text-2xl font-semibold mb-4">Welcome to CMS</h2>
//           <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
//             <span className="text-gray-500">[Picture Placeholder]</span>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }










// src/pages/HomePage.jsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-500 flex[calc(100vh-4rem)] pt-4 px-4 md:px-6 flex items-center justify-center">
      {/* Floating Card */}
      <div className="bg-white w-full max-w-7xl min-h-[75vh] rounded-2xl shadow-2xl overflow-hidden">
        {/* Title strip */}
        <div className="bg-pink-600 text-white text-center px-6 py-4 md:py-6">
          <h2 className="text-xl md:text-2xl font-bold">Welcome to Grace Celebration Chapel-Karama </h2>
        </div>

        {/* Body: picture placeholder */}
        <div className="p-6 md:p-10">
          <div className="h-64 md:h-80 rounded-xl border-2 border-dashed border-neutral/60 bg-neutral-light/60 flex items-center justify-center">
            <span className="text-neutral">[ Picture Placeholder ]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
