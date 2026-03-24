import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMediaById, getReviewsByMediaId } from "../api/mediaApi";
import { useAuth } from "../context/useAuth";
import { socket } from "../socket";
import type { MediaItem, Review } from "../types/media";
import ReviewForm from "../components/reviews/ReviewForm";
import CommentThread from "../components/reviews/CommentThread";
import { mockComments } from "../mock/mockData";

const formatRating = (rating: number) => rating.toFixed(1);

const MediaDetail = () => {
    const [newReviewText, setNewReviewText] = useState("");
    const [story, setStory] = useState(0);
    const [acting, setActing] = useState(0);
    const [cinematography, setCinematography] = useState(0)
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [media, setMedia] = useState<MediaItem | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const [userVotes, setUserVotes] = useState<{
        [key: string]: "up" | "down" | null;
    }>({});

    const [openComments, setOpenComments] = useState<{
        [key: string]: boolean;
    }>({});

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

    const handleVote = (reviewId: string, type: "up" | "down") => {
        setReviews((prev) =>
            prev.map((r) => {
                if (r.id !== reviewId) return r;

                const currentVote = userVotes[reviewId];

                let up = r.upvoteScore;
                let down = r.downvoteScore;

                if (currentVote === "up") up--;
                if (currentVote === "down") down--;

                if (currentVote !== type) {
                    if (type === "up") up++;
                    if (type === "down") down++;
                }

                return {
                    ...r,
                    upvoteScore: up,
                    downvoteScore: down,
                };
            })
        );

        setUserVotes((prev) => ({
            ...prev,
            [reviewId]: prev[reviewId] === type ? null : type,
        }));
    };

    const toggleComments = (reviewId: string) => {
        setOpenComments((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }));
    };

    const handleAddReview = () => {
        if (!newReviewText.trim() || !user) return;

        const newReview: Review = {
        id: Date.now().toString(),
        mediaId: id!,
        userId: user.id,
        username: user.username,
        content: newReviewText,
        upvoteScore: 0,
        downvoteScore: 0,
        commentCount: 0,
        ratings: {
            story,
            acting,
            cinematography,
        },
        };

        setReviews((prev) => [newReview, ...prev]);

        setNewReviewText("");
        setStory(0);
        setActing(0);
        setCinematography(0);
        setShowForm(false);
        };

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

    if (!id) return <p className="page">Missing media id.</p>;
    if (!media) return <p className="page">Media not found.</p>;

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
                                {reviews.length > 0
                                    ? `${reviews.length} total reviews`
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
                        const canEdit = isAuthenticated && user?.username === review.username;
                        const isOpen = openComments[review.id];

                        return (
                            <article key={review.id} className="review-card">
                                <div className="review-card-header">
                                    <h3>@{review.username}</h3>
                                    <div className="review-rating-pills">
                                        <span>Story {review.ratings?.story ?? 0}/10</span>
                                        <span>Acting {review.ratings?.acting ?? 0}/10</span>
                                        <span>
                                            Cinematography {review.ratings?.cinematography ?? 0}/10
                                        </span>
                                    </div>
                                </div>

                                <p>{review.content}</p>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        marginTop: "10px",
                                    }}
                                >
                                    <span
                                        onClick={() => handleVote(review.id, "up")}
                                        style={{
                                            cursor: "pointer",
                                            color:
                                                userVotes[review.id] === "up" ? "#22c55e" : "#555",
                                            fontWeight:
                                                userVotes[review.id] === "up" ? "600" : "400",
                                        }}
                                    >
                                        👍 {review.upvoteScore}
                                    </span>

                                    <span
                                        onClick={() => handleVote(review.id, "down")}
                                        style={{
                                            cursor: "pointer",
                                            color:
                                                userVotes[review.id] === "down" ? "#ef4444" : "#555",
                                            fontWeight:
                                                userVotes[review.id] === "down" ? "600" : "400",
                                        }}
                                    >
                                        👎 {review.downvoteScore}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => toggleComments(review.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#6366f1",
                                            cursor: "pointer",
                                            fontWeight: 500,
                                            padding: 0,
                                        }}
                                    >
                                        {isOpen
                                        ? "Hide comments"
                                        : `Show comments (${mockComments.filter((c) => c.reviewId === review.id).length})`}
                                    </button>
                                </div>

                                {canEdit && (
                                        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                                        <button type="button">Edit</button>
                                        <button type="button">Delete</button>
                                    </div>
                                )}

                                {isOpen && <CommentThread reviewId={review.id} />}
                            </article>
                        );
                    })}
                </div>
            </section>

            {isAuthenticated && (
                <section style={{ marginTop: "20px" }}>
                    <button type="button" onClick={() => setShowForm((prev) => !prev)}>
                        {showForm ? "Cancel" : "Write a Review"}
                    </button>

                {showForm && (
                <div className="review-form">
                    <h3>Write a Review</h3>

                    <textarea
                    placeholder="Write your thoughts..."
                    value={newReviewText}
                    maxLength={300}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    style={{
                        width: "100%",
                        minHeight: "120px",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        resize: "vertical",
                        fontSize: "14px"
                    }}
                    />
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        {newReviewText.length}/300 characters
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>

                    <div>
                        <label>Story: {story}/10</label>
                        <input
                        type="range"
                        min="1"
                        max="10"
                        value={story}
                        onChange={(e) => setStory(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#6366f1" }}
                        />
                    </div>

                    <div>
                        <label>Acting: {acting}/10</label>
                        <input
                        type="range"
                        min="1"
                        max="10"
                        value={acting}
                        onChange={(e) => setActing(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#6366f1" }}
                        />
                    </div>

                    <div>
                        <label>Cinematography: {cinematography}/10</label>
                        <input
                        type="range"
                        min="1"
                        max="10"
                        value={cinematography}
                        onChange={(e) => setCinematography(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#6366f1" }}
                        />
                    </div>

                    </div>

                    <button
                    style={{ marginTop: "10px" }}
                    onClick={handleAddReview}
                    >
                    Submit Review
                    </button>
                </div>
                )}
                </section>
            )}
        </main>
    );
};

export default MediaDetail;