import React from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/sidebar/LogoutButton";
const SelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold mb-6">Choose an Option</h1>
      <button
        onClick={() => navigate("/templates")}
        className="px-6 py-2 bg-blue-500 text-white rounded"
      >
        Go to Templates List
      </button>
          <button
              disabled={false}
        onClick={() => navigate("/home")}
        className="px-6 py-2 bg-green-500 text-white rounded"
      >
        Go to Chat Page
      </button>

      <LogoutButton />
    </div>
  );
};

export default SelectionPage;
