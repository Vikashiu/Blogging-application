import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MediumNavbar from "@/component/dashboardComponents/MediumNavbar";
// import BlogCard from "@/component/dashboardComponents/BlogCard";
import { getToken } from "@/utils/auth";
import MyBlogs from "./MyBlogs";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface UserType {
  id: string;
  name: string;
  bio?: string | null;
  avatar?: string | null;
}

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get<any>(
        `${BACKEND_URL}/api/v1/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,  // <-- TOKEN SENT HERE
          },
        }
      );
      setUser(res.data.user);
      setBlogs(res.data.blogs);
    } catch (err) {
      console.log("Profile fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading profile...</div>;

  if (!user) return <div className="text-center mt-20">User not found</div>;

  return (
    <div>
      <MediumNavbar />

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {/* Top Profile Section */}
        <div className="flex items-center gap-6">
          <img
            src={user.avatar || "https://via.placeholder.com/150"}
            className="w-24 h-24 rounded-full object-cover border"
          />

          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.bio || "No bio yet."}</p>

            <button
              onClick={() => window.location.href = `/settings`}
              className="mt-3 px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-900"
            >
              Edit Profile
            </button>
          </div>
        </div>
        <MyBlogs/>
        
      </div>
    </div>
  );
}
