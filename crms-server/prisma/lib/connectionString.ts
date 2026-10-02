export function getDatabaseConnectionString() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL is required');
  const url = new URL(value);
  url.searchParams.delete('channel_binding');
  if (!url.searchParams.has('sslmode'))
    url.searchParams.set(
      'sslmode',
      ['localhost', '127.0.0.1', '::1'].includes(url.hostname) ? 'disable' : 'verify-full',
    );
  if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '30');
  return url.toString();
}
