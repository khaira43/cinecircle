export type MediaType = "Movie" | "Show";

export interface AverageRatings {
    overall?: number;
    reviewCount?: number;
    story?: number;
    acting?: number;
    cinematography?: number;
}

export interface MediaItem {
    _id: string;
    title: string;
    type: MediaType;
    genre: string;
    releaseYear: number;
    posterUrl: string;
    synopsis: string;
    rating?: number;
    averageRatings?: AverageRatings;
}

export interface ReviewRatings {
    story?: number;
    acting?: number;
    cinematography?: number;
}

export interface Review {
    id: string;
    mediaId: string;
    userId: string;
    username: string;
    content: string;
    upvoteScore: number;
    downvoteScore: number;
    commentCount: number;
    ratings?: ReviewRatings;
}