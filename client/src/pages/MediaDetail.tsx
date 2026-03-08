import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMediaById, getReviewsByMediaId } from "../api/mediaApi";
import { useAuth } from "../context/useAuth";
import type { MediaItem, Review } from "../types/media";
import ReviewForm from "../components/reviews/ReviewForm";
import CommentThread from "../components/reviews/CommentThread";

const MediaDetail = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [media, setMedia] = useState<MediaItem | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            const mediaResult = await getMediaById(id);
            setMedia(mediaResult);

            const reviewsResult = await getReviewsByMediaId(id);
            setReviews(reviewsResult);
        };

        void loadData();
    }, [id]);

    if (!id) {
        return <p className="page">Missing media id.</p>;
    }

    if (!media) {
        return <p className="page">Media not found.</p>;
    }

    return (
        <main className="page">
            <section className="media-detail">
                <img src={media.posterUrl} alt={`${media.title} poster`} />
                <div>
                    <h1>{media.title}</h1>
                    <p>
                        <span className="badge">{media.type}</span> {media.genre} • {media.releaseYear}
                    </p>
                    <p>{media.description}</p>
                </div>
            </section>

            <section>
                <h2>Reviews</h2>
                <div className="review-list">
                    {reviews.map((review) => {
                        const canEdit = isAuthenticated && user?.id === review.userId;
                        return (
                            <article key={review.id} className="review-card">
                                <h3>@{review.username}</h3>
                                <p>{review.content}</p>
                                <p className="review-stats">
                                    👍 {review.upvoteScore} • 👎 {review.downvoteScore} • 💬 {review.commentCount}
                                </p>
                                {canEdit && (
                                    <div className="review-actions">
                                        <button type="button">Edit</button>
                                        <button type="button">Delete</button>
                                    </div>
                                )}
                                <CommentThread reviewId={review.id} />
                            </article>
                        );
                    })}
                </div>
            </section>

            {isAuthenticated && (
                <section>
                    <button type="button">Write a Review</button>
                    <ReviewForm />
                </section>
            )}
        </main>
    );
};

export default MediaDetail;
