import { useEffect, useState } from "react";
import axios from "axios";
import MediumNavbar from "@/component/dashboardComponents/MediumNavbar";
// import TagFilterBar from "@/component/dashboardComponents/TagLineFilter"; // Assuming TagLineFilter is your TagFilterBar component
import BlogCard from "@/component/dashboardComponents/BlogCard";

import type { Blogtype } from "../types/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Dashboard() {
  const [blogs, setBlogs] = useState<Blogtype[]>([]);
  // const [tags, setTags] = useState<Tagtype[]>([]);
  // const [activeTagId, setActiveTagId] = useState<string | null>(null);
  // const [loadingTags, setLoadingTags] = useState(true); // New loading state for tags
  const [loadingBlogs, setLoadingBlogs] = useState(true); // New loading state for blogs

  useEffect(() => {
    // Fetch Tags
    // setLoadingTags(true); // Set loading for tags to true
    // axios
    //   .get<AnyActionArg>(`${BACKEND_URL}/api/v1/tags`)
    //   .then((res) => {
    //     console.log("Tags:", res.data);
    //     setTags(res.data);
    //   })
    //   .catch((err) => console.error("Failed to fetch tags", err))
    //   .then(() => setLoadingTags(false)); // Set loading for tags to false

    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoadingBlogs(true); // Set loading for blogs to true
    try {
      const res = await axios.get<any>(`${BACKEND_URL}/api/v1/blogs`);
      console.log("Blogs:", res.data);
      setBlogs(res.data);
    } catch (err) {
      console.log("Failed to fetch blogs", err);
    } finally {
      setLoadingBlogs(false); // Set loading for blogs to false
    }
  };

  // const handleTagSelect = (tagId: string | null) => {
  //   setActiveTagId(tagId);
  //   // fetchBlogs(tagId); // Call fetchBlogs when a tag is selected
  // };

  return (
    <div>
      <MediumNavbar />
      {/* <TagFilterBar
        tags={tags}
        activeTagId={activeTagId}
        onTagSelect={handleTagSelect}
        isLoading={loadingTags}
         
      /> */}

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {loadingBlogs ? (
          // Skeleton loading for Blog Cards
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => ( // Show 3 skeleton cards
              <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div> {/* Title skeleton */}
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div> {/* Paragraph line 1 */}
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div> {/* Paragraph line 2 */}
                <div className="h-3 bg-gray-200 rounded w-1/2"></div> {/* Paragraph line 3 */}
                <div className="flex items-center mt-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div> {/* Author avatar skeleton */}
                  <div className="h-4 bg-gray-200 rounded w-24"></div> {/* Author name skeleton */}
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No blogs found</div>
        ) : (
          blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
        )}
      </div>
    </div>
  );
}