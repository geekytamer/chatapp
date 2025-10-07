import express from "express";
import multer from "multer";
import axios from "axios";
import csvParser from "csv-parser"; // Library to parse CSV files
import Queue from "bull"; // Using Bull for Redis-based queuing
import Campaign from "../models/campaign.model.js";
import CampaignMessage from "../models/campaignMessage.model.js";
import { Readable } from "stream";
import protectRoute from "../middleware/protectRoute.js";
import {
  startSession,
  uploadFile,
  uploadFileBuffer,
} from "../controllers/media.controller.js";
const messageQueue = new Queue("message-queue"); // Create a Redis-backed queue
const templateRouter = express.Router();
import mongoose from "mongoose";
import path from "path";
import { outputDir } from "../server.js";
import fs from "fs";
import pLimit from "p-limit";
import iconv from "iconv-lite"

// Configure multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

templateRouter.post(
  "/send-messages-file",
  protectRoute,
  upload.single("file"),
  async (req, res) => {
    const template = JSON.parse(req.body.template);
    console.log(template)
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const headerComponent = template.components.find(
      (c) => c.type === "HEADER"
    );
    let mediaId = null;
    let tempFileName = null;
    console.log("Header component:", headerComponent);
    if (
      headerComponent &&
      headerComponent.format !== "TEXT" &&
      headerComponent.example.header_handle
    ) {
      const { filePath, fileName, fileSize, fileType } =
        await downloadFileToFileSystem(
          headerComponent.example.header_handle[0],
          outputDir
        );
      console.log(filePath, tempFileName, fileSize, fileType);
      tempFileName = fileName;
      mediaId = `https://mll116rk-5001.asse.devtunnels.ms/fetch-file/${tempFileName}`;
    }

    try {
      const phoneNumbers = [];
      const campaignMessages = [];

      // Create a new campaign
      const campaign = new Campaign({
        templateName: template.name,
        category: template.category,
        target: 0, // Will update later after counting phone numbers
        status: "pending",
        creator: req.user._id, // Assuming user authentication
      });

      await campaign.save();

      // Accumulate promises for processing phone numbers
      const processPromises = [];

      // Use a stream to process the CSV file in chunks
      const buffer = file.buffer; // Assuming 'file' is the uploaded file

      // Convert the buffer to a UTF-8 string
      const decodedData = iconv.decode(buffer, "utf-8"); // Use 'windows-1256' or another encoding if necessary

      const stream = Readable.from(decodedData);
      stream
        .pipe(csvParser({ encoding: "utf8", delimiter: "," }))
        .on("data", (row) => {
          console.log("Raw data:", row);
          const phoneNumber = "+" + row["phone"]; // First column is the phone number
          // Extract remaining columns dynamically as variables
          console.log("keys:", Object.keys(row));
          const variables = Object.keys(row)
            .filter((key) => key !== "phone") // Exclude phone numbers column
            .map((key) => row[key].trim()); // Trim values to remove extra spaces
          console.log(variables, phoneNumber);

          if (phoneNumber) {
            phoneNumbers.push(phoneNumber);

            // Push the promise for processing each phone number
            processPromises.push(() =>
              processPhoneNumber(
                constructTemplateJson(
                  template,
                  phoneNumber,
                  mediaId,
                  variables,
                  tempFileName
                )
              )
            );
          }
        })
        .on("end", async () => {
          try {
            const limit = pLimit(5); // Limit to 5 concurrent executions

            // Map to limited promise executions
            const limitedPromises = processPromises.map((promiseFn) =>
              limit(promiseFn)
            );

            // Wait for all promises to resolve
            const processedMessages = await Promise.all(limitedPromises);

            // Filter out any null values (failed message processing)
            const validMessages = processedMessages.filter(
              (msg) => msg !== null
            );

            // Bulk insert the valid messages
            if (validMessages.length > 0) {
              const insertedMessages = await CampaignMessage.insertMany(
                validMessages
              );
              const messageIds = insertedMessages.map((msg) => msg._id);
              console.log("Inserted message IDs:", processedMessages);
              // Update campaign with message IDs and target
              campaign.target = phoneNumbers.length;
              campaign.messages = messageIds;
              campaign.status = "completed";
              await campaign.save();
            }

            res.status(200).json({
              message: "File processed successfully. Messages are being sent.",
            });
          } catch (processError) {
            console.error("Error processing phone numbers:", processError);
            res.status(500).json({ error: "Failed to process phone numbers" });
          }
        })
        .on("error", (err) => {
          console.error("Error processing file:", err);
          res.status(500).json({ error: "Failed to process the file" });
        });
    } catch (error) {
      console.error("Error handling request:", error);
      res.status(500).json({ error: "Failed to process the request" });
    }
  }
);

