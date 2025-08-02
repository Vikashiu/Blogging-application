
import type { Tagtype } from "@/types/types";

export default function TagFilterBar({
  tags,
  activeTagId,
  onTagSelect,
  isLoading, // Add an isLoading prop
}: {
  tags: Tagtype[];
  activeTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
  isLoading: boolean; // Define the type for isLoading
}) {
  return (
    <div className="flex justify-center gap-3 overflow-x-auto px-4 py-2 border-b border-gray-100 shadow">
      {isLoading ? (
        // Skeleton loading state
        <>
          <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        </>
      ) : (
        // Actual tag buttons
        <>
          <button
            onClick={() => onTagSelect(null)}
            className={`px-4 py-1 rounded-full border ${
              activeTagId === null ? "bg-black text-white" : "text-gray-700"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagSelect(tag.id)}
              className={`px-4 py-1 rounded-full border ${
                activeTagId === tag.id ? "bg-black text-white" : "text-gray-700"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}