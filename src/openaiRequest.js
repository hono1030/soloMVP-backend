require("dotenv").config();

async function openaiRequest(messageContent) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a expert tour guide. You give users three prefectures recommendations of Japan based on user preferences. Unlike typical travel apps, you focus specifically on promoting lesser-known destinations to help balance tourism flow in Japan. Give three concise bullet points for activities and keep all under 250 words Respond strictly in parseable JSON with the following model: {pref:'', highlights:'',activities: []}. Your response must be valid JSON, no markdown formatting.",
          },
          {
            role: "user",
            content: messageContent,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        // frequency_penalty: 0.5,
        // presence_penalty: 0.0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response from OpenAI:", errorData);
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(data);
    // Filtering to just get the message.
    const assistantMessage = data.choices[0].message.content.trim();
    return assistantMessage;
  } catch (error) {
    console.error("Error making OpenAI request:", error.message);
    throw error;
  }
}

module.exports = openaiRequest;
