import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Alert, Report, Severity, Status } from '@/data/mockData';
import { mockAlerts } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

const normalizeSeverity = (value?: string): Severity => {
  const normalized = (value ?? 'Low').toString().toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  return 'Low';
};

const normalizeStatus = (value?: string): Status => {
  const normalized = (value ?? 'Pending').toString().toUpperCase();
  if (normalized === 'VERIFIED') return 'Verified';
  if (normalized === 'REJECTED') return 'Rejected';
  if (normalized === 'UNDER_REVIEW') return 'Under Review';
  if (normalized === 'ACTIVE') return 'Active';
  if (normalized === 'MONITORING' || normalized === 'ACKNOWLEDGED') return 'Acknowledged';
  if (normalized === 'RESOLVED') return 'Resolved';
  return 'Pending';
};

export interface CaseRecord {
  id: string;
  reportId: string;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED';
}

interface BackendReport {
  _id: string;
  disease?: { diseaseName?: string; name?: string } | string;
  location?: { area?: string; name?: string } | string;
  reporter?: { fullName?: string; name?: string } | string;
  symptoms?: string[] | string;
  affectedPeople?: number;
  dateObserved?: string;
  severity?: string;
  description?: string;
  status?: string;
  verificationNotes?: string;
  followUpDate?: string;
  statusHistory?: { status: string; notes?: string; updatedAt?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

interface BackendCase {
  _id: string;
  report?: string | { _id: string };
  status: CaseRecord['status'];
}

const normalizeReport = (payload: BackendReport): Report => {
  const disease = typeof payload.disease === 'object' ? payload.disease?.diseaseName ?? payload.disease?.name : payload.disease;
  const location = typeof payload.location === 'object' ? payload.location?.area ?? payload.location?.name : payload.location;
  const reporter = typeof payload.reporter === 'object' ? payload.reporter?.fullName ?? payload.reporter?.name : payload.reporter;
  const dateString = payload.dateObserved ? new Date(payload.dateObserved).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return {
    id: payload._id,
    reportedBy: typeof reporter === 'string' ? reporter : 'Unknown',
    disease: typeof disease === 'string' ? disease : 'Unknown',
    symptoms: Array.isArray(payload.symptoms) ? payload.symptoms.join(', ') : payload.symptoms ?? '',
    affectedPeople: Number(payload.affectedPeople ?? 1),
    location: typeof location === 'string' ? location : 'Unknown',
    dateObserved: dateString,
    severity: normalizeSeverity(payload.severity),
    description: payload.description ?? '',
    status: normalizeStatus(payload.status),
    verificationNotes: payload.verificationNotes ?? '',
    followUpDate: payload.followUpDate ? new Date(payload.followUpDate).toISOString().slice(0, 10) : '',
    statusHistory: (payload.statusHistory ?? []).map((entry) => ({
      status: normalizeStatus(entry.status),
      notes: entry.notes ?? '',
      updatedAt: entry.updatedAt ?? payload.updatedAt ?? payload.createdAt ?? new Date().toISOString(),
    })),
    updatedAt: payload.updatedAt,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };
};

const normalizeCase = (payload: BackendCase): CaseRecord => ({
  id: payload._id,
  reportId: typeof payload.report === 'string' ? payload.report : payload.report?._id ?? '',
  status: payload.status,
});

interface DataContextValue {
  reports: Report[];
  reportsError: string | null;
  cases: CaseRecord[];
  casesError: string | null;
  alerts: Alert[];
  addReport: (r: Omit<Report, 'id' | 'createdAt' | 'status'>) => Promise<Report>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<Report>;
  editReport: (id: string, updates: Pick<Report, 'disease' | 'location' | 'symptoms'>) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  updateCaseStatus: (id: string, status: CaseRecord['status'], notes?: string) => Promise<Report>;
  deleteCase: (id: string) => Promise<Report>;
  addAlert: (a: Omit<Alert, 'id'>) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') setRefreshKey((current) => current + 1);
    };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReports = async () => {
      if (!token) {
        setReports([]);
        setReportsError(null);
        return;
      }

      try {
        const path = user?.role === 'official' ? '/reports' : '/reports/user/my-reports';
        const data = await apiRequest<BackendReport[]>(path, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });
        const normalized = data.map(normalizeReport);
        setReports(normalized);
        setReportsError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setReports([]);
        setReportsError(error instanceof Error ? error.message : 'Unable to load reports.');
      }
    };

