import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env',
    );
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to database: ', error);
    throw error;
  }
};
