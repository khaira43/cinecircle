import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app'; 
import User from '../src/models/User';
import dotenv from 'dotenv';
dotenv.config();

let tokenA: string;
let userAId: string;

const userACredentials = {
  username: 'settingsUserA',
  email: 'settingsa@test.com',
  password: 'password123'
};

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI!);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Wipe users and re-register before every test so each test
  // starts with a clean, known user state
  await User.deleteMany({});

  await request(app)
    .post('/api/auth/register')
    .send(userACredentials);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: userACredentials.email, password: userACredentials.password });

  tokenA = login.body.token;

  const me = await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${tokenA}`);

  userAId = me.body._id;
});

// GET /api/users/me
describe('GET /api/users/me', () => {
  it('returns the current user\'s profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(userACredentials.email);
    expect(res.body.username).toBe(userACredentials.username);
  });

  it('never returns the passwordHash in the response', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 401 when called without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

// TC-22 & TC-23: Update profile (username, email, bio)
describe('PUT /api/users/me — profile updates', () => {
  it('TC-22: can update bio successfully', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ bio: 'I love movies.' });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('I love movies.');
  });

  it('can update username to a new unique value', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ username: 'newUniqueUsername' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('newUniqueUsername');
  });

  it('can update email to a new unique value', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ email: 'newemail@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('newemail@test.com');
  });

  it('TC-23: returns 409 when updating to a username already taken', async () => {
    // Register a second user to occupy a username
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'takenUsername', email: 'taken@test.com', password: 'password123' });

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ username: 'takenUsername' });

    expect(res.status).toBe(409);
  });

  it('returns 409 when updating to an email already taken', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'otherUser', email: 'taken@test.com', password: 'password123' });

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ email: 'taken@test.com' });

    expect(res.status).toBe(409);
  });

  it('returns 400 when username is too short (under 3 characters)', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ username: 'ab' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when username is too long (over 20 characters)', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ username: 'thisusernameiswaytoolongtobevalid' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when bio exceeds 300 characters', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ bio: 'x'.repeat(301) });

    expect(res.status).toBe(400);
  });

  it('returns 401 when called without a token', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .send({ bio: 'Should not work.' });

    expect(res.status).toBe(401);
  });
});

// TC-24 & TC-25: Change password
describe('PUT /api/users/me/password', () => {
  it('TC-24: can change password with correct current password', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' });

    expect(res.status).toBe(200);

    // Verify the new password actually works for login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userACredentials.email, password: 'newpassword456' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it('TC-25: returns 401 when current password is wrong', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword456' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when new password is under 8 characters', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'password123', newPassword: 'short' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when currentPassword field is missing', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ newPassword: 'newpassword456' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when newPassword field is missing', async () => {
    const res = await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'password123' });

    expect(res.status).toBe(400);
  });

  it('old password no longer works after a successful change', async () => {
    await request(app)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userACredentials.email, password: 'password123' });

    expect(loginRes.status).toBe(401);
  });
});

// TC-26: Delete account
describe('DELETE /api/users/me', () => {
  it('TC-26: deletes account when correct password is confirmed', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'password123' });

    expect(res.status).toBe(204);

    // Verify the user is actually gone from the database
    const deletedUser = await User.findById(userAId);
    expect(deletedUser).toBeNull();
  });

  it('returns 401 when the confirmation password is wrong', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'wrongpassword' });

    expect(res.status).toBe(401);

    // Verify the user was NOT deleted
    const stillExists = await User.findById(userAId);
    expect(stillExists).not.toBeNull();
  });

  it('returns 400 when currentPassword field is missing from the request', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 401 when called without a token', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .send({ currentPassword: 'password123' });

    expect(res.status).toBe(401);
  });

  it('token no longer works after account deletion', async () => {
    await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ currentPassword: 'password123' });

    // The old token should now fail since the user no longer exists
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(401);
  });
});