import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import EditorJS from "@editorjs/editorjs";
import type { OutputData } from '@editorjs/editorjs';
import Header from "@editorjs/header";
import ImageTool from "@editorjs/image";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import Embed from "@editorjs/embed";

import { getToken } from "@/utils/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const cloudname = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const editorRef = useRef<EditorJS | null>(null);
  const [title, setTitle] = useState("");
  const [editorData, setEditorData] = useState<OutputData>({ blocks: [] });
  const [loading, setLoading] = useState(true);

  // Fetch existing blog ------------------------------------
  const fetchBlog = async () => {
    try {
      const res = await axios.get<any>(`${BACKEND_URL}/api/v1/blogs/${id}`);
      const blog = res.data;

      setTitle(blog.title);
      setEditorData(blog.content);
    } catch (err) {
      console.log("Error loading blog:", err);
    }
    setLoading(false);
  };

  // Initialize EditorJS ------------------------------------
  useEffect(() => {
    if (!loading) {
      if (editorRef.current) editorRef.current.destroy();

      editorRef.current = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        data: editorData,

        tools: {
          header: Header,
          list: List,
          quote: Quote,
          code: CodeTool,
          embed: Embed,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("upload_preset", uploadPreset);

                  const upload = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
                    { method: "POST", body: formData }
                  );
                  const data = await upload.json();

                  return {
                    success: 1,
                    file: { url: data.secure_url },
                  };
                },
              },
            },
          },
        },

        onChange: async () => {
          const output = await editorRef.current?.save();
          if (output) setEditorData(output);
        },
      });
    }

    return () => {
      if (editorRef.current) editorRef.current.destroy();
    };
  }, [loading]);

  // Update blog --------------------------------------------
  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/v1/blogs/edit/${id}`,
        { title, content: editorData },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      alert("Blog updated successfully!");
      navigate("/myblog");
    } catch (err) {
      console.log("Update error:", err);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  if (loading) return <div className="text-center p-10 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar ------------------------------------------------ */}
      <div className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="text-2xl font-serif font-bold text-gray-900">
          Medium
        </div>

        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
        >
          Update Blog
        </button>
      </div>

      {/* Content Area --------------------------------------------- */}
      <div className="max-w-3xl mx-auto mt-10 px-4">

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-5xl font-bold mb-6 outline-none bg-transparent placeholder-gray-400"
        />

        {/* EditorJS Container */}
        <div
          id="editorjs"
          className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm min-h-[400px]"
        ></div>
      </div>
    </div>
  );
}
