async function sendWhatsappMessage(data) {
  const headers = {
    "Content-type": "application/json",
    Authorization:
      "Bearer EAAGALlgZCIMsBO3SrQN0NEZCBmKbXdrdgr50gvg4xzIZCMNmOZAkZCG32rICJAOkdtU0yN88lheddkoY1wA47Frgy82HijOP16aFnt3ka6gysbaSJCi9tqBO14T8MQnd3kM66BFCLKwwwE7jZAZCSsg8X2H84SOnxbuTSbuzA9dxocyGIvLr2DspugOukNUeVKr0ZBZC52aabZAjkmC6PZB",
  };

  const url = "https://graph.facebook.com/v20.0/394225673770982/messages";

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
