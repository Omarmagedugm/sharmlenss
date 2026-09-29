import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Download, Search, Lock, UserCheck, Calendar } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const AuditLogView: React.FC = () => {
  const { auditLogs, t, appLanguage } = useApp();
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  const displayedLogs = auditLogs.filter((log) => {
    if (filterAction !== 'all' && !log.action.includes(filterAction)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User', 'Email', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const rows = auditLogs.map((l) => [
      l.id,
      l.timestamp,
      l.userName,
      l.userEmail,
      l.action,
      l.entityType,
      l.entityId,
      l.details || '',
    ]);
    exportToCSV('SharmLens_Security_Audit_Log', rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.auditTrailTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {appLanguage === 'ar'
              ? 'سجل تدقيق رقابي غير قابل للتعديل لجميع المبيعات، تعديل نسب العمولات، الصرف وإغلاقات اليومية'
              : 'Immutable tracking for all sales, commission modifications, payouts & register closings'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition"
        >
          <Download className="h-4 w-4" />
          <span>{appLanguage === 'ar' ? 'تصدير سجل التدقيق' : 'Export Audit Log'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder={appLanguage === 'ar' ? 'بحث بالإجراء، بريد المستخدم أو التفاصيل...' : 'Search action, user email, details...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-left rtl:text-right"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {appLanguage === 'ar' ? 'تصفية الحدث:' : 'Filter Event:'}
          </span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">{appLanguage === 'ar' ? 'جميع الأحداث' : 'All Events'}</option>
            <option value="SALE">{appLanguage === 'ar' ? 'المبيعات والعمولات' : 'Sales & Commissions'}</option>
            <option value="PAYMENT">{appLanguage === 'ar' ? 'صرف مستحقات المصورين' : 'Photographer Payouts'}</option>
            <option value="CLOSING">{appLanguage === 'ar' ? 'إغلاق اليومية' : 'Daily Register Closing'}</option>
            <option value="PHOTOGRAPHER">{appLanguage === 'ar' ? 'المصورين' : 'Photographers'}</option>
            <option value="SETTINGS">{appLanguage === 'ar' ? 'الإعدادات' : 'Settings'}</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'الحدث / العملية' : 'Action Event'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'الموظف المسؤول' : 'Staff User'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'الجهة' : 'Entity'}</th>
                <th className="py-3 px-4">{t.details}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-black text-sky-700 dark:text-sky-300 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                    <div className="text-[10px] text-slate-400">{log.userEmail}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">
                    {log.details || '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
