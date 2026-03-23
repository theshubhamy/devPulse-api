import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/devpulse',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  isProduction: process.env.NODE_ENV === 'production',
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }
};

// Simple validation
if (!process.env.JWT_SECRET && config.isProduction) {
  console.warn('WARNING: JWT_SECRET is not set in production!');
}

if (!process.env.MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI is not set, using default.');
}
