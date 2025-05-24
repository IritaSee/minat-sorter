export interface StudentInfo {
  name: string;
  gender: 'male' | 'female' | 'other';
  schoolName: string;
  customSchoolName?: string; // For when "Lainnya" is selected
}

export interface Job {
  id: string;
  title: string;
  description?: string;
}

export interface JobSet {
  id: string;
  name: string;
  maleJobs: Job[];
  femaleJobs: Job[];
}

export interface StudentPreferences {
  studentInfo: StudentInfo;
  jobPreferences: {
    setId: string;
    rankedJobs: string[]; // Job IDs in preference order
  }[];
  submittedAt: Date;
}

export const SCHOOLS = [
  'SMPN 1 Melaya',
  'SMPN 2 Melaya',
  'SMPN 3 Melaya',
  'SMPN 4 Melaya',
  'SMPN 5 Melaya',
  'Lainnya'
] as const;

export type SchoolName = typeof SCHOOLS[number];
