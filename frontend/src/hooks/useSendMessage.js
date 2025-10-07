import React, { useState } from 'react'
import useConversation from '../zustand/useConversation'
import toast from 'react-hot-toast';
const useSendMessage = () => {
  
    const [ loading, setLoading ] = useState(false);
    const { selectedConversation, setMessages, messages } = useConversation();

    const sendMessage = async (message) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/messages/send/${selectedConversation._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            console.log('data:', data);
            setMessages([...messages, data]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }
    return { sendMessage, loading }
}

export default useSendMessage