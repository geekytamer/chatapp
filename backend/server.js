

import cookieParser from "cookie-parser"
import express from "express"
import dotenv from "dotenv"

import authRouter from "./routes/auth.routes.js"
import messagesRouter from "./routes/message.routes.js"
import userRouter from "./routes/user.routes.js"

import connectToMongoDB from "./db/connectToMongoDb.js"

const app = express()
const PORT = process.env.PORT || 5000

dotenv.config()  // Load environment variables from.env file
app.use(cookieParser())  // Parse cookies from request headers
app.use(express.json())  // Parse JSON request bodies

app.use("/api/auth", authRouter)  // Load authentication routes
app.use("/api/messages", messagesRouter) // Load message routes
app.use("/api/users", userRouter)
// Start the server on port 5000
app.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server running on port ${PORT}`)
})