import React from 'react';
import { Bot, FileText, Stethoscope, FolderHeart, PhoneCall } from 'lucide-react';
import { TabId, Language, SeverityLevel } from '../types';
import { translations } from '../i18n/translations';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  language: Language;
  latestSeverity?: SeverityLevel | null;
  documentsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
  latestSeverity,
  documentsCount = 0,
}) => {
  const t = translations[language];

  const navItems = [
    {
      id: 'home' as TabId,
      label: t.navHome,
      icon: Bot,
      badge: null,
    },
    {
      id: 'result' as TabId,
      label: t.navResult,
      icon: FileText,
      badge: latestSeverity ? (
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            latestSeverity === 'severe'
              ? 'bg-[#e51b24] animate-ping'
              : latestSeverity === 'moderate'
              ? 'bg-amber-500'
              : 'bg-[#00a651]'
          }`}
        />
      ) : null,
    },
    {
      id: 'doctors' as TabId,
      label: t.navDoctors,
      icon: Stethoscope,
      badge: null,
    },
    {
      id: 'documents' as TabId,
      label: t.navDocuments,
      icon: FolderHeart,
      badge: documentsCount > 0 ? (
        <span className="px-1.5 py-0.2 bg-[#007ceb] text-white rounded-full text-[9px] font-black">
          {documentsCount}
        </span>
      ) : null,
    },
    {
      id: 'helplines' as TabId,
      label: t.navHelplines,
      icon: PhoneCall,
      badge: (
        <span className="px-1.5 py-0.2 bg-[#e51b24] text-white rounded-full text-[9px] font-black animate-pulse">
          108
        </span>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 sm:px-6 py-2 shadow-lg">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#007ceb] font-black scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-sky-100/80 text-[#007ceb] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {item.badge && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center">
                    {item.badge}
                  </div>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-[#007ceb]' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-[#007ceb] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
