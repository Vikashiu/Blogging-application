import { useEffect, useState } from 'react';
import axios from 'axios';
import type { CommentType } from '@/types/types';
import { getToken } from '@/utils/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
interface CommentSectionProps {
    blogId: string;
}

export default function CommentSection({ blogId }: CommentSectionProps) {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await axios.get<CommentType[]>(`${BACKEND_URL}/api/v1/comments/post/${blogId}`);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    useEffect(() => {
        console.log(comments)
        fetchComments();
    }, [blogId]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        try {
            setLoading(true);
            const res = await axios.post<CommentType>(`${BACKEND_URL}/api/v1/comments`, {
                content: newComment,
                blogId,
            }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                }
            });
            setComments([{
                ...res.data,
                author: {
                    id: localStorage.getItem('id') || '',
                    name: localStorage.getItem('name') || 'You',
                }
            }, ...comments]);
            console.log(res.data);
            setNewComment('');
        } catch (err) {
            console.error('Error posting comment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/comments/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                }
            });
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>

            <div className="flex flex-col gap-2 mb-6">
                <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                    className="self-end bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    onClick={handlePostComment}
                    disabled={loading}
                >
                    {loading ? 'Posting...' : 'Post Comment'}
                </button>
            </div>

            <div className="space-y-4">
                {comments
                    .filter(comment => comment.author) // ✅ Only show comments with valid author
                    .map((comment: CommentType) => (

                        <div key={comment.id} className="border-b pb-2">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700 font-medium">
                                    {comment.author?.name || 'Unknown'}
                                </div>
                                {comment.author && localStorage.getItem('id') === comment.author.id && (
                                    <button
                                        className="text-red-500 text-xs"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <div className="text-gray-900">{comment.content}</div>
                            
                        </div>
                    ))}
            </div>
        </div>
    );
}
