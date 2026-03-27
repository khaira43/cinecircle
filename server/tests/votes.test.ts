import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app'; 
import User from '../src/models/User';
import Media from '../src/models/Media';
import Review from '../src/models/Review';
import Vote from '../src/models/Vote';
import dotenv from 'dotenv';
dotenv.config();

let tokenA: string;
let tokenB: string;
let testReviewId: string;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI!);

  // Clean slate
  await User.deleteMany({});
  await Media.deleteMany({});
  await Review.deleteMany({});
  await Vote.deleteMany({});

  // Register and log in User A
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'voteUserA', email: 'votea@test.com', password: 'password123' });
  const loginA = await request(app)
    .post('/api/auth/login')
    .send({ email: 'votea@test.com', password: 'password123' });
  tokenA = loginA.body.token;

  // Register and log in User B
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'voteUserB', email: 'voteb@test.com', password: 'password123' });
  const loginB = await request(app)
    .post('/api/auth/login')
    .send({ email: 'voteb@test.com', password: 'password123' });
  tokenB = loginB.body.token;

  // Seed one media item
  const media = await Media.create({
    title: 'Vote Test Film',
    type: 'movie',
    genre: 'Action',
    releaseYear: 2021
  });

  // User B creates a review that User A will vote on
  const reviewRes = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${tokenB}`)
    .send({
      mediaId: media._id.toString(),
      content: 'A solid action film.',
      ratings: { story: 7, acting: 8, cinematography: 6 }
    });
  testReviewId = reviewRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Wipe votes before each test so they don't interfere with each other
  await Vote.deleteMany({});
});

describe('POST /api/votes', () => {
  it('TC-17: can upvote a review', async () => {
    const res = await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, value: 1 });

    expect([200, 201]).toContain(res.status);
  });

  it('TC-18: can downvote a review', async () => {
    const res = await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, value: -1 });

    expect([200, 201]).toContain(res.status);
  });

  it('TC-19: voting twice updates the vote, does not create a duplicate', async () => {
    // First vote — upvote
    await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, value: 1 });

    // Second vote — downvote (should overwrite, not duplicate)
    await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, value: -1 });

    // There should be exactly one vote document in the DB
    const count = await Vote.countDocuments({ reviewId: testReviewId });
    expect(count).toBe(1);

    // And it should reflect the most recent value
    const vote = await Vote.findOne({ reviewId: testReviewId });
    expect(vote!.value).toBe(-1);
  });

  it('returns 401 when voting without a token', async () => {
    const res = await request(app)
      .post('/api/votes')
      .send({ reviewId: testReviewId, value: 1 });

    expect(res.status).toBe(401);
  });

  it('returns 400 when value is not 1 or -1', async () => {
    const res = await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, value: 5 });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/votes/:reviewId', () => {
  beforeEach(async () => {
    // Place a vote before each delete test
    await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, value: 1 });
  });

  it('can delete own vote', async () => {
    const res = await request(app)
      .delete(`/api/votes/${testReviewId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect([200, 204]).toContain(res.status);

    // Confirm it's actually gone from the DB
    const vote = await Vote.findOne({ reviewId: testReviewId });
    expect(vote).toBeNull();
  });

  it('returns 401 when trying to delete a vote without a token', async () => {
    const res = await request(app)
      .delete(`/api/votes/${testReviewId}`);

    expect(res.status).toBe(401);
  });
});

describe('GET /api/votes/count/:reviewId', () => {
  it('returns correct upvote and downvote counts', async () => {
    // User A upvotes
    await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ reviewId: testReviewId, value: 1 });

    // User B downvotes
    await request(app)
      .post('/api/votes')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ reviewId: testReviewId, value: -1 });

    const res = await request(app)
      .get(`/api/votes/count/${testReviewId}`);

    expect(res.status).toBe(200);
    expect(res.body.upvotes).toBe(1);
    expect(res.body.downvotes).toBe(1);
    expect(res.body.score).toBe(0); // 1 upvote - 1 downvote = 0
  });

  it('returns zeros when no votes exist', async () => {
    const res = await request(app)
      .get(`/api/votes/count/${testReviewId}`);

    expect(res.status).toBe(200);
    expect(res.body.upvotes).toBe(0);
    expect(res.body.downvotes).toBe(0);
    expect(res.body.score).toBe(0);
  });
});