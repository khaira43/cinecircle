import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app'; 
import User from '../src/models/User';
import Media from '../src/models/Media';
import Review from '../src/models/Review';
import Comment from '../src/models/Comment';
import dotenv from 'dotenv';
dotenv.config();

let tokenA: string;
let tokenB: string;
let testReviewId: string;
let testCommentId: string;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI!);

  // Register User A
  await request(app).post('/api/auth/register')
    .send({ username: 'commentUserA', email: 'commenta@test.com', password: 'password123' });
  const loginA = await request(app).post('/api/auth/login')
    .send({ email: 'commenta@test.com', password: 'password123' });
  tokenA = loginA.body.token;

  // Register User B
  await request(app).post('/api/auth/register')
    .send({ username: 'commentUserB', email: 'commentb@test.com', password: 'password123' });
  const loginB = await request(app).post('/api/auth/login')
    .send({ email: 'commentb@test.com', password: 'password123' });
  tokenB = loginB.body.token;

  // Seed a media item and a review to comment on
  const media = await Media.create({
    title: 'Comment Test Film', type: 'movie', genre: 'Drama', releaseYear: 2021
  });

  const reviewRes = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({
      mediaId: media._id.toString(),
      content: 'A review to comment on.',
      ratings: { story: 7, acting: 8, cinematography: 6 }
    });

  testReviewId = reviewRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Comment.deleteMany({});
});

// TC-15: Post a comment

describe('POST /api/comments', () => {
  it('TC-15: authenticated user can post a comment on a review', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, content: 'Great review!' });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Great review!');
    expect(res.body.reviewId).toBe(testReviewId);

    testCommentId = res.body._id;
  });

  it('returns 401 when unauthenticated user tries to comment', async () => {
    const res = await request(app)
      .post('/api/comments')
      .send({ reviewId: testReviewId, content: 'Should not work.' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when content is empty', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, content: '' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when reviewId is missing', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'No reviewId provided.' });

    expect(res.status).toBe(400);
  });
});

// GET comments for a review

describe('GET /api/comments', () => {
  it('returns all comments for a review without authentication', async () => {
    // Seed two comments
    await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, content: 'First comment.' });

    await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ reviewId: testReviewId, content: 'Second comment.' });

    const res = await request(app)
      .get(`/api/comments?reviewId=${testReviewId}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('returns an empty array when no comments exist for a review', async () => {
    const res = await request(app)
      .get(`/api/comments?reviewId=${testReviewId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// TC-16: Delete own comment

describe('DELETE /api/comments/:id', () => {
  beforeEach(async () => {
    // Create a fresh comment before each delete test
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, content: 'Comment to be deleted.' });

    testCommentId = res.body._id;
  });

  it('TC-16: owner can delete their own comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(204);

    // Verify it is actually gone from the database
    const deleted = await Comment.findById(testCommentId);
    expect(deleted).toBeNull();
  });

  it('returns 403 when a different user tries to delete someone else\'s comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);

    // Verify it was NOT deleted
    const stillExists = await Comment.findById(testCommentId);
    expect(stillExists).not.toBeNull();
  });

  it('returns 401 when unauthenticated user tries to delete', async () => {
    const res = await request(app)
      .delete(`/api/comments/${testCommentId}`);

    expect(res.status).toBe(401);
  });

  it('returns 404 when comment does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/comments/${fakeId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });
});