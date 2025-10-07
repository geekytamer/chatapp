import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateTemplatePage = () => {
  // State for form inputs
  const [templateName, setTemplateName] = useState("");
  const [templateLanguage, setTemplateLanguage] = useState("en_us");
  const [templateCategory, setTemplateCategory] = useState("MARKETING");
  const [headerType, setHeaderType] = useState("");
  const [headerText, setHeaderText] = useState("");
  const [headerFile, setHeaderFile] = useState(null);
  const [bodyText, setBodyText] = useState("");
  const [buttons, setButtons] = useState([{ text: "", url: "" }]);
  const [variables, setVariables] = useState([]); // Variables state

  // Effect to detect variables in the body text
  useEffect(() => {
    const detectedVariables = [...bodyText.matchAll(/{{(\d+)}}/g)].map(
      (match) => match[1]
    );
    setVariables(detectedVariables);
  }, [bodyText]);

  // Handler for adding buttons dynamically
  const handleAddButton = () => {
    setButtons([...buttons, { text: "", url: "" }]);
  };

  // Handler for button input changes
  const handleButtonChange = (index, field, value) => {
    const updatedButtons = [...buttons];
    updatedButtons[index][field] = value;
    setButtons(updatedButtons);
  };

  // Function to handle deleting a button
  const handleDeleteButton = (index) => {
    const updatedButtons = buttons.filter((_, i) => i !== index); // Remove the button at the specified index
    setButtons(updatedButtons);
  };

  // Submit handler to create template
  const handleSubmit = async (e) => {
  e.preventDefault();

  let uploadedFileHandle = null;
  if (headerFile && headerType !== "text") {
    try {
      const fileSize = headerFile.size;
      const fileName = headerFile.name;
      const fileType = headerFile.type;

      // Step 1: Start the upload session (send request to your backend)
      const startSessionResponse = await fetch("/api/media/start-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileSize,
          fileType,
          accessToken:
            "EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD", // Send token securely from backend in production
        }),
      });

      const startSessionData = await startSessionResponse.json();
      console.log("Upload session starteddddd:", startSessionData);
      if (!startSessionData.id) {
        throw new Error("Failed to start the upload session.");
      }

      const uploadSessionId = startSessionData.id;

      const formData = new FormData();
      formData.append("file", headerFile); // Add file to formData
      formData.append("uploadSessionId", uploadSessionId);
      formData.append(
        "accessToken",
        "EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD"
      ); // Add token

      try {
        // Create an AbortController for managing timeouts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort(); // Abort the request if it takes too long
        }, 15 * 60 * 10000); // 10 minutes timeout (adjust as needed)

        const uploadResponse = await fetch("/api/media/upload-file", {
          method: "POST",
          body: formData, // Send as multipart/form-data
          signal: controller.signal, // Attach the signal to the fetch call
        });

        clearTimeout(timeoutId); // Clear the timeout once the request completes

        // Check if the response is OK
        if (!uploadResponse.ok) {
          console.log(uploadResponse)
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        // Parse the JSON response
        const uploadFileData = await uploadResponse.json();

        // Validate the response structure
        if (!uploadFileData.h) {
          throw new Error("File upload failed: Missing 'h' in response.");
        }

        uploadedFileHandle = uploadFileData.h;
        console.log("File uploaded:", uploadedFileHandle);
      } catch (error) {
        if (error.name === "AbortError") {
          console.error("File upload timed out.");
          alert("Media upload timed out. Please try again.");
        } else {
          console.error("Error uploading file:", error);
          alert("Media upload failed. Please try again.");
        }
      }

      
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Media upload failed. Please try again.");
      return;
    }
  }

  // Proceed with creating template as before...

    // Step 3: Prepare the header component, now including the uploaded media handle if applicable
    let headerComponent = null
    if (headerType && (headerFile || headerText)) {
      headerComponent = {
        type: "HEADER",
        format: headerType.toUpperCase(),
        ...(headerType === "text" && { text: headerText }),
        ...(headerType !== "text" && {
          example: {
            header_handle: [
                uploadedFileHandle,
            ],
          },
        }),
      };
    }

    console.log("header component",headerComponent)

    // Prepare the body component
    const bodyComponent = {
      type: "BODY",
      text: bodyText,
      ...(variables.length > 0 && {
        example: {
          body_text: variables.map((_, index) => `Value for {{${index + 1}}}`),
        },
      }),
    };

    // Conditionally add buttons if they exist
    const components = [bodyComponent];

    if (headerComponent) {
      components.unshift(headerComponent);
    }
    
    if (buttons.length > 0) {
      const buttonsComponent = {
        type: "BUTTONS",
        buttons: buttons.map((button) => ({
          type: "URL",
          text: button.text,
          url: button.url,
        })),
      };
      components.push(buttonsComponent);
    }

    // Step 4: Submit the template
    const templateData = {
      name: templateName,
      language: templateLanguage,
      category: templateCategory,
      components, // components array with optional buttons
    };

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/120508451140772/message_templates`,
        templateData,
        {
          headers: {
            Authorization: `Bearer EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Template created successfully!");
      } else {
        toast.error("Failed to create template. Please try again.");
        console.error(response.data);
      }
    } catch (error) {
      console.error("Error creating template", error);
      alert("Failed to create template.");
    }
  };

  return (
    <div className="flex w-full flex-col relative overflow-auto h-screen">
      {" "}
      {/* Make the main container scrollable */}
      <form onSubmit={handleSubmit}>
        {/* "Create" button at the top-right corner */}

        {/* Template Details */}
        <div className="card bg-base-300 rounded-box grid h-auto place-items-center p-4 mt-4 mx-2">
          <h2 className="text-lg font-bold">Template Details</h2>
          <div className="row m-4">
            <div className="col-auto">
              <label
                htmlFor="template-name"
                className="input input-bordered flex items-center gap-2"
              >
                Name
                <input
                  type="text"
                  id="template-name"
                  className="grow"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-4">
              <label htmlFor="language-select" className="block mb-1">
                Select a language
              </label>
              <select
                id="language-select"
                className="select select-bordered w-full max-w-xs"
                value={templateLanguage}
                onChange={(e) => setTemplateLanguage(e.target.value)}
              >
                <option value="en_us">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div className="mt-4">
              <label htmlFor="category-select" className="block mb-1">
                Select a category
              </label>
              <select
                id="category-select"
                className="select select-bordered w-full max-w-xs"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
              >
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* Header Section */}
        <div className="card bg-base-300 rounded-box grid h-auto place-items-center p-4 mx-2">
          <h3 className="text-lg font-bold">Header</h3>
          <div className="mt-2 w-full max-w-xs">
            <label htmlFor="header-type-select" className="block mb-1">
              Select header type
            </label>
            <select
              id="header-type-select"
              className="select select-bordered w-full"
              value={headerType}
              onChange={(e) => setHeaderType(e.target.value)}
            >
              <option value="">-- Select Header Type --</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="document">document</option>
              <option value="video">video</option>
            </select>
          </div>

          {/* Conditionally render inputs based on selected header type */}
          <div className="mt-2 w-full max-w-xs">
            {headerType === "text" && (
              <div>
                <label htmlFor="header-text" className="block mb-1">
                  Enter Header Text
                </label>
                <input
                  type="text"
                  id="header-text"
                  className="input input-bordered w-full"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                />
              </div>
            )}

            {headerType !== "text" && (
              <div>
                <label htmlFor={`header-${headerType}`} className="block mb-1">
                  Upload{" "}
                  {headerType.charAt(0).toUpperCase() + headerType.slice(1)}
                </label>
                <input
                  type="file"
                  id={`header-${headerType}`}
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setHeaderFile(e.target.files[0])}
                  accept={
                    headerType === "image" ? "image/*" : "application/pdf"
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="divider"></div>

        {/* Body Section */}
        <div className="card bg-base-300 rounded-box grid h-auto place-items-center p-4 mx-2">
          <h3 className="text-lg font-bold">Body</h3>
          <div className="mt-2 w-full max-w-xs">
            <label htmlFor="body-textarea" className="block mb-1">
              Enter Body Text
            </label>
            <textarea
              id="body-textarea"
              className="textarea textarea-bordered w-full"
              rows="5"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
            ></textarea>
          </div>

          {/* Render input fields for each variable detected */}
          {variables.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold">Variables:</h4>
              {variables.map((variable, index) => (
                <div key={index} className="mt-2">
                  <label htmlFor={`variable-${index}`} className="block">
                    Variable {variable} Value
                  </label>
                  <input
                    type="text"
                    id={`variable-${index}`}
                    className="input input-bordered w-full"
                    placeholder={`Enter value for {{${variable}}}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider"></div>

        {/* Buttons Section */}
        <div className="card bg-base-300 rounded-box grid h-auto place-items-center p-4 mx-2">
          <h3 className="text-lg font-bold">Buttons</h3>
          {buttons.map((button, index) => (
            <div key={index} className="mt-2 w-full max-w-xs">
              {/* Button Text Input */}
              <label className="input input-bordered flex items-center gap-2">
                Button {index + 1} Text
                <input
                  type="text"
                  className="grow"
                  value={button.text}
                  onChange={(e) =>
                    handleButtonChange(index, "text", e.target.value)
                  }
                />
              </label>

              {/* Button URL Input */}
              <label className="input input-bordered flex items-center gap-2 mt-2">
                Button {index + 1} URL
                <input
                  type="url"
                  className="grow"
                  value={button.url}
                  onChange={(e) =>
                    handleButtonChange(index, "url", e.target.value)
                  }
                />
              </label>

              {/* Delete Button */}
              <button
                type="button"
                className="btn btn-error mt-2"
                onClick={() => handleDeleteButton(index)}
              >
                Delete Button
              </button>
            </div>
          ))}

          {/* Add new button */}
          <button
            type="button"
            className="btn btn-outline mt-4"
            onClick={handleAddButton}
          >
            Add Button
          </button>
        </div>
        <br></br>
        {/* Submit Button */}
        <div className="card bg-base-300 rounded-box grid h-auto place-items-center p-4 mx-2 mb-24">
          <button type="submit" className="btn btn-primary top-4">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplatePage;