import React, { useEffect } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = React.useState(false);
  const { selectedConversation, messages, setMessages } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/messages/${selectedConversation._id}`
        );
        const data = await response.json();
        if (response.status == 404) {
          setLoading(false);
          setMessages([]);
          return;
        }

        if (data.error) throw new Error(data.error);
        setMessages(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessages,]);

  return { messages, loading };
};

export default useGetMessages;
