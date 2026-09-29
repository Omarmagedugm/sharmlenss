import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile } from '../../types';
import {
  Camera,
  ShieldCheck,
  Ship,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  UserCheck,
  Lock,
  Mail,
  Languages,
  DollarSign,
  Compass,
  CheckCircle2,
  ChevronRight,
  LogOut,
} from 'lucide-react';

export const LoginPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const {
    loginWithGoogle,
    loginAsUser,
    loginAsRole,
    logout,
    currentUser,
    systemUsers,
    photographers,
    isRTL,
    appLanguage,
    setAppLanguage,
    t,
  } = useApp();

  const [activePortal, setActivePortal] = useState<'photographer' | 'supervisor'>('photographer');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Filter users by portal
  const photographerUsers = systemUsers.filter((u) => u.role === 'photographer');
  const supervisorUsers = systemUsers.filter((u) => u.role !== 'photographer');

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        setGoogleError(
          appLanguage === 'ar'
            ? 'تم إلغاء تسجيل الدخول أو حدث خطأ أثناء الاتصال بجوجل.'
            : 'Sign in was cancelled or an error occurred connecting with Google.'
        );
      }
    } catch {
      setGoogleError(
        appLanguage === 'ar'
          ? 'تعذر الاتصال بـ Google. يمكنك استخدام الدخول المباشر أدناه.'
          : 'Unable to connect to Google. You can use direct portal login below.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const toggleLanguage = () => {
    setAppLanguage(appLanguage === 'ar' ? 'en' : 'ar');
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col text-left rtl:text-right">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-sky-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                SharmLens • شرم لينس
              </h3>
              <p className="text-[11px] text-slate-400">
                {appLanguage === 'ar'
                  ? 'سنتر تصوير اليخوت والرحلات البحرية - شرم الشيخ'
                  : 'Red Sea Marine Excursion Photography Center'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
              title="Switch Language"
            >
              <Languages className="h-3.5 w-3.5 text-sky-600" />
              <span>{appLanguage === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={t.close}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Main Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.loginTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              {t.loginSub}
            </p>
          </div>

          {/* Current Logged in User Bar if available */}
          {currentUser && (
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-sm shadow shrink-0">
                  {currentUser.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-extrabold text-slate-900 dark:text-white">
                      {currentUser.displayName}
                    </strong>
                    <span className="rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] block">{currentUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    {appLanguage === 'ar' ? 'متابعة للوحة التحكم' : 'Continue to Center'}
                  </button>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>{t.logoutBtn}</span>
                </button>
              </div>
            </div>
          )}

          {/* Portal Selector (Photographer vs Supervisor) */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActivePortal('photographer')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                activePortal === 'photographer'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>{t.photographerPortalTab}</span>
            </button>

            <button
              onClick={() => setActivePortal('supervisor')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                activePortal === 'supervisor'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{t.supervisorPortalTab}</span>
            </button>
          </div>

          {/* Google Sign In Official Button */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 shadow-sm hover:shadow transition active:scale-[0.99] disabled:opacity-60"
            >
              {/* Google Official SVG Icon */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isGoogleLoading ? '...' : t.signInWithGoogle}</span>
            </button>

            {googleError && (
              <p className="text-xs text-rose-500 font-semibold text-center bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                {googleError}
              </p>
            )}

            <p className="text-[11px] text-center text-slate-400">
              {appLanguage === 'ar'
                ? 'يتم التعرف على صلاحياتك (مصور، مشرف، أو محاسب) وربطك بمركبك تلقائياً حسب بريدك المسجل في لوحة التحكم.'
                : 'Your role & linked boat/photographer profile are recognized automatically based on your registered Google email.'}
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {appLanguage === 'ar' ? 'أو الدخول المباشر الفوري' : 'Or Direct Portal Access'}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: PHOTOGRAPHER PORTAL                               */}
          {/* ======================================================== */}
          {activePortal === 'photographer' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-xs text-sky-900 dark:text-sky-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Camera className="h-4 w-4 text-sky-600" />
                  <span>{appLanguage === 'ar' ? 'صلاحيات المصور البحري:' : 'Marine Photographer Access:'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {appLanguage === 'ar'
                    ? 'تسجيل نزلائه باليخت، رفع الصور الخاصة به، متابعة مبيعاته وعمولاته المستحقة، وطلب صرف المستحقات.'
                    : 'Access assigned excursions, guest registers, photo uploads, personal sales, earned commissions, and payout vouchers.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {t.selectPhotographerToLogin}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {photographers.map((p) => {
                    const matchedUser = systemUsers.find((u) => u.photographerId === p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (matchedUser) {
                            loginAsUser(matchedUser);
                          } else {
                            loginAsRole('photographer', p.id);
                          }
                          onClose?.();
                        }}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-sky-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition flex items-center justify-between group text-left rtl:text-right"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                            {p.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <strong className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-sky-600 transition">
                              {p.fullName}
                            </strong>
                            <span className="text-[10px] text-slate-400 block">
                              {p.assignedBoatName || (appLanguage === 'ar' ? 'لنش بحري' : 'Boat')} • {p.commissionPercentage}% عمولة
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition">
                          {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MANAGEMENT & SUPERVISORS PORTAL                   */}
          {/* ======================================================== */}
          {activePortal === 'supervisor' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>{appLanguage === 'ar' ? 'صلاحيات المشرفين والإدارة:' : 'Supervisors & Management Access:'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {appLanguage === 'ar'
                    ? 'لوحة المؤشرات الحية، إدارة الأسطول، جدولة الرحلات، إدارة المصورين، صرف المستحقات، وتقفيل الخزينة اليومية.'
                    : 'Full live KPIs, fleet management, excursion scheduling, commission adjustments, payout approvals, and daily register closing.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {t.selectSupervisorToLogin}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Owner */}
                  <button
                    onClick={() => {
                      loginAsRole('owner');
                      onClose?.();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition flex flex-col justify-between group text-left rtl:text-right"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold uppercase text-amber-600">Owner</span>
                      </div>
                      <strong className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-sky-600">
                        {appLanguage === 'ar' ? 'المالك العام' : 'Center Owner'}
                      </strong>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {appLanguage === 'ar' ? 'صلاحية كاملة لجميع الأقسام' : 'Full system privileges'}
                      </span>
                    </div>
                  </button>

                  {/* Supervisor / Admin */}
                  <button
                    onClick={() => {
                      loginAsRole('admin');
                      onClose?.();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition flex flex-col justify-between group text-left rtl:text-right"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold uppercase text-sky-600">Supervisor</span>
                      </div>
                      <strong className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-sky-600">
                        {appLanguage === 'ar' ? 'مدير ومشرف عام' : 'Operations Manager'}
                      </strong>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {appLanguage === 'ar' ? 'المراكب، الرحلات، والمصورين' : 'Boats, trips & team'}
                      </span>
                    </div>
                  </button>

                  {/* Accountant */}
                  <button
                    onClick={() => {
                      loginAsRole('accountant');
                      onClose?.();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition flex flex-col justify-between group text-left rtl:text-right"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                          <DollarSign className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] font-bold uppercase text-emerald-600">Finance</span>
                      </div>
                      <strong className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-sky-600">
                        {appLanguage === 'ar' ? 'مسؤول الحسابات' : 'Accountant'}
                      </strong>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {appLanguage === 'ar' ? 'المبيعات، الصرف، والتقفيل' : 'Sales, payouts & audit'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
          <span>{appLanguage === 'ar' ? 'نظام شارم لينس الآمن © شرم الشيخ' : 'SharmLens Secure Marine POS ©'}</span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>Firebase ABAC Protected</span>
          </span>
        </div>
      </div>
    </div>
  );
};
