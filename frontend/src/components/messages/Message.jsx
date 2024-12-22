import React from "react";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";
import { extractTime } from "../../utils/extractTime";

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const fromMe = message.senderId === authUser._id;

  return (
    <div className={`chat ${fromMe ? "chat-end" : "chat-start"}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src={fromMe ? authUser.profilePic : selectedConversation.profilePic}
          />
        </div>
      </div>

      <div className="chat-content">
        {/* Display text message if it exists */}

        {/* Display image if message has an imagePath */}
        {message.imageUrl && (
          <div className="chat-image w-60 rounded-lg mt-2">
            <img
              src={`http://localhost:5000/fetch-file/${message.imageUrl}`}
              alt="User sent image"
              className="rounded-lg"
              />
          </div>
        )}

        {message.message && (
          <div
            className={`chat-bubble text-white ${
              fromMe ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            {message.message}
          </div>
        )}
        <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
          {extractTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default Message;
