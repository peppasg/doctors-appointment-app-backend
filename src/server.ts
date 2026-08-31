import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './utils/db';

dotenv.config();

import dns from 'node:dns'; 

dns.setServers(['8.8.8.8', '1.1.1.1']);

const start = async () => {
    await connectDB();

    app.listen(3001, () => {
        console.log('Server is up');
    });
};

start();

