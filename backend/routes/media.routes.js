import express from "express";
import multer from "multer";

// Configure multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });
import { startUploadSession, uploadFile } from "../controllers/media.controller.js";

const mediaRouter = express.Router();

mediaRouter.post("/start-upload", startUploadSession);
mediaRouter.post("/upload-file", upload.single("file"), uploadFile);


export default mediaRouter;