    fetchReports();
    return () => controller.abort();
  }, [token, user?.id, user?.email, user?.role, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    if (!token || user?.role !== 'official') {
      setCases([]);
      setCasesError(null);
      return () => controller.abort();
    }

    apiRequest<BackendCase[]>('/cases', {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setCases(data.map(normalizeCase));
        setCasesError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setCasesError(error instanceof Error ? error.message : 'Unable to load active cases.');
      });

    return () => controller.abort();
  }, [token, user?.role, refreshKey]);

  const addReport = async (r: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> => {
    if (!token) throw new Error('Please log in again before submitting a report.');

    const payload = await apiRequest<{ report: BackendReport }>('/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        disease: r.disease,
        symptoms: r.symptoms.split(',').map((item) => item.trim()).filter(Boolean),
        affectedPeople: r.affectedPeople,
        location: r.location,
        dateObserved: r.dateObserved,
        severity: r.severity.toUpperCase(),
        description: r.description ?? '',
      }),
    });

    const saved = normalizeReport(payload.report);
    setReports((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
    setReportsError(null);
    return saved;
  };

  const updateReport = async (id: string, updates: Partial<Report>): Promise<Report> => {
    if (!token) throw new Error('Please log in again before updating this report.');
    const payload = await apiRequest<{ report: BackendReport }>(`/reports/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: updates.status?.toUpperCase().replace(' ', '_'),
        verificationNotes: updates.verificationNotes,
        followUpDate: updates.followUpDate || undefined,
      }),
    });

    const updated = normalizeReport(payload.report);
    setReports((prev) => prev.map((report) => (report.id === id ? updated : report)));
    if (updated.status === 'Verified' && user?.role === 'official') {
      const caseData = await apiRequest<BackendCase[]>('/cases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCases(caseData.map(normalizeCase));
      setCasesError(null);
    }
    return updated;
  };

  const editReport = async (id: string, updates: Pick<Report, 'disease' | 'location' | 'symptoms'>): Promise<Report> => {
    if (!token) throw new Error('Please log in again before editing this report.');
    const payload = await apiRequest<{ report: BackendReport }>(`/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `******`,
      },
      body: JSON.stringify({
        disease: updates.disease,
        location: updates.location,
        symptoms: updates.symptoms.split(',').map((item) => item.trim()).filter(Boolean),
      }),
    });

    const updated = normalizeReport(payload.report);
    setReports((prev) => prev.map((report) => (report.id === id ? updated : report)));
    return updated;
  };

  const deleteReport = async (id: string): Promise<void> => {
    if (!token) throw new Error('Please log in again before deleting this report.');
    await apiRequest<{ message: string }>(`/reports/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `******` },
    });
    setReports((prev) => prev.filter((report) => report.id !== id));
    setCases((prev) => prev.filter((caseRecord) => caseRecord.reportId !== id));
  };

  const updateCaseStatus = async (id: string, status: CaseRecord['status'], notes = ''): Promise<Report> => {
    if (!token) throw new Error('Please log in again before updating this case.');
    const payload = await apiRequest<{ case: BackendCase; report: BackendReport }>(`/cases/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, notes }),
    });
    const updatedReport = normalizeReport(payload.report);
    setReports((prev) => prev.map((report) => (report.id === updatedReport.id ? updatedReport : report)));
    setCases((prev) => prev.map((item) => item.id === id ? normalizeCase(payload.case) : item));
    return updatedReport;
  };

  const deleteCase = async (id: string): Promise<Report> => {
    if (!token) throw new Error('Please log in again before removing this case.');
    const payload = await apiRequest<{ report: BackendReport }>(`/cases/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedReport = normalizeReport(payload.report);
    setReports((prev) => prev.map((report) => (report.id === updatedReport.id ? updatedReport : report)));
    setCases((prev) => prev.filter((item) => item.id !== id));
    return updatedReport;
  };

  const addAlert = (a: Omit<Alert, 'id'>) => {
    const id = `ALT-${String(alerts.length + 1).padStart(3, '0')}`;
    setAlerts((prev) => [{ ...a, id }, ...prev]);
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <DataContext.Provider value={{ reports, reportsError, cases, casesError, alerts, addReport, updateReport, editReport, deleteReport, updateCaseStatus, deleteCase, addAlert, updateAlert, deleteAlert }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
