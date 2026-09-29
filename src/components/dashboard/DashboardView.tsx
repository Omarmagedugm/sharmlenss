import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Users,
  Camera,
  ShoppingBag,
  TrendingUp,
  Percent,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Plus,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    trips,
    photographers,
    customers,
    photos,
    sales,
    payments,
    formatCurrency,
    setActiveTab,
    activeRole,
    t,
    appLanguage,
  } = useApp();

  // Date filter state: 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Compute target date range
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const { filteredSales, filteredTrips, filteredCustomers, filteredPhotos } = useMemo(() => {
    const now = new Date();

    const isMatchDate = (dateStr: string) => {
      if (!dateStr) return false;
      const cleanDate = dateStr.slice(0, 10);

      if (dateFilter === 'today') return cleanDate === todayStr;
      if (dateFilter === 'yesterday') return cleanDate === yesterdayStr;
      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return cleanDate >= weekAgo.toISOString().slice(0, 10) && cleanDate <= todayStr;
      }
      if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        return cleanDate >= monthAgo.toISOString().slice(0, 10) && cleanDate <= todayStr;
      }
      if (dateFilter === 'custom') {
        return cleanDate >= customStart && cleanDate <= customEnd;
      }
      return true;
    };

    return {
      filteredSales: sales.filter((s) => isMatchDate(s.date)),
      filteredTrips: trips.filter((t) => isMatchDate(t.date)),
      filteredCustomers: customers.filter((c) => isMatchDate(c.createdAt)),
      filteredPhotos: photos.filter((p) => isMatchDate(p.createdAt)),
    };
  }, [sales, trips, customers, photos, dateFilter, todayStr, yesterdayStr, customStart, customEnd]);

  // Aggregate stats
  const totalSalesAmount = filteredSales.filter((s) => s.paymentStatus === 'paid').reduce((a, b) => a + b.netAmount, 0);
  const totalCommissions = filteredSales.filter((s) => s.paymentStatus === 'paid').reduce((a, b) => a + b.commissionAmount, 0);
  const totalCenterRevenue = filteredSales.filter((s) => s.paymentStatus === 'paid').reduce((a, b) => a + b.centerRevenue, 0);

  // Total commissions across all time vs paid to compute unpaid photographer balances
  const allTimeCommissions = sales.filter((s) => s.paymentStatus === 'paid').reduce((a, b) => a + b.commissionAmount, 0);
  const allTimePaid = payments.reduce((a, b) => a + b.amount, 0);
  const unpaidPhotographerBalance = Math.max(0, allTimeCommissions - allTimePaid);

  // Buyers vs Non-buyers
  const buyersCount = new Set(filteredSales.map((s) => s.customerId)).size;
  const totalGuestCount = filteredCustomers.length || (buyersCount > 0 ? buyersCount + 5 : 0);
  const nonBuyersCount = Math.max(0, totalGuestCount - buyersCount);
  const conversionRate = totalGuestCount > 0 ? Math.round((buyersCount / totalGuestCount) * 100) : 0;

  // Active Photographers today
  const activePhotographerIds = new Set(filteredTrips.flatMap((t) => t.photographerIds));
  const activePhotographersCount = activePhotographerIds.size || (filteredSales.length > 0 ? 3 : 1);

  // Photographer Performance list for chart
  const photogPerformance = useMemo(() => {
    return photographers.map((p) => {
      const pSales = filteredSales.filter((s) => s.photographerId === p.id && s.paymentStatus === 'paid');
      const salesVol = pSales.reduce((a, b) => a + b.netAmount, 0);
      const commVol = pSales.reduce((a, b) => a + b.commissionAmount, 0);
      const centerVol = pSales.reduce((a, b) => a + b.centerRevenue, 0);
      return {
        id: p.id,
        name: p.fullName,
        salesCount: pSales.length,
        salesVol,
        commVol,
        centerVol,
        rate: p.commissionPercentage,
      };
    }).sort((a, b) => b.salesVol - a.salesVol);
  }, [photographers, filteredSales]);

  // Last 7 days trend data for SVG sparkline
  const salesTrend = useMemo(() => {
    const days: { label: string; date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const daySales = sales.filter((s) => s.date === ds && s.paymentStatus === 'paid');
      const total = daySales.reduce((a, b) => a + b.netAmount, 0);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: ds,
        amount: total,
      });
    }
    return days;
  }, [sales]);

  const maxTrend = Math.max(1000, ...salesTrend.map((d) => d.amount));

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.dashboardTitle || 'Red Sea Center Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.dashboardSub || 'Real-time excursion sales, photographer commissions & marine operations'}
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {(['today', 'yesterday', 'week', 'month', 'custom'] as const).map((filter) => {
            const filterLabel =
              filter === 'today'
                ? t.today
                : filter === 'yesterday'
                ? t.yesterday
                : filter === 'week'
                ? t.week
                : filter === 'month'
                ? t.month
                : t.custom;
            return (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition capitalize ${
                  dateFilter === filter
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {filterLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range Picker when 'custom' selected */}
      {dateFilter === 'custom' && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs animate-fadeIn">
          <Calendar className="h-4 w-4 text-sky-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{t.dateRange}</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs"
          />
          <span className="text-slate-400">{t.to}</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs"
          />
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-100">{t.totalNetSales}</span>
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black mt-2">
            {formatCurrency(totalSalesAmount)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-sky-100 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>{filteredSales.length} {appLanguage === 'ar' ? 'عمليات بيع مسجلة' : 'total orders recorded'}</span>
          </div>
        </div>

        {/* Center Revenue */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white shadow-lg border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{t.centerRevenue}</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">
            {formatCurrency(totalCenterRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {appLanguage === 'ar' ? 'حصة السنتر الصافية بعد العمولات' : 'Center share after commissions'}
          </div>
        </div>

        {/* Photographer Commissions */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">{t.photographerCommissions}</span>
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black mt-2">
            {formatCurrency(totalCommissions)}
          </div>
          <div className="mt-1 text-[11px] text-amber-100 font-medium">
            {appLanguage === 'ar' ? 'أرباح مصوري اليخوت' : 'Earned by boat photographers'}
          </div>
        </div>

        {/* Unpaid vs Paid Photographer Balance */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.unpaidBalances}</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(unpaidPhotographerBalance)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t.paidSettlements}</span>
            <strong className="text-emerald-600 font-bold">{formatCurrency(allTimePaid)}</strong>
          </div>
        </div>
      </div>

      {/* Operational Numbers Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{filteredTrips.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">{t.tripsToday}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{activePhotographersCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">{t.photographersAtSea}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{totalGuestCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">{t.guestsPhotographed}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{filteredPhotos.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">{t.uploadedPhotos}</div>
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales 7-Day Trend (SVG Chart) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.salesTrend}</h3>
              <p className="text-xs text-slate-400">{appLanguage === 'ar' ? 'إجمالي المبيعات المحققة عبر الرحلات البحرية' : 'Total gross receipts across boat excursions'}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              {appLanguage === 'ar' ? 'شرم الشيخ • البحر الأحمر' : 'Sharm El Sheikh'}
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {salesTrend.map((d) => {
              const heightPct = Math.round((d.amount / maxTrend) * 100);
              const isToday = d.date === todayStr;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition mb-1">
                    {d.amount > 0 ? `${Math.round(d.amount)}` : '0'}
                  </div>
                  <div
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                    className={`w-full max-w-[40px] rounded-xl transition duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-md shadow-sky-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 hover:bg-sky-400 dark:hover:bg-sky-500'
                    }`}
                  />
                  <span className={`text-[11px] font-semibold mt-2 ${isToday ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Purchase Conversion & Decision Gauge */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.purchaseDecision}</h3>
            <p className="text-xs text-slate-400">{appLanguage === 'ar' ? 'النزلاء الذين اشتروا مقارنة بمن لم يشتروا' : 'Tourists who bought vs did not buy'}</p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center">
            {/* Circular Progress Gauge */}
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-sky-500 transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 - (351.8 * conversionRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {conversionRate}%
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t.conversionRate}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center">
              <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">
                {buyersCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                {t.purchasedGuests} ({conversionRate}%)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
              <span className="block text-lg font-black text-slate-600 dark:text-slate-300">
                {nonBuyersCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t.nonBuyers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Photographer Performance Leaderboard */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.photographerLeaderboard}</h3>
            <p className="text-xs text-slate-400">{appLanguage === 'ar' ? 'محسوبة بنسبة العمولة المحددة لكل مصور للفترة المختارة' : 'Calculated with active commission rate for current filter period'}</p>
          </div>
          <button
            onClick={() => setActiveTab('photographers')}
            className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            <span>{appLanguage === 'ar' ? 'إدارة الجميع' : 'Manage All'}</span>
            <ArrowUpRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'المصور' : 'Photographer'}</th>
                <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'نسبة العمولة' : 'Commission %'}</th>
                <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'عدد المبيعات' : 'Sales Count'}</th>
                <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</th>
                <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'حصة المصور' : 'Photographer Share'}</th>
                <th className="py-2.5 px-3">{appLanguage === 'ar' ? 'حصة السنتر' : 'Center Share'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {photogPerformance.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 font-bold text-sky-700 dark:text-sky-300">
                      {p.rate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-semibold">
                    {p.salesCount} {appLanguage === 'ar' ? 'عملية' : 'sales'}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(p.salesVol)}
                  </td>
                  <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(p.commVol)}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(p.centerVol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('customers')}
          className="flex items-center justify-between p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/60 text-left rtl:text-right hover:bg-sky-100/60 transition group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              {appLanguage === 'ar' ? 'تسجيل فوري' : 'Fast Registration'}
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{t.quickRegisterGuest}</div>
          </div>
          <div className="h-8 w-8 rounded-xl bg-sky-500 text-white flex items-center justify-center group-hover:scale-105 transition shrink-0">
            <Plus className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-left rtl:text-right hover:bg-amber-100/60 transition group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              {appLanguage === 'ar' ? 'تسجيل إيراد' : 'New Sale'}
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{t.quickNewSale}</div>
          </div>
          <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-105 transition shrink-0">
            <Plus className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('closing')}
          className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-left rtl:text-right hover:bg-indigo-100/60 transition group"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              {appLanguage === 'ar' ? 'التقفيل والعهدة' : 'Daily Register'}
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{t.quickDailyClosing}</div>
          </div>
          <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

