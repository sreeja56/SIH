export type Language = 'en' | 'te' | 'hi';

export type Gender = 'male' | 'female' | 'other';

export type TabId = 'home' | 'result' | 'doctors' | 'documents' | 'helplines';

export type SeverityLevel = 'safe' | 'moderate' | 'severe';

export interface UserProfile {
  username: string;
  pin: string; // 4-digit PIN
  phone: string;
  name: string;
  age: number;
  gender: Gender;
  language: Language;
  village?: string;
  district?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  isOtpVerified?: boolean;
  otpVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppPermissions {
  locationAllowed: boolean | null;
  notificationsAllowed: boolean | null;
  cameraAllowed: boolean | null;
  microphoneAllowed: boolean | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  language: Language;
  timestamp: string;
  audioUrl?: string;
  isTriageQuestion?: boolean;
}

export interface TriageResult {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  severityLabel: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  chiefComplaint: string;
  symptomsList: string[];
  durationDays?: string;
  painLevel?: number;
  summary: string;
  possibleConditions: Array<{
    name: string;
    description: string;
    level: string;
  }>;
  recommendedAction: string;
  homeCareTips: string[];
  warningSigns: string[];
  needImmediateEmergency: boolean;
}

export interface DoctorTimeSlot {
  time: string;
  available: boolean;
  totalSlots: number;
  availableSlots: number;
}

export interface Doctor {
  id: string;
  name: string;
  nameTe?: string;
  nameHi?: string;
  qualification: string;
  specialization: string;
  specializationTe?: string;
  specializationHi?: string;
  hospitalName: string;
  hospitalType: 'PHC' | 'CHC' | 'District Hospital' | 'Community Clinic';
  address: string;
  village: string;
  district: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  contactNumber: string;
  fee: number; // 0 for Government PHC/CHC
  availableDays: string[];
  timeSlots: DoctorTimeSlot[];
  photoUrl: string;
  mapCoordinates: {
    lat: number;
    lng: number;
  };
}

export interface Appointment {
  id: string;
  uniqueId: string; // e.g. GA-APPT-84920
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  hospitalAddress: string;
  patientName: string;
  patientAge: number;
  patientGender: Gender;
  patientPhone: string;
  date: string;
  timeSlot: string;
  symptomsBrief: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  tokenNumber: number;
  alarmSet?: boolean;
  alarmMinutesBefore?: number;
  createdAt: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  category: 'prescription' | 'lab_report' | 'xray' | 'blood_test' | 'discharge_summary' | 'other';
  doctorName?: string;
  hospitalName?: string;
  recordDate: string;
  uploadedAt: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatioPercent: number;
  dataUrl: string;
  source?: 'camera' | 'upload';
  notes?: string;
}

export interface Helpline {
  id: string;
  number: string;
  name: string;
  nameTe: string;
  nameHi: string;
  description: string;
  descriptionTe: string;
  descriptionHi: string;
  category: 'emergency' | 'maternal' | 'telemedicine' | 'child' | 'women';
  icon: string;
  isTollFree: boolean;
}

export interface AshaWorker {
  id: string;
  name: string;
  village: string;
  subCentre: string;
  district: string;
  phone: string;
  experienceYears: number;
  available: boolean;
  photoUrl: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  village: string;
  district: string;
  phone: string;
  lastDonated: string;
  isAvailable: boolean;
}

export interface UserFeedback {
  id: string;
  rating: number; // 1 to 5
  category: string;
  comment: string;
  userName?: string;
  createdAt: string;
}
