import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Search,
  Bell,
  Camera,
  CheckCircle2,
  DollarSign,
  UserCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
  ExternalLink,
  Languages,
  LogIn,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeRole,
    activePhotographerId,
    switchDemoRole,
    loginWithGoogle,
    logout,
    setIsLoginPageOpen,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    photographers,
    resetToDemoData,
    seedDemoDataToFirestore,
    settings,
    openCustomerGallery,
    customers,
    appLanguage,
    setAppLanguage,
    t,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Search autocomplete results preview
  const searchResults = searchQuery.trim().length > 1
    ? customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.galleryCode.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedDemoDataToFirestore();
    setTimeout(() => setIsSeeding(false), 800);
  };

  const toggleLanguage = () => {
    setAppLanguage(appLanguage === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center justify-between px-3 md:px-6 gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-amber-400 p-0.5 shadow-md shadow-sky-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950 text-white">
              <Camera className="h-5 w-5 text-sky-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                {settings.centerName || 'SharmLens'}
              </span>
              <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                {appLanguage === 'ar' ? 'البحر الأحمر' : 'Red Sea'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {t.centerSubtitle || 'Tourist Boat Photography Center • Sharm El Sheikh'}
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 py-2 pl-10 pr-9 rtl:pl-9 rtl:pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-900 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 rtl:right-auto rtl:left-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-12 mt-1 rounded-2xl bg-white p-2 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50 animate-fadeIn">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {t.matchingGuests} ({searchResults.length})
              </div>
              {searchResults.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => {
                    openCustomerGallery(cust.id);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer transition text-left rtl:text-right"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {cust.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Room {cust.roomNumber} • {cust.hotel} • {cust.country}
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-1 rounded-lg bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400"
                    title={t.viewGallery}
                  >
                    <span>{t.openGalleryBtn || 'Gallery'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main App Language Toggle Button: Arabic / English */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 hover:bg-sky-100 transition shadow-sm active:scale-95"
            title="تبديل اللغة / Switch Language"
          >
            <Languages className="h-4 w-4 text-sky-600" />
            <span className="font-extrabold">{appLanguage === 'ar' ? 'English 🇬🇧' : 'العربية 🇪🇬'}</span>
          </button>

          {/* Open Dedicated Login Page Button */}
          <button
            onClick={() => setIsLoginPageOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-sky-800 dark:text-sky-200 hover:bg-sky-100 transition shadow-sm active:scale-95"
            title={t.switchAccountBtn}
          >
            <LogIn className="h-3.5 w-3.5 text-sky-600" />
            <span className="hidden sm:inline">{t.switchAccountBtn}</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Quick Seed Demo / Reset Controls (Visible for evaluator) */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
              title="Save all demo data directly to Firestore database"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{isSeeding ? '...' : t.seedFirestore}</span>
            </button>
            <button
              onClick={resetToDemoData}
              className="flex items-center gap-1 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reset in-memory data to defaults"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 transition"
            >
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifMenu && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-12 mt-1 w-80 rounded-2xl bg-white p-3 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50 animate-fadeIn text-left rtl:text-right">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {appLanguage === 'ar' ? 'إشعارات وتنبيهات السنتر' : 'Center Notifications'}
                  </span>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                    {unreadNotificationCount}
                  </span>
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">
                      {appLanguage === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                    </p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl transition cursor-pointer ${
                          n.isRead
                            ? 'bg-slate-50/60 dark:bg-slate-800/40 text-slate-500'
                            : 'bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-sky-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role & User Switcher (CRITICAL FOR TESTING ALL ROLES) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 transition"
            >
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {activeRole === 'owner' ? '👑' : activeRole === 'admin' ? '🛡️' : activeRole === 'accountant' ? '💰' : '📷'}
              </div>
              <div className="text-left rtl:text-right hidden md:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white capitalize flex items-center gap-1">
                  <span>{currentUser?.displayName || 'User'}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase">
                  {activeRole === 'owner' ? t.roleOwner : activeRole === 'admin' ? t.roleAdmin : activeRole === 'accountant' ? t.roleAccountant : t.rolePhotographer}
                </div>
              </div>
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-12 mt-1 w-64 rounded-2xl bg-white p-2.5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50 animate-fadeIn text-left rtl:text-right">
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {appLanguage === 'ar' ? 'تبديل الدور (فحص الصلاحيات)' : 'Switch Role (Testing RBAC)'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {t.switchRoleNotice}
                  </p>
                </div>

                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => {
                      switchDemoRole('owner');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition ${
                      activeRole === 'owner' ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>👑</span>
                      <div>
                        <div>{t.roleOwner}</div>
                        <div className="text-[10px] font-normal text-slate-400">megastudiodm@gmail.com</div>
                      </div>
                    </div>
                    {activeRole === 'owner' && <CheckCircle2 className="h-4 w-4 text-sky-500" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition ${
                      activeRole === 'admin' ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-indigo-500" />
                      <div>
                        <div>{t.roleAdmin}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {appLanguage === 'ar' ? 'إدارة الرحلات واليخوت والمبيعات' : 'Manage trips, boats, sales'}
                        </div>
                      </div>
                    </div>
                    {activeRole === 'admin' && <CheckCircle2 className="h-4 w-4 text-sky-500" />}
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('accountant');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition ${
                      activeRole === 'accountant' ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <div>
                        <div>{t.roleAccountant}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {appLanguage === 'ar' ? 'العمولات والتسويات المالية' : 'Commissions & settlements'}
                        </div>
                      </div>
                    </div>
                    {activeRole === 'accountant' && <CheckCircle2 className="h-4 w-4 text-sky-500" />}
                  </button>

                  <div className="pt-1 pb-0.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {appLanguage === 'ar' ? 'المصورون (وضع العمل على اليخت)' : 'Photographers (Mobile Boat Mode)'}
                  </div>

                  {photographers.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchDemoRole('photographer', p.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition ${
                        activeRole === 'photographer' && activePhotographerId === p.id
                          ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5 text-sky-500" />
                        <div>
                          <div>{p.fullName}</div>
                          <div className="text-[10px] font-normal text-slate-400">
                            {p.commissionPercentage}% {appLanguage === 'ar' ? 'عمولة' : 'Comm'} • {p.assignedBoatName || 'Boat'}
                          </div>
                        </div>
                      </div>
                      {activeRole === 'photographer' && activePhotographerId === p.id && (
                        <CheckCircle2 className="h-4 w-4 text-sky-500" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      setIsLoginPageOpen(true);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                  >
                    {t.loginTitle}
                  </button>
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      logout();
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 font-medium"
                  >
                    {t.logoutBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

