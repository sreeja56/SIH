import React from 'react';
import { User, PhoneCall, ShieldCheck } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { GramArogyaLogo } from './common/GramArogyaLogo';

interface HeaderProps {
  currentUser: UserProfile | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenProfile: () => void;
  onEmergencyCall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  language,
  onLanguageChange,
  onOpenProfile,
  onEmergencyCall,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-6 py-2 sm:py-2.5 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Brand & Uploaded Logo Representation */}
        <div className="flex items-center gap-2 min-w-0">
          <GramArogyaLogo size="md" className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none tracking-tight">
                <span className="text-[#007ceb]">cu</span><span className="text-[#00a651]">ro</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#00a651]" />
                Verified
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs">
              {currentUser?.village ? `${currentUser.village}, ${currentUser.district || ''}` : t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Actions: 108 Emergency Quick Dial, Language Switcher, Profile Avatar - Perfectly fitted in frame */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick 108 Emergency Button */}
          <button
            id="btn-header-emergency-108"
            type="button"
            onClick={onEmergencyCall}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#e51b24] hover:bg-rose-700 text-white rounded-xl text-[11px] sm:text-xs font-black shadow-xs transition-transform active:scale-95 animate-pulse shrink-0"
            title="Emergency 108 Dial"
          >
            <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>108</span>
          </button>

          {/* Quick Language Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold shrink-0">
            <button
              id="header-lang-en"
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all ${
                language === 'en' ? 'bg-[#007ceb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              id="header-lang-te"
              type="button"
              onClick={() => onLanguageChange('te')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all ${
                language === 'te' ? 'bg-[#007ceb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              తె
            </button>
            <button
              id="header-lang-hi"
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all ${
                language === 'hi' ? 'bg-[#007ceb] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हि
            </button>
          </div>

          {/* User Profile Avatar Button - snug fit in frame at right top */}
          <button
            id="btn-open-user-profile"
            type="button"
            onClick={onOpenProfile}
            className="relative w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center text-[#007ceb] font-bold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            title="My Profile & Settings"
          >
            <User className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00a651] border-2 border-white rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};
