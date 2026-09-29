import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Users,
  Camera,
  ShoppingBag,
  BadgeDollarSign,
  User,
  LayoutDashboard,
  Ship,
  MoreHorizontal,
} from 'lucide-react';

export const BottomNav: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { activeTab, setActiveTab, activeRole, t, appLanguage } = useApp();

  const isPhotographer = activeRole === 'photographer';

  const photographerTabs = [
    { id: 'trips', label: appLanguage === 'ar' ? 'الرحلة' : 'Trip', icon: Compass },
    { id: 'customers', label: appLanguage === 'ar' ? 'النزلاء' : 'Guests', icon: Users },
    { id: 'photos', label: appLanguage === 'ar' ? 'الصور' : 'Photos', icon: Camera },
    { id: 'sales', label: appLanguage === 'ar' ? 'المبيعات' : 'Sales', icon: ShoppingBag },
    { id: 'payments', label: appLanguage === 'ar' ? 'العمولة' : 'Comm.', icon: BadgeDollarSign },
    { id: 'profile', label: appLanguage === 'ar' ? 'حسابي' : 'Profile', icon: User },
  ];

  const adminTabs = [
    { id: 'dashboard', label: appLanguage === 'ar' ? 'الرئيسية' : 'Dash', icon: LayoutDashboard },
    { id: 'trips', label: appLanguage === 'ar' ? 'الرحلات' : 'Trips', icon: Compass },
    { id: 'customers', label: appLanguage === 'ar' ? 'النزلاء' : 'Guests', icon: Users },
    { id: 'sales', label: appLanguage === 'ar' ? 'المبيعات' : 'Sales', icon: ShoppingBag },
    { id: 'closing', label: appLanguage === 'ar' ? 'التقفيل' : 'Closing', icon: Ship },
    { id: 'reports', label: appLanguage === 'ar' ? 'المزيد' : 'More', icon: MoreHorizontal },
  ];

  const tabs = isPhotographer ? photographerTabs : adminTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-6 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition active:scale-90 ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  isActive ? 'bg-sky-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[50px] mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
