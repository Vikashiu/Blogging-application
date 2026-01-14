"use strict";
// import express from "express";
// import { gemini, generateText, generateJson } from "../utils/gemini";
// import { authMiddleware } from "../authMiddleware";
// const router = express.Router();
// /*******************************************
//  *  FREE PROMPT  →  Generate with Gemini
//  *******************************************/
// router.post("/gemini", authMiddleware, async (req, res) => {
//   try {
//     const { title, prompt, editorData } = req.body;
//     const fullContext = `
// You are a professional blog writer.
// Write clean, readable content. Avoid symbols or markdown unless necessary.
// Blog Title: ${title || "None"}
// Current Blog Content:
// ${JSON.stringify(editorData.blocks || [], null, 2)}
// User Prompt:
// ${prompt}
// `;
//     const text = await generateText("gemini-2.5-flash", [fullContext]);
//     res.json({ result: text });
//   } catch (err) {
//     console.error("Generate error:", err);
//     res.status(500).json({ error: "Failed to generate text" });
//   }
// });
// /*******************************************
//  * REWRITE SELECTED
//  *******************************************/
// router.post("/ai/rewrite", authMiddleware, async (req, res) => {
//   try {
//     const { text, action } = req.body;
//     const prompt = `
// Rewrite the following text in a clean human-written style.
// Do not add unnecessary emojis or symbols.
// Action: ${action}
// Text: ${text}
// `;
//     const result = await generateText("gemini-2.5-flash", [prompt]);
//     res.json({ result });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Rewrite failed" });
//   }
// });
// /*******************************************
//  * CONTINUE WRITING
//  *******************************************/
// router.post("/ai/continue", authMiddleware, async (req, res) => {
//   try {
//     const { title, prompt, editorData } = req.body;
//     const content = editorData.blocks
//       .map((b: any) => b.data?.text || "")
//       .join("\n");
//     const msg = `
// Continue writing this blog in the same tone and style.
// Blog Title: ${title}
// Existing Blog:
// ${content}
// Instruction: ${prompt}
// `;
//     const result = await generateText("gemini-2.5-flash", [msg]);
//     res.json({ result });
//   } catch (err) {
//     res.status(500).json({ error: "Continue failed" });
//   }
// });
// /*******************************************
//  * IMPROVE FULL BLOG
//  *******************************************/
// router.post("/ai/improve", authMiddleware, async (req, res) => {
//   try {
//     const { editorData } = req.body;
//     const content = editorData.blocks
//       .map((b: any) => b.data?.text || "")
//       .join("\n");
//     const prompt = `
// Improve this blog completely. 
// Make it clearer, more engaging, and professional.
// Keep the meaning the same.
// ${content}
// `;
//     const result = await generateText("gemini-2.5-flash", [prompt]);
//     res.json({ result });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Improve failed" });
//   }
// });
// /*******************************************
//  * SUMMARIZE BLOG
//  *******************************************/
// router.post("/ai/summarize", authMiddleware, async (req, res) => {
//   try {
//     const { blocks } = req.body;
//     const content = blocks.map((b: any) => b.data?.text || "").join("\n");
//     const prompt = `
// Summarize the following blog in 3–5 sentences:
// ${content}
// `;
//     const result = await generateText("gemini-2.5-flash", [prompt]);
//     res.json({ result });
//   } catch (err) {
//     res.status(500).json({ error: "Summary failed" });
//   }
// });
// /*******************************************
//  * GENERATE TITLES
//  *******************************************/
// router.post("/ai/title", authMiddleware, async (req, res) => {
//   try {
//     const { editorData } = req.body;
//     const content = editorData.blocks.map((b: any) => b.data?.text || "").join("\n");
//     const prompt = `
// Generate 5 professional blog titles based on this content:
// ${content}
// `;
//     const result = await generateText("gemini-2.5-flash", [prompt]);
//     res.json({ result });
//   } catch (err) {
//     res.status(500).json({ error: "Title generation failed" });
//   }
// });
// /*******************************************
//  * GENERATE TAGS
//  *******************************************/
// router.post("/ai/tags", authMiddleware, async (req, res) => {
//   try {
//     const { editorData } = req.body;
//     const content = editorData.blocks.map((b: any) => b.data?.text || "").join("\n");
//     const schema = {
//       type: "object",
//       properties: {
//         tags: {
//           type: "array",
//           items: { type: "string" },
//         },
//       },
//       required: ["tags"],
//     };
//     const result = await generateJson("gemini-2.5-flash", [content], schema);
//     res.json({ result: result.tags });
//   } catch (err) {
//     res.status(500).json({ error: "Tags generation failed" });
//   }
// });
// /*******************************************
//  * COVER IMAGE GENERATION
//  *******************************************/
// router.post("/ai/cover", authMiddleware, async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     const result = await gemini.models.generateImage({
//       model: "imagen-3.0-generate-001",
//       prompt,
//       size: "1024",
//     });
//     const imageUrl = result.generatedImages?.[0]?.url;
//     res.json({ result: { url: imageUrl } });
//   } catch (err) {
//     res.status(500).json({ error: "Image generation failed" });
//   }
// });
// export default router;
