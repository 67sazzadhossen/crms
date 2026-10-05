'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../../redux/hook';
import { getRooms, type Room } from '../../../../redux/features/rooms/roomsApi';
import {
  createReservation,
  cancelReservation,
  getReservations,
  type Reservation,
} from '../../../../redux/features/reservations/reservationsApi';
export default function ReservationsPage() {
  const token = useAppSelector((s) => s.auth.token);
  const currentUser = useAppSelector((s) => s.auth.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Reservation[]>([]);
  const initialTimes = () => {
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000);
    start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const toInput = (date: Date) => {
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    return { roomId: '', scheduledStart: toInput(start), scheduledEnd: toInput(end) };
  };
  const [form, setForm] = useState(initialTimes);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  useEffect(() => {
    if (token) {
      getRooms(token).then(setRooms);
      getReservations(token)
        .then(setItems)
        .catch((e) => {
          setError(e.message);
          setToast({ type: 'error', message: e.message });
        });
    }
  }, [token]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const start = new Date(form.scheduledStart);
    const end = new Date(form.scheduledEnd);
    if (end <= start) {
      setToast({ type: 'error', message: 'End time must be after start time.' });
      return;
    }
    if (start.getTime() < Date.now() + 2 * 60 * 60 * 1000) {
      setToast({
        type: 'error',
        message: 'Advance reservations must start at least 2 hours from now.',
      });
      return;
    }
    try {
      const created = await createReservation(token, {
        ...form,
        type: 'PRE',
        ...(currentUser?.role === 'ADMIN' && targetUserId ? { userId: targetUserId } : {}),
      });
      setItems([...items, created]);
      setBookingOpen(false);
      setToast({ type: 'success', message: 'Room reserved successfully.' });
      setError('');
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      const message = /already reserved|room conflict|conflict|booked/i.test(raw)
        ? 'This room is already booked for the selected time.'
        : /advance|2 hours|time window/i.test(raw)
          ? 'Choose a time at least 2 hours from now.'
          : 'Could not reserve this room. Please check the selected details.';
      setToast({
        type: 'error',
        message,
      });
    }
  }
  async function cancel(id: string) {
    if (!token || !window.confirm('Cancel this reservation?')) return;
    try {
      const updated = await cancelReservation(token, id, 'Cancelled by user');
      setItems(items.map((item) => (item.id === id ? updated : item)));
      setToast({ type: 'success', message: 'Reservation cancelled successfully.' });
    } catch (e) {
      setToast({
        type: 'error',
        message: e instanceof Error ? e.message : 'Could not cancel reservation',
      });
    }
  }
  return (
    <main className="dashboard-main">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Calendar</p>
          <h2>Reservations</h2>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
      {bookingOpen && (
        <div className="booking-modal-backdrop" onClick={() => setBookingOpen(false)}>
          <form
            className="panel reservation-form booking-modal"
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title">
              <h3>Book a conference room</h3>
              <button type="button" className="modal-cancel" onClick={() => setBookingOpen(false)}>
                Cancel
              </button>
            </div>
            <div className="booking-table-wrap">
              <table className="reservation-table booking-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    {currentUser?.role === 'ADMIN' && <th>User ID</th>}
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <select
                        value={form.roomId}
                        onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                        required
                      >
                        <option value="">Choose a room</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    {currentUser?.role === 'ADMIN' && (
                      <td>
                        <input
                          placeholder="Optional user ID"
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                        />
                      </td>
                    )}
                    <td>
                      <input
                        type="datetime-local"
                        step="1800"
                        value={form.scheduledStart}
                        onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="datetime-local"
                        step="1800"
                        value={form.scheduledEnd}
                        onChange={(e) => setForm({ ...form, scheduledEnd: e.target.value })}
                        required
                      />
                    </td>
                    <td>
                      <button type="submit">Confirm reservation</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </div>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h3>Room availability</h3>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
        <table className="reservation-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Reservations</th>
              <th>Booked times</th>
              <th>Available slots</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const dayItems = items.filter(
                (item) =>
                  item.room?.name === room.name &&
                  (!filterDate || item.scheduledStart.slice(0, 10) === filterDate),
              );
              return (
                <tr key={room.id}>
                  <td>{room.name}</td>
                  <td>{dayItems.length}</td>
                  <td>
                    {dayItems.length
                      ? dayItems.map((item) => (
                          <button type="button" className="time-chip" key={item.id}>
                            {new Date(item.scheduledStart).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            –{' '}
                            {new Date(item.scheduledEnd).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </button>
                        ))
                      : 'No bookings'}
                  </td>
                  <td>{Math.max(0, 16 - dayItems.length)} slots</td>
                  <td>
                    <button
                      type="button"
                      className="table-action"
                      disabled={dayItems.length >= 16}
                      onClick={() => {
                        setForm({ ...form, roomId: room.id });
                        setBookingOpen(true);
                      }}
                    >
                      Book now
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="panel">
        <h3>{currentUser?.role === 'ADMIN' ? 'All reservations' : 'Your reservations'}</h3>
        <div className="reservation-table-wrap">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>User</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((item) => !filterDate || item.scheduledStart.slice(0, 10) === filterDate)
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.room?.name ?? 'Room'}</td>
                    <td>{item.user?.name ?? currentUser?.name ?? '—'}</td>
                    <td>{new Date(item.scheduledStart).toLocaleString()}</td>
                    <td>{new Date(item.scheduledEnd).toLocaleString()}</td>
                    <td>
                      <em>{item.status}</em>
                    </td>
                    <td>
                      {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          className="table-action danger"
                          onClick={() => cancel(item.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="muted">No reservations found.</p>}
        </div>
      </section>
    </main>
  );
}
