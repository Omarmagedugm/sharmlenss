import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Boat } from '../../types';
import { Ship, Plus, Phone, User, X, Check, Camera } from 'lucide-react';

export const BoatsView: React.FC = () => {
  const { boats, addBoat, updateBoat, photographers, activeRole, t, appLanguage } = useApp();
  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    boatName: '',
    boatNumber: '',
    company: 'Red Sea Marine Tours',
    contactPerson: '',
    phone: '',
    status: 'active' as const,
    notes: '',
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBoat({
      boatName: formData.boatName,
      boatNumber: formData.boatNumber || `SHM-${Math.floor(1000 + Math.random() * 9000)}`,
      company: formData.company,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      status: formData.status,
      notes: formData.notes,
    });
    setIsAddOpen(false);
    setFormData({
      boatName: '',
      boatNumber: '',
      company: 'Red Sea Marine Tours',
      contactPerson: '',
      phone: '',
      status: 'active',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.boatsTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {boats.length} {appLanguage === 'ar' ? 'يخوت ومراكب سياحية في مارينا شرم الشيخ • توزيع المصورين' : 'operational vessels in Sharm El Sheikh • Assigned photographers roster'}
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t.addBoatBtn}</span>
          </button>
        )}
      </div>

      {/* Boats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boats.map((b) => {
          const assignedPhotogs = photographers.filter((p) => p.assignedBoatId === b.id);

          return (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition text-left rtl:text-right"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                    <Ship className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      b.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {b.status === 'active' ? t.activeBoat : t.maintenanceBoat}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-3">
                  {b.boatName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.boatNumberLabel}: {b.boatNumber} • {b.company}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t.contactPersonLabel}: <strong className="text-slate-800 dark:text-slate-200">{b.contactPerson || (appLanguage === 'ar' ? 'ريس اليخت' : 'Assigned Skipper')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-sky-500" />
                    <span>{b.phone || '+20 100 000 0000'}</span>
                  </div>
                </div>

                {b.notes && (
                  <p className="mt-3 text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                    {b.notes}
                  </p>
                )}

                {/* Assigned Photographers */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {appLanguage === 'ar' ? `المصورون المكلفون (${assignedPhotogs.length})` : `Assigned Photographers (${assignedPhotogs.length})`}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedPhotogs.length === 0 ? (
                      <span className="text-xs text-slate-400">{appLanguage === 'ar' ? 'لا يوجد مصورين معينين' : 'None assigned'}</span>
                    ) : (
                      assignedPhotogs.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 px-2 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300"
                        >
                          <Camera className="h-3 w-3" />
                          <span>{p.fullName}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {isOwnerOrAdmin && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() =>
                      updateBoat(b.id, {
                        status: b.status === 'active' ? 'maintenance' : 'active',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    {b.status === 'active'
                      ? (appLanguage === 'ar' ? 'تحويل للصيانة' : 'Set Maintenance')
                      : (appLanguage === 'ar' ? 'تفعيل في الخدمة' : 'Set Active')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Boat Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t.addBoatModalTitle}</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.boatNameLabel} *</label>
                <input
                  type="text"
                  required
                  placeholder={appLanguage === 'ar' ? 'مثال: يخت نجمة سيناء الفاخر' : 'e.g. Sinai Star Luxury Catamaran'}
                  value={formData.boatName}
                  onChange={(e) => setFormData({ ...formData, boatName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.boatNumberLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. SHM-9812"
                    value={formData.boatNumber}
                    onChange={(e) => setFormData({ ...formData, boatNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.companyLabel}</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t.contactPersonLabel}</label>
                  <input
                    type="text"
                    placeholder={appLanguage === 'ar' ? 'مثال: الريس شريف' : 'e.g. Captain Sherif'}
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{appLanguage === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    placeholder="+20 100..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{appLanguage === 'ar' ? 'ملاحظات ورصيف المارينا' : 'Notes / Marina Pier'}</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={appLanguage === 'ar' ? 'رقم الرصيف في مارينا ترافكو أو خليج القرش...' : 'Pier number at Travco Marina or Shark Bay jetty...'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
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
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
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
