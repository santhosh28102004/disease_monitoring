export type Role = 'citizen' | 'official';
export type AccountRole = 'CITIZEN' | 'HEALTHCARE_WORKER' | 'HEALTH_OFFICIAL' | 'ADMIN';

export type Status = 'Submitted' | 'Pending' | 'Verified' | 'Rejected' | 'Under Review' | 'Active' | 'Acknowledged' | 'Resolved';
export type Severity = 'Low' | 'Medium' | 'High';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: Role;
  accountRole?: AccountRole;
  phone?: string;
  location?: string;
}

export interface Report {
  id: string;
  reportedById?: string;
  reportedBy: string;
  disease: string;
  symptoms: string;
  affectedPeople: number;
  location: string;
  dateObserved: string;
  severity: Severity;
  description?: string;
  status: Status;
  verificationNotes?: string;
  followUpDate?: string;
  statusHistory?: { status: Status; notes: string; updatedAt: string }[];
  updatedAt?: string;
  createdAt: string;
}

export interface LocationData {
  name: string;
  totalReports: number;
  verifiedCases: number;
  activeCases: number;
  riskLevel: RiskLevel;
}

export interface Alert {
  id: string;
  disease: string;
  location: string;
  riskLevel: RiskLevel;
  cases: number;
  message: string;
  date: string;
  status: AlertStatus;
}

export interface DiseaseInfo {
  name: string;
  icon: string;
  description: string;
  symptoms: string[];
  prevention: string[];
}

export const LOCATIONS = [
  'Anna Nagar',
  'Peelamedu',
  'RS Puram',
  'Saibaba Colony',
  'T. Nagar',
  'Gandhipuram',
  'Saravanampatti',
];

export const DISEASES = [
  'Dengue-like symptoms',
  'Malaria-like symptoms',
  'Typhoid-like symptoms',
  'Influenza-like symptoms',
  'Diarrheal disease',
  'Other',
];

export const mockReports: Report[] = [
  {
    id: 'RPT-001',
    reportedBy: 'John Citizen',
    disease: 'Dengue-like symptoms',
    symptoms: 'Fever, Headache, Body pain',
    affectedPeople: 3,
    location: 'Anna Nagar',
    dateObserved: '2026-08-20',
    severity: 'High',
    description: 'High fever for 3 days with severe joint pain and rash.',
    status: 'Pending',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'RPT-002',
    reportedBy: 'John Citizen',
    disease: 'Malaria-like symptoms',
    symptoms: 'Chills, Sweating, Fever',
    affectedPeople: 1,
    location: 'Peelamedu',
    dateObserved: '2026-08-18',
    severity: 'Medium',
    description: 'Recurring fever with chills every evening.',
    status: 'Verified',
    verificationNotes: 'Confirmed by local clinic as malaria.',
    followUpDate: '2026-08-25',
    createdAt: '2026-08-18T14:00:00Z',
  },
  {
    id: 'RPT-003',
    reportedBy: 'John Citizen',
    disease: 'Influenza-like symptoms',
    symptoms: 'Cough, Sore throat, Runny nose',
    affectedPeople: 2,
    location: 'RS Puram',
    dateObserved: '2026-08-15',
    severity: 'Low',
    description: 'Mild flu symptoms, recovering at home.',
    status: 'Verified',
    verificationNotes: 'Self-reported, symptoms consistent with seasonal flu.',
    createdAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'RPT-004',
    reportedBy: 'John Citizen',
    disease: 'Typhoid-like symptoms',
    symptoms: 'Fever, Weakness, Stomach pain',
    affectedPeople: 1,
    location: 'Saibaba Colony',
    dateObserved: '2026-08-10',
    severity: 'Medium',
    description: 'Persistent fever with abdominal discomfort.',
    status: 'Rejected',
    verificationNotes: 'Tested negative for typhoid at the clinic.',
    createdAt: '2026-08-10T11:00:00Z',
  },
  {
    id: 'RPT-005',
    reportedBy: 'Meera Krishnan',
    disease: 'Dengue-like symptoms',
    symptoms: 'Fever, Rash, Joint pain',
    affectedPeople: 4,
    location: 'Peelamedu',
    dateObserved: '2026-08-22',
    severity: 'High',
    description: 'Multiple family members affected with dengue symptoms.',
    status: 'Pending',
    createdAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'RPT-006',
    reportedBy: 'Rahul Sharma',
    disease: 'Diarrheal disease',
    symptoms: 'Diarrhea, Vomiting, Dehydration',
    affectedPeople: 5,
    location: 'Anna Nagar',
    dateObserved: '2026-08-21',
    severity: 'Medium',
    description: 'Possible water contamination in the area.',
    status: 'Pending',
    createdAt: '2026-08-21T15:00:00Z',
  },
  {
    id: 'RPT-007',
    reportedBy: 'Sara Thomas',
    disease: 'Malaria-like symptoms',
    symptoms: 'Fever, Chills, Nausea',
    affectedPeople: 2,
    location: 'T. Nagar',
    dateObserved: '2026-08-19',
    severity: 'Medium',
    description: 'Fever with chills after recent travel.',
    status: 'Verified',
    verificationNotes: 'Blood smear confirmed malaria parasites.',
    followUpDate: '2026-08-26',
    createdAt: '2026-08-19T12:00:00Z',
  },
  {
    id: 'RPT-008',
    reportedBy: 'Vijay Kumar',
    disease: 'Influenza-like symptoms',
    symptoms: 'Fever, Cough, Body ache',
    affectedPeople: 3,
    location: 'Gandhipuram',
    dateObserved: '2026-08-17',
    severity: 'Low',
    description: 'Seasonal flu symptoms in the household.',
    status: 'Verified',
    verificationNotes: 'Consistent with seasonal influenza.',
    createdAt: '2026-08-17T10:00:00Z',
  },
  {
    id: 'RPT-009',
    reportedBy: 'Anita Rao',
    disease: 'Typhoid-like symptoms',
    symptoms: 'High fever, Weakness, Loss of appetite',
    affectedPeople: 1,
    location: 'Saravanampatti',
    dateObserved: '2026-08-14',
    severity: 'High',
    description: 'Continuous high fever for over a week.',
    status: 'Verified',
    verificationNotes: 'Widal test positive. Treatment started.',
    followUpDate: '2026-08-28',
    createdAt: '2026-08-14T13:00:00Z',
  },
  {
    id: 'RPT-010',
    reportedBy: 'Deepak Nair',
    disease: 'Dengue-like symptoms',
    symptoms: 'Fever, Headache, Eye pain',
    affectedPeople: 2,
    location: 'RS Puram',
    dateObserved: '2026-08-23',
    severity: 'High',
    description: 'Retro-orbital pain with high fever.',
    status: 'Pending',
    createdAt: '2026-08-23T09:00:00Z',
  },
];

