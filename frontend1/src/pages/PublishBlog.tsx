import React, { useState } from 'react';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const cloudname = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

interface PublishPageProps {
  title: string;
  content: { blocks: any[] };
  onClose: () => void;
  // summary: string; // Added summary prop
  onSubmit: (meta: { subtitle: string; coverimage: string | null ; tags: string[]}) => void;
}

const PublishPage = ({title, content,onClose, onSubmit}:PublishPageProps) => {
  // console.log("Content in PublishPage:", content);
  const [topicInput, setTopicInput] = useState<string>('');
  const [storySubtitle, setStorySubtitle] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // New state for the file
  const [isUploading, setIsUploading] = useState<boolean>(false); // New state for loading indicator

  const handleAddTopic = (topicToAdd: string) => {
    if (selectedTopics.length < 5 && !selectedTopics.includes(topicToAdd)) {
      setSelectedTopics([...selectedTopics, topicToAdd]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setSelectedTopics(selectedTopics.filter(topic => topic !== topicToRemove));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a local URL for immediate preview
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setThumbnailPreview(null);
    }
  };

  const uploadImageToCloudinary = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', uploadPreset as string); // Use the upload preset from environment variable

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        return data.secure_url; // The URL of the uploaded image
      } else {
        console.error("Cloudinary upload error:", data);
        return null;
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    let coverImageUrl: string | null = null;
    if (imageFile) {
      coverImageUrl = await uploadImageToCloudinary();
      if (!coverImageUrl) {
        alert("Failed to upload cover image. Please try again.");
        return; // Stop submission if image upload fails
      }
    }

    console.log(title, storySubtitle, selectedTopics, coverImageUrl);
    onSubmit({
      subtitle: storySubtitle,
      
      coverimage: coverImageUrl,
      tags: selectedTopics, // Assuming you want to send topics as tags
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center p-4 z-50 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-8 relative">
        {/* Close Button */}
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Story Preview Section */}
          <div className="flex flex-col" >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Story Preview</h2>
            <div
              className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-center text-gray-500 min-h-[180px] bg-gray-50 relative overflow-hidden"
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="p-4">Include a high-quality image in your story to make it more inviting to readers.</span>
              )}
            </div>
            {/* File input for image upload */}
            <input
                type="file"
                accept="image/*"
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                onChange={handleFileChange}
            />
            {isUploading && <p className="text-sm text-blue-500 mt-2">Uploading image...</p>}

            <div className='mt-6 text-2xl font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-2'>{title}</div>
            <textarea
              className="mt-2 text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 resize-none overflow-hidden h-auto"
              rows={2}
              value={storySubtitle}
              onChange={(e) => setStorySubtitle(e.target.value)}
              placeholder="Add a subtitle..." // Added placeholder for clarity
            />
            <p className="mt-4 text-sm text-gray-500">
              Note: Changes here will affect how your story appears in public places like Medium's homepage and in subscribers' inboxes — not the contents of the story itself.
            </p>
          </div>

          {/* Publishing Section */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Publishing to: Vikash</h2>
            <p className="text-gray-700 mb-4">
              Add or change topics (up to 5) so readers know what your story is about
            </p>

            {/* Selected Topics Display */}
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTopics.map((topic, index) => (
                <span key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {topic}
                  <button onClick={() => handleRemoveTopic(topic)} className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none">
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a topic..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => { // Added Enter key functionality for adding topics
                  if (e.key === 'Enter' && topicInput.trim()) {
                    handleAddTopic(topicInput.trim());
                  }
                }}
              />
              <button
                onClick={() => handleAddTopic(topicInput.trim())}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                disabled={!topicInput.trim() || selectedTopics.length >= 5}
              >
                Add
              </button>
            </div>

            <a href="#" className="text-blue-600 hover:underline mt-4 text-sm">
              Learn more about what happens to your story when you publish.
            </a>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleSubmit} // Call the new handleSubmit function
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
                disabled={isUploading} // Disable button during upload
              >
                {isUploading ? 'Uploading & Publishing...' : 'Publish now'}
              </button>
              <button className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200">
                Schedule for later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishPage;