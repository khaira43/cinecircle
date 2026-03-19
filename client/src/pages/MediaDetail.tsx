import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMediaById, getReviewsByMediaId } from "../api/mediaApi";
import { useAuth } from "../context/useAuth";
import type { MediaItem, Review } from "../types/media";

import VoteButtons from "../components/reviews/VoteButtons";
import ReviewForm from "../components/reviews/ReviewForm";
import CommentThread from "../components/reviews/CommentThread";

const MediaDetail = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [media, setMedia] = useState<MediaItem | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showForm, setShowForm] = useState(false);

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
            {/* MEDIA HEADER */}
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

            {/* REVIEWS */}
            <section>
                <h2>Reviews</h2>

                <div className="review-list">
                    {reviews.map((review) => {
                        const canEdit = isAuthenticated && user?.id === review.userId;

                        return (
                            <article key={review.id} className="review-card">
                                <h3>@{review.username}</h3>

                                <p>{review.content}</p>

                                {/* CATEGORY SCORES */}
                                <div
                                    style={{
                                        fontSize: "0.9rem",
                                        color: "#475569",
                                        marginTop: "6px",
                                    }}
                                >
                                    🎬 Story: {review.story} • 🎭 Acting: {review.acting} • 🎥 Cinematography: {review.cinematography}
                                </div>

                                {/* VOTES */}
                                <div style={{ marginTop: "10px" }}>
                                    <VoteButtons
                                        reviewId={review.id}
                                        upvotes={review.upvoteScore}
                                        downvotes={review.downvoteScore}
                                    />
                                </div>

                                {canEdit && (
                                    <div className="review-actions">
                                        <button type="button">Edit</button>
                                        <button type="button">Delete</button>
                                    </div>
                                )}

                                {/* COMMENTS (this is the ONLY place comment count should exist) */}
                                <CommentThread reviewId={review.id} />
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* REVIEW FORM */}
            <section className="review-form-section" style={{ marginTop: "20px" }}>
                <button type="button" onClick={() => setShowForm(true)}>
                    Write a Review
                </button>

                {showForm && (
                    <ReviewForm onSuccess={() => setShowForm(false)} />
                )}
            </section>
        </main>
    );
};

export default MediaDetail;
