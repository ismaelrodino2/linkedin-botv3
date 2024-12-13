export type LanguageLevel = "Basic" | "Intermediate" | "Advanced" | "Native";
export type SoftwareLevel = "Basic" | "Intermediate" | "Advanced";
export type PlanType = "premium" | "free" | "none";
export type SubscriptionStatus = "active" | "canceled";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface Link {
  name: string;
  url: string;
}

export interface Language {
  language: string;
  level: LanguageLevel;
}

export interface Software {
  name: string;
  yearsOfExperience: string;
  level: SoftwareLevel;
}

export interface Technology {
  name: string;
  yearsOfExperience: string;
}

export interface Availability {
  canTravel: boolean;
  canWorkInPerson: boolean;
  needsSponsor: boolean;
  immediateStart: boolean;
  canWorkHybrid: boolean;
}

export interface DesiredSalary {
  country: string;
  amount: string;
}

export interface Account {
  cv1: string | null;
  cv2: string | null;
  coverLetter1: string | null;
  coverLetter2: string | null;
  aboutMe: string;
  experience: string;
  links: Link[];
  availability: Availability;
  languages: Language[];
  softwares: Software[];
  softSkills: string;
  hardSkills: string;
  proficiency: string;
  technologies: Technology[];
  desiredSalaries: DesiredSalary[] | null;
  id: number;
  cv1filePath: string | null;
  cv2filePath: string | null;
  coverLetter1filePath: string | null;
  coverLetter2filePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: number;
  userId: number;
  status: SubscriptionStatus;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: number;
  userId: number;
  status: PaymentStatus;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  expiration: Date | null;
  paymentDate: Date | null;
  hasPurchased: boolean;
  accountId: number | null;
  account: Account | null;
  dailyUsage: number;
  lastUsage: Date | null;
  usedDaysFree: number;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  subscription: Subscription | null;
  payment: Payment | null;
}
