import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMediaById, getReviewsByMediaId } from "../api/mediaApi";
import api from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import { socket } from "../socket";
import type { MediaItem, Review } from "../types/media";
import CommentThread from "../components/reviews/CommentThread";

const formatRating = (rating: number) => rating.toFixed(1);

const MediaDetail = () => {
    const [newReviewText, setNewReviewText] = useState("");
    const [story, setStory] = useState(5);
    const [acting, setActing] = useState(5);
    const [cinematography, setCinematography] = useState(5);
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editStory, setEditStory] = useState(5);
    const [editActing, setEditActing] = useState(5);
    const [editCinematography, setEditCinematography] = useState(5);

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

    const loadData = async () => {
        if (!id) return;
        const [mediaResult, reviewsResult] = await Promise.all([
            getMediaById(id),
            getReviewsByMediaId(id),
        ]);
        setMedia(mediaResult);
        setReviews(reviewsResult);
    };

    useEffect(() => {
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

    const handleAddReview = async () => {
        if (!newReviewText.trim() || !user) return;

        setSubmitError("");
        setSubmitting(true);

        try {
            await api.post("/reviews", {
                mediaId: id,
                content: newReviewText,
                ratings: { story, acting, cinematography },
            });

            await loadData();

            setNewReviewText("");
            setStory(5);
            setActing(5);
            setCinematography(5);
            setShowForm(false);
        } catch (err: any) {
            setSubmitError(err.response?.data?.error || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (review: Review) => {
        setEditingReviewId(review.id);
        setEditContent(review.content);
        setEditStory(review.ratings?.story ?? 5);
        setEditActing(review.ratings?.acting ?? 5);
        setEditCinematography(review.ratings?.cinematography ?? 5);
    };

    const handleSaveEdit = async (reviewId: string) => {
        try {
            await api.put(`/reviews/${reviewId}`, {
                content: editContent,
                ratings: {
                    story: editStory,
                    acting: editActing,
                    cinematography: editCinematography,
                },
            });

            await loadData();
            setEditingReviewId(null);
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to update review.");
        }
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await api.delete(`/reviews/${reviewId}`);
            await loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to delete review.");
        }
    };

    const handleVote = async (reviewId: string, type: "up" | "down") => {
        if (!isAuthenticated) return;

        const value = type === "up" ? 1 : -1;
        const currentVote = userVotes[reviewId];

        setReviews((prev) =>
            prev.map((r) => {
                if (r.id !== reviewId) return r;

                let up = r.upvoteScore;
                let down = r.downvoteScore;

                if (currentVote === "up") up--;
                if (currentVote === "down") down--;

                if (currentVote !== type) {
                    if (type === "up") up++;
                    if (type === "down") down++;
                }

                return { ...r, upvoteScore: up, downvoteScore: down };
            })
        );

        setUserVotes((prev) => ({
            ...prev,
            [reviewId]: prev[reviewId] === type ? null : type,
        }));

        try {
            if (currentVote === type) {
                await api.delete(`/votes/${reviewId}`);
            } else {
                await api.post("/votes", { reviewId, value });
            }

            const res = await api.get(`/votes/count/${reviewId}`);
            setReviews((prev) =>
                prev.map((r) =>
                    r.id === reviewId
                        ? { ...r, upvoteScore: res.data.upvotes, downvoteScore: res.data.downvotes }
                        : r
                )
            );
        } catch (err) {
            await loadData();
        }
    };

    const toggleComments = (reviewId: string) => {
        setOpenComments((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }));
    };

    const ratingBars = useMemo(() => {
        if (!media) return [];

        return [
            { label: "Story", value: media.averageRatings?.story ?? 0 },
            { label: "Acting", value: media.averageRatings?.acting ?? 0 },
            { label: "Cinematography", value: media.averageRatings?.cinematography ?? 0 },
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

            {/* ── Reviews list ── */}
            <section>
                <h2>Reviews</h2>
                <div className="review-list">
                    {reviews.length === 0 && (
                        <p className="muted-text">No reviews yet. Be the first!</p>
                    )}

                    {reviews.map((review) => {
                        const canEdit = isAuthenticated && user?.username === review.username;
                        const isOpen = openComments[review.id];
                        const isEditing = editingReviewId === review.id;

                        return (
                            <article key={review.id} className="review-card">
                                <div className="review-card-header">
                                    <h3>@{review.username}</h3>
                                    {!isEditing && (
                                        <div className="review-rating-pills">
                                            <span>Story {review.ratings?.story ?? 0}/10</span>
                                            <span>Acting {review.ratings?.acting ?? 0}/10</span>
                                            <span>Cinematography {review.ratings?.cinematography ?? 0}/10</span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Edit mode ── */}
                                {isEditing ? (
                                    <div className="review-form">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            style={{
                                                width: "100%",
                                                minHeight: "120px",
                                                padding: "12px",
                                                borderRadius: "10px",
                                                border: "1px solid #ccc",
                                                resize: "vertical",
                                                fontSize: "14px",
                                            }}
                                        />
                                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
                                            <div>
                                                <label>Story: {editStory}/10</label>
                                                <input
                                                    type="range" min="1" max="10"
                                                    value={editStory}
                                                    onChange={(e) => setEditStory(Number(e.target.value))}
                                                    style={{ width: "100%", accentColor: "#6366f1" }}
                                                />
                                            </div>
                                            <div>
                                                <label>Acting: {editActing}/10</label>
                                                <input
                                                    type="range" min="1" max="10"
                                                    value={editActing}
                                                    onChange={(e) => setEditActing(Number(e.target.value))}
                                                    style={{ width: "100%", accentColor: "#6366f1" }}
                                                />
                                            </div>
                                            <div>
                                                <label>Cinematography: {editCinematography}/10</label>
                                                <input
                                                    type="range" min="1" max="10"
                                                    value={editCinematography}
                                                    onChange={(e) => setEditCinematography(Number(e.target.value))}
                                                    style={{ width: "100%", accentColor: "#6366f1" }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                                            <button type="button" onClick={() => handleSaveEdit(review.id)}>Save</button>
                                            <button type="button" onClick={handleCancelEdit}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p>{review.content}</p>
                                )}

                                {/* ── Vote + comment controls ── */}
                                {!isEditing && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "10px" }}>
                                        <span
                                            onClick={() => isAuthenticated && handleVote(review.id, "up")}
                                            style={{
                                                cursor: isAuthenticated ? "pointer" : "not-allowed",
                                                color: userVotes[review.id] === "up" ? "#22c55e" : "#555",
                                                fontWeight: userVotes[review.id] === "up" ? "600" : "400",
                                                opacity: isAuthenticated ? 1 : 0.5,
                                            }}
                                        >
                                            👍 {review.upvoteScore}
                                        </span>

                                        <span
                                            onClick={() => isAuthenticated && handleVote(review.id, "down")}
                                            style={{
                                                cursor: isAuthenticated ? "pointer" : "not-allowed",
                                                color: userVotes[review.id] === "down" ? "#ef4444" : "#555",
                                                fontWeight: userVotes[review.id] === "down" ? "600" : "400",
                                                opacity: isAuthenticated ? 1 : 0.5,
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
                                            {isOpen ? "Hide comments" : `Show comments (${review.commentCount ?? 0})`}
                                        </button>
                                    </div>
                                )}

                                {/* ── Edit / Delete buttons ── */}
                                {canEdit && !isEditing && (
                                    <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                                        <button type="button" onClick={() => handleStartEdit(review)}>Edit</button>
                                        <button type="button" onClick={() => handleDeleteReview(review.id)}>Delete</button>
                                    </div>
                                )}

                                {isOpen && <CommentThread reviewId={review.id} />}
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* ── Write a review ── */}
            {isAuthenticated && (
                <section style={{ marginTop: "20px" }}>
                    <button type="button" onClick={() => { setShowForm((prev) => !prev); setSubmitError(""); }}>
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
                                    fontSize: "14px",
                                }}
                            />
                            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                                {newReviewText.length}/300 characters
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
                                <div>
                                    <label>Story: {story}/10</label>
                                    <input
                                        type="range" min="1" max="10"
                                        value={story}
                                        onChange={(e) => setStory(Number(e.target.value))}
                                        style={{ width: "100%", accentColor: "#6366f1" }}
                                    />
                                </div>
                                <div>
                                    <label>Acting: {acting}/10</label>
                                    <input
                                        type="range" min="1" max="10"
                                        value={acting}
                                        onChange={(e) => setActing(Number(e.target.value))}
                                        style={{ width: "100%", accentColor: "#6366f1" }}
                                    />
                                </div>
                                <div>
                                    <label>Cinematography: {cinematography}/10</label>
                                    <input
                                        type="range" min="1" max="10"
                                        value={cinematography}
                                        onChange={(e) => setCinematography(Number(e.target.value))}
                                        style={{ width: "100%", accentColor: "#6366f1" }}
                                    />
                                </div>
                            </div>

                            {submitError && (
                                <p style={{ color: "red", marginTop: "8px", fontSize: "14px" }}>{submitError}</p>
                            )}

                            <button
                                type="button"
                                style={{ marginTop: "10px" }}
                                onClick={handleAddReview}
                                disabled={submitting}
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
};

export default MediaDetail;
