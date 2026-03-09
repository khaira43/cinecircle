import api from "./axiosInstance";
import { mockMedia, mockReviews } from "../mock/mockData";
import type { MediaItem, Review } from "../types/media";

export const getMedia = async (): Promise<MediaItem[]> => {
    try {
        const response = await api.get<MediaItem[]>("/media");
        return response.data;
    } catch {
        return mockMedia;
    }
};

export const getMediaById = async (id: string): Promise<MediaItem | null> => {
    try {
        const response = await api.get<MediaItem>(`/media/${id}`);
        return response.data;
    } catch {
        return mockMedia.find((media) => media.id === id) ?? null;
    }
};

export const getReviewsByMediaId = async (mediaId: string): Promise<Review[]> => {
    try {
        const response = await api.get<Review[]>(`/reviews?mediaId=${mediaId}`);
        return response.data;
    } catch {
        return mockReviews.filter((review) => review.mediaId === mediaId);
    }
};
