import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const TemplateCSVUpload = () => {
  const location = useLocation();
  const { template } = location.state;

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

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
      const response = await axios.post("/api/send-messages-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setUploadStatus("File uploaded and messages are being sent.");
      } else {
        setUploadStatus("Failed to upload file.");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("Error occurred while uploading the file.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Phone Numbers</h1>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Template Name: {template.name}
        </label>

        <label className="block text-gray-700 text-sm font-bold mb-2">
          Body Text: {template.components.find((c) => c.type === "BODY").text}
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Upload CSV with Phone Numbers
        </label>
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      <button onClick={handleUpload} className="btn btn-primary">
        Upload and Send Messages
      </button>

      {uploadStatus && <p className="mt-4">{uploadStatus}</p>}
    </div>
  );
};

export default TemplateCSVUpload;
