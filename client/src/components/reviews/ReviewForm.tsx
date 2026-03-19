import { useState } from "react";
import type { Review } from "../../types/media";

type Props = {
  mediaId?: string;
  existingReview?: Review;
  onSuccess?: () => void;
};

const ReviewForm = ({ mediaId, existingReview, onSuccess }: Props) => {
  const [content, setContent] = useState(existingReview?.content || "");
  const [story, setStory] = useState(5);
  const [acting, setActing] = useState(5);
  const [cinematography, setCinematography] = useState(5);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Review cannot be empty");
      return;
    }

    console.log("Submitting review:", {
      mediaId,
      content,
      story,
      acting,
      cinematography,
    });

    setError("");

    if (onSuccess) onSuccess();

    if (!existingReview) {
      setContent("");
      setStory(5);
      setActing(5);
      setCinematography(5);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>{existingReview ? "Edit Review" : "Write a Review"}</h3>

      <textarea
        placeholder="Write your review..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      <div className="review-inputs">
        <label>
          Story: {story}
          <input
            type="range"
            min="1"
            max="10"
            value={story}
            onChange={(e) => setStory(Number(e.target.value))}
          />
        </label>

        <label>
          Acting: {acting}
          <input
            type="range"
            min="1"
            max="10"
            value={acting}
            onChange={(e) => setActing(Number(e.target.value))}
          />
        </label>

        <label>
          Cinematography: {cinematography}
          <input
            type="range"
            min="1"
            max="10"
            value={cinematography}
            onChange={(e) => setCinematography(Number(e.target.value))}
          />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit">
          {existingReview ? "Update Review" : "Submit Review"}
        </button>

        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          style={{ background: "#64748b" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;