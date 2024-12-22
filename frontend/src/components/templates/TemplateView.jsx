import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const TemplateView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { template } = location.state;

  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [campaigns, setCampaigns] = useState([]);

  if (!template) {
    return <p>No template data available</p>;
  }

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(
          `/api/campaigns/${template.name}`
        );
        if (response.status === 200) {
          setCampaigns(response.data);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, [template.name]);

  const detectVariables = (text) => {
    const regex = /{{(\d+)}}/g;
    let match;
    const variables = [];
    while ((match = regex.exec(text)) !== null) {
      variables.push(match[1]);
    }
    return variables;
  };

  const getRowsForBody = (text) => {
    return Math.max(3, Math.ceil(text.length / 60));
  };

  const bodyComponent = template.components.find((c) => c.type === "BODY");
  const footerComponent = template.components.find((c) => c.type === "FOOTER");
  const buttonsComponent = template.components.find(
    (c) => c.type === "BUTTONS"
  );
  const headerComponent = template.components.find((c) => c.type === "HEADER");

  const variables = bodyComponent ? detectVariables(bodyComponent.text) : [];
  const exampleValues = bodyComponent?.example?.body_text || [];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template", JSON.stringify(template));

    try {
      const response = await axios.post(
        "/api/templates/send-messages-file",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        setUploadStatus("File uploaded and messages are being sent.");
      } else {
        setUploadStatus("Failed to upload file.");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("Error occurred while uploading the file.");
    }
    setShowConfirmationModal(false);
  };

  const handleConfirmUpload = () => {
    setShowConfirmationModal(true);
  };

  return (
    <div className="flex flex-col gap-4 mt-12 p-4 w-full max-w-4xl mx-auto rounded-lg shadow-lg overflow-auto">
      <div className="flex justify-between items-center">
        <button className="btn mb-4" onClick={() => navigate(-1)}>
          Back to List
        </button>
        <button
          className="btn btn-secondary mb-4"
          onClick={() => setShowModal(true)}
        >
          Upload CSV
        </button>
      </div>

      {/* Template Details */}

      <div className="row flex items-center gap-4">
        <div className="col w-full md:w-1/2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="templateName"
          >
            Template Name
          </label>
          <input
            id="templateName"
            type="text"
            value={template.name}
            readOnly
            className="input input-bordered w-full bg-gray-100 py-1 px-2 text-sm"
          />
        </div>
        <div className="col w-full md:w-1/2">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="templateLanguage"
          >
            Language
          </label>
          <input
            id="templateLanguage"
            type="text"
            value={template.language}
            readOnly
            className="input input-bordered w-full bg-gray-100 py-1 px-2 text-sm"
          />
        </div>
      </div>

      {/* Header, Body, Footer Components */}
      {headerComponent && (
        <div className="header-section mb-4 flex flex-col items-center justify-center">
          {headerComponent.format === "IMAGE" &&
            headerComponent.example?.header_handle && (
              <img
                src={headerComponent.example.header_handle[0]}
                alt="Header Image"
                className="w-1/2 h-auto mb-2 rounded mx-auto"
              />
            )}
          <h2 className="text-md font-semibold text-center">
            {headerComponent.text}
          </h2>
        </div>
      )}

      {bodyComponent && (
        <div className="row items-center gap-4">
          <div className="w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="templateBody"
            >
              Body Text
            </label>
            <textarea
              id="templateBody"
              value={bodyComponent.text}
              readOnly
              className="textarea textarea-bordered w-full bg-gray-100 resize-none text-sm"
              rows={getRowsForBody(bodyComponent.text)}
            />
          </div>

          {variables.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold">Variable Examples</h3>
              {variables.map((variable, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <p className="block text-gray-700 text-sm font-bold">
                    {"{{" + variable + "}}"}:
                  </p>
                  <p className="text-gray-600 text-sm">
                    {exampleValues[index] || `No example provided`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {footerComponent && (
        <div className="footer-section mt-4">
          <p className="text-gray-500 text-sm">{footerComponent.text}</p>
        </div>
      )}

      {buttonsComponent && (
        <div className="buttons-section mt-4 space-y-2">
          {buttonsComponent.buttons.map((button, idx) => (
            <a
              key={idx}
              href={button.url}
              className="btn btn-primary block text-center text-sm py-1 px-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              {button.text}
            </a>
          ))}
        </div>
      )}

      {template.category && (
        <div className="mt-4">
          <p className="text-gray-500 text-sm">Category: {template.category}</p>
        </div>
      )}

      {/* Campaign Details Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold">Campaigns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.length > 0 ? (
            campaigns.map((campaign, index) => (
              <div key={index} className="card bg-white p-4 rounded shadow-md">
                <h4 className="text-md font-semibold mb-2">
                  Campaign Status: {campaign.campaignDetails.status}
                </h4>
                <p className="text-sm">
                  Target: {campaign.campaignDetails.target}
                </p>
                <p className="text-sm">
                  Created At:{" "}
                  {new Date(
                    campaign.campaignDetails.createdAt
                  ).toLocaleDateString()}
                </p>
                <p className="text-sm">Sent: {campaign.campaignDetails.sent}</p>
                <p className="text-sm">
                  Delivered: {campaign.campaignDetails.delivered}
                </p>
                <p className="text-sm">Seen: {campaign.campaignDetails.seen}</p>
              </div>
            ))
          ) : (
            <p>No campaigns available for this template.</p>
          )}
        </div>
      </div>

      {/* Modal for CSV Upload */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full mb-4"
            />

            <div className="flex justify-between">
              <button
                className="btn btn-secondary"
                onClick={handleConfirmUpload}
              >
                Upload
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Upload</h2>
            <p>
              Are you sure you want to upload the CSV and send the messages?
            </p>
            <div className="flex justify-between mt-4">
              <button className="btn btn-secondary" onClick={handleUpload}>
                Yes
              </button>
              <button
                className="btn"
                onClick={() => setShowConfirmationModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Upload Status */}
      {uploadStatus && (
        <div className="mt-4 p-2 bg-green-200 text-green-800 rounded">
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default TemplateView;
