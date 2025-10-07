// 🚀 ChatGPT API Integration with Threads for Each User in JavaScript

import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for user threads (replace with DB for production)
const userThreads = {};

// ⭐ Upload File
async function uploadFile(filePath) {
  try {
    const file = fs.createReadStream(filePath);
    const response = await openai.createFile(file, "assistants");
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// ⭐ Create Assistant
async function createAssistant(fileId) {
  try {
    const response = await openai.createAssistant({
      name: "WhatsApp AirBnb Assistant",
      instructions: "You're a helpful assistant for AirBnb guests.",
      tools: [{ type: "retrieval" }],
      model: "gpt-4-1106-preview",
      file_ids: [fileId],
    });
    return response.data;
  } catch (error) {
    console.error("Error creating assistant:", error);
    throw error;
  }
}

// ⭐ Generate Response
async function generateResponse(messageBody, waId) {
  try {
    let threadId = userThreads[waId];

    // Create new thread if it doesn't exist
    console.log(userThreads)
    if (!threadId) {
      const threadResponse = await openai.beta.threads.create();
      console.log(threadResponse);
      threadId = threadResponse.id || threadResponse.data?.id;
      userThreads[waId] = threadId;
      console.log(`Created new thread for ${waId}: ${threadId}`, threadResponse);
      // Initial message to provide context
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: `You are assisting a user with the phone number ${waId}.`,
      });
    }

    // Add user's message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messageBody,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId,{
      assistant_id: OPENAI_ASSISTANT_ID,
    });

    // Poll for completion
    let runStatus = run.status;
    while (runStatus !== "completed") {
      const statusCheck = await openai.beta.threads.runs.retrieve(threadId, run.id);
      runStatus = statusCheck.status;
    }

    // Retrieve the new message
    const messages = await openai.beta.threads.messages.list(
      threadId
    );
    const newMessage = messages.data[0].content[0].text.value;

    console.log("Generated Message:", newMessage);
    return newMessage;
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I couldn't process your request.";
  }
}

// ⭐ Generate Image Response
async function generateImageResponse(imageUrl, caption) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "user", content: caption },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 50,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating image response:", error);
    return "Sorry, I couldn't analyze the image.";
  }
}

export { uploadFile, createAssistant, generateResponse, generateImageResponse };
