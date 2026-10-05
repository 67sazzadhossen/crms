'use client';

import { useEffect, useState } from 'react';
import {
  getUsage,
  getUsageUsers,
  type UsageLog,
  type UsageUser,
} from '../../../../redux/features/usage/usageApi';
import {
  getReservations,
  type Reservation,
} from '../../../../redux/features/reservations/reservationsApi';
import { useAppSelector } from '../../../../redux/hook';

export default function UsagePage() {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [query, setQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UsageUser[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  useEffect(() => {
    if (token) {
      getUsage(token).then(setLogs);
      if (user?.role === 'ADMIN') {
        getUsageUsers(token).then(setAllUsers);
        getReservations(token).then(setReservations);
      }
    }
  }, [token]);
  const visibleLogs = logs.filter(
    (log) =>
      !query ||
      `${log.reservation.user.name} ${log.reservation.user.email ?? ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const users = (
    allUsers.length
      ? allUsers
      : Array.from(
          new Map(
            visibleLogs.map((log) => [
              log.reservation.user.email ?? log.reservation.user.name,
              log.reservation.user,
            ]),
          ).entries(),
        ).map(([key, value]) => ({ id: key, ...value, role: '' }))
  )
    .filter((value) => `${value.name} ${value.email}`.toLowerCase().includes(query.toLowerCase()))
    .map((value) => {
      const key = value.email ?? value.name;
      const userLogs = visibleLogs.filter(
        (log) => (log.reservation.user.email ?? log.reservation.user.name) === key,
      );
      const hours = userLogs.reduce((sum, log) => sum + (log.billableMins ?? 0), 0) / 60;
      return {
        ...value,
        meetings: allUsers.length
          ? reservations.filter((r) => r.user?.email === value.email).length
          : userLogs.length,
        hours,
        remaining: Math.max(0, 20 - hours),
      };
    });
  return (
    <main className="dashboard-main">
      {user?.role === 'ADMIN' && (
        <section className="panel">
          <div className="panel-heading">
            <h3>User usage summary</h3>
            <input
              placeholder="Filter by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="reservation-table-wrap">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Meetings</th>
                  <th>Used hours</th>
                  <th>Remaining hours</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.email ?? item.name}>
                    <td>{item.name}</td>
                    <td>{item.email ?? '—'}</td>
                    <td>{item.meetings}</td>
                    <td>{item.hours.toFixed(2)}</td>
                    <td>{item.remaining.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="muted">No completed usage sessions yet.</p>}
          </div>
        </section>
      )}

      {user?.role !== 'ADMIN' && (
        <section className="panel">
          <h3>{user?.role === 'ADMIN' ? 'All usage logs' : 'Recent usage logs'}</h3>
          {logs.length === 0 && <p className="muted">No completed usage sessions yet.</p>}
          {logs.map((log) => (
            <div className="reservation-row" key={log.id}>
              <div>
                <strong>
                  {log.reservation.room.name}
                  {user?.role === 'ADMIN' ? ` · ${log.reservation.user.name}` : ''}
                </strong>
                <span>
                  {new Date(log.reservation.scheduledStart).toLocaleString()} · {log.billableMins}{' '}
                  billable minutes
                </span>
              </div>
              <em>{log.overstayMinutes ? `${log.overstayMinutes}m overstay` : 'Completed'}</em>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
