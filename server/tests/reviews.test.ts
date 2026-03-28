import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app'; 
import User from '../src/models/User';
import Media from '../src/models/Media';
import Review from '../src/models/Review';
import dotenv from 'dotenv';
dotenv.config();

let tokenA: string;
let tokenB: string;
let testMediaId: string;
let testReviewId: string;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI!);

  // Create two users and get their tokens
  await request(app).post('/api/auth/register')
    .send({ username: 'userA', email: 'a@test.com', password: 'password123' });
  const loginA = await request(app).post('/api/auth/login')
    .send({ email: 'a@test.com', password: 'password123' });
  tokenA = loginA.body.token;

  await request(app).post('/api/auth/register')
    .send({ username: 'userB', email: 'b@test.com', password: 'password123' });
  const loginB = await request(app).post('/api/auth/login')
    .send({ email: 'b@test.com', password: 'password123' });
  tokenB = loginB.body.token;

  // Seed one media item
  const media = await Media.create({
    title: 'Test Film', type: 'movie', genre: 'Drama', releaseYear: 2020
  });
  testMediaId = media._id.toString();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Review.deleteMany({}); // clean reviews before each test
});

describe('POST /api/reviews', () => {
  it('TC-09: creates a review with valid data', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        mediaId: testMediaId,
        content: 'Great film.',
        ratings: { story: 8, acting: 7, cinematography: 9 }
      });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Great film.');
    testReviewId = res.body._id;
  });

  it('TC-10: returns 400 when a rating is out of range', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        mediaId: testMediaId,
        content: 'Bad data.',
        ratings: { story: 0, acting: 7, cinematography: 9 }
      });

    expect(res.status).toBe(400);
  });

  it('TC-11: returns 409 if user already reviewed this media', async () => {
    // First review
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        mediaId: testMediaId,
        content: 'First review.',
        ratings: { story: 8, acting: 7, cinematography: 9 }
      });

    // Second review — same user, same media
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        mediaId: testMediaId,
        content: 'Second attempt.',
        ratings: { story: 5, acting: 5, cinematography: 5 }
      });

    expect(res.status).toBe(409);
  });
});

describe('PUT /api/reviews/:id', () => {
  beforeEach(async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        mediaId: testMediaId,
        content: 'Original content.',
        ratings: { story: 8, acting: 7, cinematography: 9 }
      });
    testReviewId = res.body._id;
  });

  it('TC-12: owner can edit their own review', async () => {
    const res = await request(app)
      .put(`/api/reviews/${testReviewId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Updated content.' });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Updated content.');
  });

  it('TC-14: returns 403 when another user tries to edit', async () => {
    const res = await request(app)
      .put(`/api/reviews/${testReviewId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ content: 'Hacked content.' });

    expect(res.status).toBe(403);
  });
});