// src/components/AIWritingModal.tsx
import React, { useState, useRef } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// -------------------------
// TYPES
// -------------------------
type AiResponse =
  | { result?: string }
  | { result?: string[] }
  | { result?: { url: string } }
  | {};

export type ApplyMode = "insert" | "replace" | "replaceAll";

export default function AIWritingModal({
  open,
  onClose,
  title,
  editorData,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  editorData: { blocks: any[] };
}) {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applyMode, setApplyMode] = useState<ApplyMode>("insert");
  const contentRef = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  // -------------------------
  // EDITOR HELPERS
  // -------------------------
  const getEditor = () => (window as any).editorInstance;

  const insertBelowCursor = async (text: string) => {
    const editor = getEditor();
    if (!editor) return console.warn("Editor not ready.");

    const idx = editor.blocks.getCurrentBlockIndex();
    await editor.blocks.insert("paragraph", { text }, {}, idx + 1);
  };

  const replaceSelected = async (text: string) => {
    const editor = getEditor();
    if (!editor) return;

    const saved = await editor.save();
    const idx = editor.blocks.getCurrentBlockIndex();
    const block = saved.blocks[idx];

    if (!block) return alert("No block selected.");

    await editor.blocks.update(block.id, { type: "paragraph", data: { text } });
  };

  const replaceAll = async (text: string) => {
    const editor = getEditor();
    if (!editor) return;

    const saved = await editor.save();

    // Insert new content
    await editor.blocks.insert("paragraph", { text }, {}, saved.blocks.length);

    // Delete rest
    for (const b of saved.blocks) {
      try {
        await editor.blocks.delete(b.id);
      } catch {}
    }
  };

  const insertImage = async (url: string) => {
    const editor = getEditor();
    if (!editor) return;

    const idx = editor.blocks.getCurrentBlockIndex();
    await editor.blocks.insert(
      "image",
      { file: { url }, caption: "" },
      {},
      idx + 1
    );
  };

  // -------------------------
  // API WRAPPER (typed)
  // -------------------------
  const postAi = async (path: string, body: any): Promise<AiResponse> => {
    setLoading(true);

    try {
      const res = await axios.post<AiResponse>(
        `${BACKEND_URL}${path}`,
        body,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          timeout: 120000,
        }
      );
      return res.data;
    } catch (err) {
      console.error("AI API Error:", err);
      return {};
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // AI ACTIONS
  // -------------------------

  // 1) FREE Prompt → Generate
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const data = await postAi("/api/v1/gemini", {
      title,
      prompt,
      editorData,
    });

    const text = (data as any)?.result || "";
    setGeneratedText(text);

    if (!text) return;

    if (applyMode === "insert") await insertBelowCursor(text);
    else if (applyMode === "replace") await replaceSelected(text);
    else await replaceAll(text);
  };

  // 2) Continue writing
  const handleContinue = async () => {
    const data = await postAi("/api/v1/gemini/continue", {
      title,
      prompt,
      editorData,
    });

    const text = (data as any)?.result || "";
    setGeneratedText(text);

    if (!text) return;

    if (applyMode === "insert") await insertBelowCursor(text);
    else if (applyMode === "replace") await replaceSelected(text);
    else await replaceAll(text);
  };

  // 3) Rewrite selected
  const handleRewriteSelected = async () => {
    const editor = getEditor();
    if (!editor) return alert("Editor not ready.");

    const saved = await editor.save();
    const idx = editor.blocks.getCurrentBlockIndex();
    const block = saved.blocks[idx];

    if (!block) return alert("Select a block first.");

    let original = "";
    if (block.type === "paragraph") original = block.data?.text || "";
    else if (block.type === "header") original = block.data?.text || "";
    else if (block.type === "list") original = (block.data?.items || []).join("\n");
    else original = JSON.stringify(block.data || {});

    const data = await postAi("/api/v1/gemini/rewrite", {
      text: original,
      action: "rewrite",
    });

    const text = (data as any)?.result || "";
    setGeneratedText(text);

    if (!text) return;

    if (applyMode === "replace") await replaceSelected(text);
    else await insertBelowCursor(text);
  };

  // 4) Improve full blog
  const handleImprove = async () => {
    const data = await postAi("/api/v1/gemini/improve", { editorData });

    const text = (data as any)?.result || "";
    setGeneratedText(text);

    if (text && applyMode === "replaceAll") await replaceAll(text);
  };

  // 5) Summarize
  const handleSummarize = async () => {
    const data = await postAi("/api/v1/gemini/summarize", {
      blocks: editorData.blocks,
    });

    const text = (data as any)?.result || "";
    setGeneratedText(text);

    if (text && applyMode === "insert") await insertBelowCursor(text);
  };

  // 6) Generate Title
  const handleGenerateTitle = async () => {
    const data = await postAi("/api/v1/gemini/title", { editorData });
    setGeneratedText((data as any)?.result || "");
  };

  // 7) Generate Tags
  const handleGenerateTags = async () => {
    const data = await postAi("/api/v1/gemini/tags", { editorData });
    setGeneratedText((data as any)?.result || "");
  };

  // 8) Cover Image
