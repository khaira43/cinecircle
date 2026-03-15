export type MediaType = "Movie" | "Show";

export interface MediaItem {
    _id: string;
    title: string;
    type: MediaType;
    genre: string;
    releaseYear: number;
    posterUrl: string;
    synopsis: string;
    rating: number;
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
}
