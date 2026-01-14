import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Signup } from './pages/SignUp';
import { Signin } from './pages/SignIn';
import {CreateBlog}  from './pages/CreateBlog';
import MyBlogs from './pages/MyBlogs';
import Dashboard from './pages/Dashboard';
import ReadOnlyBlogPage from './pages/pageOnlyRead';
import { Navigate } from 'react-router-dom';
import EditorComponent from './pages/EditBlog';
import ProfilePage from './pages/ProfilePage';
import Settings from './pages/Setting';
// import  from 'react';

// interface EditorProps {
//   data: { blocks: any[] };
//   onChange: (title: string, data: any) => void;
// }

function ProtectedRoute({ children }: {
  children: React.ReactNode;
}) {
  const isLoggedIn = localStorage.getItem('token'); // adjust if you use context or cookies
  return isLoggedIn ? children : <Navigate to="/signin" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<div>404 - Page Not Found</div>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route
          path="/create-blog"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blog/:id" element={<ReadOnlyBlogPage />} />
        <Route path="/myblog" element={<MyBlogs />}></Route>
        <Route
          path="/edit/:id"
          element={
            <EditorComponent/>
          }
        />
        <Route path="/user/:id" element={<ProfilePage />} />
        <Route path="settings" element={<Settings/>}></Route>
      </Routes>
    </Router>
  );
}

export default App
