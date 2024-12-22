export const startUploadSession = async (req, res) => {
  const { fileName, fileSize, fileType, accessToken } = req.body;
  // Proxy request to Facebook Graph API to start an upload session
  try {
    const sessionData = await startSession(fileName, fileSize, fileType, accessToken);
    console.log("Started upload session:", sessionData);
    res.json(sessionData);
  } catch (error) {
    console.error("Error starting upload session:", error);
    res.status(500).json({ error: "Failed to start upload session" });
  }
};

export const startSession = async (fileName, fileSize, fileType) => {
  // Proxy request to Facebook Graph API to start an upload session
    const startSessionResponse = await fetch(
      `https://graph.facebook.com/v20.0/422411514093771/uploads?file_name=${fileName}&file_length=${fileSize}&file_type=${fileType}&access_token=EAAGALlgZCIMsBO9CFs3oi7LgiULNLbohY1ccRZAZAVIZCGG95ZBnyRIcLVZBNVBeg9lrh8ppcaufTerjRSNlFfZBAw5enkz5GycmaB9ZCRTUFcC4vOCxAv00TJmhoWJisBeiHZAY4PZCHjXtSKhZC4GTP7XmcEqkZAJIJkBu3095qLulW8bnXF1JRIUSvCyLUhHPxYUXhMddZCcsmHxDegDcv`,
      { method: "POST" }
    );
    const sessionData = await startSessionResponse.json();
    return sessionData;
}

export const uploadFile = async (req, res) => {
  const { uploadSessionId, accessToken } = req.body;
  console.log(req.body);
  const file = req.file; // Get the file from multer
  console.log("Uploading file:", {
    uploadSessionId,
    accessToken,
    file: file,
  });
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("Uploading file chunk:", {
    uploadSessionId,
    accessToken,
    file: file.originalname,
  });

  try {
    const uploadFileResponse = await fetch(
      `https://graph.facebook.com/v20.0/${uploadSessionId}`,
      {
        method: "POST",
        headers: {
          Authorization: `OAuth ${accessToken}`,
          file_offset: "0",
        },
        body: file.buffer, // Use the file's buffer (binary data)
      }
    );

    const uploadData = await uploadFileResponse.json();
    console.log("File uploaded:", uploadData);
    res.json(uploadData);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "File upload failed" });
  }
};

export const uploadFileBuffer = async (uploadSessionId, fileBuffer) => {
  const accessToken =
    "EAAGALlgZCIMsBO9CFs3oi7LgiULNLbohY1ccRZAZAVIZCGG95ZBnyRIcLVZBNVBeg9lrh8ppcaufTerjRSNlFfZBAw5enkz5GycmaB9ZCRTUFcC4vOCxAv00TJmhoWJisBeiHZAY4PZCHjXtSKhZC4GTP7XmcEqkZAJIJkBu3095qLulW8bnXF1JRIUSvCyLUhHPxYUXhMddZCcsmHxDegDcv";

  console.log("Uploading file")
  if (!fileBuffer) {
    return ;
  }

  console.log("Uploading file chunk:", {
    uploadSessionId,
    accessToken,
    file: fileBuffer,
  });
  try {
    const uploadFileResponse = await fetch(
      `https://graph.facebook.com/v20.0/${uploadSessionId}`,
      {
        method: "POST",
        headers: {
          Authorization: `OAuth ${accessToken}`,
          file_offset: "0",
        },
        body: fileBuffer, // Use the file's buffer (binary data)
      }
    );

    const uploadData = await uploadFileResponse.json();
    console.log("File uploaded:", uploadData);
    return uploadData;
  } catch (error) {
    console.error("Error uploading file:", error);
    return { error: "File upload failed" };
  }
};
