export interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  username: string;
  content: string;
}

export const mockComments: Comment[] = [
  {
    id: "c1",
    reviewId: "r1",
    userId: "user-456",
    username: "cinecritic",
    content: "yeah visuals were insane fr"
  },
  {
    id: "c2",
    reviewId: "r2",
    userId: "user-123",
    username: "filmfan88",
    content: "agreed but pacing was kinda off"
  },
  {
  id: "c3",
  reviewId: "r2",
  userId: "user-999",
  username: "movielover",
  content: "nah i actually loved the pacing"
  },
  {
    id: "c4",
    reviewId: "r4",
    userId: "user-333",
    username: "multiverse",
    content: "the visuals were CRAZY fr"
 },
 {
    id: "c5",
    reviewId: "r4",
    userId: "user-444",
    username: "comicnerd",
    content: "best spiderman movie no debate"
 },
 {
    id: "c6",
    reviewId: "r5",
    userId: "user-555",
    username: "theorist",
    content: "that ending had me confused for days"
 },
];