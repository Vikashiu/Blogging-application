// src/pages/CreateBlog.tsx
import { useEffect, useState } from "react";
import EditorComponent from "../component/CreateComponent/editor";
import PublishPage from "./PublishBlog";
import AIWritingModal from "@/component/CreateComponent/aiWritingModal";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

export function CreateBlog() {
  const [editorData, setEditorData] = useState<{ blocks: any[] }>({ blocks: [] });
  const [title, setTitle] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [openAiModal, setOpenAiModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const raw = localStorage.getItem("draft");
      if (raw) {
        const d = JSON.parse(raw);
        if (d?.title) setTitle(d.title);
        if (d?.editorData) setEditorData(d.editorData);
      }
    } catch (e) {}
  }, []);

  // Editor content update
  const handleEditorChange = (newTitle: string, data: { blocks: any[] }) => {
    setTitle(newTitle);
    setEditorData(data);

    // Save draft locally
    localStorage.setItem(
      "draft",
      JSON.stringify({ title: newTitle, editorData: data })
    );
  };

  // triggered when user clicks Publish inside publish page
  const handleSubmit = async (meta: any) => {
    try {
    const payload = {
      title,
      subtitle: meta.subtitle || "",
      tags: meta.tags || [],
      content: editorData,
      coverimage: meta.coverimage || null
    };

    console.log("Publishing payload:", payload);

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("Blog Published Successfully!");

    // OPTIONAL: clear draft
    localStorage.removeItem("draft");

    navigate("/dashboard");

  } catch (error: any) {
    console.error("Publish error:", error?.response || error);
    alert(
      error?.response?.data?.message ||
      "Failed to publish blog. Please try again."
    );
  }
  };

  // user clicked publish button from EditorComponent
  const openPublishModal = () => {
    // if (!title.trim()) return alert("Please add a title!");
    if (editorData.blocks.length === 0) return alert("Blog content cannot be empty!");
    setShowPublish(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 p-4">
        <EditorComponent
          data={editorData}
          onChange={handleEditorChange}
          onPublishClick={openPublishModal}   // ⭐ NEW LINE
        />

        {showPublish && (
          <PublishPage
            title={title}
            content={editorData}
            onClose={() => setShowPublish(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* AI Assist Button */}
      <button
        onClick={() => setOpenAiModal(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition"
      >
        Write Blog with AI
      </button>

      <AIWritingModal
        open={openAiModal}
        onClose={() => setOpenAiModal(false)}
        title={title}
        editorData={editorData}
      />
    </div>
  );
}

export default CreateBlog;
