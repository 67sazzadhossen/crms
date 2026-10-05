import 'dotenv/config';
import process from 'process';
export const env = {
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  corsAllowedOrigins: (
    process.env.CORS_ALLOWED_ORIGINS ??
    process.env.CLIENT_URL ??
    'http://localhost:3000'
  ).split(','),
  jwtSecret: process.env.JWT_SECRET ?? 'change-this-development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
};
