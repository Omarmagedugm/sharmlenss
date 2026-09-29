import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PhotographerPayment, PaymentMethod } from '../../types';
import {
  CreditCard,
  Plus,
  DollarSign,
  Download,
  Calendar,
  CheckCircle2,
  X,
  FileText,
  Printer,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const PaymentsView: React.FC<{ initialPhotographerId?: string }> = ({
  initialPhotographerId,
}) => {
  const {
    payments,
    photographers,
    addPayment,
    getPhotographerStats,
    formatCurrency,
    activeRole,
    activePhotographerId,
    t,
    appLanguage,
  } = useApp();

  const isPhotographer = activeRole === 'photographer';
  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';
  const isAccountant = activeRole === 'accountant';

  const [isAddOpen, setIsAddOpen] = useState(!!initialPhotographerId);
  const [formPhotogId, setFormPhotogId] = useState(initialPhotographerId || photographers[0]?.id || 'photo-1');
  const [formAmount, setFormAmount] = useState(1000);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formMethod, setFormMethod] = useState<PaymentMethod>('cash');
  const [formRef, setFormRef] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Selected photog stats
  const targetStats = getPhotographerStats(formPhotogId);

  // Filtered payments
  const displayedPayments = payments.filter((p) => {
    if (isPhotographer && p.photographerId !== activePhotographerId) {
      return false;
    }
    return true;
  });

  const totalPaidOut = displayedPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) return;

    await addPayment({
      photographerId: formPhotogId,
      amount: Number(formAmount),
      date: formDate,
      paymentMethod: formMethod,
      referenceNumber: formRef || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: formNotes,
    });

    setIsAddOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Receipt #', 'Date', 'Photographer', 'Amount', 'Payment Method', 'Recorded By', 'Notes'];
    const rows = displayedPayments.map((p) => [
      p.referenceNumber || p.id,
      p.date,
      p.photographerName,
      p.amount,
      p.paymentMethod,
      p.recordedBy,
      p.notes || '',
    ]);
    exportToCSV('SharmLens_Photographer_Payouts', rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.paymentsTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {appLanguage === 'ar'
              ? `${displayedPayments.length} مدفوعات مسجلة • تتبع مستحقات المصورين وتسوية العمولات النقدية`
              : `${displayedPayments.length} payouts issued • Track commission settlements and cash balances`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4" />
            <span>{appLanguage === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          {!isPhotographer && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>{t.recordPayment}</span>
            </button>
          )}
        </div>
      </div>

      {/* Photographer Balance Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photographers
          .filter((p) => (isPhotographer ? p.id === activePhotographerId : true))
          .map((p) => {
            const stats = getPhotographerStats(p.id);
            const due = stats?.remainingBalance ?? 0;

            return (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {p.fullName}
                    </h3>
                    <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                      {p.commissionPercentage}% {t.commissionRate}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {t.totalCommission}
                      </span>
                      <strong className="text-slate-900 dark:text-white text-sm font-black">
                        {formatCurrency(stats?.totalCommission ?? 0)}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {t.paidCommission}
                      </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
                        {formatCurrency(stats?.totalPaid ?? 0)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      {t.remainingCommission}:
                    </span>
                    <strong className="text-base font-black text-amber-900 dark:text-amber-200">
                      {formatCurrency(due)}
                    </strong>
                  </div>
                </div>

                {!isPhotographer && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        setFormPhotogId(p.id);
                        setFormAmount(Math.max(0, due));
                        setIsAddOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                    >
                      {appLanguage === 'ar'
                        ? `صرف المستحقات (${formatCurrency(due)})`
                        : `Pay Settlement (${formatCurrency(due)})`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Payout History Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {appLanguage === 'ar' ? 'سندات وإيصالات تسوية العمولات' : 'Payout Settlement Vouchers & Receipts'}
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {appLanguage === 'ar' ? 'إجمالي المنصرف: ' : 'Total Disbursed: '}
            <strong className="text-emerald-600">{formatCurrency(totalPaidOut)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'رقم الإيصال / السند' : 'Receipt / Ref #'}</th>
                <th className="py-3 px-4">{t.photographer}</th>
                <th className="py-3 px-4">{t.paymentMethod}</th>
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'صرف بواسطة' : 'Disbursed By'}</th>
                <th className="py-3 px-4">{t.notes}</th>
                <th className="py-3 px-4">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-500 font-medium">{p.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {p.referenceNumber || p.id}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {p.photographerName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                      {p.paymentMethod === 'cash'
                        ? t.cash
                        : p.paymentMethod === 'card'
                        ? t.card
                        : p.paymentMethod === 'bank_transfer'
                        ? t.bankTransfer
                        : p.paymentMethod === 'online'
                        ? t.onlinePayment
                        : p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{p.recordedBy}</td>
                  <td className="py-3 px-4 text-slate-400 italic">{p.notes || '–'}</td>
                  <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.recordPayment}
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.photographer} *
                </label>
                <select
                  required
                  value={formPhotogId}
                  onChange={(e) => setFormPhotogId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-semibold"
                >
                  {photographers.map((p) => {
                    const st = getPhotographerStats(p.id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({t.remainingCommission}: {formatCurrency(st?.remainingBalance ?? 0)})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Balance due indicator */}
              {targetStats && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                  <span className="text-amber-800 dark:text-amber-300 font-semibold">
                    {appLanguage === 'ar' ? 'الرصيد المتبقي المستحق للمصور:' : 'Current Unpaid Balance:'}
                  </span>
                  <strong className="text-amber-900 dark:text-amber-200 text-sm font-black">
                    {formatCurrency(targetStats.remainingBalance)}
                  </strong>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {appLanguage === 'ar' ? 'مبلغ الصرف (جنيه مصري) *' : 'Payout Amount (EGP) *'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-black text-sm text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold capitalize"
                  >
                    <option value="cash">{t.cash} {appLanguage === 'ar' ? '(خزينة المركز)' : '(Safe Box)'}</option>
                    <option value="bank_transfer">{t.bankTransfer} (CIB/NBE)</option>
                    <option value="online">{t.onlinePayment} / Vodafone Cash / InstaPay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {appLanguage === 'ar' ? 'رقم الإيصال / السند' : 'Reference / Voucher #'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-5491"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.notes}
                </label>
                <input
                  type="text"
                  placeholder={appLanguage === 'ar' ? 'تسوية نقدية بموجب توقيع المصور' : 'e.g. Weekly settlement signed by photographer'}
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
