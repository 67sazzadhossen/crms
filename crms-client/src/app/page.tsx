'use client';
import { useAppSelector } from '../redux/hook';
export default function HomePage() {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <main>
      <h1>Conference Room Reservation System</h1>
      <p>{user ? `Welcome, ${user.name}` : 'Client portal ready'}</p>
    </main>
  );
}
