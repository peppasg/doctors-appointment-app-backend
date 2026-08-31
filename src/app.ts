import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointments.routes';
import {setupSwagger} from './swagger'

dotenv.config();

const app = express();

setupSwagger(app);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     parameters: []
 *     description: Returns service status.
 *     responses:
 *       200:
 *         description: Service is running
 */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/appointments', appointmentRoutes);



export default app;