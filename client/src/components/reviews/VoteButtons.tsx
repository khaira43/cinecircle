import { useState } from "react";

type Props = {
  reviewId: string;
  upvotes: number;
  downvotes: number;
};

const VoteButtons = ({ reviewId, upvotes, downvotes }: Props) => {
  const [upvoteCount, setUpvoteCount] = useState(upvotes);
  const [downvoteCount, setDownvoteCount] = useState(downvotes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);

  const handleUpvote = () => {
    if (userVote === 1) {
      // remove upvote
      setUpvoteCount((prev) => prev - 1);
      setUserVote(null);
      return;
    }

    if (userVote === -1) {
      // switch from downvote to upvote
      setDownvoteCount((prev) => prev - 1);
    }

    setUpvoteCount((prev) => prev + 1);
    setUserVote(1);
  };

  const handleDownvote = () => {
    if (userVote === -1) {
      // remove downvote
      setDownvoteCount((prev) => prev - 1);
      setUserVote(null);
      return;
    }

    if (userVote === 1) {
      // switch from upvote to downvote
      setUpvoteCount((prev) => prev - 1);
    }

    setDownvoteCount((prev) => prev + 1);
    setUserVote(-1);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        marginTop: "10px",
      }}
    >
      <button
        onClick={handleUpvote}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          cursor: "pointer",
          background: userVote === 1 ? "#2563eb" : "#1d4ed8",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
        }}
      >
        👍 <span>{upvoteCount}</span>
      </button>

      <button
        onClick={handleDownvote}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          cursor: "pointer",
          background: userVote === -1 ? "#2563eb" : "#1d4ed8",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
        }}
      >
        👎 <span>{downvoteCount}</span>
      </button>
    </div>
  );
};

export default VoteButtons;