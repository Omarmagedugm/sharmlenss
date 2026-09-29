import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, Check, RotateCcw, ShieldAlert, Sparkles, Users, Building } from 'lucide-react';
import { UsersPermissionsView } from './UsersPermissionsView';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, seedDemoDataToFirestore, resetToDemoData, activeRole, t, appLanguage } = useApp();
  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';

  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');

  const [formData, setFormData] = useState({
    centerName: settings.centerName,
    tagline: settings.tagline || '',
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    defaultPhotographerCommission: settings.defaultPhotographerCommission,
    defaultCenterPercentage: settings.defaultCenterPercentage,
    taxPercentage: settings.taxPercentage,
    phone: settings.phone || '',
    address: settings.address || '',
  });

  const [saved, setSaved] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      centerName: formData.centerName,
      tagline: formData.tagline,
      currency: formData.currency,
      currencySymbol: formData.currencySymbol,
      defaultPhotographerCommission: Number(formData.defaultPhotographerCommission),
      defaultCenterPercentage: 100 - Number(formData.defaultPhotographerCommission),
      taxPercentage: Number(formData.taxPercentage),
      phone: formData.phone,
      address: formData.address,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    await seedDemoDataToFirestore();
    setTimeout(() => setIsSeeding(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl text-left rtl:text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.settingsTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {appLanguage === 'ar'
              ? 'المعايير المالية العامة، نسب عمولات المصورين، وإدارة المستخدمين والصلاحيات'
              : 'Global financial parameters, base commission tiers, and employee user permissions'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>{appLanguage === 'ar' ? 'إعدادات المركز' : 'Center Profile'}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{t.userManagementTitle}</span>
          </button>
        </div>
      </div>

      {/* Tab 2: Users & Permissions */}
      {activeTab === 'users' && <UsersPermissionsView />}

      {/* Tab 1: General Settings Form */}
      {activeTab === 'general' && (
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Center Identity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'هوية المركز والعلامة التجارية' : 'Center Identity & Branding'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {appLanguage === 'ar' ? 'اسم مركز التصوير *' : 'Center Business Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.centerName}
                onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {appLanguage === 'ar' ? 'الشعار التسويقي / الوصف المختصر' : 'Tagline / Subtitle'}
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.phone} / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {appLanguage === 'ar' ? 'مقر المارينا / العنوان' : 'Marina Base Address'}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Commission Parameters */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'العملة والنسب الافتراضية للعمولات' : 'Currency & Commission Defaults'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {appLanguage === 'ar' ? 'رمز العملة (ISO)' : 'Currency Code (ISO)'}
              </label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {appLanguage === 'ar' ? 'الافتراضي: EGP (الجنيه المصري)' : 'Default: EGP (Egyptian Pounds)'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {appLanguage === 'ar' ? 'رمز العرض في الفواتير' : 'Currency Display Symbol'}
              </label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {appLanguage === 'ar' ? 'مثال: ج.م أو EGP' : 'e.g. EGP or ج.م'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {appLanguage === 'ar' ? 'عمولة المصور الافتراضية %' : 'Default Commission %'}
              </label>
              <input
                type="number"
                min={5}
                max={90}
                required
                value={formData.defaultPhotographerCommission}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPhotographerCommission: Number(e.target.value),
                    defaultCenterPercentage: 100 - Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-black text-sky-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {appLanguage === 'ar' ? 'نسبة المركز:' : 'Center Share:'}{' '}
                {100 - Number(formData.defaultPhotographerCommission)}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              <strong>{appLanguage === 'ar' ? 'قاعدة ثبات العمولات التاريخية:' : 'Important Commission Invariant:'}</strong>{' '}
              {appLanguage === 'ar'
                ? 'تغيير نسبة العمولة الافتراضية هنا يسري فقط على المصورين الجدد أو المبيعات المستقبلية. جميع المبيعات التاريخية تحتفظ بنسبتها الأصلية المؤمّنة في لحظة البيع ولا تتأثر أبداً.'
                : 'Changing the default commission rate here only applies to new photographers or future sales without an explicit rate. All completed historical sales preserve their locked percentage permanently.'}
            </p>
          </div>
        </div>

        {/* Database & Demo Controls */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'البيانات وقاعدة بيانات Firestore' : 'Demo Data & Firestore Sync'}
          </h3>
          <p className="text-xs text-slate-400">
            {appLanguage === 'ar'
              ? 'يمكنك مزامنة البيانات التوضيحية مباشرة مع قاعدة بيانات Firestore السحابية أو إعادة تعيين الحالة المحلية.'
              : 'For evaluation, you can push all demo records directly into your provisioned Firestore database or reset in-memory state.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSeedFirestore}
              disabled={isSeeding}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isSeeding
                  ? (appLanguage === 'ar' ? 'جارٍ الحفظ في Firestore...' : 'Writing to Firestore...')
                  : (appLanguage === 'ar' ? 'مزامنة البيانات مع Firestore' : 'Seed All Data to Firestore')}
              </span>
            </button>

            <button
              type="button"
              onClick={resetToDemoData}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{appLanguage === 'ar' ? 'إعادة ضبط البيانات التوضيحية' : 'Reset Local State'}</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        {isOwnerOrAdmin && (
          <div className="flex justify-end rtl:justify-start gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 font-bold text-xs text-white shadow-lg shadow-emerald-600/20 transition active:scale-95"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>
                    {appLanguage === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings Saved Successfully!'}
                  </span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{t.saveSettings}</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
      )}
    </div>
  );
};
