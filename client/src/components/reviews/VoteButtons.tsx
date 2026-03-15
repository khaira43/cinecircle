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
      setUpvoteCount((prev) => prev - 1);
      setUserVote(null);
      return;
    }

    if (userVote === -1) {
      setDownvoteCount((prev) => prev - 1);
    }

    setUpvoteCount((prev) => prev + 1);
    setUserVote(1);
  };

  const handleDownvote = () => {
    if (userVote === -1) {
      setDownvoteCount((prev) => prev - 1);
      setUserVote(null);
      return;
    }

    if (userVote === 1) {
      setUpvoteCount((prev) => prev - 1);
    }

    setDownvoteCount((prev) => prev + 1);
    setUserVote(-1);
  };

  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
      <button onClick={handleUpvote}>
        👍 {upvoteCount}
      </button>

      <button onClick={handleDownvote}>
        👎 {downvoteCount}
      </button>
    </div>
  );
};

export default VoteButtons;