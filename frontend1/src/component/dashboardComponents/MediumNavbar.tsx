import { Bell, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken } from "@/utils/auth"; // add this

const MediumNavbar = () => {
  const navigate = useNavigate();
  const userId = getUserIdFromToken(); // decode JWT

  return (
    <nav className="flex items-center justify-between px-8 py-3 border-b border-b-gray-100 bg-white sticky top-0 z-50 shadow-sm">

      <div className="flex items-center gap-10">
        <div 
          className="text-2xl font-serif font-bold cursor-pointer"
          onClick={() => navigate('/')}
        >
          Story Forge
        </div>
      </div>

      <div className="flex items-center gap-6">

        <button 
          onClick={() => navigate('/create-blog')} 
          className="cursor-pointer flex items-center gap-1 text-sm font-medium hover:text-black"
        >
          <Pencil className="w-4 h-4" /> Write
        </button>

        <Bell className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />

        {/* ⭐ Avatar → My Profile */}
        <img
          src="https://avatars.githubusercontent.com/u/1?v=4"
          onClick={() => navigate(`/user/${userId}`)}  // 👈 GO TO PROFILE
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover cursor-pointer"
        />
      </div>
    </nav>
  );
};

export default MediumNavbar;
