function processSentiment(emailText) {
  const GROQ_KEY = PropertiesService.getScriptProperties().getProperty("GROQ_KEY");

  if (!GROQ_KEY) {
    Logger.log("Groq API key not found.");
    return "UNPROCESSED";
  }

  if (!emailText || typeof emailText !== "string") {
    Logger.log("Invalid email text: " + emailText);
    return "neutral";
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a sentiment classifier. Reply with only one word: positive, neutral, or negative."
      },
      {
        role: "user",
        content: emailText
      }
    ],
    temperature: 0
  };

  const options = {
    method: "POST",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const status = response.getResponseCode();
    const text = response.getContentText();

    if (status !== 200) {
      Logger.log("Groq HTTP Error " + status + ": " + text);
      return "UNPROCESSED";
    }

    const json = JSON.parse(text);
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      Logger.log("Unexpected Groq response: " + text);
      return "UNPROCESSED";
    }

    const result = content.trim().toLowerCase();

    if (result.includes("positive")) return "positive";
    if (result.includes("negative")) return "negative";
    return "neutral";

  } catch (e) {
    Logger.log("Groq error: " + e.toString());
    return "UNPROCESSED";
  }
}


function testGroq() {
  Logger.log(processSentiment("I love this product!"));
  Logger.log(processSentiment("This is terrible and disappointing."));
  Logger.log(processSentiment("Please share more details."));
}

