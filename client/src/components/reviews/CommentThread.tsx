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

  if (loading) return <p style={{ fontSize: "13px" }}>Loading comments...</p>;

  return (
    <div style={{ marginTop: "12px", marginLeft: "12px" }}>
      {error && (
        <p style={{ color: "red", fontSize: "13px" }}>{error}</p>
      )}

      {comments.map((c) => {
        const isOwner = user?.id === c.userId._id;

        return (
          <div
            key={c._id}
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#f3f4f6",
              fontSize: "14px",
            }}
          >
            <strong style={{ fontSize: "13px" }}>@{c.userId.username}</strong>

            {editingId === c._id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ width: "100%", marginTop: "6px", padding: "6px" }}
                />
                <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                  <button onClick={() => saveEdit(c._id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <p style={{ margin: "4px 0 0 0" }}>{c.content}</p>
            )}

            {isOwner && editingId !== c._id && (
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                <button onClick={() => startEdit(c)}>Edit</button>
                <button onClick={() => handleDelete(c._id)}>Delete</button>
              </div>
            )}
          </div>
        );
      })}

      {isAuthenticated && (
        <div style={{ marginTop: "12px" }}>
          <input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleAdd}
            style={{ marginTop: "6px", padding: "6px 12px" }}
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentThread;