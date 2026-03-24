import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { mockComments } from "../../mock/mockData";

type Comment = {
  id: string;
  reviewId: string;
  userId: string;
  username: string;
  content: string;
};

type Props = {
  reviewId: string;
};

const CommentThread = ({ reviewId }: Props) => {
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState<Comment[]>(
    mockComments.filter((c) => c.reviewId === reviewId)
  );

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
  if (!newComment.trim() || !user) return;

  if (newComment.trim().length < 3) return;

  if (comments.length >= 5) return;

  const newEntry: Comment = {
    id: Date.now().toString(),
    reviewId,
    userId: user.id,
    username: user.username,
    content: newComment.trim(),
  };

  setComments((prev) => [...prev, newEntry]);
  setNewComment("");
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const saveEdit = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, content: editText } : c
      )
    );
    setEditingId(null);
    setEditText("");
  };

  return (
    <div style={{ marginTop: "12px", marginLeft: "12px" }}>
      {comments.map((c) => {
        const isOwner = user?.id === c.userId;

        return (
          <div
            key={c.id}
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#f3f4f6",
              fontSize: "14px",
            }}
          >
            <strong style={{ fontSize: "13px" }}>@{c.username}</strong>

            {editingId === c.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "6px",
                  }}
                />
                <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                  <button onClick={() => saveEdit(c.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <p style={{ margin: "4px 0 0 0" }}>{c.content}</p>
            )}

            {isOwner && editingId !== c.id && (
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                <button onClick={() => startEdit(c)}>Edit</button>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
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
            style={{
              marginTop: "6px",
              padding: "6px 12px",
            }}
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentThread;