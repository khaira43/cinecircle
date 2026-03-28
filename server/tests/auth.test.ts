import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app'; 
import User from '../src/models/User';
import dotenv from 'dotenv';
dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI!);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({}); // start each test with a clean users collection
});

describe('POST /api/auth/register', () => {
  it('TC-01: registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'secure123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('TC-02: returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com' });

    expect(res.status).toBe(400);
  });

  it('TC-27: returns 409 when email already exists', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'secure123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice2', email: 'alice@test.com', password: 'secure123' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'secure123' });
  });

  it('TC-04: logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'secure123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('TC-05: returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });
});