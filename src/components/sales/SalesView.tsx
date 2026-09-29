import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, Sale, PaymentMethod, PaymentStatus } from '../../types';
import {
  ShoppingBag,
  Plus,
  DollarSign,
  Download,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  RotateCcw,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const SalesView: React.FC<{ preSelectedCustomer?: Customer | null }> = ({
  preSelectedCustomer,
}) => {
  const {
    sales,
    customers,
    photographers,
    trips,
    packages,
    createSale,
    updateSaleStatus,
    formatCurrency,
    activeRole,
    activePhotographerId,
    t,
    appLanguage,
  } = useApp();

  const isPhotographer = activeRole === 'photographer';
  const isAccountant = activeRole === 'accountant';

  const [isAddOpen, setIsAddOpen] = useState(!!preSelectedCustomer);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchSale, setSearchSale] = useState('');

  // Form state
  const [formCustomerId, setFormCustomerId] = useState(preSelectedCustomer?.id || customers[0]?.id || '');
  const [formPhotogId, setFormPhotogId] = useState(
    preSelectedCustomer?.photographerId || activePhotographerId || photographers[0]?.id || 'photo-1'
  );
  const [formTripId, setFormTripId] = useState(preSelectedCustomer?.tripId || trips[0]?.id || 'trip-today-1');
  const [formPkgId, setFormPkgId] = useState(packages[1]?.id || 'pkg-20');
  const [formGross, setFormGross] = useState(packages[1]?.price || 1000);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('cash');
  const [formStatus, setFormStatus] = useState<PaymentStatus>('paid');
  const [formNotes, setFormNotes] = useState('');

  // Active photographer chosen in form
  const selectedPhotog = photographers.find((p) => p.id === formPhotogId);
  const commRate = selectedPhotog?.commissionPercentage ?? 30;

  // Real-time calculation previews
  const gross = Number(formGross) || 0;
  const discount = Number(formDiscount) || 0;
  const net = Math.max(0, gross - discount);
  const commAmount = Math.round(net * (commRate / 100));
  const centerRevenue = net - commAmount;

  // When customer changes in form, auto-fill trip & photographer
  const handleCustomerChange = (cId: string) => {
    setFormCustomerId(cId);
    const c = customers.find((item) => item.id === cId);
    if (c) {
      if (c.tripId) setFormTripId(c.tripId);
      if (c.photographerId) setFormPhotogId(c.photographerId);
    }
  };

  const handlePackageChange = (pId: string) => {
    setFormPkgId(pId);
    const p = packages.find((item) => item.id === pId);
    if (p) {
      setFormGross(p.price);
    }
  };

  const handleCreateSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find((p) => p.id === formPkgId);

    await createSale({
      customerId: formCustomerId,
      photographerId: formPhotogId,
      tripId: formTripId,
      selectedPhotoIds: [],
      packageId: formPkgId,
      packageName: pkg?.name || 'Standard Package',
      quantity: 1,
      grossAmount: gross,
      discount,
      paymentMethod: formMethod,
      paymentStatus: formStatus,
      notes: formNotes,
    });

    setIsAddOpen(false);
  };

  // Filtered sales
  const displayedSales = sales.filter((s) => {
    if (isPhotographer && s.photographerId !== activePhotographerId) {
      return false;
    }
    if (statusFilter !== 'all' && s.paymentStatus !== statusFilter) {
      return false;
    }
    if (searchSale) {
      const q = searchSale.toLowerCase();
      return (
        s.saleId.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.photographerName.toLowerCase().includes(q) ||
        (s.customerHotel && s.customerHotel.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Totals
  const totalSalesNet = displayedSales.filter((s) => s.paymentStatus === 'paid').reduce((a, b) => a + b.netAmount, 0);
  const totalComm = displayedSales.filter((s) => s.paymentStatus === 'paid').reduce((a, b) => a + b.commissionAmount, 0);
  const totalCenter = displayedSales.filter((s) => s.paymentStatus === 'paid').reduce((a, b) => a + b.centerRevenue, 0);

  const handleExportCSV = () => {
    const headers = [
      'Sale ID',
      'Date',
      'Customer',
      'Hotel',
      'Room',
      'Photographer',
      'Package',
      'Gross Amount',
      'Discount',
      'Net Amount',
      'Comm %',
      'Photographer Commission',
      'Center Revenue',
      'Payment Method',
      'Payment Status',
    ];
    const rows = displayedSales.map((s) => [
      s.saleId,
      s.date,
      s.customerName,
      s.customerHotel || '',
      s.customerRoom || '',
      s.photographerName,
      s.packageName || '',
      s.grossAmount,
      s.discount,
      s.netAmount,
      `${s.commissionPercentage}%`,
      s.commissionAmount,
      s.centerRevenue,
      s.paymentMethod,
      s.paymentStatus,
    ]);
    exportToCSV('SharmLens_Sales_Report', rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.salesTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {displayedSales.length} {appLanguage === 'ar' ? 'عملية بيع • نسب العمولات التاريخية محفوظة ومجمدة' : 'transactions • Historical commission rates permanently locked'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t.createNewSale}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.totalNetSales}</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalSalesNet)}
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.photographerCommissions}</div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {formatCurrency(totalComm)}
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.centerRevenue}</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalCenter)}
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Building className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder={appLanguage === 'ar' ? 'بحث بكود البيع، النزيل، الفندق، المصور...' : 'Search sale ID, customer, hotel, photographer...'}
            value={searchSale}
            onChange={(e) => setSearchSale(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'paid', 'unpaid', 'refunded'] as const).map((st) => {
            const stLabel =
              st === 'all'
                ? t.all
                : st === 'paid'
                ? t.paid
                : st === 'unpaid'
                ? t.unpaid
                : t.refunded;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition capitalize ${
                  statusFilter === st
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {stLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'كود البيع / التاريخ' : 'Sale ID / Date'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'النزيل' : 'Guest'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'المصور' : 'Photographer'}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'الباقة' : 'Package'}</th>
                <th className="py-3 px-4">{t.netAmount}</th>
                <th className="py-3 px-4">{t.photographerShare}</th>
                <th className="py-3 px-4">{t.centerShare}</th>
                <th className="py-3 px-4">{t.paymentMethod}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'الحالة / الإجراء' : 'Status / Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">{s.saleId}</div>
                    <div className="text-[10px] text-slate-400">{s.date}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{s.customerName}</div>
                    <div className="text-[10px] text-slate-400">
                      {s.customerHotel} ({appLanguage === 'ar' ? 'غرفة' : 'Rm'} {s.customerRoom})
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{s.photographerName}</div>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                      {s.commissionPercentage}% {appLanguage === 'ar' ? 'مجمدة' : 'locked'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                    {s.packageName}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    {formatCurrency(s.netAmount)}
                    {s.discount > 0 && (
                      <span className="block text-[10px] text-rose-500 font-normal">
                        {appLanguage === 'ar' ? 'خصم:' : 'disc:'} -{s.discount}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(s.commissionAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(s.centerRevenue)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                      {s.paymentMethod === 'cash'
                        ? (appLanguage === 'ar' ? 'كاش' : 'Cash')
                        : s.paymentMethod === 'card'
                        ? (appLanguage === 'ar' ? 'بطاقة' : 'Card')
                        : s.paymentMethod === 'online'
                        ? (appLanguage === 'ar' ? 'أونلاين' : 'Online')
                        : (appLanguage === 'ar' ? 'تحويل' : 'Transfer')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          s.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : s.paymentStatus === 'unpaid'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {s.paymentStatus === 'paid'
                          ? t.paid
                          : s.paymentStatus === 'unpaid'
                          ? t.unpaid
                          : t.refunded}
                      </span>

                      {/* Quick status toggles for management */}
                      {!isPhotographer && s.paymentStatus === 'unpaid' && (
                        <button
                          onClick={() => updateSaleStatus(s.id, 'paid')}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                          title="Confirm Cash / Card received"
                        >
                          {appLanguage === 'ar' ? 'تسديد' : 'Mark Paid'}
                        </button>
                      )}
                      {!isPhotographer && s.paymentStatus === 'paid' && (
                        <button
                          onClick={() => updateSaleStatus(s.id, 'refunded')}
                          className="px-1.5 py-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-[10px]"
                          title="Refund"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sale Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t.createSaleModalTitle}</h3>
                  <p className="text-[11px] text-slate-400">{t.salesSub}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSaleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Select Customer */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.selectCustomer} *
                </label>
                <select
                  required
                  value={formCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} • {appLanguage === 'ar' ? 'غرفة' : 'Room'} {c.roomNumber} ({c.hotel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Photographer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerName} *
                  </label>
                  <select
                    value={formPhotogId}
                    onChange={(e) => setFormPhotogId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                  >
                    {photographers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.commissionPercentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.selectPackage}
                  </label>
                  <select
                    value={formPkgId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({formatCurrency(pkg.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Discounts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.grossAmount} ({t.currencyEGP}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formGross}
                    onChange={(e) => setFormGross(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.discount} ({t.currencyEGP})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* AUTOMATIC COMMISSION CALCULATION BOX (LIVE ENGINE) */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">{t.netAmount}:</span>
                  <strong className="text-sm font-black text-white">{formatCurrency(net)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">
                    {t.photographerShare} ({commRate}%):
                  </span>
                  <strong className="text-sm font-black text-amber-400">{formatCurrency(commAmount)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">
                    {t.centerShare} ({100 - commRate}%):
                  </span>
                  <strong className="text-sm font-black text-emerald-400">{formatCurrency(centerRevenue)}</strong>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  {t.historicalLockNotice}
                </p>
              </div>

              {/* Payment Method & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 capitalize font-medium"
                  >
                    <option value="cash">{t.cashDrawer}</option>
                    <option value="card">{t.cardMarina}</option>
                    <option value="online">{t.onlinePay}</option>
                    <option value="bank_transfer">{t.bankTransfer}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.paymentStatus}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PaymentStatus)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 capitalize font-medium"
                  >
                    <option value="paid">{t.paid}</option>
                    <option value="unpaid">{t.unpaid}</option>
                    <option value="partially_paid">{t.partiallyPaid}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'ملاحظات عملية البيع' : 'Sale Notes'}
                </label>
                <input
                  type="text"
                  placeholder={appLanguage === 'ar' ? 'مثال: تم الدفع نقداً على متن اليخت' : 'e.g. Paid in EGP cash on deck'}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  {t.saveSaleBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
