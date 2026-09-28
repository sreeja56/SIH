import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PhoneCall, ShieldAlert, Heart, Users, Search, Phone } from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { translations } from '../../i18n/translations';
import { mockHelplines, mockAshaWorkers, mockBloodDonors } from '../../data/mockData';
import { GoogleMapPin } from '../common/GoogleMapPin';

interface HelplinesViewProps {
  language: Language;
  currentUser: UserProfile | null;
}

export const HelplinesView: React.FC<HelplinesViewProps> = ({ language, currentUser }) => {
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'emergency' | 'asha' | 'blood'>('emergency');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAsha = mockAshaWorkers.filter((worker) => {
    const q = searchQuery.toLowerCase();
    return (
      worker.name.toLowerCase().includes(q) ||
      worker.village.toLowerCase().includes(q) ||
      worker.subCentre.toLowerCase().includes(q)
    );
  });

  const filteredBloodDonors = mockBloodDonors.filter((donor) => {
    const matchesGroup = bloodFilter === 'all' || donor.bloodGroup === bloodFilter;
    const matchesSearch =
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.village.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 pb-24 space-y-4 text-slate-900">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          {t.helplinesTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {t.helplinesSubtitle}
        </p>
      </div>

      {/* Sub Category Selector */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          id="subtab-emergency"
          type="button"
          onClick={() => setActiveSubTab('emergency')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'emergency'
              ? 'bg-[#e51b24] text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Emergency (108)</span>
        </button>

        <button
          id="subtab-asha"
          type="button"
          onClick={() => setActiveSubTab('asha')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'asha'
              ? 'bg-[#007ceb] text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase tracking-wider">
            ASHA
          </span>
          <span>{t.ashaWorkersTab}</span>
        </button>

        <button
          id="subtab-blood"
          type="button"
          onClick={() => setActiveSubTab('blood')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'blood'
              ? 'bg-[#00a651] text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>{t.bloodDonorsTab}</span>
        </button>
      </div>

      {/* Subtab 1: Emergency 108, 102 & Government Helplines */}
      {activeSubTab === 'emergency' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Priority 108 Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#e51b24] to-[#b91c1c] text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#e51b24] flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                108
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  24x7 Free Rural Emergency Response
                </span>
                <h3 className="text-lg sm:text-xl font-black mt-0.5">
                  National Emergency & Ambulance (108)
                </h3>
                <p className="text-xs text-rose-100 font-medium">
                  Direct GPS dispatch for accidents, snake bites, cardiac events & maternal emergencies
                </p>
              </div>
            </div>

            <a
              href="tel:108"
              className="w-full sm:w-auto px-6 py-3 bg-white text-[#e51b24] hover:bg-rose-50 font-black rounded-2xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Call 108 Now</span>
            </a>
          </div>

          {/* Grid of Other Public Helplines (102, 104, 1098, 181, 112) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockHelplines.map((helpline) => {
              const nameDisplay = language === 'te' ? helpline.nameTe : language === 'hi' ? helpline.nameHi : helpline.name;
              const descDisplay = language === 'te' ? helpline.descriptionTe : language === 'hi' ? helpline.descriptionHi : helpline.description;

              return (
                <div
                  key={helpline.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {nameDisplay}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-md">
                        {helpline.number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">
                      {descDisplay}
                    </p>
                    <span className="text-[10px] font-bold text-[#00a651] block mt-1">
                      ✓ {helpline.isTollFree ? 'Toll Free • ' : ''}24 Hours Active
                    </span>
                  </div>

                  <a
                    href={`tel:${helpline.number}`}
                    className="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-[#007ceb] text-[#007ceb] hover:text-white border border-sky-200 flex items-center justify-center shadow-xs transition-colors shrink-0"
                    title={`Call ${helpline.number}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Subtab 2: ASHA Workers Directory */}
      {activeSubTab === 'asha' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Search bar for ASHA */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ASHA worker by name or village..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#007ceb]"
            />
          </div>

          <div className="space-y-3">
            {filteredAsha.map((asha) => (
              <div
                key={asha.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007ceb] to-[#00a651] text-white flex flex-col items-center justify-center font-black text-xs tracking-wider shadow-sm shrink-0 border-2 border-white">
                    <span className="text-[11px] leading-tight">ASHA</span>
                    <span className="text-[8px] font-bold opacity-90 leading-tight">ఆశా</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {asha.name}
                      </h4>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg ${
                        asha.available ? 'bg-emerald-100 text-[#00a651]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {asha.available ? '● Available' : 'Off Duty'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                      <GoogleMapPin size={15} />
                      <span>{asha.village} • Sub-Centre: {asha.subCentre}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Experience: {asha.experienceYears} years • District: {asha.district}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${asha.phone}`}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#007ceb] hover:bg-sky-700 text-white rounded-2xl text-xs font-black shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call ASHA: {asha.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Subtab 3: Blood Donors Network */}
      {activeSubTab === 'blood' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Blood Group Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['all', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-'].map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setBloodFilter(bg)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  bloodFilter === bg
                    ? 'bg-[#e51b24] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {bg === 'all' ? 'All Donors' : bg}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBloodDonors.map((donor) => (
              <div
                key={donor.id}
                className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#e51b24] border border-rose-200 flex items-center justify-center font-black text-sm shadow-2xs shrink-0">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{donor.name}</h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <GoogleMapPin size={13} />
                      <span>{donor.village}, {donor.district}</span>
                    </p>
                    <span className="text-[10px] text-[#00a651] font-bold block mt-0.5">
                      ✓ Ready to donate • Last: {donor.lastDonated}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${donor.phone}`}
                  className="w-10 h-10 rounded-2xl bg-rose-50 hover:bg-[#e51b24] text-[#e51b24] hover:text-white border border-rose-200 flex items-center justify-center shadow-xs transition-colors shrink-0"
                  title={`Call ${donor.name}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
