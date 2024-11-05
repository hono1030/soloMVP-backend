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
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a seasoned tour guide specializing in Japanese travel recommendations. Your task is to suggest three lesser-known prefectures in Japan based on user preferences to help balance tourism. For each prefecture, provide three unique, concise activity highlights in bullet points, with all content totaling no more than 250 words. Respond strictly in valid, parseable JSON format, structured as follows: {recommendations: [{pref: '', highlights: '', activities: []}, {pref: '', highlights: '', activities: []}, {pref: '', highlights: '', activities: []}]}. Each object in the recommendations array must adhere to this schema. Do not use markdown, extra text, or any format other than the specified JSON structure.",
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
