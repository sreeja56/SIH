import { UserProfile, TriageResult, ChatMessage, Doctor, Appointment, MedicalDocument, Language, AppPermissions, UserFeedback } from '../types';
import { mockDoctors, initialSampleDocuments } from '../data/mockData';

const BACKEND_API = '/api/backend';

async function backendRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BACKEND_API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Backend request failed (${response.status})`);
  }
  return data as T;
}

const USERS_STORAGE_KEY = 'gramarogya_users_v1';
const CURRENT_USER_KEY = 'gramarogya_current_user_v1';
const BOOKINGS_STORAGE_KEY = 'gramarogya_bookings_v1';
const DOCUMENTS_STORAGE_KEY = 'gramarogya_documents_v1';
const PERMISSIONS_STORAGE_KEY = 'gramarogya_permissions_v1';
const DOCTORS_SLOTS_STORAGE_KEY = 'gramarogya_doctors_slots_v2';
const FEEDBACK_STORAGE_KEY = 'gramarogya_feedback_v1';

// Seed default demo user for evaluation
const defaultDemoUser: UserProfile = {
  username: 'ravi_kumar',
  pin: '1234',
  phone: '9876543210',
  name: 'Ravi Kumar (రవి కుమార్)',
  age: 36,
  gender: 'male',
  language: 'en',
  village: 'Rampur Village',
  district: 'Medak',
  bloodGroup: 'O+',
  emergencyContact: '+91 98480 99887',
  isOtpVerified: true,
  otpVerifiedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const apiService = {
  // --- Auth & Users ---
  getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultDemoUser]));
        return [defaultDemoUser];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultDemoUser]));
        return [defaultDemoUser];
      }
      return parsed;
    } catch {
      return [defaultDemoUser];
    }
  },

  saveUser(user: UserProfile): void {
    const cleanUserUsername = (user.username || '').trim().toLowerCase();
    const cleanUserPhone = (user.phone || '').trim().replace(/\D/g, '');

    const users = this.getUsers().filter(u => {
      const existingUname = (u.username || '').trim().toLowerCase();
      const existingPhone = (u.phone || '').trim().replace(/\D/g, '');
      return existingUname !== cleanUserUsername && existingPhone !== cleanUserPhone;
    });

    users.push({
      ...user,
      isOtpVerified: user.isOtpVerified ?? true,
      updatedAt: new Date().toISOString(),
    });

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    this.setCurrentUser(user);
    void backendRequest('/profile', { method: 'POST', body: JSON.stringify(user) }).catch((error) => {
      console.warn('Supabase profile sync skipped:', error);
    });
  },

  async login(identifier: string, pin: string): Promise<UserProfile | null> {
    try {
      const data = await backendRequest<{ success: boolean; user: UserProfile | null }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, pin }),
      });
      return data.user || null;
    } catch (error) {
      console.warn('Supabase login fallback:', error);
      return this.findUser(identifier)?.pin === pin ? this.findUser(identifier) : null;
    }
  },

  findUser(identifier: string): UserProfile | null {
    const clean = identifier.trim();
    const cleanLower = clean.toLowerCase();
    const cleanPhoneDigits = clean.replace(/\D/g, '');

    const users = this.getUsers();
    return users.find(u => {
      const uName = (u.username || '').trim().toLowerCase();
      const uPhone = (u.phone || '').trim().replace(/\D/g, '');

      if (uName && uName === cleanLower) return true;
      if (cleanPhoneDigits.length >= 10 && uPhone && (uPhone === cleanPhoneDigits || uPhone.endsWith(cleanPhoneDigits))) return true;
      if (u.username === clean || u.phone === clean) return true;
      return false;
    }) || null;
  },

  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  // --- Permissions ---
  getPermissions(): AppPermissions {
    try {
      const data = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : { locationAllowed: null, notificationsAllowed: null, cameraAllowed: null, microphoneAllowed: null };
    } catch {
      return { locationAllowed: null, notificationsAllowed: null, cameraAllowed: null, microphoneAllowed: null };
    }
  },

  savePermissions(permissions: AppPermissions): void {
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    const user = this.getCurrentUser();
    if (user) {
      void backendRequest('/permissions', { method: 'POST', body: JSON.stringify({ username: user.username, ...permissions }) }).catch(() => {});
    }
  },

  // --- AI Chatbot ---
  async sendChatMessage(
    message: string,
    history: ChatMessage[],
    language: Language,
    userProfile: UserProfile | null
  ): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: history,
          language,
          userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        void backendRequest('/chat', { method: 'POST', body: JSON.stringify({
          username: currentUser.username, message, history, language, assistantText: data.text || ''
        }) }).catch(() => {});
      }
      return data.text || 'I have recorded your symptoms. Please visit the nearest PHC if discomfort increases.';
    } catch (e) {
      console.warn('API Chat fetch fallback:', e);
      if (language === 'te') {
        return 'మీ లక్షణాలను నమోదు చేసాము. దయచేసి పుష్కలంగా నీరు తాగి విశ్రాంతి తీసుకోండి. సమస్య తీవ్రమైతే వెంటనే సమీప PHCకి వెళ్ళండి లేదా 108 కి కాల్ చేయండి.';
      } else if (language === 'hi') {
        return 'आपके लक्षणों को नोट कर लिया गया है। कृपया आराम करें और पर्याप्त पानी पिएं। यदि तकलीफ अधिक हो तो तुरंत PHC जाएं या 108 पर कॉल करें।';
      }
      return 'I have recorded your symptoms. Please rest, stay well-hydrated, and consult a doctor at the nearest PHC if symptoms persist.';
    }
  },

  // --- AI Clinical Triage Analysis ---
  async analyzeTriage(
    messages: ChatMessage[],
    language: Language,
    userProfile: UserProfile | null
  ): Promise<TriageResult> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          language,
          userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.result) {
        const result = {
          id: `triage-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          patientName: userProfile?.name || 'Patient',
          patientAge: userProfile?.age || 30,
          patientGender: userProfile?.gender || 'other',
          ...data.result,
        };
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          void backendRequest('/triage', { method: 'POST', body: JSON.stringify({ username: currentUser.username, id: result.id, result }) }).catch(() => {});
        }
        return result;
      }
      throw new Error('Invalid format');
    } catch (e) {
      console.warn('API Analyze fallback:', e);
      return {
        id: `triage-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: 'moderate',
        severityLabel: language === 'te' ? 'మితమైన సంరక్షణ (MODERATE)' : language === 'hi' ? 'मध्यम स्तर (MODERATE)' : 'MODERATE Care Required',
        patientName: userProfile?.name || 'Patient',
        patientAge: userProfile?.age || 30,
        patientGender: userProfile?.gender || 'male',
        chiefComplaint: language === 'te' ? 'జ్వరం మరియు నీరసం' : language === 'hi' ? 'बुखार और शारीरिक कमजोरी' : 'Fever and Physical Discomfort',
        symptomsList: ['Fever', 'Body Pain', 'Mild Headache'],
        durationDays: '2-3 days',
        painLevel: 5,
        summary: language === 'te' 
          ? 'లక్షణాలు సాధారణ వైరల్ జ్వరాన్ని సూచిస్తున్నాయి. 24 గంటల్లో డాక్టర్‌ని సంప్రదించి పరీక్ష చేయించుకోండి.'
          : language === 'hi'
          ? 'लक्षण सामान्य मौसमी बुखार के अनुकूल हैं। 24 घंटे में डॉक्टर से परामर्श लें।'
          : 'Symptoms are consistent with a moderate seasonal viral condition. A clinical checkup at the PHC is recommended within 24 hours.',
        possibleConditions: [
          {
            name: 'Viral Pyrexia / Seasonal Infection',
            description: 'Common seasonal viral elevation in temperature.',
            level: 'Probable Match'
          }
        ],
        recommendedAction: 'Book an appointment at your local Primary Health Centre (PHC) for doctor consultation.',
        homeCareTips: [
          'Drink warm boiled water throughout the day.',
          'Take complete bed rest in a well-ventilated room.',
          'Eat freshly prepared light porridge or soup.'
        ],
        warningSigns: [
          'High fever above 102.5°F',
          'Severe breathing difficulty or chest tightness',
          'Persistent vomiting or inability to keep liquids down'
        ],
        needImmediateEmergency: false
      };
    }
  },

  // --- Doctors & Live Slot Management ---
  getDoctors(): Doctor[] {
    try {
      const stored = localStorage.getItem(DOCTORS_SLOTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(DOCTORS_SLOTS_STORAGE_KEY, JSON.stringify(mockDoctors));
      return mockDoctors;
    } catch {
      return mockDoctors;
    }
  },

  saveDoctors(doctors: Doctor[]): void {
    localStorage.setItem(DOCTORS_SLOTS_STORAGE_KEY, JSON.stringify(doctors));
  },

  async refreshDoctors(): Promise<Doctor[]> {
    try {
      const data = await backendRequest<{ success: boolean; doctors: Doctor[] }>('/doctors');
      this.saveDoctors(data.doctors);
      return data.doctors;
    } catch (error) {
      console.warn('Supabase doctors fallback:', error);
      return this.getDoctors();
    }
  },

  getBookings(): Appointment[] {
    try {
      const data = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  createBooking(bookingData: Omit<Appointment, 'id' | 'uniqueId' | 'tokenNumber' | 'createdAt' | 'status'>): {
    success: boolean;
    appointment?: Appointment;
    errorMessage?: string;
  } {
    const doctors = this.getDoctors();
    const doctor = doctors.find(d => d.id === bookingData.doctorId);

    if (!doctor) {
      return { success: false, errorMessage: 'Doctor not found' };
    }

    const slot = doctor.timeSlots.find(s => s.time === bookingData.timeSlot);
    if (!slot || slot.availableSlots <= 0 || !slot.available) {
      return {
        success: false,
        errorMessage: 'NO_SLOTS_AVAILABLE',
      };
    }

    // Decrement slot count
    slot.availableSlots = Math.max(0, slot.availableSlots - 1);
    if (slot.availableSlots === 0) {
      slot.available = false;
    }

    this.saveDoctors(doctors);

    const existing = this.getBookings();
    const uniqueId = `GA-APPT-${Math.floor(10000 + Math.random() * 90000)}`;
    const tokenNumber = Math.floor(1 + Math.random() * 25);

    const newAppointment: Appointment = {
      id: `appt-${Date.now()}`,
      uniqueId,
      tokenNumber,
      status: 'confirmed',
      alarmSet: true, // Default 30-min alarm enabled
      alarmMinutesBefore: 30,
      createdAt: new Date().toISOString(),
      ...bookingData,
    };

    existing.unshift(newAppointment);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(existing));
    const currentUser = this.getCurrentUser();
    void backendRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify({ ...newAppointment, username: currentUser?.username }),
    }).catch((error) => console.warn('Supabase appointment sync skipped:', error));

    return {
      success: true,
      appointment: newAppointment,
    };
  },

  toggleAppointmentAlarm(id: string, enabled: boolean): void {
    const bookings = this.getBookings().map(b => b.id === id ? { ...b, alarmSet: enabled } : b);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    void backendRequest(`/appointments/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ alarmSet: enabled }) }).catch(() => {});
  },

  cancelBooking(id: string): void {
    const bookings = this.getBookings();
    const target = bookings.find(b => b.id === id);
    if (target && target.status !== 'cancelled') {
      // Re-increment the slot
      const doctors = this.getDoctors();
      const doctor = doctors.find(d => d.id === target.doctorId);
      if (doctor) {
        const slot = doctor.timeSlots.find(s => s.time === target.timeSlot);
        if (slot) {
          slot.availableSlots = Math.min(slot.totalSlots, slot.availableSlots + 1);
          if (slot.availableSlots > 0) {
            slot.available = true;
          }
          this.saveDoctors(doctors);
        }
      }
    }

    const updated = bookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    void backendRequest(`/appointments/${encodeURIComponent(id)}/cancel`, { method: 'POST' }).catch(() => {});
  },

  // --- Document Vault ---
  getDocuments(): MedicalDocument[] {
    try {
      const data = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(initialSampleDocuments));
        return initialSampleDocuments;
      }
      return JSON.parse(data);
    } catch {
      return initialSampleDocuments;
    }
  },

  saveDocument(doc: MedicalDocument): void {
    const docs = this.getDocuments();
    docs.unshift(doc);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    const user = this.getCurrentUser();
    void backendRequest('/documents', { method: 'POST', body: JSON.stringify({ ...doc, username: user?.username }) }).catch((error) => console.warn('Supabase document sync skipped:', error));
  },

  deleteDocument(id: string): void {
    const docs = this.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    void backendRequest(`/documents/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  },

  updateDocumentTitle(id: string, newTitle: string): void {
    const title = newTitle.trim();
    const docs = this.getDocuments().map(d => d.id === id ? { ...d, title } : d);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    void backendRequest(`/documents/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ title }) }).catch(() => {});
  },

  // --- Feedback System ---
  getFeedback(): UserFeedback[] {
    try {
      const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt'>): UserFeedback {
    const all = this.getFeedback();
    const newFeedback: UserFeedback = {
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...feedback,
    };
    all.unshift(newFeedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(all));
    const user = this.getCurrentUser();
    void backendRequest('/feedback', { method: 'POST', body: JSON.stringify({ ...newFeedback, username: user?.username }) }).catch(() => {});
    return newFeedback;
  }
};
