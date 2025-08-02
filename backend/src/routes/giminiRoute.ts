import { Router } from "express";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const app = Router();
const apiKey = process.env.GIMINI_API_KEY;


if (!apiKey) throw new Error("Missing Gemini API key");

const ai = new GoogleGenAI({ apiKey });
// const genAI = new GoogleGenerativeAI(apiKey);

// Optional function if you want to call raw API
const callGeminiAPI = async (prompt: string, schema?: any) => {
  const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
  const payload: any = { contents: chatHistory };

  if (schema) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: schema
    };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  return result;
};
// const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Explain how AI works in a few words",
//   });
//   console.log(response.text)
app.post("/", async (req, res) => {
  const { prompt, topic } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const result = await model.generateContent(prompt);
    // const text = await result.response.text();

    // res.json({ result: text });
    // const response = await callGeminiAPI(prompt);
    // console.log("Gemini API Response:", response);
    // res.json( response)

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: ["you are a professional blog writter, use good word and make your response to the point",
        "your response should contain alphabet, don't add unnecessory symbol, basically it should look like that a human has written it",
        prompt,

      ]
    });
    //   console.log(response.text);
    res.json({ result: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.post('/summarize', async (req, res) => {
  try {

    const { blocks } = req.body; // From Editor.js

    const plainText = blocks
      .map((block: any) => {
        switch (block.type) {
          case 'paragraph':
            return block.data.text;
          case 'header':
            return `## ${block.data.text}`;
          case 'quote':
            return `"${block.data.text}"`;
          case 'list':
            return block.data.items.join('\n');
          default:
            return '';
        }
      })
      .join('\n\n');
    
    console.log('Plain Text:', plainText);
    // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // const result = await model.generateContent(
    //   `Summarize the following blog post:\n\n${plainText}`
    // );

    // const response = await result.response;
    // const text = response.text();

    // return res.json({ summary: text });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: ["you are a professional blog writter, use good word and make your response to the point",
        "your response should contain alphabet, don't add unnecessory symbol, basically it should look like that a human has written it",
        plainText,

      ]
    });
    //   console.log(response.text);
    res.json({ result: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default app;
