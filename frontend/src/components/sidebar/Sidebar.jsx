import { NavLink } from "react-router-dom";
import SearchInput from "./Searchinput";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";

const Sidebar = () => {

  return (
    <div className="w-72 min-w-72 border-r border-slate-500 p-4 flex flex-col bg-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">ChatApp</h2>
        <NavLink
          to="/templates"
          className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg shadow hover:bg-blue-600 transition"
        >
          📋 Templates
        </NavLink>
      </div>

      {/* Search + Conversations */}
      <SearchInput />
      <div className="divider my-4"></div>
      <div className="flex-1 overflow-y-auto">
        <Conversations />
      </div>

      {/* Logout at bottom */}
      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
};

export default Sidebar;