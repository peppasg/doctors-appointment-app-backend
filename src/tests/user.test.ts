import { TestServer } from './testSetup';
import userRouter from '../routes/user.routes';
import User from '../models/user.model';
import Role from '../models/role.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const server = new TestServer();
server.app.use('/users', userRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

describe('User API integration tests', () => {
  let token: string;

  beforeAll(async () => {
    await server.start();
    await Role.create({ role: 'PATIENT', description: 'Default patient role', active: true });
  });

  beforeEach(async () => {
    const user = await User.create({
      username: 'testUser',
      password: await bcrypt.hash('123456', 10),
      email: 'testUser@aueb.gr',
      roles: [],
    });

    token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        roles: [{ role: 'PATIENT', active: true }],
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await server.cleanup();
  });

  afterAll(async () => {
    await server.stop();
  });

  test('GET /users -> returns all users', async () => {
    const res = await server.request.get('/users');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /users -> creates a user', async () => {
    const res = await server.request
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'user1',
        password: '123456',
        email: 'user1@example.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
  });

  test('POST /users -> create a user with wrong password', async () => {
    const res = await server.request
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'user2',
        password: '1234',
      });

    expect(res.status).toBe(401);
  });

  test('POST /users -> create a user with wrong username', async () => {
    const res = await server.request
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'us',
        password: '123456',
      });

    expect(res.status).toBe(400);
  });

  test('POST /users -> requires Authorization token', async () => {
    const res = await server.request.post('/users').send({
      username: 'user3',
      password: '123456',
      email: 'user3@example.com',
    });

    expect(res.status).toBe(401);
  });
});