async function processPhoneNumber(templateJson) {
  try {
    // Simulate sending message (replace with real service)
    const messageResponse = await sendMessage(templateJson);

    // Check if the message sending failed
    if (!messageResponse || messageResponse === "failed") {
      // Optionally, return a null value or an object indicating the failure
      console.error("Failed to send message to:", templateJson.to);
      return null;
    }

    // Create a new CampaignMessage object with the necessary fields
    const campaignMessage = new CampaignMessage({
      waId: messageResponse.messages[0].id, // Assuming response contains message ID
      recipient: templateJson.to, // The phone number
      status: "pending", // Initial status, can be updated later
      createdAt: new Date(), // Timestamp (optional)
      // You can add more fields if needed, such as message content, media ID, etc.
    });

    // Return the prepared CampaignMessage object for later insertion
    return campaignMessage;
  } catch (error) {
    console.error("Error processing phone number:", error);
    return null; // Return null in case of an error to avoid breaking the flow
  }
}

// Process the queue
messageQueue.process(async (job, done) => {
  const { campaignId, phoneNumber, templateData } = job.data;

  try {
    const templateJson = constructTemplateJson(templateData);
    // Simulate sending message (replace with real service)
    const messageResponse = await sendMessage(phoneNumber, templateJson);

    if (messageResponse === "failed") {
      return;
    }

    const campaignMessage = new CampaignMessage({
      _id: messageResponse.messages[0].id,
      recipient: phoneNumber,
      status: "pending",
    });

    await campaignMessage.save();

    done();
  } catch (error) {
    console.error("Error sending message:", error);
    done(error);
  }
});

function constructTemplateJson(data, phoneNumber, mediaId, variables, filename) {
  const { name, components, language } = data;

  const headerComponent = components.find((c) => c.type === "HEADER");
  const bodyComponent = components.find((c) => c.type === "BODY");

  const templateJson = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneNumber,
    type: "template",
    template: {
      name: name,
      language: { code: language },
      components: [],
    },
  };

  // Map HEADER component if it exists
  if (
    headerComponent &&
    headerComponent.format !== "TEXT" &&
    headerComponent.example.header_handle &&
    mediaId
  ) {
    if (headerComponent.format == "IMAGE") {
      templateJson.template.components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: { link: mediaId },
          },
        ],
      });
    } else if (headerComponent.format == "DOCUMENT") {
      console.log("file name is ", filename);
      templateJson.template.components.push({
        type: "header",
        parameters: [
          {
            type: "document",
            document: {
              link: mediaId,
              filename: "برنامج اليوم المفتوح.pdf",
            },
          },
        ],
      });
    } else if (headerComponent.format == "VIDEO") {
      console.log("file name is ", filename);
      templateJson.template.components.push({
        type: "header",
        parameters: [
          {
            type: "video",
            video: {
              link: mediaId,
            },
          },
        ],
      });
    }
  }

  // Map BODY component if it exists
  if (bodyComponent && variables.length > 0) {
    const bodyParameters = variables.map((variable) => ({
      type: "text",
      text: variable, // Map each variable to a text parameter
    }));

    templateJson.template.components.push({
      type: "body",
      parameters: bodyParameters,
    });
  }

  return templateJson;
}

async function sendMessage(data) {
  const headers = {
    "Content-type": "application/json",
    Authorization:
      "Bearer EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD",
  };

  const url = "https://graph.facebook.com/v20.0/120295417829073/messages";

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status !== 200) {
      throw new Error("Failed to send message");
    }
    return response.data;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("Connection Error", error.message);
    } else {
      console.log("error sending message", error);
    }
    return "failed";
  }
}

async function downloadFileToMemory(url) {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
    });

    const fileBuffer = Buffer.from(response.data);
    console.log("File downloaded and stored in memory.");

    // Extract metadata
    const fileType = response.headers["content-type"]; // MIME type from response headers
    const fileSize = response.headers["content-length"]; // File size from response headers
    const fileName = url.split("/").pop(); // Extract file name from URL

    return { fileBuffer, fileName, fileSize, fileType };
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

// Function to download a file from a URL and save it to the filesystem
async function downloadFileToFileSystem(url, outputDir) {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
    });

    // Extract filename and determine file path
    const fileName = path.basename(url.split("?")[0]); // You can also set this as needed
    const filePath = path.join(outputDir, fileName);

    // Write file to the filesystem
    fs.writeFileSync(filePath, response.data);
    console.log(`File downloaded and saved to ${filePath}`);

    // Return file details
    return {
      filePath,
      fileName,
      fileSize: response.data.length,
      fileType: response.headers["content-type"],
    };
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

async function processWithLimit(promises, limit) {
  const results = [];
  const executing = [];

  for (const promise of promises) {
    const p = promise.then((result) => {
      executing.splice(executing.indexOf(p), 1); // Remove finished promise
      return result;
    });
    results.push(p);
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing); // Wait for the first promise to finish
    }
  }

  return Promise.all(results);
}
export default templateRouter;
