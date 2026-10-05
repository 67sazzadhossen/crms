import app from './app.js';
import { env } from './config/env.js';
app.listen(env.port, env.host, () => console.log(`CRMS API listening on ${env.host}:${env.port}`));
