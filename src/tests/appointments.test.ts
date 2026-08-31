import { TestServer } from './testSetup';
import appointmentRouter from '../routes/appointments.routes';
import User from '../models/user.model';
import Appointment from '../models/appointment.model';
import jwt from 'jsonwebtoken';

const server = new TestServer();
server.app.use('/appointments', appointmentRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

describe('Appointments API integration tests', () => {
  let token: string;

  beforeAll(async () => {
    await server.start();
  });

  beforeEach(async () => {
    const user = await User.create({
      username: 'apptuser',
      password: 'hashed-password',
      email: 'apptuser@example.com',
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

  test('GET /appointments should return the current user appointments', async () => {
    await Appointment.create({
      user: 'apptuser',
      date: '2026-09-30',
      slot: '09:00',
      specialty: 'Pathology',
      status: 'booked',
    });

    const res = await server.request
      .get('/appointments')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ user: 'apptuser', date: '2026-09-01' });
  });

  test('GET /appointments/slots should return available slots for a date', async () => {
    await Appointment.create({
      user: 'apptuser',
      date: '2026-09-02',
      slot: '09:00',
      specialty: 'Pathology',
      status: 'booked',
    });

    const res = await server.request
      .get('/appointments/slots?date=2026-09-02')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).not.toContain('09:00');
  });

  test('POST /appointments should create a booking', async () => {
    const res = await server.request
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-09-03',
        slot: '10:00',
        specialty: 'Cardiology',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      user: 'apptuser',
      date: '2026-09-03',
      slot: '10:00',
      specialty: 'Cardiology',
    });
  });

  test('POST /appointments should reject a duplicate time slot for same user', async () => {
    await Appointment.create({
      user: 'apptuser',
      date: '2026-09-04',
      slot: '11:00',
      specialty: 'General Medicine',
      status: 'booked',
    });

    const res = await server.request
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-09-04',
        slot: '11:00',
        specialty: 'Dermatology',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already booked|already/i);
  });

  test('POST /appointments should reject a second appointment in the same specialty on the same day', async () => {
    await Appointment.create({
      user: 'apptuser',
      date: '2026-09-05',
      slot: '09:00',
      specialty: 'Cardiology',
      status: 'booked',
    });

    const res = await server.request
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-09-05',
        slot: '10:00',
        specialty: 'Cardiology',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already have an appointment in this specialty for this day|already/i);
  });
});
