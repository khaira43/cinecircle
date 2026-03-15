import { useEffect, useState } from "react";

type Props = {
  reviewId: string;
};

const VoteButtons = ({ reviewId }: Props) => {
  const [score, setScore] = useState(0);

  return (
    <div>
      <button>👍</button>
      <span>{score}</span>
      <button>👎</button>
    </div>
  );
};

export default VoteButtons;