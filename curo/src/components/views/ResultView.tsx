import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Stethoscope, ArrowRight, ShieldAlert, Sparkles, PhoneCall, RefreshCw, Check, X, Home, MessageSquarePlus, FileSpreadsheet } from 'lucide-react';
import { Language, TriageResult, UserProfile } from '../../types';
import { translations } from '../../i18n/translations';

interface ResultViewProps {
  triageResult: TriageResult | null;
  language: Language;
  currentUser: UserProfile | null;
  onConsultDoctorClick: () => void;
  onRetakeConsultation: () => void;
  onGoHome?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  triageResult,
  language,
  currentUser,
  onConsultDoctorClick,
  onRetakeConsultation,
  onGoHome,
}) => {
  const t = translations[language];
  const [detailsConfirmed, setDetailsConfirmed] = useState<boolean | null>(null);
  const [showSummaryPopup, setShowSummaryPopup] = useState<boolean>(true);

  // If no triage report exists yet, show clean empty state (Requirement 5)
  if (!triageResult) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 pb-24 space-y-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-100 text-[#007ceb] flex items-center justify-center shadow-md">
          <FileSpreadsheet className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'te'
              ? 'వైద్య సారాంశ నివేదిక ఇంకా నమోదు కాలేదు'
              : language === 'hi'
              ? 'अभी कोई सारांश रिपोर्ट तैयार नहीं है'
              : 'No Health Summary Generated Yet'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {language === 'te'
              ? 'AI చాట్‌బాట్‌తో మీ లక్షణాలను పంచుకున్న తర్వాత, మీ వైద్య సారాంశ పట్టిక మరియు సూచనలు ఇక్కడ ప్రదర్శించబడతాయి.'
              : language === 'hi'
              ? 'AI चैटबॉट से बातचीत कर अपने लक्षण बताने के बाद, आपकी क्लिनिकल सारांश रिपोर्ट और सलाह यहाँ प्रदर्शित होगी।'
              : 'Your personalized clinical summary table, triage severity, and precautions will appear here immediately after completing a consultation with the AI Healthcare Assistant.'}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onRetakeConsultation}
            className="px-6 py-3.5 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 text-white font-black rounded-2xl text-sm shadow-lg inline-flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>
              {language === 'te'
                ? 'AI వైద్య సహాయకుడితో చాట్ ప్రారంభించండి ➔'
                : language === 'hi'
                ? 'AI स्वास्थ्य सहायक से बात करें ➔'
                : 'Start AI Health Consultation ➔'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  const result = triageResult;
  const isSevere = result.severity === 'severe';
  const isModerate = result.severity === 'moderate';
  const isSafe = result.severity === 'safe';

  const handleConfirmNo = () => {
    setDetailsConfirmed(false);
    setTimeout(() => {
      onRetakeConsultation();
    }, 400);
  };

  const handleConfirmYes = () => {
    setDetailsConfirmed(true);
  };

  const handleGoHomeClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      onRetakeConsultation();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 pb-24 space-y-4">
      {/* Pop-up Message on first viewing report: "Your summarized data is shown here" (#5) */}
      <AnimatePresence>
        {showSummaryPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-sky-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#007ceb] to-[#00a651] text-white flex items-center justify-center mx-auto shadow-md">
                <FileSpreadsheet className="w-7 h-7" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-[#007ceb] text-[10px] font-black uppercase tracking-wider">
                  AI Clinical Triage Complete
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-2 leading-snug">
                  {language === 'te'
                    ? 'మీ సారాంశ వివరాలు ఇక్కడ చూపించబడ్డాయి'
                    : language === 'hi'
                    ? 'आपका सारांश डेटा यहाँ दिखाया गया है'
                    : 'Your summarized data is shown here'}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                  {language === 'te'
                    ? 'మీరు చాట్‌లో తెలిపిన లక్షణాల ఆధారంగా రూపొందించిన క్లినికల్ సారాంశ పట్టిక మరియు వైద్య సూచనలు క్రింద పరిశీలించండి.'
                    : language === 'hi'
                    ? 'चैटबॉट में आपके द्वारा बताए गए लक्षणों के आधार पर तैयार की गई क्लिनिकल सारांश रिपोर्ट नीचे दी गई है।'
                    : 'Your clinical assessment table and priority recommendations have been generated based on your symptoms discussion.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSummaryPopup(false)}
                className="w-full py-3 bg-[#007ceb] hover:bg-sky-700 active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {language === 'te'
                    ? 'సారాంశ నివేదికను చూడండి ➔'
                    : language === 'hi'
                    ? 'सारांश रिपोर्ट देखें ➔'
                    : 'View Summary Report ➔'}
                </span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.resultTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t.resultSubtitle}
          </p>
        </div>

        <button
          id="btn-recheck-symptoms"
          type="button"
          onClick={onRetakeConsultation}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.reCheckSymptoms}</span>
        </button>
      </div>

      {/* 1. SUMMARY TABLE ABOVE (#9) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007ceb]" />
            {t.summaryTableTitle || 'Clinical Summary Table'}
          </h3>
          <span className="text-[11px] font-bold text-slate-500">{result.timestamp}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 w-1/3">{t.colParameter || 'Parameter'}</th>
                <th className="py-2.5 px-4">{t.colDetails || 'Clinical Observation'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-600 bg-slate-50/50">{t.rowPatientName || 'Patient Name'}</td>
                <td className="py-2.5 px-4 font-bold text-slate-900">{result.patientName}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-600 bg-slate-50/50">{t.rowAgeGender || 'Age & Gender'}</td>
                <td className="py-2.5 px-4">{result.patientAge} Years / {result.patientGender}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-600 bg-slate-50/50">{t.rowChiefComplaint || 'Primary Complaint'}</td>
                <td className="py-2.5 px-4 text-[#007ceb] font-bold">{result.chiefComplaint}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-600 bg-slate-50/50">{t.rowDuration || 'Duration'}</td>
                <td className="py-2.5 px-4">{result.durationDays}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-600 bg-slate-50/50">{t.rowSeverity || 'Assessed Severity'}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black text-white ${
                    isSevere ? 'bg-[#e51b24]' : isModerate ? 'bg-amber-500' : 'bg-[#00a651]'
                  }`}>
                    {result.severity.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-600 bg-slate-50/50">{t.rowSuspected || 'Suspected Conditions'}</td>
                <td className="py-2.5 px-4">
                  {result.possibleConditions.map((c, i) => (
                    <div key={i} className="mb-1 last:mb-0">
                      <span className="font-bold text-slate-900">• {c.name}</span>
                      <p className="text-[11px] text-slate-500">{c.description}</p>
                    </div>
                  ))}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-600 bg-slate-50/50">{t.rowRecommended || 'Recommended Action'}</td>
                <td className="py-2.5 px-4 font-semibold text-emerald-800">{result.recommendedAction}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. COLORED ATTENTION BELOW (#9) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-3xl border-2 shadow-lg transition-all ${
          isSevere
            ? 'bg-rose-50 border-[#e51b24] text-rose-950'
            : isModerate
            ? 'bg-amber-50 border-amber-500 text-amber-950'
            : 'bg-emerald-50 border-[#00a651] text-emerald-950'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Severity Icon Badge */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
                isSevere
                  ? 'bg-[#e51b24] animate-pulse'
                  : isModerate
                  ? 'bg-amber-500'
                  : 'bg-[#00a651]'
              }`}
            >
              {isSevere ? (
                <ShieldAlert className="w-7 h-7" />
              ) : isModerate ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {t.attentionSectionTitle || 'Colored Clinical Attention'}
              </span>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {isSevere ? t.severeLevel : isModerate ? t.moderateLevel : t.safeLevel}
              </h3>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shrink-0 ${
              isSevere ? 'bg-[#e51b24]' : isModerate ? 'bg-amber-500' : 'bg-[#00a651]'
            }`}
          >
            {result.severity.toUpperCase()}
          </div>
        </div>

        {/* Action Advice according to severity */}
        <p className="text-xs sm:text-sm font-semibold mt-3.5 pt-3 border-t border-black/10 leading-relaxed">
          {isSevere ? t.severeAdvice : isModerate ? t.moderateAdvice : t.safeAdvice}
        </p>

        {isSevere && (
          <div className="mt-3 flex items-center gap-2">
            <a
              href="tel:108"
              className="px-4 py-2 bg-[#e51b24] hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Dial 108 Emergency Ambulance</span>
            </a>
          </div>
        )}
      </motion.div>

      {/* Safe Home Care & Warning Signs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Home Care */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-md">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#00a651] flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-[#00a651]" />
            <span>{t.homeCareLabel}</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {result.homeCareTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#00a651] font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warning Signs */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-md">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#e51b24] flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-4 h-4 text-[#e51b24]" />
            <span>{t.warningSignsLabel}</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {result.warningSigns.map((sign, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#e51b24] font-bold">•</span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. CONFIRMATION QUESTION: "Are you sure with the details?" (#9, #10) */}
      <div className="bg-white rounded-3xl p-5 border border-sky-200 shadow-md text-center">
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mb-3">
          {t.confirmDetailsQuestion || 'Are you sure with the details?'}
        </h4>

        {detailsConfirmed === true ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 bg-emerald-50 border border-emerald-300 text-[#00a651] font-black rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>{t.detailsConfirmedOk || '✓ OK! Details Confirmed'}</span>
          </motion.div>
        ) : detailsConfirmed === false ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-sky-50 border border-sky-300 text-[#007ceb] font-bold rounded-2xl text-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t.retakeChatNotice || 'Redirecting back to chatbot to continue conversation...'}</span>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            {/* YES button -> shows OK */}
            <button
              id="btn-confirm-details-yes"
              type="button"
              onClick={handleConfirmYes}
              className="min-w-[120px] py-2.5 px-6 bg-[#00a651] hover:bg-emerald-700 active:scale-95 text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.btnYes || 'Yes'}</span>
            </button>

            {/* NO button -> redirects to chatbot interface to continue conversation */}
            <button
              id="btn-confirm-details-no"
              type="button"
              onClick={handleConfirmNo}
              className="min-w-[120px] py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 font-bold rounded-2xl text-sm border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>{t.btnNo || 'No'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. "CONSULT A DOCTOR" BOX (Directs to 3rd Icon: Doctors & Rural PHC Booking) (#9) */}
      <div className="pt-2 flex flex-col items-center space-y-3">
        <button
          id="btn-consult-doctor-cta"
          type="button"
          onClick={onConsultDoctorClick}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 active:scale-[0.99] text-white font-black rounded-3xl text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Stethoscope className="w-5 h-5" />
          <span>{t.consultDoctorCTA || 'Consult a Doctor & Book Slot ➔'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* 5. "NO, THANKS" HYPERTEXT LINK (Directs to Homepage) (#9) */}
        <button
          id="btn-no-thanks-link"
          type="button"
          onClick={handleGoHomeClick}
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-[#007ceb] hover:underline transition-colors flex items-center gap-1 cursor-pointer py-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t.noThanksLink || 'No thanks, return to Home'}</span>
        </button>
      </div>
    </div>
  );
};