//   const handleGenerateCoverImage = async () => {
//     if (!prompt.trim()) return setGeneratedText("Provide an image prompt.");

//     const data = await postAi("/api/v1/gemini/cover", { prompt });

//     const url = (data as any)?.result?.url;
//     if (!url) return setGeneratedText("No image generated.");

//     setGeneratedText(`Image URL: ${url}`);
//     await insertImage(url);
//   };

  // -------------------------
  // UI HELPERS
  // -------------------------
  const handleCopy = () => {
    if (!generatedText) return;

    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleApplyOutput = async () => {
    if (!generatedText) return;

    if (applyMode === "insert") await insertBelowCursor(generatedText);
    else if (applyMode === "replace") await replaceSelected(generatedText);
    else await replaceAll(generatedText);
  };

  // -------------------------
  // MODAL UI
  // -------------------------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">AI Writing Assistant</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* Prompt */}
        <label className="text-sm">Prompt / Instruction</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full border rounded p-2 mt-2 mb-4"
          placeholder="Write a blog intro about AI in healthcare..."
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={handleGenerate} className="bg-black text-white px-4 py-2 rounded">
            Generate
          </button>
          <button onClick={handleContinue} className="bg-gray-800 text-white px-4 py-2 rounded">
            Continue
          </button>
          <button onClick={handleRewriteSelected} className="bg-gray-800 text-white px-4 py-2 rounded">
            Rewrite Selected
          </button>
          <button onClick={handleImprove} className="bg-gray-800 text-white px-4 py-2 rounded">
            Improve Blog
          </button>
          <button onClick={handleSummarize} className="bg-gray-800 text-white px-4 py-2 rounded">
            Summarize
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={handleGenerateTitle} className="bg-indigo-600 text-white px-3 py-2 rounded">
            Generate Title
          </button>
          <button onClick={handleGenerateTags} className="bg-indigo-600 text-white px-3 py-2 rounded">
            Generate Tags
          </button>
          {/* <button onClick={handleGenerateCoverImage} className="bg-purple-700 text-white px-3 py-2 rounded">
            Cover Image
          </button> */}
        </div>

        {/* Apply Mode */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm">Apply Mode:</label>
          <select
            value={applyMode}
            onChange={(e) => setApplyMode(e.target.value as ApplyMode)}
            className="border rounded p-1"
          >
            <option value="insert">Insert (below cursor)</option>
            <option value="replace">Replace selected block</option>
            <option value="replaceAll">Replace entire blog</option>
          </select>
        </div>

        {/* Output */}
        <div>
          <h4 className="font-medium mb-1">AI Output</h4>
          <div className="border bg-gray-50 rounded p-3 min-h-[120px] max-h-60 overflow-y-auto">
            {generatedText ? (
              <div ref={contentRef} className="text-sm whitespace-pre-wrap">
                {generatedText}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No AI output yet.</div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={handleCopy} className="bg-black text-white px-3 py-2 rounded">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleApplyOutput} className="bg-green-600 text-white px-3 py-2 rounded">
              Apply Output
            </button>
            <button onClick={() => setGeneratedText("")} className="bg-gray-200 px-3 py-2 rounded">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
