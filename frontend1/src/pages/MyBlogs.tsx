import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Blog {
  id: string;
  title: string;
  subtitle?: string;
  coverimage?: string;
  createdAt: string;
}

interface MyBlogsResponse {
  blogs: Blog[];
}

export default function MyBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBlogs = async () => {
    try {
      const res = await axios.get<MyBlogsResponse>(`${BACKEND_URL}/api/v1/blogs/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.log("Error fetching blogs:", err);
    }
    setLoading(false);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/v1/blogs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Loading your blogs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
    

      {/* PAGE TITLE */}
      <div className="max-w-5xl mx-auto mt-10 px-4">
        <h1 className="text-4xl font-bold mb-6">Your Blogs</h1>

        {blogs.length === 0 ? (
          <p className="text-gray-600 text-lg">You haven’t written any blogs yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 border border-gray-100"
              >
                {blog.coverimage ? (
                  <img
                    src={blog.coverimage}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex justify-center items-center text-gray-500 mb-4">
                    No Image
                  </div>
                )}

                {/* Blog Title and Subtitle */}
                <h2 className="text-xl font-semibold line-clamp-1">{blog.title}</h2>

                {blog.subtitle && (
                  <p className="text-gray-600 text-sm line-clamp-2 mt-1">{blog.subtitle}</p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <Link
                    to={`/edit/${blog.id}`}
                    className="px-4 py-1.5 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteBlog(blog.id)}
                    className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
