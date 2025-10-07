async function sendWhatsappMessage(data) {
  const headers = {
    "Content-type": "application/json",
    Authorization:
      "Bearer EAASaGKQLCyoBPOcuHkj4ZCwUOMAgYexo2DvuVFdEMH0JxZAoj6cUKUY02GieLjGeZAxHMIsWETYZAIEwEwkHefxcGZAi6HwMgPvXtkkCLCAzZC6qmfuxzSR8F3G30Tncy82Xtm5B8FjVafqokLUBBsTZAUTiZC5dwXfrpQOYBHinSdcapMvSiRYcNyK61uKrtDKgcAZDZD",
  };

  const url = "https://graph.facebook.com/v20.0/120295417829073/messages";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: data,
    });

    console.log(response.status);
    const jsonResponse = await response.json();
    console.log(jsonResponse);

    if (response.status !== 200) {
      console.log(data);
      console.log(response.status);
      console.log(response);
    }
  } catch (error) {
    console.error("Connection Error", error);
  }
}

function getTextMessageInput(recipient, text) {
  return JSON.stringify({
    messaging_product: "whatsapp",
    preview_url: false,
    recipient_type: "individual",
    to: "+"+recipient,
    type: "text",
    text: { body: text },
  });
}

export { sendWhatsappMessage, getTextMessageInput };
