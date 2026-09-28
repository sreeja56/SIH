import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Keyboard, Send, Volume2, Sparkles, AlertTriangle, ArrowRight, Stethoscope, RefreshCw, Activity, Droplets, Heart } from 'lucide-react';
import { ChatMessage, Language, UserProfile, TriageResult } from '../../types';
import { translations } from '../../i18n/translations';
import { voiceService } from '../../services/speech';
import { apiService } from '../../services/api';
import { HeartRateMonitor } from '../HeartRateMonitor';

interface HomeChatViewProps {
  currentUser: UserProfile | null;
  language: Language;
  onTriageComplete: (result: TriageResult) => void;
}

export const HomeChatView: React.FC<HomeChatViewProps> = ({
  currentUser,
  language,
  onTriageComplete,
}) => {
  const t = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showHeartRate, setShowHeartRate] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when user changes or loads
  useEffect(() => {
    let welcomeText = '';
    const patientSalutation = currentUser?.name ? `${currentUser.name}! ` : '';
    if (language === 'te') {
      welcomeText = `నమస్కారం ${patientSalutation}నేను డాక్టర్ క్యూరో (Dr. Curo), మీ వాయిస్ అసిస్టెంట్. మీకు బీపీ, షుగర్, విరేచనాలు (డయేరియా) లేదా ఇతర ఎలాంటి సమస్య ఉన్నా మైక్రోఫోన్ నొక్కి మాట్లాడండి లేదా టైప్ చేయండి.`;
    } else if (language === 'hi') {
      welcomeText = `नमस्ते ${patientSalutation}मैं डॉ. क्यूरो (Dr. Curo), आपका वॉइस असिस्टेंट हूँ। आपको बीपी, शुगर, दस्त (डायरिया) या कोई अन्य समस्या हो तो माइक्रोफ़ोन दबाकर बोलें या लिखें।`;
    } else {
      welcomeText = `Hello, I'm Dr. Curo, your voice assistant. ${patientSalutation ? `Welcome ${currentUser?.name}! ` : ''}If you have concerns about BP, Sugar/Diabetes, Diarrhoea, or other symptoms, tap the microphone to speak or type below.`;
    }

    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: welcomeText,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([initialMsg]);
  }, [language, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isProcessing) return;

    setInputText('');
    setVoiceError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsProcessing(true);

    try {
      const reply = await apiService.sendChatMessage(text, newHistory, language, currentUser);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = async () => {
    setVoiceError(null);
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      // Explicitly request media devices microphone permission (#4)
      if (navigator?.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn('Microphone permission warning:', e);
        }
      }

      const started = voiceService.startListening(
        language,
        (transcript, isFinal) => {
          if (isFinal) {
            handleSendMessage(transcript);
            setIsListening(false);
          } else {
            setInputText(transcript);
          }
        },
        (errorMsg) => {
          setIsListening(false);
          setVoiceError(`${t.voiceNotSupported} (${errorMsg})`);
        },
        () => {
          setIsListening(false);
        }
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  const handleGenerateReport = async () => {
    if (generatingReport) return;
    setGeneratingReport(true);

    try {
      const result = await apiService.analyzeTriage(messages, language, currentUser);
      onTriageComplete(result);
    } catch (e) {
      console.error('Error generating report', e);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleQuickSymptom = (symptomText: string) => {
    handleSendMessage(symptomText);
  };

  const handleSpeechSpeak = (text: string) => {
    voiceService.speak(text, language);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-2xl mx-auto px-3 sm:px-4 py-2">
      {/* Top Header / Triage Banner */}
      <div className="bg-gradient-to-r from-[#007ceb] via-[#0284c7] to-[#00a651] rounded-2xl p-3 text-white shadow-md mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black leading-tight">{t.voiceAssistantTitle}</h2>
            <p className="text-[11px] text-sky-50 font-medium leading-tight">
              {messages.length > 2 ? `${messages.length} responses evaluated` : t.voiceAssistantDesc}
            </p>
          </div>
        </div>

        {/* Generate Report Button when user has sent at least one symptom */}
        {messages.length >= 2 && (
          <button
            id="btn-generate-report-top"
            type="button"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="px-3 py-1.5 bg-[#00a651] hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1 shrink-0 transition-transform active:scale-95 animate-pulse cursor-pointer"
          >
            {generatingReport ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            )}
            <span>{language === 'te' ? 'నివేదిక' : language === 'hi' ? 'रिपोर्ट' : 'Report'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Common Rural Symptoms Chips - Includes BP, Sugar, Diarrhoea (#6) */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            {t.quickSymptoms}
          </span>
          
          {/* BP Option (#6) */}
          <button
            id="btn-quick-bp"
            type="button"
            onClick={() => handleQuickSymptom(language === 'te' ? 'నాకు రక్తపోటు (BP) సమస్యగా ఉంది. మైకం, తలనొప్పి వస్తోంది.' : language === 'hi' ? 'मुझे ब्लड प्रेशर (BP) की समस्या है, चक्कर आ रहे हैं।' : 'I have high/low Blood Pressure (BP) symptoms with dizziness.')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full font-bold shrink-0 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-[#e51b24]" />
            <span>{t.symptomBp}</span>
          </button>

          {/* Heart Rate Monitor */}
          <button
            id="btn-heart-rate"
            type="button"
            onClick={() => setShowHeartRate(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full font-bold shrink-0 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-[#e51b24]" />
            <span>{t.heartRateBtn}</span>
          </button>

          {/* Sugar Option (#6) */}
          <button
            id="btn-quick-sugar"
            type="button"
            onClick={() => handleQuickSymptom(language === 'te' ? 'నాకు షుగర్ / డయాబెటిస్ ఉంది. నీరసం, తరచూ మూత్రం వస్తోంది.' : language === 'hi' ? 'मुझे शुगर / डायबिटीज है, कमजोरी और ज्यादा प्यास लग रही है।' : 'I am experiencing high Blood Sugar / Diabetes symptoms, extreme thirst and fatigue.')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-full font-bold shrink-0 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.symptomSugar}</span>
          </button>

          {/* Diarrhoea Option (#6) */}
          <button
            id="btn-quick-diarrhoea"
            type="button"
            onClick={() => handleQuickSymptom(language === 'te' ? 'నాకు విరేచనాలు (డయేరియా/మోషన్స్) మరియు డీహైడ్రేషన్ ఉంది.' : language === 'hi' ? 'मुझे दस्त (डायरिया / लूज मोशन) और उल्टी की समस्या है।' : 'I am having acute Diarrhoea, loose motions and severe dehydration.')}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-full font-bold shrink-0 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 text-[#007ceb]" />
            <span>{t.symptomDiarrhoea}</span>
          </button>

          {/* Fever */}
          <button
            type="button"
            onClick={() => handleQuickSymptom(t.symptomFever)}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full font-semibold shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            {t.symptomFever}
          </button>

          {/* Cough */}
          <button
            type="button"
            onClick={() => handleQuickSymptom(t.symptomCough)}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full font-semibold shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            {t.symptomCough}
          </button>

          {/* Stomach */}
          <button
            type="button"
            onClick={() => handleQuickSymptom(t.symptomStomach)}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full font-semibold shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            {t.symptomStomach}
          </button>
        </div>
      </div>

      {/* Voice Error Notice */}
      {voiceError && (
        <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white rounded-3xl border border-slate-100 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#007ceb] to-[#00a651] flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-xs ring-1 ring-sky-200" title="Dr. Curo AI Assistant">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[84%] sm:max-w-[78%] rounded-3xl p-3.5 shadow-xs ${
                  isUser
                    ? 'bg-[#007ceb] text-white rounded-br-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-black/5 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleSpeechSpeak(msg.text)}
                      className="p-1 rounded-md hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 font-bold cursor-pointer"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'వినండి' : language === 'hi' ? 'सुनें' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#00a651] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
              )}
            </motion.div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold p-2">
            <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center animate-spin">
              <RefreshCw className="w-3.5 h-3.5 text-[#007ceb]" />
            </div>
            <span>{t.thinkingAi}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action to Generate Summary Report */}
      {messages.length >= 2 && (
        <div className="mt-2 text-center">
          <button
            id="btn-generate-report-bottom"
            type="button"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="w-full py-2.5 bg-gradient-to-r from-[#007ceb] to-[#00a651] hover:opacity-95 active:scale-[0.99] text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {generatingReport ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-200" />
            )}
            <span>{t.generateReportBtn}</span>
          </button>
        </div>
      )}

      {/* Voice Assistant Controls & Microphone Logo (#7) */}
      <div className="mt-2 bg-white p-2.5 rounded-3xl border border-slate-200 shadow-md">
        {/* Toggle between Voice Mic Mode and Keyboard Input */}
        <div className="flex items-center justify-between mb-1 px-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            {isListening ? (
              <span className="flex items-center gap-1.5 text-[#e51b24] animate-pulse font-extrabold">
                <span className="w-2 h-2 rounded-full bg-[#e51b24] animate-ping" />
                {t.listeningPrompt}
              </span>
            ) : (
              <span>Voice / Keyboard AI Assistant</span>
            )}
          </div>

          <button
            id="btn-toggle-keyboard"
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="text-[11px] font-bold text-[#007ceb] hover:text-sky-800 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-sky-50 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{showKeyboard ? t.keyboardToggleVoice : t.keyboardToggleShow}</span>
          </button>
        </div>

        {/* Keyboard Input Bar */}
        <AnimatePresence>
          {showKeyboard ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                id="input-chat-text"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.typeMessagePlaceholder}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#007ceb] focus:bg-white"
              />
              <button
                id="btn-send-message"
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="p-2.5 bg-[#007ceb] hover:bg-sky-700 disabled:opacity-50 text-white rounded-2xl shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            /* Primary Voice Microphone Button with Clean Studio Microphone Logo (#7) */
            <div className="flex flex-col items-center justify-center py-1.5">
              <motion.button
                id="btn-voice-mic"
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={toggleListening}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                  isListening
                    ? 'bg-[#e51b24] text-white ring-8 ring-rose-200 animate-pulse'
                    : 'bg-gradient-to-tr from-[#007ceb] to-[#00a651] text-white hover:opacity-95 shadow-md'
                }`}
              >
                {/* Clean Professional Microphone Logo Icon (#7) */}
                {isListening ? (
                  <MicOff className="w-7 h-7 animate-bounce" />
                ) : (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" fillOpacity="0.2" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                    <line x1="8" x2="16" y1="22" y2="22" />
                  </svg>
                )}
                {isListening && (
                  <span className="absolute -inset-2 rounded-full border-2 border-rose-400 animate-ping pointer-events-none" />
                )}
              </motion.button>
              <span className="text-xs font-bold text-slate-700 mt-1.5">
                {isListening ? t.stopVoiceBtn : t.startVoiceBtn}
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
      {showHeartRate && (
        <HeartRateMonitor
          language={language}
          onClose={() => setShowHeartRate(false)}
        />
      )}

    </div>
  );
};
