import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { mockComments } from "../../mock/mockComments";

interface Props {
  reviewId: string;
}

const CommentThread = ({ reviewId }: Props) => {
  const { isAuthenticated, user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(
    mockComments.filter((c) => c.reviewId === reviewId)
  );
  const [newComment, setNewComment] = useState("");

  const handlePost = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: crypto.randomUUID(),
      reviewId,
      userId: user?.id || "temp",
      username: user?.username || "you",
      content: newComment
    };

    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="comment-thread">
      {/* Toggle button */}
      <button
        className="view-comments-btn"
        onClick={() => setShowComments((prev) => !prev)}
      >
        {showComments ? "Hide comments" : `View comments (${comments.length})`}
      </button>

      {showComments && (
        <>
          {/* Comment list */}
          <div className="comment-list">
            {comments.map((c) => {
              const canDelete = user?.id === c.userId;

              return (
                <div key={c.id} className="comment-item">
                  <p>
                    <strong>@{c.username}</strong>: {c.content}
                  </p>

                  {canDelete && (
                    <button
                      className="delete-comment"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input */}
          {isAuthenticated && (
            <div className="comment-input">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handlePost}>Post</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentThread;