import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { getTextMessageInput, sendWhatsappMessage } from "../utils/whatsapp_handler.js";
export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id } = req.params;
        const userId = req.user._id;
        console.log(userId)
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, id] },
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, id],
            });
        }


        const newMessage = new Message({
            senderId: userId,
            receiverId: id,
            message: message
        });

        if (newMessage) {
            conversation.messages.push(newMessage);
        }
        
        Promise.all([conversation.save(), newMessage.save()]);
        
        const receiverSocketId = getReceiverSocketId(id);
        if (receiverSocketId) {
            // io.to(<receiverId>).emit() used to send a new message event to the receiver's socket ID
            io.to(receiverSocketId).emit("newMessage", newMessage);
        } else {
            const targetUser = await User.findById(id);
            if (!targetUser) return;
            const data = getTextMessageInput(targetUser.username, message);
            console.log(data)
            await sendWhatsappMessage(data);
         }
        res.status(201).json(newMessage);

    } catch (error) { 
        console.error("Error in sending message: ", error);
        res.status(500).json({ error: "Server Error" });
    }
 

}


export const sendTemplatedMessage = async (req, res) => {
    try {
        const { jsonBody } = req.body;
        const userId = req.user._id;

        const { id: userToChat } = req.params;
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, id] },
        });

        if (!conversation) {
            Conversation.create({
                participants: [userId, userToChat],
            })
        }
        const newMessage = new Message({
            senderId: userId,
            receiverId: id,
            message: jsonBody.message,
        });
    } catch (error) {

    } finally {
        return;
     }
 }
export const getMessages = async (req, res) => {
    try {
        const { id: userToChat } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChat] },
        }).populate("messages");

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        return res.status(200).json(conversation.messages);
    } catch (error) {

     }
 }