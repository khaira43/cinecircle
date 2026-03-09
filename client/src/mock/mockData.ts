import type { MediaItem, Review } from "../types/media";

export const mockMedia: MediaItem[] = [
    {
        id: "m1",
        title: "Dune: Part Two",
        type: "Movie",
        genre: "Sci-Fi",
        releaseYear: 2024,
        posterUrl:
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop",
        description:
            "Paul Atreides unites with the Fremen to seek justice and shape the destiny of Arrakis.",
    },
    {
        id: "m2",
        title: "The Bear",
        type: "Show",
        genre: "Drama",
        releaseYear: 2022,
        posterUrl:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop",
        description:
            "A young chef returns home to run his family sandwich shop while dealing with grief and chaos.",
    },
    {
        id: "m3",
        title: "Spider-Man: Across the Spider-Verse",
        type: "Movie",
        genre: "Animation",
        releaseYear: 2023,
        posterUrl:
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop",
        description:
            "Miles Morales teams up with Spider-People across the multiverse to confront a growing threat.",
    },
    {
        id: "m4",
        title: "Severance",
        type: "Show",
        genre: "Thriller",
        releaseYear: 2022,
        posterUrl:
            "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&auto=format&fit=crop",
        description:
            "Employees at Lumon Industries undergo a procedure that separates their work and personal memories.",
    },
];

export const mockReviews: Review[] = [
    {
        id: "r1",
        mediaId: "m1",
        userId: "user-123",
        username: "filmfan88",
        content:
            "Huge scale and great world-building. The visuals were incredible and the pacing felt tighter than Part One.",
        upvoteScore: 34,
        downvoteScore: 5,
        commentCount: 8,
    },
    {
        id: "r2",
        mediaId: "m1",
        userId: "user-456",
        username: "cinecritic",
        content:
            "Strong performances and score. Some scenes felt rushed, but overall a very satisfying sequel.",
        upvoteScore: 19,
        downvoteScore: 3,
        commentCount: 2,
    },
    {
        id: "r3",
        mediaId: "m2",
        userId: "user-789",
        username: "kitchenchaos",
        content:
            "One of the most intense shows on TV right now. Great character work and direction.",
        upvoteScore: 27,
        downvoteScore: 1,
        commentCount: 6,
    },
];
