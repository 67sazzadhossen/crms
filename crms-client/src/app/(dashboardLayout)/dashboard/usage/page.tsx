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
import { getAuditLogs, type AuditLog } from '../../../../redux/features/usage/auditApi';

export default function UsagePage() {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const quota = user?.monthlyQuotaHrs ?? 20;
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [query, setQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allUsers, setAllUsers] = useState<UsageUser[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  useEffect(() => {
    if (token) {
      getUsage(token).then(setLogs);
      if (user?.role === 'ADMIN') getAuditLogs(token).then(setAuditLogs);
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
        remaining: Math.max(0, quota - hours),
      };
    });
  function download(format: 'csv' | 'json') {
    const rows = users.map((item) => ({
      name: item.name,
      email: item.email,
      meetings: item.meetings,
      usedHours: Number(item.hours.toFixed(2)),
      remainingHours: Number(item.remaining.toFixed(2)),
    }));
    const content =
      format === 'json'
        ? JSON.stringify(rows, null, 2)
        : [
            'Name,Email,Meetings,Used Hours,Remaining Hours',
            ...rows.map((row) =>
              [row.name, row.email, row.meetings, row.usedHours, row.remainingHours]
                .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                .join(','),
            ),
          ].join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crms-usage.${format}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  return (
    <main className="dashboard-main">
      {user?.role === 'ADMIN' && (
        <section className="panel">
          <div className="panel-heading">
            <h3>User usage summary</h3>
            <div className="export-actions">
              <button type="button" className="table-action" onClick={() => download('csv')}>
                Export CSV
              </button>
              <button type="button" className="table-action" onClick={() => download('json')}>
                Export JSON
              </button>
            </div>
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
      {user?.role === 'ADMIN' && (
        <section className="panel">
          <div className="panel-heading">
            <h3>Audit log</h3>
          </div>
          <div className="reservation-table-wrap">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.entityType}</td>
                    <td>{log.entityId}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {auditLogs.length === 0 && <p className="muted">No audit activity yet.</p>}
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
