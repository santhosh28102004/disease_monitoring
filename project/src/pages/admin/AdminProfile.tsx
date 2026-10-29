import { useState } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { LOCATIONS } from '@/data/mockData';
import { apiRequest } from '@/lib/api';

export function AdminProfile() {
  const { user, updateUser } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({
    name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', location: user?.location ?? '',
  });
  const [profileDetails, setProfileDetails] = useState({
    name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', location: user?.location ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await apiRequest<{ user: { fullName: string; email: string; phone: string; location?: string } }>('/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
        }),
      });
      const updatedProfile = {
        name: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        location: result.user.location ?? '',
      };
      updateUser(updatedProfile);
      setForm(updatedProfile);
      setProfileDetails(updatedProfile);
      show('Profile updated successfully!');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (profileDetails.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('');
  const assignedLocations = ['Anna Nagar', 'Peelamedu', 'RS Puram', 'Saibaba Colony'];

  return (
    <AppShell>
      <PageHeader title="Profile" breadcrumb="Profile" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">{profileDetails.name}</h2>
              <p className="text-sm text-ink-muted">Health Official</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="label">Location</label>
                <select value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="input">
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Role</label>
                <input value="Health Official" disabled className="input bg-slate-50 text-ink-muted cursor-not-allowed" />
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-ink mb-4">Profile Details</h3>
          <div className="space-y-3 mb-6">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-ink-muted">Name</p>
              <p className="mt-1 text-sm font-semibold text-ink">{profileDetails.name || '—'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-ink-muted">Email</p>
              <p className="mt-1 break-all text-sm font-semibold text-ink">{profileDetails.email || '—'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-ink-muted">Phone</p>
              <p className="mt-1 text-sm font-semibold text-ink">{profileDetails.phone || '—'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-ink-muted">Location</p>
              <p className="mt-1 text-sm font-semibold text-ink">{profileDetails.location || '—'}</p>
            </div>
          </div>
          <h3 className="text-base font-semibold text-ink mb-4">Assigned Locations</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {assignedLocations.map((l) => (
              <span key={l} className="rounded-lg bg-primary-light px-3 py-1.5 text-sm font-medium text-primary">{l}</span>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm text-ink-muted">Member Since</span>
              <span className="text-sm font-semibold text-ink">Jan 2026</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm text-ink-muted">Role</span>
              <span className="text-sm font-semibold text-ink">Health Official</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
