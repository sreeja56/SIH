import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Camera, Mic, Check, X, ArrowRight } from 'lucide-react';
import { AppPermissions, Language } from '../types';
import { translations } from '../i18n/translations';
import { GramArogyaLogo } from './common/GramArogyaLogo';
import { GoogleMapPin } from './common/GoogleMapPin';

interface SplashLoadingProps {
  language: Language;
  onComplete: (permissions: AppPermissions) => void;
}

export const SplashLoading: React.FC<SplashLoadingProps> = ({ language, onComplete }) => {
  const t = translations[language];
  const [showPrompt] = useState(true);
  const [locationAllowed, setLocationAllowed] = useState<boolean>(true);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(true);
  const [cameraAllowed, setCameraAllowed] = useState<boolean>(true);
  const [microphoneAllowed, setMicrophoneAllowed] = useState<boolean>(true);

  const handleFinish = (loc: boolean, notif: boolean, cam: boolean, mic: boolean) => {
    // Try requesting actual browser microphone/camera permissions if available
    if (navigator?.mediaDevices?.getUserMedia) {
      if (mic || cam) {
        navigator.mediaDevices.getUserMedia({ 
          audio: mic, 
          video: cam ? { facingMode: 'environment' } : false 
        }).then(stream => {
          // Stop immediately after requesting permission
          stream.getTracks().forEach(track => track.stop());
        }).catch(err => {
          console.log('Permission request handled:', err);
        });
      }
    }

    onComplete({
      locationAllowed: loc,
      notificationsAllowed: notif,
      cameraAllowed: cam,
      microphoneAllowed: mic,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#007ceb] via-[#0284c7] to-[#00a651] text-white p-5 overflow-y-auto">
      {/* Decorative Rural Health Waves */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,25 Q25,50 50,25 T100,25 L100,100 L0,100 Z" fill="white" />
        </svg>
      </div>

      {/* Top Header Platform Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-3 text-center z-10"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white border border-white/30 shadow-xs">
          🇮🇳 Rural Healthcare Platform
        </span>
      </motion.div>

      {/* Center Branding & Logo with uploaded design */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center z-10 my-3"
      >
        <div className="relative mb-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white shadow-2xl flex items-center justify-center p-2 text-sky-600 relative"
          >
            <GramArogyaLogo size="xl" />
          </motion.div>
          <div className="absolute -inset-2 rounded-3xl bg-white/25 animate-ping pointer-events-none" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
          {t.splashTitle}
        </h1>
        <p className="text-xs sm:text-sm text-sky-50 font-semibold mt-1 max-w-xs">
          {t.splashMotto}
        </p>
      </motion.div>

      {/* Permissions Pop-up Dialog (#3, #4, #5) */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            className="w-full max-w-md bg-white rounded-3xl p-5 text-slate-800 shadow-2xl z-20 border border-emerald-100"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100">
                <GoogleMapPin size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                  {t.permissionPromptTitle}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  {t.permissionPromptDesc}
                </p>
              </div>
            </div>

            {/* Permission Toggle Cards (Location, Notification, Camera, Microphone) */}
            <div className="space-y-2 mb-4">
              {/* Location */}
              <div 
                onClick={() => setLocationAllowed(!locationAllowed)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  locationAllowed ? 'bg-sky-50/80 border-sky-300 text-sky-950' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <GoogleMapPin size={18} />
                  <span className="line-clamp-1">{t.locationPerm}</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  locationAllowed ? 'bg-[#007ceb] text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {locationAllowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
              </div>

              {/* Microphone */}
              <div 
                onClick={() => setMicrophoneAllowed(!microphoneAllowed)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  microphoneAllowed ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Mic className={`w-4 h-4 ${microphoneAllowed ? 'text-[#00a651]' : 'text-slate-400'}`} />
                  <span className="line-clamp-1">{t.microphonePerm}</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  microphoneAllowed ? 'bg-[#00a651] text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {microphoneAllowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
              </div>

              {/* Camera */}
              <div 
                onClick={() => setCameraAllowed(!cameraAllowed)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  cameraAllowed ? 'bg-sky-50/80 border-sky-300 text-sky-950' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Camera className={`w-4 h-4 ${cameraAllowed ? 'text-[#007ceb]' : 'text-slate-400'}`} />
                  <span className="line-clamp-1">{t.cameraPerm}</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  cameraAllowed ? 'bg-[#007ceb] text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {cameraAllowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
              </div>

              {/* Notification & Alarm */}
              <div 
                onClick={() => setNotificationsAllowed(!notificationsAllowed)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  notificationsAllowed ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Bell className={`w-4 h-4 ${notificationsAllowed ? 'text-[#00a651]' : 'text-slate-400'}`} />
                  <span className="line-clamp-1">{t.notificationPerm}</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  notificationsAllowed ? 'bg-[#00a651] text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {notificationsAllowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
              </div>
            </div>

            {/* Refined "OK, Continue" Box (#5) */}
            <div className="flex flex-col gap-2">
              <button
                id="btn-ok-continue"
                onClick={() => handleFinish(locationAllowed, notificationsAllowed, cameraAllowed, microphoneAllowed)}
                className="w-full py-3 px-5 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 active:scale-[0.99] text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{t.okContinueBox || 'OK, Continue ➔'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-deny-permissions"
                onClick={() => handleFinish(false, false, false, false)}
                className="w-full py-2 px-3 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors text-center"
              >
                {t.denyOption}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-2 text-center text-[10px] text-sky-100 font-medium z-10">
        curo • Accessible Rural Healthcare & Tele-Triage
      </div>
    </div>
  );
};
