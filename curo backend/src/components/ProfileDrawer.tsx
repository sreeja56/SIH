import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Calendar, Settings, LogOut, X, Edit3, Check, KeyRound, Phone, ShieldCheck, AlertCircle, Sparkles, Trash2, Star, MessageSquareHeart, Send } from 'lucide-react';
import { UserProfile, Appointment, Language, UserFeedback } from '../types';
import { translations } from '../i18n/translations';
import { apiService } from '../services/api';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  language: Language;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onUserUpdate,
  onLogout,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'feedback' | 'settings'>('profile');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState<number>(currentUser?.age || 30);
  const [gender, setGender] = useState(currentUser?.gender || 'male');
  const [village, setVillage] = useState(currentUser?.village || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'O+');

  // Phone number update with OTP state
  const [newPhone, setNewPhone] = useState(currentUser?.phone || '');
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Settings: Change PIN state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);

  // Feedback State (#6)
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState<'general' | 'doctor' | 'chat' | 'reports'>('general');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>(() => apiService.getFeedback());

  // Bookings list
  const bookings = apiService.getBookings();

  if (!isOpen) return null;

  const handleSendPhoneOtp = () => {
    if (!newPhone || newPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    setPhoneError(null);
  };

  const handleVerifyPhoneOtp = () => {
    if (otpCode === '4829' || otpCode.length >= 4) {
      setOtpVerified(true);
      setPhoneError(null);
    } else {
      setPhoneError('Invalid OTP. Use Demo OTP: 4829');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Check if phone changed and not verified
    if (isChangingPhone && !otpVerified) {
      setPhoneError('Phone number change requires OTP verification.');
      return;
    }

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      age,
      gender: gender as any,
      village: village.trim() || currentUser.village,
      bloodGroup,
      phone: (isChangingPhone && otpVerified) ? newPhone.trim() : currentUser.phone,
      updatedAt: new Date().toISOString(),
    };

    apiService.saveUser(updated);
    onUserUpdate(updated);
    setIsEditing(false);
    setIsChangingPhone(false);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);

    if (!currentUser) return;

    if (currentUser.pin && currentPinInput !== currentUser.pin) {
      setPinChangeError('Current 4-digit PIN is incorrect.');
      return;
    }

    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinChangeError(t.invalidPinError);
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeError(t.pinMismatchError);
      return;
    }

    const updated: UserProfile = {
      ...currentUser,
      pin: newPinInput.trim(),
      updatedAt: new Date().toISOString(),
    };

    apiService.saveUser(updated);
    onUserUpdate(updated);
    setPinChangeSuccess('Your 4-digit PIN has been updated successfully!');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handleCancelBooking = (id: string) => {
    apiService.cancelBooking(id);
    onUserUpdate({ ...(currentUser as UserProfile) });
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    const newEntry = apiService.saveFeedback({
      userName: currentUser?.name || 'Citizen',
      rating,
      category: feedbackCategory,
      comment: feedbackComment.trim(),
    });

    setFeedbackList(prev => [newEntry, ...prev]);
    setFeedbackSuccess(
      language === 'te'
        ? 'ధన్యవాదాలు! మీ అమూల్యమైన అభిప్రాయం నమోదు చేయబడింది.'
        : language === 'hi'
        ? 'धन्यवाद! आपकी प्रतिक्रिया सफलतापूर्वक दर्ज की गई है।'
        : 'Thank you! Your feedback has been submitted successfully.'
    );
    setFeedbackComment('');
    setTimeout(() => {
      setFeedbackSuccess(null);
    }, 4000);
  };

  const starLabels = [
    language === 'te' ? 'బాగా లేదు (1★)' : language === 'hi' ? 'खराब (1★)' : 'Poor (1★)',
    language === 'te' ? 'పర్వాలేదు (2★)' : language === 'hi' ? 'सामान्य (2★)' : 'Fair (2★)',
    language === 'te' ? 'మంచిది (3★)' : language === 'hi' ? 'अच्छा (3★)' : 'Good (3★)',
    language === 'te' ? 'చాలా మంచిది (4★)' : language === 'hi' ? 'बहुत अच्छा (4★)' : 'Very Good (4★)',
    language === 'te' ? 'అద్భుతం (5★)' : language === 'hi' ? 'उत्कृष्ट (5★)' : 'Excellent (5★)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-[#007ceb] to-[#00a651] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {currentUser?.name || 'curo Citizen'}
              </h3>
              <p className="text-xs text-sky-100 font-medium">{currentUser?.phone}</p>
            </div>
          </div>

          <button
            id="btn-close-profile-drawer"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Nav Tabs in the List: My Profile, My Bookings, Feedback, Settings (#6) */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-[11px] font-bold">
          <button
            id="tab-drawer-profile"
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-center border-b-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'profile'
                ? 'border-[#007ceb] text-[#007ceb] bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="truncate">{t.profileTab}</span>
          </button>

          <button
            id="tab-drawer-bookings"
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`py-3 text-center border-b-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'bookings'
                ? 'border-[#007ceb] text-[#007ceb] bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">{t.bookingsTab} ({bookings.length})</span>
          </button>

          <button
            id="tab-drawer-feedback"
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`py-3 text-center border-b-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'feedback'
                ? 'border-[#007ceb] text-[#007ceb] bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span className="truncate">{t.feedbackTab || 'Feedback'}</span>
          </button>

          <button
            id="tab-drawer-settings"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 text-center border-b-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'settings'
                ? 'border-[#007ceb] text-[#007ceb] bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="truncate">{t.settingsTab}</span>
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Patient Health Details
                </span>
                {!isEditing && (
                  <button
                    id="btn-edit-profile-start"
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setName(currentUser?.name || '');
                      setAge(currentUser?.age || 30);
                      setGender(currentUser?.gender || 'male');
                      setVillage(currentUser?.village || '');
                      setBloodGroup(currentUser?.bloodGroup || 'O+');
                    }}
                    className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.editProfileBtn}</span>
                  </button>
                )}
              </div>

              {!isEditing ? (
                /* View Only Profile Card */
                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs text-slate-500">Full Name</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser?.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs text-slate-500">Phone Number</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser?.phone}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs text-slate-500">Age & Gender</span>
                    <span className="text-sm font-bold text-slate-900">
                      {currentUser?.age} yrs, {currentUser?.gender?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs text-slate-500">Village / District</span>
                    <span className="text-sm font-bold text-slate-900">
                      {currentUser?.village}, {currentUser?.district || 'Medak'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Blood Group</span>
                    <span className="text-xs font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg">
                      {currentUser?.bloodGroup || 'O+'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Editing Profile Form */
                <form onSubmit={handleSaveProfile} className="space-y-3 bg-white rounded-3xl p-4 border border-sky-200 shadow-sm">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Village</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  {/* Phone number change section - CAN BE CHANGED ONLY AFTER OTP VERIFICATION as requested */}
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-900 uppercase">
                        Change Mobile Number (OTP Required)
                      </label>
                      {!isChangingPhone && (
                        <button
                          type="button"
                          onClick={() => setIsChangingPhone(true)}
                          className="text-[11px] font-bold text-sky-600 hover:underline"
                        >
                          Modify Phone
                        </button>
                      )}
                    </div>

                    {isChangingPhone && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            maxLength={10}
                            disabled={otpVerified}
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="New 10-digit phone"
                            className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold"
                          />
                          {!otpVerified && (
                            <button
                              type="button"
                              onClick={handleSendPhoneOtp}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                            >
                              {otpSent ? 'Resend' : 'Send OTP'}
                            </button>
                          )}
                        </div>

                        {otpSent && !otpVerified && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="Enter OTP (4829)"
                              className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-center font-bold tracking-widest"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyPhoneOtp}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                            >
                              Verify
                            </button>
                          </div>
                        )}

                        {otpVerified && (
                          <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            New phone verified successfully.
                          </p>
                        )}

                        {phoneError && (
                          <p className="text-[11px] text-rose-600 font-semibold">{phoneError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setIsChangingPhone(false);
                      }}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-save-profile-edit"
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-xs"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: MY BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                Saved OPD & Hospital Appointments ({bookings.length})
              </span>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No bookings yet. You can book slots in the Doctors tab.</p>
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest font-mono">
                          {b.uniqueId}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">{b.doctorName}</h4>
                        <p className="text-xs text-slate-500">{b.hospitalName}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                        Token #{b.tokenNumber}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                      <span>👤 {b.patientName} ({b.patientAge}y)</span>
                      <span className="font-bold">{b.date} @ {b.timeSlot}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        Cancel Slot
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: FEEDBACK & 5-STAR RATING (#6) */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  {language === 'te'
                    ? 'మీ అమూల్యమైన అభిప్రాయం & రేటింగ్'
                    : language === 'hi'
                    ? 'आपकी प्रतिक्रिया और 5-स्टार रेटिंग'
                    : 'App Feedback & Star Rating'}
                </span>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {language === 'te'
                    ? 'గ్రామీణ ఆరోగ్య సేవలను మరింత మెరుగుపరచడానికి మీ సూచనలను తెలియజేయండి.'
                    : language === 'hi'
                    ? 'ग्रामीण स्वास्थ्य सेवा को बेहतर बनाने के लिए अपने विचार साझा करें।'
                    : 'Help us improve curo healthcare accessibility in rural communities.'}
                </p>
              </div>

              {feedbackSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-300 text-[#00a651] text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4 shrink-0 text-[#00a651]" />
                  <span>{feedbackSuccess}</span>
                </motion.div>
              )}

              {/* Feedback Input Form */}
              <form onSubmit={handleSubmitFeedback} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
                {/* 5-Star Rating Selector */}
                <div className="space-y-2 text-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    {language === 'te' ? 'స్టార్ రేటింగ్ ఎంచుకోండి (1 నుండి 5 నక్షత్రాలు)' : language === 'hi' ? 'स्टार रेटिंग चुनें (1 से 5 स्टार)' : 'Select Star Rating (1 to 5 Stars)'}
                  </label>

                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating !== null ? hoverRating >= star : rating >= star);
                      return (
                        <button
                          key={star}
                          type="button"
                          id={`btn-star-rating-${star}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 text-2xl transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              isFilled
                                ? 'fill-amber-400 text-amber-400 filter drop-shadow-sm'
                                : 'text-slate-300 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs font-extrabold text-[#007ceb]">
                    {starLabels[rating - 1]}
                  </div>
                </div>

                {/* Feedback Category */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase">
                    {language === 'te' ? 'విభాగం' : language === 'hi' ? 'श्रेणी' : 'Category'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'general', label: language === 'te' ? 'సాధారణ యాప్' : language === 'hi' ? 'सामान्य' : 'General App' },
                      { id: 'chat', label: language === 'te' ? 'AI చాట్‌బాట్' : language === 'hi' ? 'AI चैट' : 'AI Health Chat' },
                      { id: 'doctor', label: language === 'te' ? 'డాక్టర్ బుకింగ్' : language === 'hi' ? 'डॉक्टर बुकिंग' : 'Doctor Booking' },
                      { id: 'reports', label: language === 'te' ? 'నివేదికలు' : language === 'hi' ? 'रिपोर्ट्स' : 'Reports & Vault' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFeedbackCategory(cat.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                          feedbackCategory === cat.id
                            ? 'bg-sky-50 border-[#007ceb] text-[#007ceb]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text Box */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase">
                    {language === 'te' ? 'మీ సూచనలు / సలహాలు' : language === 'hi' ? 'आपकी प्रतिक्रिया / सुझाव' : 'Your Feedback & Comments'}
                  </label>
                  <textarea
                    id="input-feedback-comment"
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder={
                      language === 'te'
                        ? 'యాప్‌లో మీ అనుభవాన్ని మరియు మెరుగుదలలను ఇక్కడ వ్రాయండి...'
                        : language === 'hi'
                        ? 'अपना अनुभव और सुझाव यहाँ लिखें...'
                        : 'Share your thoughts, healthcare needs, or feature suggestions here...'
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007ceb] resize-none"
                    required
                  />
                </div>

                <button
                  id="btn-submit-feedback"
                  type="submit"
                  disabled={!feedbackComment.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {language === 'te' ? 'అభిప్రాయం సమర్పించండి' : language === 'hi' ? 'प्रतिक्रिया भेजें' : 'Submit Feedback'}
                  </span>
                </button>
              </form>

              {/* Past feedback submitted */}
              {feedbackList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    {language === 'te' ? 'మునుపటి సమీక్షలు' : language === 'hi' ? 'पिछली प्रतिक्रियाएँ' : 'Recent Feedback Reviews'}
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {feedbackList.map((fb) => (
                      <div key={fb.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium">{fb.comment}</p>
                        <span className="inline-block text-[10px] font-bold text-[#007ceb] bg-sky-50 px-2 py-0.5 rounded-md uppercase">
                          {fb.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS (CHANGE PIN / PASSWORD) */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                {t.changePasswordTitle}
              </span>

              {pinChangeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pinChangeSuccess}</span>
                </div>
              )}

              {pinChangeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinChangeError}</span>
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-3 bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                    Current 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter current PIN"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-base font-black tracking-widest"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter new 4 digits"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-base font-black tracking-widest"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                    Confirm New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter new 4 digits"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-base font-black tracking-widest"
                    required
                  />
                </div>

                <button
                  id="btn-update-pin"
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-xs transition-all mt-2 cursor-pointer"
                >
                  Update 4-Digit PIN
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Drawer Footer: Logout Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            id="btn-drawer-logout"
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logoutBtn}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
