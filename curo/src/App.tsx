/**
 * curo - Accessible Rural Public Healthcare & Dr. Curo AI Tele-Triage
 */

import React, { useState, useEffect } from 'react';
import { SplashLoading } from './components/SplashLoading';
import { AuthLogin } from './components/AuthLogin';
import { AuthSignUp } from './components/AuthSignUp';
import { BasicDetails } from './components/BasicDetails';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeChatView } from './components/views/HomeChatView';
import { ResultView } from './components/views/ResultView';
import { DoctorsView } from './components/views/DoctorsView';
import { DocumentsView } from './components/views/DocumentsView';
import { HelplinesView } from './components/views/HelplinesView';
import { ProfileDrawer } from './components/ProfileDrawer';
import { Language, TabId, UserProfile, TriageResult, AppPermissions } from './types';
import { apiService } from './services/api';
import { PhoneCall, X, ShieldAlert } from 'lucide-react';

type ScreenState = 'splash' | 'login' | 'signup' | 'details' | 'main';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [draftUser, setDraftUser] = useState<Partial<UserProfile>>({});
  const [latestTriageResult, setLatestTriageResult] = useState<TriageResult | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [permissions, setPermissions] = useState<AppPermissions>(apiService.getPermissions());

  // Load existing session or default user
  useEffect(() => {
    const user = apiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setLanguage(user.language || 'en');
    }
  }, []);

  // 1. Splash Screen Complete
  const handleSplashComplete = (perms: AppPermissions) => {
    setPermissions(perms);
    apiService.savePermissions(perms);
    // Transition to Login page as specified
    setCurrentScreen('login');
  };

  // 2. Login Flow
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setLanguage(user.language || 'en');
    setCurrentScreen('main');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('signup');
  };

  const handleSignUpClick = () => {
    setCurrentScreen('signup');
  };

  // 3. Signup Success -> Proceed to Basic Details page as specified
  const handleSignUpDraftSuccess = (draft: Partial<UserProfile>) => {
    setDraftUser(draft);
    if (draft.language) {
      setLanguage(draft.language);
    }
    setCurrentScreen('details');
  };

  // 4. Basic Details Complete -> Save & Directs to Home Dashboard
  const handleBasicDetailsComplete = (fullUser: UserProfile) => {
    setCurrentUser(fullUser);
    setLanguage(fullUser.language);
    setCurrentScreen('main');
  };

  // 5. Triage Complete -> Automatically guide user to Result Page (Icon 2)
  const handleTriageComplete = (result: TriageResult) => {
    setLatestTriageResult(result);
    setActiveTab('result');
  };

  // 6. Consult Doctor CTA on Result Page -> Directs to Doctors Page (Icon 3)
  const handleConsultDoctor = () => {
    setActiveTab('doctors');
  };

  // 7. Retake consultation
  const handleRetakeConsultation = () => {
    setActiveTab('home');
  };

  // 8. Logout
  const handleLogout = () => {
    apiService.setCurrentUser(null);
    setCurrentUser(null);
    setIsProfileOpen(false);
    setCurrentScreen('login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#007ceb] selection:text-white">
      {/* 1. Splash & Permissions Screen */}
      {currentScreen === 'splash' && (
        <SplashLoading language={language} onComplete={handleSplashComplete} />
      )}

      {/* 2. Login Screen */}
      {currentScreen === 'login' && (
        <AuthLogin
          language={language}
          onLoginSuccess={handleLoginSuccess}
          onForgotPasswordClick={handleForgotPassword}
          onSignUpClick={handleSignUpClick}
          onLanguageChange={setLanguage}
        />
      )}

      {/* 3. Signup / OTP Verification / Reset PIN Screen */}
      {currentScreen === 'signup' && (
        <AuthSignUp
          language={language}
          onSignUpSuccess={handleSignUpDraftSuccess}
          onBackToLogin={() => setCurrentScreen('login')}
          onLanguageChange={setLanguage}
        />
      )}

      {/* 4. Basic Details Registration Screen (Top Language, Age Scroll, Gender Cards) */}
      {currentScreen === 'details' && (
        <BasicDetails
          draftUser={draftUser}
          initialLanguage={language}
          onComplete={handleBasicDetailsComplete}
          onLanguageChange={setLanguage}
        />
      )}

      {/* 5. Main Application Experience with Header & 5-Icon Navigation */}
      {currentScreen === 'main' && (
        <div className="flex-1 flex flex-col relative pb-16">
          {/* Top Header with Profile Icon on Right Top */}
          <Header
            currentUser={currentUser}
            language={language}
            onLanguageChange={(lang) => {
              setLanguage(lang);
              if (currentUser) {
                const updated = { ...currentUser, language: lang };
                setCurrentUser(updated);
                apiService.saveUser(updated);
              }
            }}
            onOpenProfile={() => setIsProfileOpen(true)}
            onEmergencyCall={() => setShowEmergencyModal(true)}
          />

          {/* Active View Container */}
          <main className="flex-1 pt-2">
            {activeTab === 'home' && (
              <HomeChatView
                currentUser={currentUser}
                language={language}
                onTriageComplete={handleTriageComplete}
              />
            )}

            {activeTab === 'result' && (
              <ResultView
                triageResult={latestTriageResult}
                language={language}
                currentUser={currentUser}
                onConsultDoctorClick={handleConsultDoctor}
                onRetakeConsultation={handleRetakeConsultation}
                onGoHome={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'doctors' && (
              <DoctorsView
                language={language}
                currentUser={currentUser}
                onBookingComplete={() => {
                  // user can also see it in profile
                }}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsView
                language={language}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'helplines' && (
              <HelplinesView
                language={language}
                currentUser={currentUser}
              />
            )}
          </main>

          {/* 5-Icon Bottom Navigation Bar */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            language={language}
            latestSeverity={latestTriageResult?.severity}
          />

          {/* User Profile & Settings Drawer */}
          <ProfileDrawer
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            currentUser={currentUser}
            language={language}
            onUserUpdate={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
          />

          {/* 108 Emergency Dial Modal */}
          {showEmergencyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-[#e51b24]/30">
                <div className="w-16 h-16 rounded-3xl bg-rose-100 text-[#e51b24] flex items-center justify-center mx-auto shadow-xs">
                  <ShieldAlert className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Emergency Dispatch
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Are you experiencing an acute medical emergency? Dial national 108 ambulance now.
                  </p>
                </div>

                <div className="space-y-2">
                  <a
                    href="tel:108"
                    className="w-full py-3.5 bg-[#e51b24] hover:bg-red-700 active:bg-red-800 text-white font-black rounded-2xl text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call 108 Ambulance</span>
                  </a>
                  <a
                    href="tel:102"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2"
                  >
                    <span>Call 102 (Janani Shishu / Maternity)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
