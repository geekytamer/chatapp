import { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";

const Messages = () => {
  const { loading, messages } = useGetMessages();
  const { selectedConversation } = useConversation();
  useListenMessages();
  const lastMessageRef = useRef();
  const { authUser } = useAuthContext();
  console.log(selectedConversation)
  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);
  return (
      <div className="px-4 flex-1 overflow-auto">
        {!loading &&
          messages.length > 0 &&
          messages.map((message) =>
          (
            (selectedConversation._id === message.senderId || authUser._id === message.senderId) &&
            <div key={message._id}
            ref={lastMessageRef}>
              <Message message={message} />
            </div>
            )
          )}
        
        {loading &&
          [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

        {!loading && messages.length === 0 && (
          <div className="flex justify-center items-center">
            <p className="text-gray-400 text-lg">No messages yet.</p>
          </div>
        )}
      </div>
    );
}

export default Messages;