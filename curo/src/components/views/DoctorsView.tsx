import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, CheckCircle2, AlertCircle, Phone, X, ShieldCheck, Search, Bell, AlertTriangle } from 'lucide-react';
import { Doctor, Appointment, Language, UserProfile, DoctorTimeSlot } from '../../types';
import { translations } from '../../i18n/translations';
import { apiService } from '../../services/api';
import { StarRating } from '../common/StarRating';
import { GoogleMapPin } from '../common/GoogleMapPin';

interface DoctorsViewProps {
  language: Language;
  currentUser: UserProfile | null;
  onBookingComplete?: (appt: Appointment) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  language,
  currentUser,
  onBookingComplete,
}) => {
  const t = translations[language];
  const [doctors, setDoctors] = useState<Doctor[]>(() => apiService.getDoctors());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow, Morning Session');
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00 AM - 10:00 AM');
  const [bookingFor, setBookingFor] = useState<'self' | 'other'>('self');
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientAge, setPatientAge] = useState<number>(currentUser?.age || 30);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>(currentUser?.gender || 'male');
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);

  // Requirement 12: No Slots Available Popup Modal State
  const [showNoSlotPopup, setShowNoSlotPopup] = useState<boolean>(false);
  const [noSlotMessage, setNoSlotMessage] = useState<string>('');

  const refreshDoctors = () => {
    setDoctors(apiService.getDoctors());
  };

  const filteredDoctors = doctors.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query) ||
      doc.hospitalName.toLowerCase().includes(query) ||
      doc.village.toLowerCase().includes(query)
    );
  });

  const handleOpenBookingModal = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setConfirmedAppt(null);
    setShowNoSlotPopup(false);
    
    // Pick first available slot if any, otherwise first
    const firstAvailable = doc.timeSlots.find(s => s.available && s.availableSlots > 0);
    setSelectedSlot(firstAvailable ? firstAvailable.time : doc.timeSlots[0]?.time || '09:00 AM - 10:00 AM');

    if (bookingFor === 'self') {
      setPatientName(currentUser?.name || 'Patient');
      setPatientAge(currentUser?.age || 30);
      setPatientGender(currentUser?.gender || 'male');
    }
  };

  const handleSlotSelect = (slot: DoctorTimeSlot) => {
    // Check if slot has 0 capacity or is marked unavailable (#12)
    if (!slot.available || slot.availableSlots <= 0) {
      setNoSlotMessage(
        language === 'te' 
          ? `ఈ సమయానికి (${slot.time}) స్లాట్లు పూర్తయ్యాయి. దయచేసి వేరే సమయాన్ని ఎంచుకోండి.`
          : language === 'hi'
          ? `इस समय (${slot.time}) के लिए कोई स्लॉट उपलब्ध नहीं है। कृपया दूसरा समय चुनें।`
          : `All slots for ${slot.time} are full (${slot.availableSlots}/${slot.totalSlots} left). Please select another time.`
      );
      setShowNoSlotPopup(true);
      return;
    }
    setSelectedSlot(slot.time);
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctor) return;

    // Check slot availability (#12)
    const slot = selectedDoctor.timeSlots.find((s) => s.time === selectedSlot);
    if (!slot || !slot.available || slot.availableSlots <= 0) {
      setNoSlotMessage(
        language === 'te' 
          ? `ఈ సమయానికి అన్ని స్లాట్లు పూర్తయ్యాయి. దయచేసి వేరే సమయం ఎంచుకోండి.`
          : language === 'hi'
          ? `इस समय के सभी स्लॉट भर चुके हैं। कृपया दूसरा समय चुनें।`
          : `All appointment slots for ${selectedSlot} are currently full. Please choose a different time.`
      );
      setShowNoSlotPopup(true);
      return;
    }

    if (!patientName.trim()) {
      alert('Please enter patient name');
      return;
    }

    const res = apiService.createBooking({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      hospitalName: selectedDoctor.hospitalName,
      hospitalAddress: selectedDoctor.address,
      date: selectedDate,
      timeSlot: selectedSlot,
      patientName: patientName.trim(),
      patientAge,
      patientGender,
      patientPhone: currentUser?.phone || '9876543210',
      symptomsBrief: 'OPD Consultation for seasonal health symptoms',
      alarmMinutesBefore: alarmEnabled ? 30 : 0,
    });

    if (res.success && res.appointment) {
      setConfirmedAppt(res.appointment);
      refreshDoctors();
      if (onBookingComplete) {
        onBookingComplete(res.appointment);
      }
    } else {
      setNoSlotMessage(res.errorMessage || t.noSlotPopupMsg);
      setShowNoSlotPopup(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 pb-24 space-y-4">
      {/* Header & Search */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.doctorsTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {t.doctorsSubtitle}
        </p>

        {/* Search Bar */}
        <div className="relative mt-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-doctors"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'te' ? 'డాక్టర్, PHC లేదా గ్రామం పేరుతో శోధించండి...' : language === 'hi' ? 'डॉक्टर, पीएचसी या गांव के नाम से खोजें...' : 'Search doctor, PHC or village...'}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#007ceb]"
          />
        </div>
      </div>

      {/* Google Map Location Network Badge (#13) */}
      <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-3xl p-3 border border-sky-200 text-sky-950 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-sky-100">
            <GoogleMapPin size={22} />
          </div>
          <div className="text-xs">
            <p className="font-extrabold text-slate-900">Google Maps Rural Health Facility Directory</p>
            <p className="text-[11px] text-slate-600">Showing verified Govt PHCs, CHCs & Doctors in your area</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-white text-[#007ceb] rounded-xl text-[10px] font-black border border-sky-200 shrink-0 shadow-2xs">
          GPS Active
        </span>
      </div>

      {/* Doctors List with Exact Star Ratings (#11) & Google Maps Pin (#13) */}
      <div className="space-y-3">
        {filteredDoctors.map((doc) => {
          const totalSlotsLeft = doc.timeSlots.reduce((acc, s) => acc + (s.available ? s.availableSlots : 0), 0);
          
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-md hover:border-[#007ceb] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={doc.photoUrl}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {language === 'te' && doc.nameTe ? doc.nameTe : language === 'hi' && doc.nameHi ? doc.nameHi : doc.name}
                    </h3>
                    
                    {/* Star Marks According to Doctor's Rating (#11) */}
                    <StarRating rating={doc.rating} size="sm" showNumber={true} />
                  </div>

                  <p className="text-xs font-bold text-[#007ceb] mt-0.5">
                    {language === 'te' && doc.specializationTe ? doc.specializationTe : language === 'hi' && doc.specializationHi ? doc.specializationHi : doc.specialization}
                  </p>

                  {/* Google Maps Location Symbol (#13) */}
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                    <GoogleMapPin size={16} />
                    <span>{doc.hospitalName} • {doc.village} ({doc.distanceKm} km away)</span>
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-medium">
                    <span className="text-[#00a651] font-extrabold">
                      {doc.fee === 0 ? t.freeGovt : `₹${doc.fee}`}
                    </span>
                    <span>•</span>
                    <span className={totalSlotsLeft > 0 ? 'text-slate-700 font-bold' : 'text-[#e51b24] font-bold'}>
                      {totalSlotsLeft > 0 ? `${totalSlotsLeft} ${t.slotsRemaining}` : t.noSlotsLeft}
                    </span>
                    <span>•</span>
                    <span>{doc.qualification}</span>
                  </div>
                </div>
              </div>

              {/* Book Appointment CTA */}
              <div className="w-full sm:w-auto flex sm:flex-col items-center gap-2">
                <button
                  id={`btn-book-${doc.id}`}
                  type="button"
                  onClick={() => handleOpenBookingModal(doc)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 active:scale-[0.98] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.bookAppointmentBtn}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Booking Modal Dialog */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8 text-slate-900 relative"
            >
              {!confirmedAppt ? (
                <div>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {selectedDoctor.name}
                        </h3>
                        <StarRating rating={selectedDoctor.rating} size="xs" showNumber={true} />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {selectedDoctor.hospitalName} • {selectedDoctor.fee === 0 ? 'Free Govt OPD' : `₹${selectedDoctor.fee}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(null)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5 mt-3">
                    {/* Patient Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.patientNameLabel} *
                        </label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            value={patientAge}
                            onChange={(e) => setPatientAge(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Gender
                          </label>
                          <select
                            value={patientGender}
                            onChange={(e) => setPatientGender(e.target.value as any)}
                            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Date Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.selectDateLabel}
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="Today, Emergency OPD">Today (Emergency Walk-in)</option>
                        <option value="Tomorrow, Morning Session">Tomorrow (Morning Session)</option>
                        <option value="Day after Tomorrow, Afternoon">Day after Tomorrow (Afternoon)</option>
                      </select>
                    </div>

                    {/* Time Slots with Live Slot Counts (#12) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        {t.selectTimeSlotLabel}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedDoctor.timeSlots.map((slot, idx) => {
                          const isFull = !slot.available || slot.availableSlots <= 0;
                          const isSelected = selectedSlot === slot.time;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSlotSelect(slot)}
                              className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all text-center cursor-pointer ${
                                isSelected && !isFull
                                  ? 'bg-[#007ceb] text-white border-[#007ceb] shadow-xs'
                                  : isFull
                                  ? 'bg-rose-50 border-rose-200 text-rose-500 opacity-80'
                                  : 'bg-white border-slate-200 text-slate-800 hover:bg-sky-50'
                              }`}
                            >
                              <div className="font-bold">{slot.time}</div>
                              <div className={`text-[10px] mt-0.5 ${
                                isFull ? 'text-[#e51b24] font-black' : isSelected ? 'text-white' : 'text-[#00a651] font-bold'
                              }`}>
                                {isFull ? '0 slots (Full)' : `${slot.availableSlots} slots left`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 30-Minute Prior Alarm Reminder Feature (#14) */}
                    <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#007ceb] text-white flex items-center justify-center shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.alarmNoticeTitle}</p>
                          <p className="text-[11px] text-slate-600">{t.alarmNoticeDesc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAlarmEnabled(!alarmEnabled)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          alarmEnabled ? 'bg-[#00a651]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          alarmEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(null)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-confirm-appointment"
                      type="button"
                      onClick={handleConfirmBooking}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#007ceb] to-[#00a651] text-white text-xs font-extrabold hover:opacity-95 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {t.confirmBookingBtn}
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Success View (#14) */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-2 space-y-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#00a651] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {t.bookingSuccessTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Your government PHC appointment has been reserved in the queue.
                    </p>
                  </div>

                  {/* Unique ID Highlight Box */}
                  <div className="p-4 bg-sky-50 rounded-2xl border-2 border-sky-300 text-sky-950 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#007ceb]">
                      {t.uniqueIdLabel}
                    </span>
                    <div className="text-2xl font-black tracking-widest text-sky-800 font-mono">
                      {confirmedAppt.uniqueId}
                    </div>
                    <div className="text-xs font-bold text-slate-700 pt-1">
                      Token Number: #{confirmedAppt.tokenNumber} • {confirmedAppt.timeSlot}
                    </div>
                  </div>

                  {/* 30-Minute Alarm Confirmation Badge (#14) */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4 text-[#00a651]" />
                    <span>⏰ 30-Minute Prior Reminder Alarm is Active!</span>
                  </div>

                  {/* Details Card with Google Maps symbol (#13) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Doctor:</span>
                      <span className="font-bold">{confirmedAppt.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Facility:</span>
                      <span className="font-bold flex items-center gap-1">
                        <GoogleMapPin size={14} />
                        {confirmedAppt.hospitalName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient:</span>
                      <span className="font-bold">{confirmedAppt.patientName} ({confirmedAppt.patientAge}y)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Time:</span>
                      <span className="font-bold">{confirmedAppt.date} @ {confirmedAppt.timeSlot}</span>
                    </div>
                  </div>

                  <button
                    id="btn-done-booking"
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="w-full py-3 bg-gradient-to-r from-[#007ceb] to-[#00a651] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    {t.closeBtn}
                  </button>
                </motion.div>
              )}

              {/* Requirement 12: POPUP DIALOG: "No slots available" with button "OK, Back" */}
              <AnimatePresence>
                {showNoSlotPopup && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 rounded-3xl">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-rose-200"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-[#e51b24] flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-8 h-8" />
                      </div>

                      <h4 className="text-lg font-black text-slate-900 mb-1.5">
                        {t.noSlotPopupTitle || 'No Slots Available!'}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed mb-5">
                        {noSlotMessage || t.noSlotPopupMsg}
                      </p>

                      {/* Button: "OK, Back" (Clicking it vanishes the popup cleanly) */}
                      <button
                        id="btn-no-slot-ok-back"
                        type="button"
                        onClick={() => setShowNoSlotPopup(false)}
                        className="w-full py-2.5 px-5 bg-[#007ceb] hover:bg-sky-700 text-white font-black rounded-2xl text-sm shadow-md transition-all cursor-pointer"
                      >
                        {t.okBackBtn || 'OK, Back'}
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
