// src/pages/Settings.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import MediumNavbar from "@/component/dashboardComponents/MediumNavbar";
import { getToken } from "@/utils/auth";
import { useNavigate } from "react-router-dom";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // unsigned preset


type FormState = {
  name: string;
  bio: string;
  avatar?: string | null;
  twitter?: string;
  linkedin?: string;
  github?: string;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: "",
    bio: "",
    avatar: null,
    twitter: "",
    linkedin: "",
    github: "",
    notifyEmail: true,
    notifyPush: false,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await axios.get<any>(`${BACKEND_URL}/api/v1/users/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const u = res.data.user;
      setForm((s) => ({
        ...s,
        name: u.name || "",
        bio: u.bio || "",
        avatar: u.avatar || null,
        twitter: u.twitter || "",
        linkedin: u.linkedin || "",
        github: u.github || "",
        notifyEmail: u.notifyEmail ?? true,
        notifyPush: u.notifyPush ?? false,
      }));
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleAvatarUpload(file: File) {
    if (!UPLOAD_PRESET || !CLOUD_NAME) {
      setError("Cloudinary not configured.");
      return;
    }
    setSaving(true);
    setMsg("Uploading avatar...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET as string);

      const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await resp.json();
      if (!data.secure_url) throw new Error("Upload failed");
      handleChange("avatar", data.secure_url);
      setMsg("Avatar uploaded (not yet saved). Click Save changes.");
    } catch (err) {
      console.error(err);
      setError("Avatar upload failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 2500);
    }
  }

async function handleSubmit(e?: React.FormEvent) {
  if (e) e.preventDefault();
  setSaving(true);
  setError(null);
  setMsg(null);

  if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
    setError("New password and confirm password do not match.");
    setSaving(false);
    return;
  }

  try {
    const payload: any = {
      name: form.name,
      bio: form.bio,
      avatar: form.avatar,
      twitter: form.twitter,
      linkedin: form.linkedin,
      github: form.github,
      notifyEmail: form.notifyEmail,
      notifyPush: form.notifyPush,
    };

    if (form.currentPassword && form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    const res = await axios.patch<any>(
      `${BACKEND_URL}/api/v1/users/me`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    const updatedUser = res.data.user;

    setMsg("Profile saved.");

    // Redirect after 1 second
    setTimeout(() => {
      navigate(`/user/${updatedUser.id}`);
    }, 800);

  } catch (err: any) {
    console.error("Save error:", err);
    setError(err?.response?.data?.message || "Failed to save");
  } finally {
    setSaving(false);
  }
}


  if (loading) return <div className="min-h-screen p-8">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <MediumNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 bg-white rounded-lg p-6 shadow-sm">
            <nav className="flex flex-col gap-3 text-sm">
              <button className="text-left py-2 px-3 rounded hover:bg-gray-50 font-medium">Profile</button>
              <button className="text-left py-2 px-3 rounded hover:bg-gray-50">Account</button>
              <button className="text-left py-2 px-3 rounded hover:bg-gray-50">Notifications</button>
              <button className="text-left py-2 px-3 rounded hover:bg-gray-50">Social</button>
            </nav>
          </aside>

          {/* Content */}
          <main className="md:col-span-3 bg-white rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Top: avatar + name */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border">
                  {form.avatar ? (
                    <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No</div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600">Display name</label>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Your display name"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(ev) => {
                          const file = ev.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                        className="hidden"
                      />
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm">Change photo</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleChange("avatar", null)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 min-h-[100px]"
                  placeholder="Short bio shown on your profile"
                />
              </div>

              {/* Social links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Twitter</label>
                  <input
                    value={form.twitter}
                    onChange={(e) => handleChange("twitter", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">LinkedIn</label>
                  <input
                    value={form.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="linkedin.com/in/you"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">GitHub</label>
                  <input
                    value={form.github}
                    onChange={(e) => handleChange("github", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="github.com/you"
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!form.notifyEmail}
                    onChange={(e) => handleChange("notifyEmail", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!form.notifyPush}
                    onChange={(e) => handleChange("notifyPush", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Push notifications</span>
                </label>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Current password</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Leave empty to keep"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">New password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="New password"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Confirm new</label>
                  <input
                    type="password"
                    value={form.confirmNewPassword}
                    onChange={(e) => handleChange("confirmNewPassword", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center justify-end gap-4">
                {error && <div className="text-red-600">{error}</div>}
                {msg && <div className="text-green-600">{msg}</div>}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
