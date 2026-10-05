'use client';
import { useAppSelector } from '../../../../redux/hook';
export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <main className="dashboard-main">
      <section className="panel profile-card">
        <p className="panel-kicker">Account</p>
        <h2>Profile</h2>
        <div className="profile-details">
          <div>
            <span>Name</span>
            <strong>{user?.name ?? 'Admin'}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user?.email ?? 'Not available'}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{user?.role ?? 'MEMBER'}</strong>
          </div>
          <div>
            <span>Company</span>
            <strong>CRMS Workspace</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
