import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Phone, CheckCircle2, KeyRound, AlertCircle, ArrowLeft, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface AuthSignUpProps {
  language: Language;
  onSignUpSuccess: (draftUser: Partial<UserProfile>) => void;
  onBackToLogin: () => void;
  onLanguageChange: (lang: Language) => void;
}

export const AuthSignUp: React.FC<AuthSignUpProps> = ({
  language,
  onSignUpSuccess,
  onBackToLogin,
  onLanguageChange,
}) => {
  const t = translations[language];

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);

  const handleSendOtp = () => {
    setError(null);
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpSent(true);
    setDemoOtpNotice('4829'); // Simulated OTP
  };

  const handleVerifyOtp = () => {
    setError(null);
    if (otpValue === '4829' || otpValue.length === 4 || otpValue.length === 6) {
      setIsOtpVerified(true);
      setError(null);
    } else {
      setError('Invalid OTP code. Please enter 4829 (Demo OTP).');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter a username or patient name.');
      return;
    }

    if (!isOtpVerified) {
      setError('Please verify the mobile OTP first.');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError(t.invalidPinError);
      return;
    }

    if (pin !== confirmPin) {
      setError(t.pinMismatchError);
      return;
    }

    // Pass draft user to Basic Details page
    onSignUpSuccess({
      username: username.trim(),
      phone: phone.trim(),
      pin: pin.trim(),
      language,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-900">
      {/* Top Bar with Language Selector */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <button
          id="btn-back-to-login-top"
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToLogin}</span>
        </button>

        <div className="flex items-center bg-white p-1 rounded-xl shadow-xs border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'en' ? 'bg-sky-600 text-white' : 'text-slate-600'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('te')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'te' ? 'bg-sky-600 text-white' : 'text-slate-600'
            }`}
          >
            తెలుగు
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'hi' ? 'bg-sky-600 text-white' : 'text-slate-600'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Main Signup / Reset Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.signupTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {t.signupSubtitle}
          </p>
        </div>

        {/* Demo OTP Banner */}
        {demoOtpNotice && !isOtpVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{t.otpSentMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setOtpValue('4829')}
              className="px-2.5 py-1 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition-colors"
            >
              Auto-Fill
            </button>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t.usernameLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Ramesh Kumar or ramesh99"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Mobile Number & OTP Verification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t.mobileLabel}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="input-signup-phone"
                  type="tel"
                  maxLength={10}
                  disabled={isOtpVerified}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.mobilePlaceholder}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all disabled:opacity-60"
                  required
                />
              </div>

              {!isOtpVerified && (
                <button
                  id="btn-send-otp"
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3.5 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-2xl text-xs font-bold shrink-0 shadow-sm transition-all"
                >
                  {otpSent ? 'Resend OTP' : t.sendOtpBtn}
                </button>
              )}
            </div>
          </div>

          {/* OTP Input Field */}
          {otpSent && !isOtpVerified && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
            >
              <label className="block text-xs font-bold text-slate-700">
                {t.otpLabel}
              </label>
              <div className="flex gap-2">
                <input
                  id="input-otp-code"
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="Enter 4829"
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center text-base font-black tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <button
                  id="btn-verify-otp"
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {t.verifyOtpBtn}
                </button>
              </div>
            </motion.div>
          )}

          {isOtpVerified && (
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.otpVerifiedMsg}</span>
            </div>
          )}

          {/* 4-Digit PIN Creation */}
          {isOtpVerified && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2 border-t border-slate-100"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  {t.newPinLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="input-create-pin"
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 5678"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center tracking-widest text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  {t.confirmPinLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="input-confirm-pin"
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 5678"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center tracking-widest text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            id="btn-submit-signup"
            type="submit"
            disabled={!isOtpVerified}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
          >
            <span>{t.signupBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            {t.alreadyHaveAccount}{' '}
            <button
              id="btn-return-login"
              type="button"
              onClick={onBackToLogin}
              className="text-sky-600 font-bold hover:underline cursor-pointer ml-1"
            >
              {t.backToLogin}
            </button>
          </p>
        </div>
      </motion.div>

      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-400 py-2">
        curo Public Healthcare Security Framework
      </div>
    </div>
  );
};