export const mockLocations: LocationData[] = [
  { name: 'Anna Nagar', totalReports: 42, verifiedCases: 32, activeCases: 18, riskLevel: 'High' },
  { name: 'Peelamedu', totalReports: 35, verifiedCases: 28, activeCases: 14, riskLevel: 'High' },
  { name: 'RS Puram', totalReports: 30, verifiedCases: 18, activeCases: 8, riskLevel: 'Medium' },
  { name: 'Saibaba Colony', totalReports: 22, verifiedCases: 16, activeCases: 6, riskLevel: 'Medium' },
  { name: 'T. Nagar', totalReports: 15, verifiedCases: 9, activeCases: 4, riskLevel: 'Low' },
  { name: 'Gandhipuram', totalReports: 10, verifiedCases: 5, activeCases: 2, riskLevel: 'Low' },
  { name: 'Saravanampatti', totalReports: 8, verifiedCases: 4, activeCases: 1, riskLevel: 'Low' },
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    disease: 'Dengue',
    location: 'Peelamedu',
    riskLevel: 'High',
    cases: 28,
    message: 'High-risk dengue activity detected in Peelamedu.',
    date: '2026-08-24',
    status: 'Active',
  },
  {
    id: 'ALT-002',
    disease: 'Malaria',
    location: 'RS Puram',
    riskLevel: 'Medium',
    cases: 12,
    message: 'Malaria cases increasing in RS Puram.',
    date: '2026-08-23',
    status: 'Active',
  },
  {
    id: 'ALT-003',
    disease: 'Typhoid',
    location: 'Saibaba Colony',
    riskLevel: 'High',
    cases: 22,
    message: 'Typhoid cases reported above normal range.',
    date: '2026-08-22',
    status: 'Acknowledged',
  },
  {
    id: 'ALT-004',
    disease: 'Influenza',
    location: 'Anna Nagar',
    riskLevel: 'Low',
    cases: 5,
    message: 'Influenza cases are under control.',
    date: '2026-08-20',
    status: 'Resolved',
  },
];

