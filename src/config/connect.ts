import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    const mongodbUri = config.mongodbUri;

    try {
        const db = await mongoose.connect(mongodbUri);
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to database: ', error);
        throw error;
    }
};
