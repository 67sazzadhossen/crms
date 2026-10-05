'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../../redux/hook';
import {
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom,
  type Room,
} from '../../../../redux/features/rooms/roomsApi';
export default function RoomsPage() {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', capacity: '', equipmentList: '', hourlyRate: '' });
  useEffect(() => {
    if (token)
      getRooms(token)
        .then(setRooms)
        .catch((e) => setError(e.message));
  }, [token]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const room = await createRoom(token, {
        ...form,
        capacity: Number(form.capacity),
        hourlyRate: Number(form.hourlyRate),
        equipmentList: form.equipmentList
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
      });
      setRooms([...rooms, room]);
      setForm({ name: '', capacity: '', equipmentList: '', hourlyRate: '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create room');
    }
  }
  return (
    <main className="dashboard-main">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Workspace</p>
          <h2>Conference rooms</h2>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <section className="panel room-table-wrap">
        <table className="room-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Capacity</th>
              <th>Equipment</th>
              <th>Rate</th>
              {user?.role === 'ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{room.capacity} seats</td>
                <td>{room.equipmentList.join(', ') || 'Standard'}</td>
                <td>${room.hourlyRate}/hour</td>
                {user?.role === 'ADMIN' && (
                  <td>
                    <button
                      className="table-action"
                      onClick={async () => {
                        const name = window.prompt('Room name', room.name);
                        if (!name || !token) return;
                        const updated = await updateRoom(token, room.id, { name });
                        setRooms(rooms.map((x) => (x.id === room.id ? updated : x)));
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="table-action danger"
                      onClick={async () => {
                        if (token && window.confirm('Delete this room?')) {
                          await deleteRoom(token, room.id);
                          setRooms(rooms.filter((x) => x.id !== room.id));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {user?.role === 'ADMIN' && (
        <form className="panel room-table-wrap" onSubmit={submit}>
          <h3>Add a room</h3>
          <table className="room-table">
            <tbody>
              <tr>
                <td>
                  <input
                    placeholder="Room name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    placeholder="Capacity"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    required
                  />
                </td>
                <td>
                  <input
                    placeholder="Equipment, comma separated"
                    value={form.equipmentList}
                    onChange={(e) => setForm({ ...form, equipmentList: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Hourly rate"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    required
                  />
                </td>
                <td>
                  <button type="submit">Add room</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      )}
    </main>
  );
}
