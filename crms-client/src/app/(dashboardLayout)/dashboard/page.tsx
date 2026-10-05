'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getReservations,
  type Reservation,
} from '../../../redux/features/reservations/reservationsApi';
import { getRooms, type Room } from '../../../redux/features/rooms/roomsApi';
import { getUsage, type UsageLog } from '../../../redux/features/usage/usageApi';
import { useAppSelector } from '../../../redux/hook';

export default function DashboardPage() {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [usage, setUsage] = useState<UsageLog[]>([]);
  useEffect(() => {
    if (token) {
      getRooms(token).then(setRooms);
      getReservations(token).then(setReservations);
      getUsage(token).then(setUsage);
    }
  }, [token]);
  const upcoming = reservations
    .filter((item) => new Date(item.scheduledEnd) > new Date() && item.status !== 'CANCELLED')
    .slice(0, 5);
  const usedHours = usage.reduce((sum, item) => sum + item.billableMins, 0) / 60;
  return (
    <main className="dashboard-main">
      <section className="stat-grid">
        <article className="stat-card blue">
          <p>Hours used</p>
          <strong>{usedHours.toFixed(2)}h</strong>
          <span>of 20h monthly quota</span>
        </article>
        <article className="stat-card green">
          <p>Upcoming bookings</p>
          <strong>{upcoming.length}</strong>
          <span>Scheduled reservations</span>
        </article>
        <article className="stat-card orange">
          <p>Available rooms</p>
          <strong>{rooms.length}</strong>
          <span>Active conference rooms</span>
        </article>
      </section>
      <section className="dashboard-grid">
        <article className="panel occupancy-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Workspace</p>
              <h2>Conference rooms</h2>
            </div>
            <Link href="/dashboard/rooms">View all</Link>
          </div>
          <div className="room-list">
            {rooms.slice(0, 5).map((room) => (
              <div className="room-row" key={room.id}>
                <span className="room-status available" />
                <div>
                  <strong>{room.name}</strong>
                  <small>
                    {room.capacity} seats · {room.equipmentList.join(', ') || 'Standard equipment'}
                  </small>
                </div>
                <Link href="/dashboard/reservations">Book</Link>
              </div>
            ))}
            {rooms.length === 0 && <p className="muted">No active rooms available.</p>}
          </div>
        </article>
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">
                {user?.role === 'ADMIN' ? 'Team calendar' : 'Your calendar'}
              </p>
              <h2>Upcoming reservations</h2>
            </div>
            <Link href="/dashboard/reservations">See all</Link>
          </div>
          <div className="reservation-table-wrap">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>User</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((item) => (
                  <tr key={item.id}>
                    <td>{item.room?.name ?? 'Room'}</td>
                    <td>{item.user?.name ?? user?.name ?? '—'}</td>
                    <td>{new Date(item.scheduledStart).toLocaleString()}</td>
                    <td>{new Date(item.scheduledEnd).toLocaleTimeString()}</td>
                    <td>
                      <em>{item.status}</em>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {upcoming.length === 0 && <p className="muted">No upcoming reservations.</p>}
        </article>
      </section>
    </main>
  );
}
