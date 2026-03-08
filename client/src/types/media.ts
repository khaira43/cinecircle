export type MediaType = "Movie" | "Show";

export interface MediaItem {
    id: string;
    title: string;
    type: MediaType;
    genre: string;
    releaseYear: number;
    posterUrl: string;
    description: string;
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
