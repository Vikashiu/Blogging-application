"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.Router)();
const apiKey = process.env.GIMINI_API_KEY;
if (!apiKey)
    throw new Error("Missing Gemini API key");
const ai = new genai_1.GoogleGenAI({ apiKey });
// const genAI = new GoogleGenerativeAI(apiKey);
// Optional function if you want to call raw API
const callGeminiAPI = (prompt, schema) => __awaiter(void 0, void 0, void 0, function* () {
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    if (schema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: schema
        };
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const response = yield fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = yield response.json();
    return result;
});
// const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Explain how AI works in a few words",
//   });
//   console.log(response.text)
app.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt, topic } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "Prompt is required" });
    try {
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // const result = await model.generateContent(prompt);
        // const text = await result.response.text();
        // res.json({ result: text });
        // const response = await callGeminiAPI(prompt);
        // console.log("Gemini API Response:", response);
        // res.json( response)
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet, don't add unnecessory symbol, basically it should look like that a human has written it",
                prompt,
            ]
        });
        //   console.log(response.text);
        res.json({ result: response.text });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate content" });
    }
}));
app.post('/summarize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blocks } = req.body; // From Editor.js
        const plainText = blocks
            .map((block) => {
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
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet, don't add unnecessory symbol, basically it should look like that a human has written it",
                plainText,
            ]
        });
        //   console.log(response.text);
        res.json({ result: response.text });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
}));
exports.default = app;
