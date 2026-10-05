'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../../redux/hook';
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenance,
  type Maintenance,
} from '../../../../redux/features/rooms/maintenanceApi';
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
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [maintenanceForm, setMaintenanceForm] = useState({
    roomId: '',
    startTime: '',
    endTime: '',
    reason: '',
  });
  const [form, setForm] = useState({ name: '', capacity: '', equipmentList: '', hourlyRate: '' });
  useEffect(() => {
    if (token) {
      getRooms(token)
        .then(setRooms)
        .catch((e) => setError(e.message));
      getMaintenance(token)
        .then(setMaintenance)
        .catch(() => undefined);
    }
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
  async function scheduleMaintenance(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const item = await createMaintenance(token, maintenanceForm);
      setMaintenance([...maintenance, item]);
      setMaintenanceForm({ roomId: '', startTime: '', endTime: '', reason: '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not schedule maintenance');
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
      {user?.role === 'ADMIN' && (
        <>
          <form className="panel room-form" onSubmit={scheduleMaintenance}>
            <h3>Schedule maintenance</h3>
            <select
              value={maintenanceForm.roomId}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, roomId: e.target.value })}
              required
            >
              <option value="">Choose room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={maintenanceForm.startTime}
              onChange={(e) =>
                setMaintenanceForm({ ...maintenanceForm, startTime: e.target.value })
              }
              required
            />
            <input
              type="datetime-local"
              value={maintenanceForm.endTime}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, endTime: e.target.value })}
              required
            />
            <input
              placeholder="Reason"
              value={maintenanceForm.reason}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, reason: e.target.value })}
            />
            <button type="submit">Schedule</button>
          </form>
          <section className="panel">
            <h3>Maintenance schedule</h3>
            <table className="room-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.room?.name ?? rooms.find((room) => room.id === item.roomId)?.name}
                    </td>
                    <td>{new Date(item.startTime).toLocaleString()}</td>
                    <td>{new Date(item.endTime).toLocaleString()}</td>
                    <td>{item.reason || '—'}</td>
                    <td>
                      <button
                        className="table-action danger"
                        onClick={async () => {
                          if (token) {
                            await deleteMaintenance(token, item.id);
                            setMaintenance(maintenance.filter((x) => x.id !== item.id));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}
