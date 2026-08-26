import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import Appointment from '../models/appointment.model';

const router = Router();
const mockSlots = ['09:00', '10:00', '11:00', '12:00', '17:00', '18:00'];

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

router.post('/', authenticate, async (req, res) => {
  const { date, slot } = req.body as { date?: string; slot?: string };

  if (!date || !slot) {
    return res.status(400).json({ message: 'Date and slot are required' });
  }

  const user = req.user?.username || 'anonymous';
  const existing = await Appointment.findOne({ user, date, slot, status: 'booked' });

  if (existing) {
    return res.status(409).json({ message: "You' ve  already booked this time slot" });
  }

  const specialty = req.body.specialty || 'General Medicine';
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

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, slot } = req.body as { date?: string; slot?: string };

  if (!date || !slot) {
    return res.status(400).json({ message: 'Date and slot are required' });
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

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findByIdAndDelete(id);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  return res.status(200).json({ message: 'Appointment deleted', appointment: { id: appointment._id.toString(), user: appointment.user, date: appointment.date, slot: appointment.slot, specialty: appointment.specialty } });
});

export default router;
