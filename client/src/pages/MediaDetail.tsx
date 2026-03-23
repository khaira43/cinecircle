import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMediaById, getReviewsByMediaId } from "../api/mediaApi";
import { useAuth } from "../context/useAuth";
import { socket } from "../socket";
import type { MediaItem, Review } from "../types/media";

import VoteButtons from "../components/reviews/VoteButtons";
import ReviewForm from "../components/reviews/ReviewForm";
import CommentThread from "../components/reviews/CommentThread";

const formatRating = (rating: number) => rating.toFixed(1);

const MediaDetail = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [media, setMedia] = useState<MediaItem | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);

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

    useEffect(() => {
        if (!id) return;

        const handleJoinMedia = () => {
            socket.emit("join-media", id);
        };

        const handleViewerCount = (count: number) => {
            setViewerCount(count);
        };

        socket.on("connect", handleJoinMedia);
        socket.on("viewer-count", handleViewerCount);

        if (socket.connected) {
            handleJoinMedia();
        }

        return () => {
            socket.emit("leave-media", id);
            socket.off("connect", handleJoinMedia);
            socket.off("viewer-count", handleViewerCount);
        };
    }, [id]);

    const ratingBars = useMemo(() => {
        if (!media) return [];

        return [
            { label: "Story", value: media.averageRatings?.story ?? 0 },
            { label: "Acting", value: media.averageRatings?.acting ?? 0 },
            {
                label: "Cinematography",
                value: media.averageRatings?.cinematography ?? 0,
            },
        ];
    }, [media]);

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
                    <div className="media-detail-topline">
                        <span className="live-indicator">
                            👁 {viewerCount} people watching
                        </span>
                        <span className="badge">{media.type}</span>
                    </div>

                    <h1>{media.title}</h1>

                    <p className="media-meta">
                        {media.genre} • {media.releaseYear}
                    </p>

                    <p className="media-description">{media.synopsis}</p>

                    <section className="detail-ratings-card">
                        <div className="detail-ratings-header">
                            <div>
                                <p className="eyebrow">Average Rating</p>
                                <h2>
                                    ★ {formatRating(media.averageRatings?.overall ?? media.rating ?? 0)}
                                </h2>
                            </div>

                            <p className="rating-count muted-text">
                                {(media.averageRatings?.reviewCount ?? 0) > 0
                                    ? `${media.averageRatings?.reviewCount ?? 0} total reviews`
                                    : "No reviews yet"}
                            </p>
                        </div>

                        <div className="rating-breakdown-grid">
                            {ratingBars.map((item) => (
                                <div className="rating-breakdown-item" key={item.label}>
                                    <div className="rating-breakdown-label">
                                        <span>{item.label}</span>
                                        <strong>{formatRating(item.value)}</strong>
                                    </div>
                                    <div className="rating-bar-track">
                                        <div
                                            className="rating-bar-fill"
                                            style={{ width: `${(item.value / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </section>

            <section>
                <h2>Reviews</h2>

                <div className="review-list">
                    {reviews.map((review) => {
                        const canEdit = isAuthenticated && user?.id === review.userId;

                        return (
                            <article key={review.id} className="review-card">
                                <div className="review-card-header">
                                    <h3>@{review.username}</h3>
                                    <div className="review-rating-pills">
                                        <span>Story {review.story ?? review.ratings?.story ?? 0}/10</span>
                                        <span>Acting {review.acting ?? review.ratings?.acting ?? 0}/10</span>
                                        <span>
                                            Cinematography {review.cinematography ?? review.ratings?.cinematography ?? 0}/10
                                        </span>
                                    </div>
                                </div>

                                <p>{review.content}</p>

                                <VoteButtons
                                    reviewId={review.id}
                                    upvotes={review.upvoteScore}
                                    downvotes={review.downvoteScore}
                                />

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