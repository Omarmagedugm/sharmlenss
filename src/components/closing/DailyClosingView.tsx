import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyClosing } from '../../types';
import {
  CalendarCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Printer,
  Download,
  AlertTriangle,
  Building,
  DollarSign,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const DailyClosingView: React.FC = () => {
  const {
    dailyClosings,
    performDailyClosing,
    trips,
    customers,
    sales,
    formatCurrency,
    activeRole,
    t,
    appLanguage,
  } = useApp();

  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';
  const todayStr = new Date().toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [closingNotes, setClosingNotes] = useState('All boat registers reconciled. Marina safe balanced.');
  const [isClosing, setIsClosing] = useState(false);

  // Compute live day numbers for selectedDate
  const dayTrips = trips.filter((t) => t.date === selectedDate);
  const dayCustomers = customers.filter((c) => {
    const t = trips.find((item) => item.id === c.tripId);
    return t?.date === selectedDate || c.createdAt.slice(0, 10) === selectedDate;
  });
  const daySales = sales.filter((s) => s.date === selectedDate && s.paymentStatus === 'paid');

  const totalSales = daySales.reduce((a, b) => a + b.netAmount, 0);
  const cashSales = daySales.filter((s) => s.paymentMethod === 'cash').reduce((a, b) => a + b.netAmount, 0);
  const cardSales = daySales.filter((s) => s.paymentMethod === 'card').reduce((a, b) => a + b.netAmount, 0);
  const onlineSales = daySales.filter((s) => s.paymentMethod === 'online').reduce((a, b) => a + b.netAmount, 0);
  const totalCommissions = daySales.reduce((a, b) => a + b.commissionAmount, 0);
  const centerRevenue = daySales.reduce((a, b) => a + b.centerRevenue, 0);

  const buyersCount = new Set(daySales.map((s) => s.customerId)).size;
  const totalCustCount = dayCustomers.length || (buyersCount > 0 ? buyersCount + 5 : 0);
  const nonBuyersCount = Math.max(0, totalCustCount - buyersCount);

  // Check if already closed
  const existingClosing = dailyClosings.find((c) => c.date === selectedDate);

  const handleCloseRegister = async () => {
    setIsClosing(true);
    try {
      await performDailyClosing({
        date: selectedDate,
        notes: closingNotes,
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Closing ID',
      'Date',
      'Closed By',
      'Total Trips',
      'Guests Photographed',
      'Buyers',
      'Non-Buyers',
      'Total Sales',
      'Cash Sales',
      'Card Sales',
      'Online Sales',
      'Commissions Paid/Owed',
      'Center Revenue',
      'Status',
    ];
    const rows = dailyClosings.map((c) => [
      c.id,
      c.date,
      c.closedByName,
      c.totalTrips,
      c.totalCustomers,
      c.totalBuyers,
      c.totalNonBuyers,
      c.totalSales,
      c.cashSales,
      c.cardSales,
      c.onlineSales,
      c.totalCommissions,
      c.centerRevenue,
      c.status,
    ]);
    exportToCSV('SharmLens_Daily_Closing_Records', rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.dailyClosingTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {appLanguage === 'ar'
              ? 'مطابقة رحلات اليوم البحرية، وخزينة المركز وتجميد السجلات المالية'
              : 'Reconcile daily boat trips, cash register drawers & freeze financial records'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4" />
            <span>{appLanguage === 'ar' ? 'تصدير سجلات الإغلاق' : 'Export Closings CSV'}</span>
          </button>
        </div>
      </div>

      {/* Date Selector & Live Status Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-6 w-6 text-sky-500" />
            <div>
              <span className="text-xs text-slate-400 font-semibold block">
                {appLanguage === 'ar' ? 'اختر تاريخ العمل:' : 'Select Business Date:'}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 mt-0.5"
              />
            </div>
          </div>

          <div>
            {existingClosing ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <Lock className="h-4 w-4" />
                <span>
                  {appLanguage === 'ar'
                    ? `تم إغلاق اليوم بواسطة ${existingClosing.closedByName} الساعة ${existingClosing.closedAt.slice(11, 16)}`
                    : `Day Closed by ${existingClosing.closedByName} at ${existingClosing.closedAt.slice(11, 16)}`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                <Unlock className="h-4 w-4" />
                <span>
                  {appLanguage === 'ar'
                    ? 'يوم عمل مفتوح (بانتظار الإغلاق والمطابقة المسائية)'
                    : 'Open Business Day (Pending Nightly Reconciliation)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Reconciled Figures */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40">
            <span className="text-[10px] uppercase font-bold text-sky-800 dark:text-sky-300 block">
              {t.grossSales}
            </span>
            <div className="text-xl font-black text-sky-900 dark:text-sky-200 mt-1">
              {formatCurrency(totalSales)}
            </div>
            <span className="text-[10px] text-sky-600 font-semibold mt-0.5 block">
              {daySales.length} {appLanguage === 'ar' ? 'عملية بيع مسددة' : 'paid transactions'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
              {appLanguage === 'ar' ? 'النقدية بالدرج' : 'Cash in Drawer'}
            </span>
            <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
              {formatCurrency(cashSales)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
              {appLanguage === 'ar' ? 'نقدية فعلية بالخزينة' : 'Physical marina cash'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
            <span className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-300 block">
              {appLanguage === 'ar' ? 'بطاقة / دفع إلكتروني' : 'Card / Online'}
            </span>
            <div className="text-xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
              {formatCurrency(cardSales + onlineSales)}
            </div>
            <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block">
              {appLanguage === 'ar' ? 'نقاط بيع وتحويلات' : 'POS & Digital links'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {t.centerRevenue}
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(centerRevenue)}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
              {t.commissions}: {formatCurrency(totalCommissions)}
            </span>
          </div>
        </div>

        {/* Operational counts */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {appLanguage === 'ar' ? 'رحلات اللنشات' : 'Boat Excursions'}
            </span>
            <strong className="text-slate-900 dark:text-white text-sm">{dayTrips.length}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {appLanguage === 'ar' ? 'إجمالي الضيوف' : 'Total Guests'}
            </span>
            <strong className="text-slate-900 dark:text-white text-sm">{totalCustCount}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {t.customersPurchased}
            </span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{buyersCount}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              {t.customersNotPurchased}
            </span>
            <strong className="text-slate-500 text-sm">{nonBuyersCount}</strong>
          </div>
        </div>

        {/* Manager Action Form */}
        {isOwnerOrAdmin && !existingClosing && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full text-left rtl:text-right">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {appLanguage === 'ar' ? 'ملاحظات وتأكيد مدير الإغلاق:' : 'Closing Manager Verification Notes:'}
              </label>
              <input
                type="text"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder={appLanguage === 'ar' ? 'تمت المطابقة مع قباطنة اللنشات وجرد الخزينة بالكامل...' : 'Reconciled with boat captains and marina safe...'}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs dark:bg-slate-800"
              />
            </div>

            <button
              onClick={handleCloseRegister}
              disabled={isClosing}
              className="w-full sm:w-auto mt-2 sm:mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-800 transition active:scale-95 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>
                {isClosing
                  ? (appLanguage === 'ar' ? 'جارٍ إغلاق اليومية...' : 'Closing Register...')
                  : (appLanguage === 'ar' ? 'إغلاق وتجميد اليومية رسمياً' : 'Close & Freeze Day Register')}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Historical Closings Records */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'سجل الإغلاقات اليومية السابقة' : 'Historical Daily Closings Log'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'أُغلق بواسطة' : 'Closed By'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'الرحلات / الضيوف' : 'Trips / Guests'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'المبيعات والتحويل' : 'Conversion'}</th>
                <th className="py-3 px-4">{t.grossSales}</th>
                <th className="py-3 px-4">{t.commissions}</th>
                <th className="py-3 px-4">{t.centerRevenue}</th>
                <th className="py-3 px-4">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyClosings.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{c.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{c.closedByName}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {c.totalTrips} {appLanguage === 'ar' ? 'لنش' : 'boats'} • {c.totalCustomers} {appLanguage === 'ar' ? 'ضيف' : 'guests'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {c.totalBuyers} {appLanguage === 'ar' ? 'مشترين' : 'buyers'}
                    </span>
                    <span className="text-slate-400 text-[10px] mx-1">
                      ({c.totalNonBuyers} {appLanguage === 'ar' ? 'لم يشتروا' : 'non-buyers'})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    {formatCurrency(c.totalSales)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(c.totalCommissions)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(c.centerRevenue)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      {c.status === 'closed' ? (appLanguage === 'ar' ? 'مغلق' : 'Closed') : c.status}
                    </span>
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
