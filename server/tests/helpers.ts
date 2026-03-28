import request from 'supertest';
import { app } from '../src/app'; 

export const testUserA = {
  username: 'testuser_a',
  email: 'a@test.com',
  password: 'password123'
};

export const testUserB = {
  username: 'testuser_b',
  email: 'b@test.com',
  password: 'password123'
};

export async function registerAndLogin(user = testUserA): Promise<string> {
  // Try registering — ignore 409 if already exists from a previous test
  await request(app).post('/api/auth/register').send(user);

  const res = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password
  });

  return res.body.token; // returns the JWT
}