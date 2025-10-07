import Conversation from "./Conversation";
import useGetConversations from "../../hooks/useGetConversations";
import useSearchConversations from "../../hooks/useSearchConversations";
import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";

const Conversations = () => {
  const { loading, conversations } = useGetConversations(); // Fetch conversations from the server
  const { messages, setMessages } = useConversation();
  const { resultConversations } = useConversation();
  const { socket } = useSocketContext();
  const [conversationsToDisplay, setConversationsToDisplay] =
    useState(conversations);

  // Use `useEffect` to monitor changes in both `conversations` and `resultConversations`
  useEffect(() => {
    console.log("Conversations in Conversations component:", conversations);
    console.log(
      "Search results updated in Conversations:",
      resultConversations
    );

    setConversationsToDisplay(
      resultConversations?.length > 0 ? resultConversations : conversations
    );
  }, [resultConversations, conversations]);

  // Listen for new conversations via WebSocket
  useEffect(() => {
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    const handleNewConversation = (newConversation) => {
      setConversationsToDisplay([newConversation, ...conversations]);
    };

    // Attach listener to 'newConversation' event
    socket.on("newConversation", handleNewConversation);

    // Cleanup the socket listener on unmount or socket change
    return () => {
      socket.off("newConversation", handleNewConversation);
    };
  }, [socket, conversations]); // Ensure the listener re-attaches if socket or conversations change

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {conversationsToDisplay.map((conversation, idx) => (
        <Conversation
          key={conversation._id}
          conversation={conversation}
          lastIdx={idx === conversations.length - 1}
        />
      ))}
      {loading ? (
        <span className="loading loading-spinner mx-auto"></span>
      ) : null}
    </div>
  );
};

export default Conversations;
