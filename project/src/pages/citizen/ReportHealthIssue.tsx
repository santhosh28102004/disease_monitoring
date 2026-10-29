import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, PageHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/components/Toast';
import type { Severity } from '@/data/mockData';

export function ReportHealthIssue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addReport } = useData();
  const { show } = useToast();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({
    disease: '', symptoms: '', affectedPeople: 1, location: user?.location ?? '',
    dateObserved: new Date().toISOString().slice(0, 10), severity: 'Low' as Severity, description: '',
  });

  const update = (key: string, val: string | number) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await addReport({
        reportedBy: user?.name ?? 'Unknown',
        disease: form.disease.trim(),
        symptoms: form.symptoms,
        affectedPeople: Number(form.affectedPeople),
        location: form.location.trim(),
        dateObserved: form.dateObserved,
        severity: form.severity,
        description: form.description,
      });
      show('Report saved to MongoDB successfully!');
      navigate('/my-reports');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit the report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Report Health Issue" breadcrumb="Report Issue" />
      <div className="card p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Disease/Symptom Category</label>
              <input value={form.disease} onChange={(e) => update('disease', e.target.value)} placeholder="Enter disease or symptom category" className="input" required />
            </div>
            <div>
              <label className="label">Symptoms</label>
              <input value={form.symptoms} onChange={(e) => update('symptoms', e.target.value)} placeholder="Fever, Headache, Body pain" className="input" required />
            </div>
            <div>
              <label className="label">Number of Affected People</label>
              <input type="number" min={1} value={form.affectedPeople} onChange={(e) => update('affectedPeople', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Location</label>
              <input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Enter your location" className="input" required />
            </div>
            <div>
              <label className="label">Date Observed</label>
              <input type="date" value={form.dateObserved} onChange={(e) => update('dateObserved', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Severity</label>
              <select value={form.severity} onChange={(e) => update('severity', e.target.value as Severity)} className="input">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description (Optional)</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} placeholder="Additional details about the symptoms or situation..." className="input resize-none" />
          </div>
          <div>
            <label className="label">Upload Image (Optional)</label>
            <div className="flex items-center gap-3">
              <label className="btn-secondary cursor-pointer">
                Choose File
                <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
              </label>
              <span className="text-sm text-ink-muted">{fileName || 'No file chosen'}</span>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting || !form.disease.trim() || !form.location.trim()} className="btn-primary">{submitting ? 'Saving report...' : 'Submit Report'}</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
