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
    const { prompt, topic, editorData } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "Prompt is required" });
    try {
        const plainText = editorData.blocks
            .map((block) => {
            if (block.type === "paragraph")
                return block.data.text;
            if (block.type === "header")
                return `${"#".repeat(block.data.level)} ${block.data.text}`;
            if (block.type === "list")
                return block.data.items.join("\n");
            return "";
        })
            .join("\n\n");
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet,don't add unnecessory symbol, basically it should look like that a human has written it",
                plainText,
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
        // console.log('Plain Text:', plainText);
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet, don't add unnecessory symbol, basically it should look like that a human has written it",
                `you need to summarize what is written in plaintext`,
                `plainText is : ${plainText}`,
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
app.post('/continue', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, prompt, editorData } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "Prompt is required" });
    try {
        const plainText = editorData.blocks
            .map((block) => {
            if (block.type === "paragraph")
                return block.data.text;
            if (block.type === "header")
                return `${"#".repeat(block.data.level)} ${block.data.text}`;
            if (block.type === "list")
                return block.data.items.join("\n");
            return "";
        })
            .join("\n\n");
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet,don't add unnecessory symbol, basically it should look like that a human has written it",
                plainText,
                prompt,
            ]
        });
        //   console.log(response.text);
        res.json({ result: response.text });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to coninute" });
    }
}));
app.post('/rewrite', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, action } = req.body;
    // if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    try {
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet,don't add unnecessory symbol, basically it should look like that a human has written it",
                `so the text is : ${text}`,
                `you need to perform ${action} on the text to modify, check good flow and grammer check, improve the text`,
            ]
        });
        //   console.log(response.text);
        res.json({ result: response.text });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to coninute" });
    }
}));
app.post('/improve', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { editorData } = req.body;
    // if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    try {
        const plainText = editorData.blocks
            .map((block) => {
            if (block.type === "paragraph")
                return block.data.text;
            if (block.type === "header")
                return `${"#".repeat(block.data.level)} ${block.data.text}`;
            if (block.type === "list")
                return block.data.items.join("\n");
            return "";
        })
            .join("\n\n");
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet,don't add unnecessory symbol, basically it should look like that a human has written it",
                `editor data is : ${plainText}`,
                `improve the writing style of editordata`,
            ]
        });
        //   console.log(response.text);
        res.json({ result: response.text });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to coninute" });
    }
}));
app.post('/title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { editorData } = req.body;
    // if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    try {
        const plainText = editorData.blocks
            .map((block) => {
            if (block.type === "paragraph")
                return block.data.text;
            if (block.type === "header")
                return `${"#".repeat(block.data.level)} ${block.data.text}`;
            if (block.type === "list")
                return block.data.items.join("\n");
            return "";
        })
            .join("\n\n");
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet,don't add unnecessory symbol, basically it should look like that a human has written it",
                `plainText is : ${plainText}`,
                `based on the plaintext can you generate the best title for it`,
            ]
        });
        //   console.log(response.text);
        res.json({ result: response.text });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to coninute" });
    }
}));
app.post('/tags', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { editorData } = req.body;
    // if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    try {
        const plainText = editorData.blocks
            .map((block) => {
            if (block.type === "paragraph")
                return block.data.text;
            if (block.type === "header")
                return `${"#".repeat(block.data.level)} ${block.data.text}`;
            if (block.type === "list")
                return block.data.items.join("\n");
            return "";
        })
            .join("\n\n");
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: ["you are a professional blog writter, use good word and make your response to the point",
                "your response should contain alphabet,don't add unnecessory symbol, basically it should look like that a human has written it",
                `plainText is : ${plainText}`,
                `your job is to extract meaningfull tags from the blog or plaintext`,
            ]
        });
        //   console.log(response.text);
        res.json({ result: response.text });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to coninute" });
    }
}));
exports.default = app;
