import { useState, useEffect, useContext, GlobalContext } from "react";
import useGetConversations from "./useGetConversations";

const useSearchConversations = () => {
  const { conversations } = useGetConversations();
  const [resultConversations, setResultConversations] = useContext(GlobalContext);
  var filteredConversations = [];
  const searchConversation = (query) => {
    if (!query || query.length === 0) {
      setResultConversations([]);
    } else {
      filteredConversations = conversations.filter((conversation) =>
        conversation.fullname.toLowerCase().includes(query.toLowerCase())
      );
      // Even if the filtered result is the same, create a new array reference
      setResultConversations([...filteredConversations]);
    }
  };

  // Log when `resultConversations` has been updated
  useEffect(() => {
    console.log("Search results updated in hook:", resultConversations);
  }, [resultConversations]);

  return { searchConversation, resultConversations };
};

export default useSearchConversations;
