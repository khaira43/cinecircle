import api from "./axiosInstance";
import { mockMedia, mockReviews } from "../mock/mockData";
import type {AverageRatings, MediaItem, MediaType, Review } from "../types/media";

interface RawAverageRatings {
    overall?: number;
    reviewCount?: number;
    story?: number;
    acting?: number;
    cinematography?: number;
}

interface RawMedia {
    _id?: string;
    id?: string;
    title?: string;
    type?: string;
    genre?: string | string[];
    releaseYear?: number;
    posterUrl?: string;
    description?: string;
    synopsis?: string;
    averageRatings?: RawAverageRatings;
}

interface RawReview {
    _id?: string;
    id?: string;
    mediaId?: string | { _id?: string; id?: string };
    userId?: string | { _id?: string; id?: string; username?: string };
    username?: string;
    user?: { username?: string };
    content?: string;
    upvoteScore?: number;
    downvoteScore?: number;
    voteScore?: number;
    commentCount?: number;
    ratings?: {
        story?: number;
        acting?: number;
        cinematography?: number;
    };
}

const toMediaType = (value?: string): MediaType => {
    if (value === "tv_show" || value === "show" || value === "Show") {
        return "Show";
    }

    return "Movie";
};

const normalizeAverageRatings = (
    ratings?: RawAverageRatings
): AverageRatings => ({
    overall: Number(ratings?.overall ?? 0),
    reviewCount: Number(ratings?.reviewCount ?? 0),
    story: Number(ratings?.story ?? 0),
    acting: Number(ratings?.acting ?? 0),
    cinematography: Number(ratings?.cinematography ?? 0),
});

const normalizeMedia = (media: RawMedia): MediaItem => {
    const genres = Array.isArray(media.genre) ? media.genre : [media.genre ?? "Unknown"];

    return {
        _id: media.id ?? media._id ?? "unknown-media",
        title: media.title ?? "Untitled",
        type: toMediaType(media.type),
        genre: genres[0],
        releaseYear: media.releaseYear ?? new Date().getFullYear(),
        posterUrl:
            media.posterUrl ||
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop",
        synopsis: media.description ?? media.synopsis ?? "No description available yet.",
        averageRatings: normalizeAverageRatings(media.averageRatings),
    };
};

const extractId = (value?: string | { _id?: string; id?: string }) => {
    if (typeof value === "string") return value;
    return value?.id ?? value?._id ?? "unknown-id";
};

const normalizeReview = (review: RawReview): Review => ({
    id: review.id ?? review._id ?? "unknown-review",
    mediaId: extractId(review.mediaId),
    userId: extractId(review.userId),
    username:
        review.username ??
        review.user?.username ??
        (typeof review.userId === "object" ? review.userId.username : undefined) ??
        "anonymous",
    content: review.content ?? "",
    upvoteScore: review.upvoteScore ?? Math.max(review.voteScore ?? 0, 0),
    downvoteScore: review.downvoteScore ?? 0,
    commentCount: review.commentCount ?? 0,
    ratings: {
        story: Number(review.ratings?.story ?? 0),
        acting: Number(review.ratings?.acting ?? 0),
        cinematography: Number(review.ratings?.cinematography ?? 0),
    },
});

export const getMedia = async (): Promise<MediaItem[]> => {
    try {
        const response = await api.get<RawMedia[]>("/media");
        return response.data.map(normalizeMedia);
    } catch {
        return mockMedia;
    }
};

export const getMediaById = async (id: string): Promise<MediaItem | null> => {
    try {
        const response = await api.get<RawMedia>(`/media/${id}`);
        return normalizeMedia(response.data);
    } catch {
        return mockMedia.find((media) => media._id === id) ?? null;
    }
};

export const getReviewsByMediaId = async (mediaId: string): Promise<Review[]> => {
    try {
        const response = await api.get<RawReview[]>(`/reviews?mediaId=${mediaId}`);
        return response.data.map(normalizeReview);
    } catch {
        return mockReviews.filter((review) => review.mediaId === mediaId);
    }
};
