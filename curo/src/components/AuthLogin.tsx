import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { apiService } from '../services/api';
import { GramArogyaLogo } from './common/GramArogyaLogo';

interface AuthLoginProps {
  language: Language;
  onLoginSuccess: (user: UserProfile) => void;
  onForgotPasswordClick: () => void;
  onSignUpClick: () => void;
  onLanguageChange: (lang: Language) => void;
}

export const AuthLogin: React.FC<AuthLoginProps> = ({
  language,
  onLoginSuccess,
  onForgotPasswordClick,
  onSignUpClick,
  onLanguageChange,
}) => {
  const t = translations[language];
  const [username, setUsername] = useState('9876543210');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanPin = pin.trim();

    if (!cleanUsername) {
      setError(t.invalidUserError);
      return;
    }

    if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      setError(t.invalidPinError);
      return;
    }

    const user = apiService.findUser(cleanUsername);
    if (user) {
      if (user.pin === cleanPin) {
        apiService.setCurrentUser(user);
        onLoginSuccess(user);
      } else {
        setError(t.invalidPinError);
      }
    } else {
      setError(t.invalidUserError);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between p-4 sm:p-6 text-slate-900">
      {/* Top Bar with Language Switcher */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <GramArogyaLogo size="sm" showText={true} />

        {/* 3 Languages Switcher */}
        <div className="flex items-center bg-white p-1 rounded-xl shadow-xs border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'en' ? 'bg-[#007ceb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('te')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'te' ? 'bg-[#007ceb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            తెలుగు
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'hi' ? 'bg-[#007ceb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-sky-100">
            <GramArogyaLogo size="md" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.loginTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t.usernameLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007ceb] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* 4-Digit PIN Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t.pinLabel}
              </label>
              {/* Forgot Password Hyperlink */}
              <button
                id="btn-forgot-password-link"
                type="button"
                onClick={onForgotPasswordClick}
                className="text-xs font-bold text-[#007ceb] hover:underline transition-colors cursor-pointer"
              >
                {t.forgotPassword}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="input-login-pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 4) setPin(val);
                }}
                placeholder={t.pinPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg tracking-widest font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007ceb] focus:bg-white transition-all text-center"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Demo PIN: 1234</p>
          </div>

          {/* Decreased Login Button (#2) */}
          <div className="pt-2 flex justify-center">
            <button
              id="btn-submit-login"
              type="submit"
              className="w-4/5 py-2.5 px-5 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 active:scale-[0.98] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Sign Up Redirect */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            {t.newUserPrompt}{' '}
            <button
              id="btn-goto-signup"
              type="button"
              onClick={onSignUpClick}
              className="text-[#007ceb] font-bold hover:underline cursor-pointer ml-1"
            >
              {t.signUpLink}
            </button>
          </p>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-400 py-2">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00a651]" />
          Government PHC Tele-Triage & Digital OPD Network
        </span>
      </div>
    </div>
  );
};
