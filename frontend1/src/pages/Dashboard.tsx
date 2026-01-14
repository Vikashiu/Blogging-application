import { useEffect, useState } from "react";
import axios from "axios";
import MediumNavbar from "@/component/dashboardComponents/MediumNavbar";
import BlogCard from "@/component/dashboardComponents/BlogCard";
import type { Tagtype, Blogtype } from "../types/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Dashboard() {
  const [blogs, setBlogs] = useState<Blogtype[]>([]);
  const [tags, setTags] = useState<Tagtype[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("latest");

  // Fetch tags
  useEffect(() => {
    setLoadingTags(true);
    axios
  .get<any>(`${BACKEND_URL}/api/v1/tags`)
  .then((res) => setTags(res.data))
  .catch(() => console.log("Failed to fetch tags"))
  .then(() => setLoadingTags(false)); // use .then instead of .finally


    fetchBlogs();
  }, []);

  // Fetch blogs with search, tag filter, and sorting
  const fetchBlogs = async (
  query: string = "",
  tag: string | null = null,
  sort: string = "latest"
) => {
  setLoadingBlogs(true);

  try {
    let url = `${BACKEND_URL}/api/v1/blogs`;

    if (query.trim() !== "" || tag !== null) {
      url = `${BACKEND_URL}/api/v1/blogs/search`;
    }

    const res = await axios.get<any>(url, {
      params: { q: query, tag, sort },
    });

    setBlogs(res.data);
  } catch (err) {
    console.log("Failed to fetch blogs", err);
  } finally {
    setLoadingBlogs(false);
  }
};


  // Debounced search
  useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.trim().length > 0 || selectedTag !== null) {
      fetchBlogs(searchQuery, selectedTag, sortOption);
    } else {
      fetchBlogs(); // load all blogs normally
    }
  }, 500);

  return () => clearTimeout(timer);
}, [searchQuery, selectedTag, sortOption]);


  return (
    <div className="bg-gray-50 min-h-screen">
      <MediumNavbar />

      {/* SEARCH + SORT + TAGS SECTION */}
      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full p-4 pl-12 pr-12 rounded-full border shadow-sm bg-white outline-none transition focus:ring-2 focus:ring-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Search Icon */}
          <span className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</span>

          {/* Clear Search Button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-black text-lg"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Discover Blogs</h2>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 px-4 border bg-white rounded-full shadow-sm focus:ring-2 focus:ring-black"
          >
            <option value="latest">Latest</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        {/* Tag Filter Bar */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {loadingTags ? (
            <div className="animate-pulse">Loading tags...</div>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.id}
                className={`px-4 py-2 rounded-full border transition ${
                  selectedTag === tag.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() =>
                  setSelectedTag(selectedTag === tag.id ? null : tag.id)
                }
              >
                {tag.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* BLOG LIST */}
      <div className="max-w-5xl mx-auto px-4 mt-8 pb-10">
        {loadingBlogs ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse"
              >
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-gray-500 mt-12 text-lg">
            No blogs found.
          </p>
        ) : (
          blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
        )}
      </div>
    </div>
  );
}
