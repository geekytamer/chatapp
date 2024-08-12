import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

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
        
        res.status(201).json(conversation);

    } catch (error) { 
        console.error("Error in sending message: ", error);
        res.status(500).json({ error: "Server Error" });
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