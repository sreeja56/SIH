import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Check, Globe, Sparkles, Heart } from 'lucide-react';
import { Gender, Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { apiService } from '../services/api';
import { GoogleMapPin } from './common/GoogleMapPin';
import { GramArogyaLogo } from './common/GramArogyaLogo';

interface BasicDetailsProps {
  draftUser: Partial<UserProfile>;
  initialLanguage: Language;
  onComplete: (user: UserProfile) => void;
  onLanguageChange: (lang: Language) => void;
}

export const BasicDetails: React.FC<BasicDetailsProps> = ({
  draftUser,
  initialLanguage,
  onComplete,
  onLanguageChange,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>(initialLanguage || 'en');
  const t = translations[currentLang];

  const [name, setName] = useState(draftUser.name || draftUser.username || '');
  const [selectedAge, setSelectedAge] = useState<number>(30);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState<boolean>(true);
  const [gender, setGender] = useState<Gender>('male');
  const [village, setVillage] = useState('Rampur Village');
  const [district, setDistrict] = useState('Medak');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [error, setError] = useState<string | null>(null);

  const handleLangSelect = (lang: Language) => {
    setCurrentLang(lang);
    onLanguageChange(lang);
  };

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const fullUser: UserProfile = {
      username: draftUser.username || draftUser.phone || 'patient',
      pin: draftUser.pin || '1234',
      phone: draftUser.phone || draftUser.username || '9876543210',
      name: name.trim(),
      age: selectedAge,
      gender,
      language: currentLang,
      village: village.trim() || 'Rural Village',
      district: district.trim() || 'Medak',
      bloodGroup,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to durable storage / backend for future logins
    apiService.saveUser(fullUser);
    onComplete(fullUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-900">
      {/* Top Header with 3-Language Selector & Brand */}
      <div className="max-w-xl w-full mx-auto pt-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <GramArogyaLogo size={36} />
          <span className="text-lg font-black text-slate-900 tracking-tight">
            <span className="text-[#007ceb]">cu</span><span className="text-[#00a651]">ro</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-md border border-slate-100 mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#007ceb]">
            <Globe className="w-4 h-4 text-[#007ceb]" />
            <span>{t.selectLanguageHeader}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* English */}
            <button
              id="lang-btn-en"
              type="button"
              onClick={() => handleLangSelect('en')}
              className={`py-2 px-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-[#007ceb] border-[#007ceb] text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>English</span>
              {currentLang === 'en' && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Telugu */}
            <button
              id="lang-btn-te"
              type="button"
              onClick={() => handleLangSelect('te')}
              className={`py-2 px-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                currentLang === 'te'
                  ? 'bg-[#007ceb] border-[#007ceb] text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>తెలుగు (Telugu)</span>
              {currentLang === 'te' && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Hindi */}
            <button
              id="lang-btn-hi"
              type="button"
              onClick={() => handleLangSelect('hi')}
              className={`py-2 px-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                currentLang === 'hi'
                  ? 'bg-[#007ceb] border-[#007ceb] text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>हिन्दी (Hindi)</span>
              {currentLang === 'hi' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full mx-auto my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100"
      >
        <div className="mb-6">
          <span className="px-3 py-1 bg-sky-100 text-[#007ceb] text-xs font-bold rounded-full inline-flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Step 2: Profile Registration
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.detailsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {t.detailsSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveAndProceed} className="space-y-4">
          {/* Full Name Input Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t.fullNameLabel} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-fullname"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007ceb] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Scrolling Age Selector with OK Confirmation */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t.ageLabel}
              </label>
              <div className="flex items-center gap-1 text-xs font-black text-[#007ceb] bg-sky-100 px-2.5 py-1 rounded-xl">
                <span>{selectedAge} Years Old</span>
                {isAgeConfirmed && <Check className="w-3.5 h-3.5 text-[#00a651]" />}
              </div>
            </div>

            {/* Horizontal Scrolling Wheel / Picker */}
            <div className="relative flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-sky-200">
              {Array.from({ length: 90 }, (_, i) => i + 1).map((ageVal) => (
                <button
                  key={ageVal}
                  type="button"
                  onClick={() => {
                    setSelectedAge(ageVal);
                    setIsAgeConfirmed(false);
                  }}
                  className={`min-w-11 h-11 rounded-2xl font-bold text-sm flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    selectedAge === ageVal
                      ? 'bg-[#007ceb] text-white scale-110 shadow-md font-black ring-2 ring-sky-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {ageVal}
                </button>
              ))}
            </div>

            {/* OK Button for Age */}
            <div className="mt-2 flex items-center justify-end">
              <button
                id="btn-confirm-age-ok"
                type="button"
                onClick={() => setIsAgeConfirmed(true)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isAgeConfirmed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-[#007ceb] text-white shadow-xs hover:bg-sky-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAgeConfirmed ? 'Age Confirmed (OK)' : t.confirmAgeBtn}</span>
              </button>
            </div>
          </div>

          {/* Animated Gender Selection Cards (Male, Female, Other) with OK */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              {t.selectGenderLabel} *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Male Card with Illustration */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setGender('male')}
                className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col items-center text-center transition-all ${
                  gender === 'male'
                    ? 'bg-sky-50 border-[#007ceb] text-sky-950 shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-2xl mb-1.5 shadow-xs">
                  👨‍🌾
                </div>
                <span className="text-xs font-black leading-tight">Male</span>
                <span className="text-[10px] text-slate-500 font-medium">పురుషుడు / पुरुष</span>
                {gender === 'male' && (
                  <span className="mt-1 px-2 py-0.5 bg-[#007ceb] text-white text-[10px] font-bold rounded-full">
                    OK ✓
                  </span>
                )}
              </motion.div>

              {/* Female Card with Illustration */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setGender('female')}
                className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col items-center text-center transition-all ${
                  gender === 'female'
                    ? 'bg-rose-50 border-[#e51b24] text-rose-950 shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-2xl mb-1.5 shadow-xs">
                  👩‍🌾
                </div>
                <span className="text-xs font-black leading-tight">Female</span>
                <span className="text-[10px] text-slate-500 font-medium">స్త్రీ / महिला</span>
                {gender === 'female' && (
                  <span className="mt-1 px-2 py-0.5 bg-[#e51b24] text-white text-[10px] font-bold rounded-full">
                    OK ✓
                  </span>
                )}
              </motion.div>

              {/* Other Card with Illustration */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setGender('other')}
                className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col items-center text-center transition-all ${
                  gender === 'other'
                    ? 'bg-emerald-50 border-[#00a651] text-emerald-950 shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl mb-1.5 shadow-xs">
                  🧑
                </div>
                <span className="text-xs font-black leading-tight">Other</span>
                <span className="text-[10px] text-slate-500 font-medium">ఇతర / अन्य</span>
                {gender === 'other' && (
                  <span className="mt-1 px-2 py-0.5 bg-[#00a651] text-white text-[10px] font-bold rounded-full">
                    OK ✓
                  </span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Location & Blood Group info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                {t.villageLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <GoogleMapPin size={16} />
                </div>
                <input
                  id="input-village"
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={t.villagePlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Blood Group (రక్త వర్గం)
              </label>
              <select
                id="select-blood-group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900"
              >
                <option value="O+">O+ (Positive)</option>
                <option value="A+">A+ (Positive)</option>
                <option value="B+">B+ (Positive)</option>
                <option value="AB+">AB+ (Positive)</option>
                <option value="O-">O- (Universal Donor)</option>
                <option value="A-">A- (Negative)</option>
                <option value="B-">B- (Negative)</option>
                <option value="AB-">AB- (Negative)</option>
              </select>
            </div>
          </div>

          {/* Submit Details & Proceed to Home */}
          <button
            id="btn-save-details-submit"
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 text-white font-black rounded-2xl text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-white text-white" />
            <span>{t.saveDetailsBtn}</span>
          </button>
        </form>
      </motion.div>

      <div className="max-w-xl w-full mx-auto text-center text-xs text-slate-400 py-2">
        Data stored securely in curo public health ledger.
      </div>
    </div>
  );
};
