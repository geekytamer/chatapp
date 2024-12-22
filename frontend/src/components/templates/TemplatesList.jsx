import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import useGetTemplates from "../../hooks/useGetTemplates";

const TemplatesList = () => {
  const { templates, fetchMessageTemplates, loading } = useGetTemplates();
  const navigate = useNavigate(); // To navigate between routes

  useEffect(() => {
    fetchMessageTemplates(); // Fetch templates when the component mounts
  }, []);

  const handleCreateTemplate = () => {
    navigate("/templates/create");
  };

  const handleTemplateClick = (template) => {
    navigate(`/templates/${template.id}`, { state: { template } });
  };

  return (
    <div className="overflow-x-auto w-1/1">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Templates List</h1>
        <button 
          className="btn btn-primary"
          onClick={handleCreateTemplate}
        >
          Create New Template
        </button>
      </div>
      {loading && <span className="loading loading-spinner"></span>}
      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {templates.length > 0 &&
              templates.map((template) => (
                <tr key={template.id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div
                      className="font-bold cursor-pointer"
                      onClick={() => handleTemplateClick(template)}
                    >
                      {template.name}
                    </div>
                  </td>
                  <td>{template.category}</td>
                  <td>{template.status}</td>
                  <th>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleTemplateClick(template)}
                    >
                      View Details
                    </button>
                  </th>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default TemplatesList;
