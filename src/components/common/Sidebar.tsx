import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Ship,
  Compass,
  Users,
  Camera,
  ShoppingBag,
  PackageCheck,
  CreditCard,
  BarChart3,
  CalendarCheck,
  Settings,
  ShieldCheck,
  UserCheck,
  BadgeDollarSign,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    currentUser,
    setIsLoginPageOpen,
    logout,
    t,
    appLanguage,
  } = useApp();

  const isPhotographer = activeRole === 'photographer';
  const isAccountant = activeRole === 'accountant';

  const photographerNavItems = [
    { id: 'trips', label: t.trips, icon: Compass },
    { id: 'customers', label: t.customers, icon: Users },
    { id: 'photos', label: t.photos, icon: Camera },
    { id: 'sales', label: t.sales, icon: ShoppingBag },
    { id: 'payments', label: t.payments, icon: BadgeDollarSign },
    { id: 'profile', label: t.profile, icon: User },
  ];

  const adminNavItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'trips', label: t.trips, icon: Compass },
    { id: 'photographers', label: t.photographers, icon: Camera },
    { id: 'boats', label: t.boats, icon: Ship },
    { id: 'customers', label: t.customers, icon: Users },
    { id: 'photos', label: t.photos, icon: Camera },
    { id: 'sales', label: t.sales, icon: ShoppingBag },
    { id: 'packages', label: t.packages, icon: PackageCheck },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'closing', label: t.closing, icon: CalendarCheck },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'audit', label: t.audit, icon: ShieldCheck },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const accountantNavItems = [
    { id: 'dashboard', label: t.financialOverview, icon: LayoutDashboard },
    { id: 'sales', label: t.sales, icon: ShoppingBag },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'closing', label: t.closing, icon: CalendarCheck },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'customers', label: t.customers, icon: Users },
  ];

  const navItems = isPhotographer
    ? photographerNavItems
    : isAccountant
    ? accountantNavItems
    : adminNavItems;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r rtl:border-r-0 rtl:border-l border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Current Mode Badge */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/60 border border-sky-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
            {isPhotographer ? t.portalPhotographer : isAccountant ? t.portalAccountant : t.portalAdmin}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
          {currentUser?.displayName || 'Authorized User'}
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition active:scale-[0.98] ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session & Role Card */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {currentUser && (
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {currentUser.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase block">
                  {currentUser.role === 'owner'
                    ? t.roleOwner
                    : currentUser.role === 'admin'
                    ? t.roleAdmin
                    : currentUser.role === 'accountant'
                    ? t.roleAccountant
                    : t.rolePhotographer}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition shrink-0"
              title={t.logoutBtn}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => setIsLoginPageOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs hover:bg-sky-100 transition shadow-sm active:scale-95"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>{t.switchAccountBtn}</span>
        </button>

        {/* Footer Info */}
        <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center">
          <p className="font-semibold text-slate-600 dark:text-slate-400">SharmLens Marine Center</p>
          <p className="mt-0.5">South Sinai • Red Sea</p>
        </div>
      </div>
    </aside>
  );
};
