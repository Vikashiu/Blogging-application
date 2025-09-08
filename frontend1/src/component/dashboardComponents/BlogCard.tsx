import { Link } from 'react-router-dom'; // Import Link for navigation
import type { Blogtype } from '@/types/types'; //

const BlogCard = ({ blog }: { blog: Blogtype }) => {
  return (
    // Wrap the entire card with Link to make it clickable and navigate to the blog post
    <Link to={`/blog/${blog.id}`} className="block">
      <div className="flex justify-between border-b pb-4 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-200">
        <div>
          <div className="text-sm text-gray-500">
            by {blog.author?.name} {/* Use optional chaining for author.name */}
          </div>
          <h2 className="font-bold text-lg">{blog.title}</h2>
          {/* Displaying a snippet of the content */}
          <p className="text-gray-700">
            {blog.content && typeof blog.content === 'object' && 'blocks' in blog.content && Array.isArray(blog.content.blocks)
              ? blog.content.blocks[0]?.data?.text?.slice(0, 120) + '...'
              : '...'}
          </p>

          <div className="text-sm flex gap-4 mt-2 text-gray-500">
            <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>👁️‍🗨️ {blog.views || 0}</span>
            <span>💬 {blog.comments?.length || 0}</span> {/* Use optional chaining for comments.length */}
          </div>
        </div>

        {blog.coverimage && (
          <img
            src={blog.coverimage}
            alt={blog.title}
            className="w-32 h-24 object-cover rounded-lg ml-4"
          />
        )}
      </div>
    </Link>
  );
};

export default BlogCard;
