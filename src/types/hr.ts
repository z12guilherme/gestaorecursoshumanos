export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager?: string;
  contractType: string;
  status: string;
  hireDate: string;
  birthDate: string;
  avatar?: string;
  avatar_url?: string;
  salary?: number;
  pin?: string;
  baseSalary?: number;
  fixedDiscounts?: number;
  contractedHours?: number;
  hasInsalubrity?: boolean;
  hasNightShift?: boolean;
  pisPasep?: string;
  pis_pasep?: string;
  pixKey?: string;
  vacationDueDate?: string;
  vacationLimitDate?: string;
  workSchedule?: string;
  unit?: string;
  variable_discounts?: any[];
  variable_additions?: any[];
  custom_fields?: any;
  inss_value?: number | null;
  insalubrityAmount?: number;
  nightShiftAmount?: number;
  role?: string;
  admissionDate?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "intern";
  status: "open" | "closed" | "paused";
  description: string;
  requirements: string[];
  createdAt: string;
  applicants: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: "applied" | "screening" | "interview" | "approved" | "rejected";
  appliedAt: string;
  resumeUrl?: string;
  notes?: string;
  rating?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "vacation" | "sick" | "personal" | "maternity" | "paternity";
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  attachmentUrl?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  period: string;
  overallScore: number;
  goals: { description: string; achieved: boolean; score: number }[];
  competencies: { name: string; score: number }[];
  feedback: string;
  createdAt: string;
}
