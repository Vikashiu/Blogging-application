import { useState } from 'react';
import axios from 'axios';
import { getToken } from '@/utils/auth';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  author: {
    name: string;
  };
  createdAt: string;
}

export function SearchBlogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      setIsSearching(true);
      try {
        const response = await axios.get<any>(`${BACKEND_URL}/api/v1/blogs/search?q=${query}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        setSearchResults(response.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="">
      <div className="relative">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-2">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((blog) => (
              <div key={blog.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <h4 className="text-lg font-medium text-gray-900">{blog.title}</h4>
                <p className="text-gray-600 mt-1">{blog.summary}</p>
                <div className="mt-2 text-sm text-gray-500">
                  By {blog.author.name} • {new Date(blog.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}