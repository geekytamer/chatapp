import {useState} from 'react'
import toast from 'react-hot-toast';

const useGetTemplates = () => {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true);

    const WHATSAPP_BUSINESS_ACCOUNT_ID = "120508451140772"; // replace with actual business account ID
    const FIELDS = "name,status,category,components,language"; // replace with the desired fields
    const LIMIT = 10; // replace with the desired limit
    const ACCESS_TOKEN =
      "EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD"; // EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD replace with the actual access token

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