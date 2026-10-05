import app from './app.js';
import { env } from './config/env.js';
import { prisma } from '../prisma/lib/prisma.js';
async function cancelNoShows() {
  await prisma.reservation.updateMany({
    where: { status: 'CONFIRMED', scheduledStart: { lt: new Date(Date.now() - 15 * 60 * 1000) } },
    data: {
      status: 'CANCELLED',
      cancellationReason: 'Automatically cancelled: no check-in within 15 minutes',
      cancelledAt: new Date(),
    },
  });
}
app.listen(env.port, env.host, () => console.log(`CRMS API listening on ${env.host}:${env.port}`));
setInterval(() => {
  cancelNoShows().catch((error) => console.error('No-show cleanup failed', error));
}, 60_000);
