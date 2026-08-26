import { Schema, model, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
    user: string;
    userId?: Types.ObjectId;
    date: string;
    slot: string;
    specialty: string;
    status?: 'booked' | 'cancelled';
}

const AppointmentSchema = new Schema<IAppointment>({
    user: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    specialty: { type: String, required: true, default: 'General Medicine' },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' }
}, {
    collection: 'appointments',
    timestamps: {
        currentTime: () => {
            const now = new Date();
            return new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
        },
    },
});

export default model<IAppointment>('Appointment', AppointmentSchema);
