export const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'];

export const appointments: Array<{
  id: string;
  user: string;
  date: string;
  slot: string;
  specialty: string;
}> = [];

export const getAvailableSlots = (date: string) => {
  const reserved = appointments
    .filter((appointment) => appointment.date === date)
    .map((appointment) => appointment.slot);

  return slots.filter((slot) => !reserved.includes(slot));
};

export const createAppointment = (user: string, data: { date: string; slot: string; specialty?: string }) => {
  const appointment = {
    id: `${Date.now()}`,
    user,
    date: data.date,
    slot: data.slot,
    specialty: data.specialty || 'General Medicine',
  };

  appointments.push(appointment);
  return appointment;
};

export const updateAppointment = (id: string, data: { date: string; slot: string }) => {
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return null;

  appointment.date = data.date;
  appointment.slot = data.slot;
  return appointment;
};

export const deleteAppointment = (id: string) => {
  const cancelId = appointments.findIndex((item) => item.id === id);
  if (cancelId === -1) return null;

  const [removed] = appointments.splice(cancelId, 1);
  return removed;
};
