import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import api from "../../api/axiosInstance";

type Comment = {
  _id: string;
  reviewId: string;
  userId: {
    _id: string;
    username: string;
  };
  content: string;
  createdAt: string;
};

type Props = {
  reviewId: string;
};

const CommentThread = ({ reviewId }: Props) => {
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/comments?reviewId=${reviewId}`);
        setComments(res.data);
      } catch (err) {
        setError("Failed to load comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [reviewId]);

  const handleAdd = async () => {
    if (!newComment.trim() || !user) return;
    if (newComment.trim().length < 3) return;

    try {
      const res = await api.post("/comments", {
        reviewId,
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      setError("Failed to post comment.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError("Failed to delete comment.");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditText(comment.content);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await api.put(`/comments/${id}`, {
        content: editText,
      });
      setComments((prev) =>
        prev.map((c) => (c._id === id ? res.data : c))
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      setError("Failed to update comment.");
    }
  };

  if (loading) return <p className="muted-text comment-loading">Loading comments...</p>;

  return (
    <div className="comment-thread">
      {error && <p className="form-error">{error}</p>}

      {comments.map((c) => {
        const isOwner = user?.id === c.userId._id;

        return (
          <div key={c._id} className="comment-bubble">
            <strong className="comment-author">@{c.userId.username}</strong>

            {editingId === c._id ? (
              <>
                <input
                  className="comment-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="button-row-sm">
                  <button onClick={() => saveEdit(c._id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <p className="comment-text">{c.content}</p>
            )}

            {isOwner && editingId !== c._id && (
              <div className="button-row-sm">
                <button onClick={() => startEdit(c)}>Edit</button>
                <button onClick={() => handleDelete(c._id)}>Delete</button>
              </div>
            )}
          </div>
        );
      })}

      {isAuthenticated && (
        <div className="comment-add">
          <input
            className="comment-input"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="comment-post-btn" onClick={handleAdd}>
            Post
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentThread;
