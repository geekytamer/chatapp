// 🚀 Frontend: Toggle Button in MessageContainer.jsx
import React, { useEffect, useState } from "react";
import Messages from "./messages";
import MessageInput from "./MessageInput";
import { TiMessages } from "react-icons/ti";
import useConversation from "../../zustand/useConversation";
import axios from "axios";

const MessageContainer = () => {
  const {
    selectedConversation,
    setSelectedConversation,
    resultConversations,
    setResultConversations,
  } = useConversation();

  const [autoResponseEnabled, setAutoResponseEnabled] = useState(false);

  useEffect(() => {
    if (selectedConversation) {
      setAutoResponseEnabled(selectedConversation.autoResponseEnabled);
    }
  }, [selectedConversation]);

  const toggleAutoResponse = async () => {
    try {
      const updatedStatus = !autoResponseEnabled;

      const response = await axios.post(
        `/api/conversations/${selectedConversation._id}/toggle-auto-response`,
        { autoResponseEnabled: updatedStatus }
      );

      const updatedConversation = response.data;
      setAutoResponseEnabled(updatedConversation.autoResponseEnabled);

      // Update the selected conversation
      setSelectedConversation(updatedConversation);
      console.log("Auto-response toggled:", updatedConversation);
      // Update conversation list (if visible anywhere else)
      const updatedList = resultConversations.map((conv) =>
        conv.fullname === updatedConversation.fullname ? updatedConversation : conv
      );
      setResultConversations(updatedList);
    } catch (error) {
      console.error("Error toggling auto-response:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-full">
  {!selectedConversation ? (
    <NoChatSelected />
  ) : (
    <>
      <div className="bg-slate-500 px-4 py-2 flex justify-between items-center">
        <span className="label-text">To: {selectedConversation.fullname}</span>
        <button
          className={`px-2 py-1 text-sm rounded ${
            autoResponseEnabled ? "bg-green-500" : "bg-red-500"
          }`}
          onClick={toggleAutoResponse}
        >
          {autoResponseEnabled ? "Auto-Response On" : "Auto-Response Off"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Messages />
      </div>
      <div className="border-t p-2">
        <MessageInput />
      </div>
    </>
  )}
</div>
  );
};

export default MessageContainer;

const NoChatSelected = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
        <p>Welcome</p>
        <p>Select a chat to start messaging</p>
        <TiMessages className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};
