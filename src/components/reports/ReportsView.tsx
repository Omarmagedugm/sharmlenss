import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Filter,
  FileSpreadsheet,
  Users,
  Compass,
  ShoppingBag,
  CreditCard,
  Percent,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const ReportsView: React.FC = () => {
  const {
    photographers,
    trips,
    boats,
    sales,
    payments,
    customers,
    dailyClosings,
    getPhotographerStats,
    formatCurrency,
    t,
    appLanguage,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [selectedPhotogId, setSelectedPhotogId] = useState<string>('all');
  const [selectedBoatId, setSelectedBoatId] = useState<string>('all');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filtered photographers list
  const filteredPhotogs = photographers.filter((p) => {
    if (selectedPhotogId !== 'all' && p.id !== selectedPhotogId) return false;
    if (selectedBoatId !== 'all' && p.assignedBoatId !== selectedBoatId) return false;
    return true;
  });

  // Export actions
  const exportSalesReport = () => {
    const headers = ['Sale ID', 'Date', 'Customer', 'Hotel', 'Room', 'Photographer', 'Gross', 'Net', 'Comm %', 'Comm Amount', 'Center Revenue', 'Status'];
    const rows = sales.map((s) => [
      s.saleId,
      s.date,
      s.customerName,
      s.customerHotel || '',
      s.customerRoom || '',
      s.photographerName,
      s.grossAmount,
      s.netAmount,
      `${s.commissionPercentage}%`,
      s.commissionAmount,
      s.centerRevenue,
      s.paymentStatus,
    ]);
    exportToCSV('SharmLens_Sales_Report', rows, headers);
  };

  const exportCommissionsReport = () => {
    const headers = ['Photographer', 'Commission Rate %', 'Total Sales', 'Total Commission', 'Paid Commission', 'Remaining Balance', 'Conversion Rate %'];
    const rows = photographers.map((p) => {
      const st = getPhotographerStats(p.id);
      return [
        p.fullName,
        `${p.commissionPercentage}%`,
        st?.netSales ?? 0,
        st?.totalCommission ?? 0,
        st?.totalPaid ?? 0,
        st?.remainingBalance ?? 0,
        `${st?.conversionRate ?? 0}%`,
      ];
    });
    exportToCSV('SharmLens_Photographer_Commissions', rows, headers);
  };

  const exportCustomersReport = () => {
    const headers = ['Customer ID', 'Date', 'Full Name', 'Hotel', 'Room', 'Country', 'People Count', 'Photographer', 'Gallery Code'];
    const rows = customers.map((c) => [
      c.customerId,
      c.createdAt.slice(0, 10),
      c.fullName,
      c.hotel,
      c.roomNumber,
      c.country,
      c.peopleCount,
      c.photographerName || '',
      c.galleryCode,
    ]);
    exportToCSV('SharmLens_Customers_Directory', rows, headers);
  };

  const exportTripsReport = () => {
    const headers = ['Trip ID', 'Date', 'Destination', 'Boat', 'Departure', 'Return', 'Expected', 'Actual', 'Status'];
    const rows = trips.map((t) => [
      t.tripId,
      t.date,
      t.destination,
      t.boatName,
      t.departureTime,
      t.returnTime,
      t.expectedCustomers,
      t.actualCustomers,
      t.status,
    ]);
    exportToCSV('SharmLens_Boat_Trips', rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.reportsTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {appLanguage === 'ar'
              ? 'تصدير تقارير محاسبية مفصلة بصيغة Excel / CSV ومتابعة معدلات تحويل المصورين'
              : 'Export comprehensive Excel / CSV audit sheets & photographer conversion metrics'}
          </p>
        </div>
      </div>

      {/* Quick Export Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={exportSalesReport}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right hover:border-sky-500 transition group"
        >
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'تقرير المبيعات CSV' : 'Export Sales CSV'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {appLanguage === 'ar' ? 'جميع المعاملات والعمولات' : 'All transactions & commissions'}
          </p>
        </button>

        <button
          onClick={exportCommissionsReport}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right hover:border-amber-500 transition group"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
            <Percent className="h-4 w-4" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'تقرير العمولات والتسويات' : 'Commissions Export'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {appLanguage === 'ar' ? 'أرصدة المصورين والمستحقات' : 'Settlement & payout balances'}
          </p>
        </button>

        <button
          onClick={exportCustomersReport}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right hover:border-emerald-500 transition group"
        >
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
            <Users className="h-4 w-4" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'دليل السياح والضيوف' : 'Guests Directory'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {appLanguage === 'ar' ? 'الفنادق، الغرف ومعارض الصور' : 'Hotels, rooms & passes'}
          </p>
        </button>

        <button
          onClick={exportTripsReport}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right hover:border-indigo-500 transition group"
        >
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
            <Compass className="h-4 w-4" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'سجل رحلات اللنشات' : 'Boat Trips Log'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {appLanguage === 'ar' ? 'الرحلات اليومية بالمارينا' : 'Daily marina excursions'}
          </p>
        </button>
      </div>

      {/* Photographer Performance Matrix Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {appLanguage === 'ar' ? 'مؤشرات أداء المصورين التفصيلية' : 'Photographer Performance Metrics'}
            </h3>
            <p className="text-xs text-slate-400">
              {appLanguage === 'ar'
                ? 'الرحلات، نسبة تحويل العملاء، متوسط المبيعات ومساهمة كل مصور في إيراد المركز'
                : 'Trips, customer conversion %, average sales and center revenue contributions'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBoatId}
              onChange={(e) => setSelectedBoatId(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs"
            >
              <option value="all">
                {appLanguage === 'ar' ? 'جميع اللنشات' : 'All Boats'}
              </option>
              {boats.map((b) => (
                <option key={b.id} value={b.id}>{b.boatName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">{t.photographer}</th>
                <th className="py-3 px-4">{t.commissionRate}</th>
                <th className="py-3 px-4">{t.totalTrips}</th>
                <th className="py-3 px-4">{t.totalCustomers}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'مشترين / لم يشتروا' : 'Buyers / Non-Buyers'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'نسبة التحويل' : 'Conversion'}</th>
                <th className="py-3 px-4">{t.totalSales}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'متوسط الفاتورة' : 'Avg Sale'}</th>
                <th className="py-3 px-4">{t.totalCommission}</th>
                <th className="py-3 px-4">{t.centerRevenue}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPhotogs.map((p) => {
                const st = getPhotographerStats(p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {p.fullName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {p.assignedBoatName || (appLanguage === 'ar' ? 'لنش بحري' : 'Vessel')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400">
                      {p.commissionPercentage}%
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {st?.totalTrips ?? 0}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {st?.totalCustomers ?? 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {st?.buyersCount ?? 0}
                      </span>
                      <span className="text-slate-400 mx-1">/ {st?.nonBuyersCount ?? 0}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-lg bg-sky-50 dark:bg-sky-950 px-2 py-0.5 text-xs font-black text-sky-700 dark:text-sky-300">
                        {st?.conversionRate ?? 0}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {formatCurrency(st?.netSales ?? 0)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(st?.averageSale ?? 0)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(st?.totalCommission ?? 0)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(st?.centerRevenue ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
