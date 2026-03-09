interface CommentThreadProps {
    reviewId: string;
}

const CommentThread = ({ reviewId }: CommentThreadProps) => {
    return (
        <div className="comment-placeholder">
            <em>Comment thread placeholder for review {reviewId}.</em>
        </div>
    );
};

export default CommentThread;
