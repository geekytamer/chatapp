import dotenv from "dotenv";

import { app, server } from "./socket/socket.js";
import authRouter from "./routes/auth.routes.js";
import messagesRouter from "./routes/message.routes.js";
import userRouter from "./routes/user.routes.js";
import templateRouter from "./routes/template.route.js";
import mediaRouter from "./routes/media.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
import multer from "multer";
import connectToMongoDB from "./db/connectToMongoDb.js";
import path from "path";
import fs from "fs";
import { startUploadSession, uploadFile } from "./controllers/media.controller.js";
import { fileURLToPath } from "url";
import campaignRouter from "./routes/campaign.routes.js";
const PORT = process.env.PORT || 5000;

dotenv.config(); // Load environment variables from.env file

const upload = multer({ storage: multer.memoryStorage() });
// Directory to save files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const outputDir = path.join(__dirname, "downloads");
fs.mkdirSync(outputDir, { recursive: true }); 

// Endpoint to fetch a file by name
app.get('/fetch-file/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(outputDir, fileName);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers for the file download
    res.download(filePath, (downloadError) => {
      if (downloadError) {
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
  });
});

app.use("/api/auth", authRouter); // Load authentication routes
app.use("/api/messages", messagesRouter); // Load message routes
app.use("/api/users", userRouter);
app.use("/api/templates", templateRouter); // Load template routes
app.use("/api/media", mediaRouter)
app.use("/api/webhook", webhookRouter); // Load webhook routes
app.use("/api/campaigns", campaignRouter);
// Start the server on port 5000
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server running on port ${PORT}`);
});
