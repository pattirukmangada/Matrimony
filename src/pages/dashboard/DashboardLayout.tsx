import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Content */}
      <div className="flex flex-1">

        <Sidebar />

        <div className="flex-1 p-6 bg-gray-100">
          <Outlet />
        </div>

      </div>

    </div>
  );
}