import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs'; // Import OutputData
import CommentSection from '@/component/CreateComponent/CommentSection';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { Blogtype } from '../types/types';
import MediumNavbar from '@/component/dashboardComponents/MediumNavbar';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ReadOnlyBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const editorRef = useRef<EditorJS | null>(null);
  const [blog, setBlog] = useState<Blogtype | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(480); // default 30rem
  const isResizing = useRef(false);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) { // optional min/max width
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (id) {
      axios.get<Blogtype>(`${BACKEND_URL}/api/v1/blogs/${id}`)
        .then(response => {
          setBlog(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch blog:", err);
          setError("Failed to load blog post.");
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (blog && !editorRef.current) {
      editorRef.current = new EditorJS({
        holder: 'editorjs-readonly',
        // Explicitly cast blog.content to OutputData to satisfy TypeScript
        data: blog.content as unknown as OutputData,
        readOnly: true,
        tools: {
          header: Header,
          list: List,
          image: ImageTool,
          embed: Embed,
          quote: Quote,
          code: CodeTool,
        },
      });
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [blog]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);
  const generateSummary = async () => {
    if (!editorRef.current) return;

    try {
      setGenerating(true);
      // const savedData = await editorRef.current.save();
      console.log(blog)
      const response = await axios.post<any>(`${BACKEND_URL}/api/v1/gemini/summarize`, {
        // blocks: savedData.blocks,
        blocks: (blog?.content as OutputData).blocks, // Use the content from the blog
      });
      console.log('Summary Response:', response.data.result);
      setSummary(response.data.result);
    } catch (error) {
      console.log('Error:', error);
      setSummary('Failed to generate summary.');
    } finally {
      setGenerating(false);
    }
  };


  if (loading) {
    return (
      <div>
        <MediumNavbar />
        <div className="max-w-3xl mx-auto py-6 px-4 animate-pulse">
          <div className="h-10 bg-gray-300 rounded mb-4 w-3/4" />
          <div className="h-5 bg-gray-300 rounded mb-6 w-1/4" />
          <div className="h-64 bg-gray-300 rounded mb-8 w-full" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-full" />
          </div>
        </div>
      </div>

    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!blog) {
    return <div className="text-center mt-10">Blog post not found.</div>;
  }

  return (
    <div className='flex flex-col'>
      <MediumNavbar />

      <div className="max-w-3xl mx-auto py-6 px-4 min-w-2xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 break-words">
          {blog.title}
        </h1>
        {blog.author && (
          <p className="text-md text-gray-600 mb-6">By {blog.author.name}</p>
        )}
        
        <div id="editorjs-readonly" className="prose max-w-none">
        </div>
        <CommentSection blogId={blog.id} />

        {/* Floating Button */}
        {!sidebarOpen && (<button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg"
        >
          Generate Summary
        </button>)}

        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-lg border-l transform transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          style={{ width: sidebarWidth }}
          ref={sidebarRef}
        >
          <div
            onMouseDown={() => (isResizing.current = true)}
            className="absolute top-0 left-0 h-full w-2 cursor-ew-resize z-50"
          />
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold">Sidebar</h2>

          </div>
          <div className="p-4 flex flex-col gap-2">
            <div className='flex justify-between  '>
              <div className='font-bold text-xl'>Generate Summary</div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="bg-black rounded-xl px-4 py-1 text-white hover:text-blue-800"
              >
                Close
              </button>
            </div>

            <button
              onClick={generateSummary}
              disabled={generating}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Summary'}
            </button>

            {summary && (
              <div className="mt-4 p-3 border rounded bg-gray-50 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {summary}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ReadOnlyBlogPage;