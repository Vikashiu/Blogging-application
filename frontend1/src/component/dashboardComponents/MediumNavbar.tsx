
import { Search, Bell, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchBlogs } from '../CreateComponent/SearchBlogs'; // Adjust the import path as necessary

const MediumNavbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="flex items-center justify-between px-8 py-3 border-b border-b-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      {/* Left side - Logo and Tabs */}
      <div className="flex items-center gap-10">
        <div className="text-2xl font-serif font-bold">Medium</div>
       
      </div>

      {/* Right side - Search, Write, Bell, Avatar */}
      <div className="flex items-center gap-6">
        <div className="container ">
          
          <SearchBlogs />
          {/* Rest of your existing content */}
        </div>
        <button onClick={() => navigate('/create-blog')} className="cursor-pointer flex items-center gap-1 text-sm font-medium hover:text-black">
          <Pencil className="w-4 h-4" /> Write
        </button>
        <Bell className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
        <img
          src="https://avatars.githubusercontent.com/u/1?v=4"
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
    </nav>
  );
};

export default MediumNavbar;