export const diseaseInfo: DiseaseInfo[] = [
  {
    name: 'Dengue',
    icon: 'Bug',
    description: 'A mosquito-borne viral infection common in tropical regions. Can cause severe flu-like illness and potentially lethal complications.',
    symptoms: ['High fever (40°C/104°F)', 'Severe headache', 'Pain behind the eyes', 'Joint and muscle pain', 'Nausea and vomiting', 'Skin rash'],
    prevention: ['Use mosquito repellents', 'Wear long-sleeved clothing', 'Remove stagnant water', 'Use mosquito nets', 'Keep windows screened'],
  },
  {
    name: 'Malaria',
    icon: 'Activity',
    description: 'A life-threatening disease caused by parasites transmitted to people through the bites of infected Anopheles mosquitoes.',
    symptoms: ['Fever and chills', 'Sweating', 'Headache', 'Nausea and vomiting', 'Body aches', 'Fatigue'],
    prevention: ['Use insecticide-treated nets', 'Apply mosquito repellent', 'Eliminate standing water', 'Take antimalarial medication when traveling', 'Wear protective clothing'],
  },
  {
    name: 'Typhoid',
    icon: 'Thermometer',
    description: 'A bacterial infection that can spread throughout the body, affecting many organs. Caused by Salmonella typhi bacteria.',
    symptoms: ['Prolonged high fever', 'Weakness and fatigue', 'Stomach pain', 'Loss of appetite', 'Headache', 'Constipation or diarrhea'],
    prevention: ['Drink clean, boiled water', 'Wash hands frequently', 'Avoid raw foods', 'Get vaccinated', 'Maintain food hygiene'],
  },
  {
    name: 'Influenza',
    icon: 'Wind',
    description: 'A common viral infection of the respiratory system that can be highly contagious. Seasonal outbreaks are common.',
    symptoms: ['Fever or chills', 'Cough', 'Sore throat', 'Runny or stuffy nose', 'Muscle or body aches', 'Fatigue'],
    prevention: ['Get annual flu vaccine', 'Wash hands regularly', 'Avoid close contact with sick people', 'Cover coughs and sneezes', 'Stay home when ill'],
  },
];

export const healthTips = [
  { text: 'Drink clean and safe water', icon: 'Droplets', color: 'text-blue-500' },
  { text: 'Keep your surroundings clean', icon: 'Sparkles', color: 'text-green-500' },
  { text: 'Use mosquito repellent regularly', icon: 'Bug', color: 'text-orange-500' },
  { text: 'Consult a doctor if symptoms persist', icon: 'Stethoscope', color: 'text-red-500' },
];

export const analyticsStats = {
  totalReports: 2451,
  verifiedCases: 1268,
  activeCases: 312,
  resolvedCases: 956,
};

export const healthOfficialStats = {
  totalReports: 250,
  verifiedCases: 130,
  activeCases: 30,
  resolvedCases: 95,
};

export const diseaseDistribution = [
  { name: 'Dengue', value: 40, color: '#3B82F6' },
  { name: 'Malaria', value: 25, color: '#22C55E' },
  { name: 'Influenza', value: 15, color: '#F97316' },
  { name: 'Typhoid', value: 10, color: '#EF4444' },
  { name: 'Others', value: 10, color: '#A855F7' },
];

export const casesOverTime = [
  { date: 'Apr 20', cases: 120 },
  { date: 'Apr 27', cases: 145 },
  { date: 'May 4', cases: 168 },
  { date: 'May 11', cases: 195 },
  { date: 'May 18', cases: 230 },
];

export const severityDistribution = [
  { name: 'High', value: 40, color: '#EF4444' },
  { name: 'Medium', value: 35, color: '#F97316' },
  { name: 'Low', value: 25, color: '#22C55E' },
];

export const casesByLocation = [
  { location: 'Peelamedu', cases: 35 },
  { location: 'RS Puram', cases: 30 },
  { location: 'Anna Nagar', cases: 28 },
  { location: 'Saibaba Colony', cases: 22 },
  { location: 'Gandhipuram', cases: 10 },
];

export const landingStats = [
  { label: 'Reports Logged', value: '2,451' },
  { label: 'Active Cases Tracked', value: '312' },
  { label: 'Verified Cases', value: '1,268' },
  { label: 'Communities Protected', value: '8' },
];
