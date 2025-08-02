
import { useState, useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import Embed from '@editorjs/embed';
import type { BlockToolConstructable } from '@editorjs/editorjs';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const cloudname = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const EditorComponent = ({ data, onChange }:{
  data: { blocks: any[] }, onChange: (title: string, data: { blocks: any[] }) => void
}) => {
  const editorRef = useRef<EditorJS>(null); // Ref to hold the Editor.js instance
  const titleRef = useRef<HTMLInputElement>(null);
  const [localtitle, setLocalTitle] = useState(""); // Local state for title
  useEffect(() => {
      if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: 'editorjs',
        tools: {
          header: {
            class: Header as unknown as BlockToolConstructable,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          image: {
            class: Image,
            config: {
              uploader: {
                // You'll need to implement your own image upload service
                // This function will be called when an image is pasted/uploaded
                async uploadByFile(file: File) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', uploadPreset as string);

                try {
                  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudname}/image/upload`, {
                    method: 'POST',
                    body: formData
                  });

                  const data = await response.json();

                  return {
                    success: 1,
                    file: {
                      url: data.secure_url,
                    },
                  };
                } catch (error) {
                    console.error('Cloudinary upload error:', error);
                    return { success: 0 };
                  }
                },
                // For pasting external URLs
                async uploadByUrl(url: string) {
                  try {
                    const response = await fetch(`https://api.cloudinary.com/v1_1/din3caubo/image/upload`, {
                      method: 'POST',
                      body: new URLSearchParams({
                        file: url,
                        upload_preset: uploadPreset as string,
                      })
                    });

                    const data = await response.json();

                    return {
                      success: 1,
                      file: {
                        url: data.secure_url,
                      },
                    };
                  } catch (error) {
                    console.error('Cloudinary URL upload error:', error);
                    return { success: 0 };
                  }
                }
              }
            }
          },
          embed: {
            class: Embed as any,
            config: {
              services: {
                youtube: true,
                vimeo: true,
                // Add other video services if needed
              }
            }
          },
          list: {
            class: List as any,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            },
          },
          code: CodeTool,
           // For code blocks
          // Add other desired tools here
        },
        data: data.blocks.length ? data : undefined, // Load initial data if available
        onChange: async () => {
          if (editorRef.current && titleRef.current) {
            const outputData = await editorRef.current.save();
            onChange(titleRef.current.value, outputData);
          }
        },
        onReady: () => {
          // You might want to focus the editor or do other things when it's ready
        }
      });
    }

    // Cleanup function to destroy the Editor.js instance on unmount
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [data]); 


  return <div>

    <nav className="flex items-center justify-evenly px-6 py-3 sticky top-0 z-50 bg-white">
        <div className="text-2xl font-serif font-bold pl-30 text-gray-900">Medium</div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Drafts</button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Stories</button>
          <button className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
            onClick={async () => {
            
            if (editorRef.current) {
              const savedData = await editorRef.current.save();

              onChange(localtitle, savedData); 
              console.log("hello")
              console.log(data);
            }
            
        }}
          >Publish</button>
        </div>
    </nav>
    <div className="max-w-3xl mx-auto pl-30 py-6 ">
        <input
          type="text"
          value={localtitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-6xl font-bold mb-6 outline-none placeholder-gray-500"
    />
    <div>
        <div id="editorjs" className=' min-h-1/2' />
    </div>
    
    </div>
  </div>
  
};

export default EditorComponent;