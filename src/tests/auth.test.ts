import { TestServer } from './testSetup';
import authRouter from '../routes/auth.routes';
import User from '../models/user.model';
import Role from '../models/role.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const server = new TestServer();
server.app.use('/auth', authRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';


describe('Auth API integration tests', () => {
  beforeAll(async () => {
    await server.start();
    await Role.create({ role: 'PATIENT', description: 'Default patient role', active: true });
  });

  afterEach(async () => {
    await server.cleanup();
  });

  afterAll(async () => {
    await server.stop();
  });

  test('POST /auth/signup should create a new patient user', async () => {
    const res = await server.request.post('/auth/signup').send({
      username: 'alice',
      password: 'secret123',
      email: 'alice@example.com',
      firstname: 'Alice',
      lastname: 'Doe',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body.role).toBe('patient');
  });

  test('POST /auth/signup should reject duplicate username or email', async () => {
    const existingUser = await User.create({
      username: 'bob',
      password: await bcrypt.hash('secret123', 10),
      email: 'bob@example.com',
      roles: [],
    });

    const res = await server.request.post('/auth/signup').send({
      username: existingUser.username,
      password: 'secret123',
      email: existingUser.email,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists|invalid payload/i);
  });

  test('POST /auth/login should return a token for valid credentials', async () => {
    await User.create({
      username: 'charlie',
      password: await bcrypt.hash('secret123', 10),
      email: 'charlie@example.com',
      roles: [],
    });

    const res = await server.request.post('/auth/login').send({
      username: 'charlie',
      password: 'secret123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body.role).toBe('patient');
  });

  test('POST /auth/login should reject invalid password', async () => {
    await User.create({
      username: 'diana',
      password: await bcrypt.hash('secret123', 10),
      email: 'diana@example.com',
      roles: [],
    });

    const res = await server.request.post('/auth/login').send({
      username: 'diana',
      password: 'wrongpass',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});
