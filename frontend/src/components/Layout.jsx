// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <Outlet />
      </div>
    </div>
  );
}