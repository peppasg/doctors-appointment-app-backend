import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import Appointment from '../models/appointment.model';

const router = Router();
const mockSlots = ['09:00', '10:00', '11:00', '12:00', '17:00', '18:00'];

/**
 * @openapi
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: List of logged-in user's appointments
 *     parameters: []
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments for the authenticated user
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', authenticate, async (req, res) => {
  const username = req.user?.username;

  if (!username) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const appointments = await Appointment.find({ user: username }).sort({ createdAt: -1 }).lean();

  return res.status(200).json(
    appointments.map((appointment) => ({
      id: appointment._id.toString(),
      user: appointment.user,
      date: appointment.date,
      slot: appointment.slot,
      specialty: appointment.specialty,
    }))
  );
});

// /**
//  * @openapi
//  * /appointments/slots:
//  *   get:
//  *     tags: [Appointments]
//  *     summary: Get available time slots for a date
//  *     parameters:
//  *       - in: query
//  *         name: date
//  *         required: true
//  *         schema:
//  *           type: string
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Available slots
//  *       400:
//  *         description: Date is required
//  *       401:
//  *         description: Missing or invalid token
//  */
router.get('/slots', authenticate, async (req, res) => {
  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ message: 'Date is required' });
  }

  const reserved = await Appointment.find({ date }).select('slot').lean();
  const occupiedSlots = reserved.map((appointment) => appointment.slot);
  const availableSlots = mockSlots.filter((slot) => !occupiedSlots.includes(slot));

  return res.status(200).json(availableSlots);
});

/**
 * @openapi
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Book an appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Appointment created
 *       400:
 *         description: Date and slot are required
 *       401:
 *         description: Missing or invalid token
 *       409:
 *         description: Slot already booked by this user
 */
router.post('/', authenticate, async (req, res) => {
  const { date, slot } = req.body as { date?: string; slot?: string };

  if (!date || !slot) {
    return res.status(400).json({ message: 'Date and slot are required' });
  }

  const user = req.user?.username || 'anonymous';
  const specialty = req.body.specialty || 'Pathology';

  const existingSameDaySameSpecialty = await Appointment.findOne({
    user,
    date,
    specialty,
    status: 'booked',
  });

  if (existingSameDaySameSpecialty) {
    return res.status(409).json({
      message: 'You already have an appointment in this specialty for this day',
    });
  }

  const existing = await Appointment.findOne({ user, date, slot, status: 'booked' });

  if (existing) {
    return res.status(409).json({ message: "You've already booked this time slot" });
  }

  const appointment = await Appointment.create({
    user,
    date,
    slot,
    specialty,
    status: 'booked',
  });

  return res.status(201).json({
    id: appointment._id.toString(),
    user: appointment.user,
    date: appointment.date,
    slot: appointment.slot,
    specialty: appointment.specialty,
  });
});

// /**
//  * @openapi
//  * /appointments/{id}:
//  *   put:
//  *     tags: [Appointments]
//  *     summary: Reschedule an appointment
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/UpdateAppointmentRequest'
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Appointment updated
//  *       400:
//  *         description: Date and slot are required
//  *       401:
//  *         description: Missing or invalid token
//  *       404:
//  *         description: Appointment not found
//  */
router.put('/:id', authenticate, async (req, res) => {
  const id = typeof req.params.id === 'string' ? req.params.id : '';
  const { date, slot } = req.body as { date?: string; slot?: string };

  if (!date || !slot) {
    return res.status(400).json({ message: 'Date and slot are required' });
  }

  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({ message: 'Invalid appointment id' });
  }

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { date, slot },
    { new: true }
  );

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  return res.status(200).json({
    id: appointment._id.toString(),
    user: appointment.user,
    date: appointment.date,
    slot: appointment.slot,
    specialty: appointment.specialty,
  });
});

/**
 * @openapi
 * /appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Delete an appointment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findByIdAndDelete(id);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  return res.status(200).json({ message: 'Appointment deleted', appointment: { id: appointment._id.toString(), user: appointment.user, date: appointment.date, slot: appointment.slot, specialty: appointment.specialty } });
});

export default router;
