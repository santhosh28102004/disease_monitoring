import type { CaseRecord } from '@/context/DataContext';
import type { Report, RiskLevel, Severity } from '@/data/mockData';

const chartColors = ['#3B82F6', '#22C55E', '#F97316', '#EF4444', '#A855F7', '#06B6D4'];

export interface HealthMetrics {
  stats: {
    totalReports: number;
    verifiedCases: number;
    activeCases: number;
    resolvedCases: number;
  };
  locations: {
    name: string;
    totalReports: number;
    verifiedCases: number;
    activeCases: number;
    resolvedCases: number;
    riskLevel: RiskLevel;
  }[];
  diseaseDistribution: { name: string; value: number; color: string }[];
  casesOverTime: { date: string; cases: number }[];
  severityDistribution: { name: string; value: number; color: string }[];
  casesByLocation: { location: string; cases: number }[];
}

const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const latestSeverity = (reports: Report[]): RiskLevel => {
  const rank: Record<Severity, number> = { Low: 0, Medium: 1, High: 2 };
  const severity = reports.reduce<Severity>(
    (highest, report) => rank[report.severity] > rank[highest] ? report.severity : highest,
    'Low',
  );
  return severity;
};

const wasVerified = (report: Report) =>
  report.status === 'Verified' || report.statusHistory?.some((entry) => entry.status === 'Verified') === true;

export function getHealthMetrics(
  reports: Report[],
  cases: CaseRecord[],
  rangeDays = 30,
): HealthMetrics {
  const reportsById = new Map(reports.map((report) => [report.id, report]));
  const trackedCases = cases.filter((caseRecord) => reportsById.has(caseRecord.reportId));
  const locationGroups = new Map<string, Report[]>();
  reports.forEach((report) => {
    const group = locationGroups.get(report.location) ?? [];
    group.push(report);
    locationGroups.set(report.location, group);
  });

  const casesByLocation = new Map<string, CaseRecord[]>();
  trackedCases.forEach((caseRecord) => {
    const report = reportsById.get(caseRecord.reportId);
    if (!report) return;
    const group = casesByLocation.get(report.location) ?? [];
    group.push(caseRecord);
    casesByLocation.set(report.location, group);
  });

  const locations = Array.from(locationGroups, ([name, locationReports]) => {
    const locationCases = casesByLocation.get(name) ?? [];
    return {
      name,
      totalReports: locationReports.length,
      verifiedCases: locationReports.filter(wasVerified).length,
      activeCases: locationCases.filter((caseRecord) => caseRecord.status === 'ACTIVE').length,
      resolvedCases: locationCases.filter((caseRecord) => caseRecord.status === 'RESOLVED').length,
      riskLevel: latestSeverity(locationReports),
    };
  }).sort((first, second) => second.totalReports - first.totalReports);

  const diseaseCounts = new Map<string, number>();
  reports.forEach((report) => diseaseCounts.set(report.disease, (diseaseCounts.get(report.disease) ?? 0) + 1));
  const diseaseEntries = Array.from(diseaseCounts, ([name, count]) => ({ name, count }))
    .sort((first, second) => second.count - first.count);
  const diseaseDistribution = diseaseEntries.map((entry, index) => ({
    name: entry.name,
    value: reports.length ? Math.round((entry.count / reports.length) * 100) : 0,
    color: chartColors[index % chartColors.length],
  }));

  const today = new Date();
  const firstDay = new Date(today);
  firstDay.setDate(firstDay.getDate() - rangeDays + 1);
  const reportsByDay = new Map<string, number>();
  reports.forEach((report) => {
    const key = report.dateObserved.slice(0, 10);
    if (key >= localDateKey(firstDay) && key <= localDateKey(today)) {
      reportsByDay.set(key, (reportsByDay.get(key) ?? 0) + 1);
    }
  });
  const casesOverTime = Array.from({ length: rangeDays }, (_, index) => {
    const day = new Date(firstDay);
    day.setDate(firstDay.getDate() + index);
    const key = localDateKey(day);
    return {
      date: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      cases: reportsByDay.get(key) ?? 0,
    };
  });

  const severityCounts: Record<Severity, number> = { Low: 0, Medium: 0, High: 0 };
  reports.forEach((report) => { severityCounts[report.severity] += 1; });
  const severityColors: Record<Severity, string> = { Low: '#22C55E', Medium: '#F97316', High: '#EF4444' };
  const severityDistribution = (Object.keys(severityCounts) as Severity[]).map((name) => ({
    name,
    value: reports.length ? Math.round((severityCounts[name] / reports.length) * 100) : 0,
    color: severityColors[name],
  }));

  return {
    stats: {
      totalReports: reports.length,
      verifiedCases: reports.filter(wasVerified).length,
      activeCases: trackedCases.filter((caseRecord) => caseRecord.status === 'ACTIVE').length,
      resolvedCases: trackedCases.filter((caseRecord) => caseRecord.status === 'RESOLVED').length,
    },
    locations,
    diseaseDistribution,
    casesOverTime,
    severityDistribution,
    casesByLocation: locations.slice(0, 5).map((location) => ({
      location: location.name,
      cases: location.totalReports,
    })),
  };
}
