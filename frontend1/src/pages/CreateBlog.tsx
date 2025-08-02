import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import EditorComponent from '../component/CreateComponent/editor';
import PublishPage from './PublishBlog';
import { getToken } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function CreateBlog() {
  const navigate = useNavigate();
  const [editorData, setEditorData] = useState<{ blocks: any[] }>({ blocks: [] });
  const [title, setTitle] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const isResizing = useRef(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);




  const handleEditorChange = (newTitle: string, data: { blocks: any[] }) => {
    setEditorData(data);
    setTitle(newTitle);
    if (data.blocks.length > 0 && newTitle.trim() !== '') {
      setShowPublish(true);
    } else {
      setShowPublish(false);
    }
  };


  const handleSubmit = async (meta: any) => {
    try {
      const payload = {
        title,
        subtitle: meta.subtitle || "",
        tags: meta.topics || [],
        content: editorData,
        coverimage: meta.coverimage || "",

      };
      // console.log('Payload:', payload);

      await axios.post(`${BACKEND_URL}/api/v1/blogs`, payload, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      // Show success alert
      alert("Blog created successfully!");

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {

      console.log(err);
    }
  };
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post<any>(`${BACKEND_URL}/api/v1/gemini`, {
        title,
        prompt,
      });

      setGeneratedText(response.data.result || 'No response');
    } catch (err) {
      console.log("Gemini API error:", err);
      setGeneratedText("❌ Error generating content.");
    }
    setLoading(false);
  };
  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 280 && newWidth <= 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  // ✅ Add auto-save useEffect here after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('draft', JSON.stringify({ title, editorData }));
    }, 10000);
    return () => clearTimeout(timeout);
  }, [title, editorData]);

  return (
    <div className=''>
      <div className='flex flex-col gap-4 p-4'>

        <div className=''>
          <EditorComponent data={editorData} onChange={handleEditorChange} />
        </div>

        {showPublish && (
          <PublishPage
            title={title}
            content={editorData}
            // summary= { summary } 
            onClose={() => setShowPublish(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
      <button
        onClick={() => setOpenModal(true)} // or any other action
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition"
      >
        Write Blog with AI
      </button>
      {openModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          {/* Sidebar */}
          <div
            style={{ width: sidebarWidth }}
            className="bg-white h-full shadow-lg p-6 animate-slide-in-right relative transition-all duration-100"
          >
            <div
              onMouseDown={handleMouseDown}
              className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-50"
            ></div>

            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Right Sidebar</h2>
            {/* Add sidebar content here */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Write a blog intro on AI in healthcare"
              rows={4}
              className="w-full p-2 border rounded-md mb-3"
            />

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full transition"
            >
              {loading ? 'Generating...' : 'Generate with Gemini'}
            </button>

            {generatedText && (
              <div className="relative mt-4">
                <div
                  ref={contentRef}
                  className="p-3 border rounded bg-gray-50 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto"
                >
                  {generatedText}
                </div>
                <button
                  onClick={() => {
                    if (contentRef.current) {
                      navigator.clipboard.writeText(contentRef.current.innerText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
                    }
                  }}
                  className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div>

      </div>
    </div>


  );
}

