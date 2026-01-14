// src/component/CreateComponent/EditorComponent.tsx
import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import type { BlockToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

type EditorData = { blocks: any[] };

export default function EditorComponent({
  data,
  onChange,
  onPublishClick
}: {
  data: EditorData;
  onChange: (title: string, data: EditorData) => void;
  onPublishClick: () => void;
}) {

  const editorRef = useRef<EditorJS | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // --- FIX START ---
  // Create a ref to track the live title value
  const titleRef = useRef(localTitle);

  // Sync the ref whenever state changes
  useEffect(() => {
    titleRef.current = localTitle;
  }, [localTitle]);
  // --- FIX END ---

  // Initialize EditorJS once
  useEffect(() => {
    if (editorRef.current) return;

    editorRef.current = new EditorJS({
      holder: "editorjs",
      data: data && data.blocks && data.blocks.length ? data : undefined,
      autofocus: true,
      tools: {
        header: {
          class: Header as unknown as BlockToolConstructable,
          inlineToolbar: true,
          config: {
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2,
          },
        },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("upload_preset", UPLOAD_PRESET as string);

                  const resp = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                    {
                      method: "POST",
                      body: formData,
                    }
                  );
                  const json = await resp.json();
                  return { success: 1, file: { url: json.secure_url } };
                } catch (err) {
                  console.error("Cloudinary upload error", err);
                  return { success: 0 };
                }
              },
              async uploadByUrl(url: string) {
                try {
                  const resp = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                    {
                      method: "POST",
                      body: new URLSearchParams({
                        file: url,
                        upload_preset: UPLOAD_PRESET as string,
                      }),
                    }
                  );
                  const json = await resp.json();
                  return { success: 1, file: { url: json.secure_url } };
                } catch (err) {
                  console.error("Cloudinary URL upload error", err);
                  return { success: 0 };
                }
              },
            },
          },
        },
        embed: {
          class: Embed as any,
          config: {
            services: {
              youtube: true,
              vimeo: true,
            },
          },
        },
        list: { class: List as any, inlineToolbar: true },
        quote: {
          class: Quote,
          inlineToolbar: true,
          shortcut: "CMD+SHIFT+O",
        },
        code: CodeTool,
      },
      onChange: async () => {
        try {
          if (!editorRef.current) return;
          const saved = await editorRef.current.save();
          // --- FIX START ---
          // Use titleRef.current instead of localTitle to get the actual text
          onChange(titleRef.current, saved);
          // --- FIX END ---
        } catch (err) {
          console.warn("Editor save onChange failed", err);
        }
      },
      onReady: () => {
        // no-op for now
      },
    });

    return () => {
      const inst = editorRef.current;
      if (inst && inst.destroy) {
        inst.destroy();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init only once

  // Keep local title in sync with parent data
  useEffect(() => {
    onChange(localTitle, data);
  }, [localTitle]);

  return (
    <div className="relative">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-3 sticky top-0 z-50 bg-white border-b">
        <div className="text-2xl font-serif font-bold text-gray-900">Medium</div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
            Drafts
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
            Stories
          </button>
          <button
            onClick={onPublishClick}
            className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "Publish"}
          </button>

        </div>
      </nav>

      {/* Title + editor */}
      <div className="max-w-3xl mx-auto py-6 px-6">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-5xl font-bold mb-6 outline-none placeholder-gray-500"
        />

        <div id="editorjs" className="min-h-[400px] bg-white rounded shadow-sm p-4" />
      </div>

    </div>
  );
}