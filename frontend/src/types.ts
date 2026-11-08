// Mirrors the JSON returned by the Spring Boot API. Dates are ISO strings ("2024-03-01").

export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  APPRENTICESHIP: 'Apprenticeship',
} as const;
export type EmploymentType = keyof typeof EMPLOYMENT_TYPES;

export const SKILL_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
} as const;
export type SkillLevel = keyof typeof SKILL_LEVELS;

export const PROFICIENCIES = {
  NATIVE: 'Native',
  C2: 'C2 · Proficient',
  C1: 'C1 · Advanced',
  B2: 'B2 · Upper intermediate',
  B1: 'B1 · Intermediate',
  A2: 'A2 · Elementary',
  A1: 'A1 · Beginner',
} as const;
export type Proficiency = keyof typeof PROFICIENCIES;

export const WORK_MODES = { REMOTE: 'Remote', HYBRID: 'Hybrid', ONSITE: 'On-site' } as const;
export type WorkMode = keyof typeof WORK_MODES;

export const MILITARY_STATUSES = {
  COMPLETED: 'Completed',
  EXEMPT: 'Exempt',
  POSTPONED: 'Postponed',
  NOT_APPLICABLE: 'Not applicable',
} as const;
export type MilitaryServiceStatus = keyof typeof MILITARY_STATUSES;

export interface Me {
  name: string;
  provider: string;
}

export interface Country {
  iso: string;
  name: string;
  dial: string;
  format: string;
}

export interface ContactProfile {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  phoneCountryCode: string | null;
  phoneCountryIso: string | null;
  city: string | null;
  country: string | null;
  linkedInUrl: string | null;
  portfolioUrl: string | null;
  professionalSummary: string | null;
}

export interface WorkExperience {
  id: number;
  company: string;
  title: string;
  location: string | null;
  employmentType: EmploymentType | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
}

export interface Education {
  id: number;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  grade: string | null;
  description: string | null;
}

export interface Skill {
  id: number;
  name: string;
  level: SkillLevel | null;
}

export interface SpokenLanguage {
  id: number;
  language: string;
  proficiency: Proficiency;
}

export interface ApplicationPreferences {
  desiredTitles: string | null;
  preferredWorkMode: WorkMode | null;
  willingToRelocate: boolean | null;
  workAuthorization: string | null;
  requiresSponsorship: boolean | null;
  noticePeriodDays: number | null;
  availableFrom: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  militaryServiceStatus: MilitaryServiceStatus | null;
  drivingLicense: string | null;
}
