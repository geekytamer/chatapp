import {useState} from 'react'
import toast from 'react-hot-toast';

const useGetTemplates = () => {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true);

    const WHATSAPP_BUSINESS_ACCOUNT_ID = "429009386955154"; // replace with actual business account ID
    const FIELDS = "name,status,category,components,language"; // replace with the desired fields
    const LIMIT = 10; // replace with the desired limit
    const ACCESS_TOKEN =
      "EAAGALlgZCIMsBO9CFs3oi7LgiULNLbohY1ccRZAZAVIZCGG95ZBnyRIcLVZBNVBeg9lrh8ppcaufTerjRSNlFfZBAw5enkz5GycmaB9ZCRTUFcC4vOCxAv00TJmhoWJisBeiHZAY4PZCHjXtSKhZC4GTP7XmcEqkZAJIJkBu3095qLulW8bnXF1JRIUSvCyLUhHPxYUXhMddZCcsmHxDegDcv"; // replace with the actual access token

    const fetchMessageTemplates = async () => {
        try {
          const response = await fetch(
            `https://graph.facebook.com/v20.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?fields=${FIELDS}&limit=${LIMIT}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
              },
            }
          );

          if (!response.ok) {
            toast.error("Failed to fetch message templates");
          }

            const data = await response.json();
          setTemplates(data.data); // Assuming the data is in a 'data' array
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
    };
    
    return { templates, loading, fetchMessageTemplates };
}

export default useGetTemplates