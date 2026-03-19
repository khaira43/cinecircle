import type { Review } from "../types/media";

export const calculateMediaRating = (mediaId: string, reviews: Review[]) => {
    const mediaReviews = reviews.filter(r => r.mediaId === mediaId);

    if (mediaReviews.length === 0) return null;

    const total = mediaReviews.reduce((sum, r) => {
        const avg = (r.story + r.acting + r.cinematography) / 3;
        return sum + avg;
    }, 0);

    return Number((total / mediaReviews.length).toFixed(1));
};