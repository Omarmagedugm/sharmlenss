import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Photographer } from '../../types';
import {
  X,
  Camera,
  Percent,
  TrendingUp,
  CreditCard,
  Printer,
  Plus,
  Phone,
  Mail,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface PhotographerProfileModalProps {
  photographerId: string;
  onClose: () => void;
  onOpenPayout?: (photographerId: string) => void;
}

export const PhotographerProfileModal: React.FC<PhotographerProfileModalProps> = ({
  photographerId,
  onClose,
  onOpenPayout,
}) => {
  const {
    getPhotographerStats,
    sales,
    payments,
    formatCurrency,
    updatePhotographer,
    activeRole,
    t,
    appLanguage,
  } = useApp();

  const stats = getPhotographerStats(photographerId);
  const photog = stats?.photographer;

  const [isEditingComm, setIsEditingComm] = useState(false);
  const [newComm, setNewComm] = useState(photog?.commissionPercentage ?? 30);
  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';

  if (!photog || !stats) return null;

  const photogSales = sales.filter((s) => s.photographerId === photographerId);
  const photogPayments = payments.filter((p) => p.photographerId === photographerId);

  const handleSaveCommission = async () => {
    await updatePhotographer(photog.id, { commissionPercentage: Number(newComm) });
    setIsEditingComm(false);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const handleExportStatement = () => {
    const headers = ['Type', 'ID / Ref', 'Date', 'Description / Package', 'Gross', 'Net', 'Commission %', 'Amount'];
    const rows: (string | number)[][] = [];

    photogSales.forEach((s) => {
      rows.push([
        'Sale',
        s.saleId,
        s.date,
        s.packageName || 'Photos',
        s.grossAmount,
        s.netAmount,
        `${s.commissionPercentage}%`,
        s.commissionAmount,
      ]);
    });

    photogPayments.forEach((p) => {
      rows.push([
        'Settlement Payout',
        p.referenceNumber || p.id,
        p.date,
        p.notes || 'Payout',
        0,
        0,
        '-',
        -p.amount,
      ]);
    });

    exportToCSV(`Settlement_Statement_${photog.fullName.replace(/\s+/g, '_')}`, rows, headers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fadeIn print:bg-white print:p-0">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-h-full">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 print:hidden text-left rtl:text-right">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {photog.fullName} — {appLanguage === 'ar' ? 'الملف وكشف الحساب المالي' : 'Profile & Settlement Statement'}
              </h3>
              <p className="text-xs text-slate-400">
                {t.photographerEmpId}: {photog.idNumber || 'EGY-PH-001'} • {t.dateJoinedLabel}: {photog.dateJoined}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintStatement}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
              title={appLanguage === 'ar' ? 'طباعة كشف الحساب' : 'Print Statement'}
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-left rtl:text-right">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {photog.fullName}
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  {photog.status === 'active' ? t.activePhotographer : t.inactivePhotographer}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-sky-500" />
                  <span>{photog.phone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{photog.email}</span>
                </span>
                <span>{t.assignedBoatLabel}: <strong className="text-slate-700 dark:text-slate-300">{photog.assignedBoatName || (appLanguage === 'ar' ? 'غير مسند' : 'Unassigned')}</strong></span>
              </div>
            </div>

            {/* Commission % Badge & Editor */}
            <div className="flex items-center gap-2">
              <div className="text-right rtl:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.commissionRateLabel}</span>
                {isEditingComm ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      min={5}
                      max={90}
                      value={newComm}
                      onChange={(e) => setNewComm(Number(e.target.value))}
                      className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 p-1 text-xs font-bold text-center dark:bg-slate-800"
                    />
                    <button
                      onClick={handleSaveCommission}
                      className="px-2 py-1 bg-sky-600 text-white rounded-lg text-xs font-bold"
                    >
                      {t.save}
                    </button>
                    <button
                      onClick={() => setIsEditingComm(false)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                      {photog.commissionPercentage}%
                    </span>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={() => setIsEditingComm(true)}
                        className="text-xs text-sky-600 hover:underline font-semibold"
                      >
                        {t.edit}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settlement Balance Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                {t.totalEarnedComm}
              </span>
              <div className="text-lg font-black text-sky-900 dark:text-sky-200 mt-1">
                {formatCurrency(stats.totalCommission)}
              </div>
              <span className="text-[10px] text-sky-600 mt-0.5 block">{stats.totalSalesCount} {appLanguage === 'ar' ? 'عملية بيع' : 'sales recorded'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                {t.totalPaidOut}
              </span>
              <div className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-1">
                {formatCurrency(stats.totalPaid)}
              </div>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">{photogPayments.length} {appLanguage === 'ar' ? 'دفعات مسددة' : 'payments issued'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {t.dueBalance}
              </span>
              <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-1">
                {formatCurrency(stats.remainingBalance)}
              </div>
              <span className="text-[10px] text-amber-700 mt-0.5 block">{appLanguage === 'ar' ? 'مستحق للصرف' : 'Due for payout'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t.centerRevenue}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(stats.centerRevenue)}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{appLanguage === 'ar' ? 'صافي دخل السنتر' : 'After commissions'}</span>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{appLanguage === 'ar' ? 'إجمالي الرحلات' : 'Total Trips'}</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{stats.totalTrips}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.guestsPhotographed}</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{stats.totalCustomers}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.conversionRate}</span>
              <strong className="text-sm font-black text-sky-600 dark:text-sky-400">{stats.conversionRate}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{appLanguage === 'ar' ? 'متوسط قيمة البيع' : 'Average Sale Ticket'}</span>
              <strong className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(stats.averageSale)}</strong>
            </div>
          </div>

          {/* Sales History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {appLanguage === 'ar' ? 'سجل المبيعات (مع الاحتفاظ بنسب العمولات التاريخية)' : 'Sales History (Preserving Historical Commission Rates)'}
              </h4>
              <button
                onClick={handleExportStatement}
                className="text-xs text-sky-600 font-semibold hover:underline"
              >
                {appLanguage === 'ar' ? 'تحميل كشف الحساب CSV' : 'Download Statement CSV'}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'كود البيع' : 'Sale ID'}</th>
                    <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'النزيل' : 'Guest'}</th>
                    <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'الباقة' : 'Package'}</th>
                    <th className="py-2.5 px-3">{t.netAmount}</th>
                    <th className="py-2.5 px-3">{t.commissionRateLabel}</th>
                    <th className="py-2.5 px-3">{t.photographerShare}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {photogSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        {appLanguage === 'ar' ? 'لا توجد مبيعات مسجلة لهذا المصور حتى الآن.' : 'No sales recorded for this photographer yet.'}
                      </td>
                    </tr>
                  ) : (
                    photogSales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{s.saleId}</td>
                        <td className="py-2.5 px-3 text-slate-500">{s.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{s.customerName}</td>
                        <td className="py-2.5 px-3 text-slate-500">{s.packageName}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{formatCurrency(s.netAmount)}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 text-[10px] font-bold text-sky-600">
                            {s.commissionPercentage}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(s.commissionAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Payout History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.payoutHistory}
              </h4>
              {onOpenPayout && isOwnerOrAdmin && (
                <button
                  onClick={() => onOpenPayout(photographerId)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{appLanguage === 'ar' ? `صرف دفعة إلى ${photog.fullName}` : `Record Payout to ${photog.fullName}`}</span>
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2.5 px-3">{t.receiptVoucher}</th>
                    <th className="py-2.5 px-3">{t.paymentMethod}</th>
                    <th className="py-2.5 px-3">{t.disbursedBy}</th>
                    <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                    <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'المبلغ المصروف' : 'Amount Paid'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {photogPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        {appLanguage === 'ar' ? 'لم يتم إصدار دفعات لهذا المصور حتى الآن.' : 'No payments issued to this photographer yet.'}
                      </td>
                    </tr>
                  ) : (
                    photogPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-500">{p.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {p.referenceNumber || p.id}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-600">
                          {p.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{p.recordedBy}</td>
                        <td className="py-2.5 px-3 text-slate-400 italic">{p.notes || '–'}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
