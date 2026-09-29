import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PhotoPackage } from '../../types';
import { PackageCheck, Plus, Check, X, Edit, Trash2, Sparkles } from 'lucide-react';

export const PackagesView: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage, formatCurrency, activeRole, t, appLanguage } = useApp();
  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PhotoPackage | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photoCount: 10,
    price: 800,
    active: true,
    isPopular: false,
  });

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setFormData({
      name: '',
      description: '',
      photoCount: 15,
      price: 900,
      active: true,
      isPopular: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: PhotoPackage) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      photoCount: pkg.photoCount,
      price: pkg.price,
      active: pkg.active,
      isPopular: !!pkg.isPopular,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPkg) {
      await updatePackage(editingPkg.id, {
        name: formData.name,
        description: formData.description,
        photoCount: Number(formData.photoCount),
        price: Number(formData.price),
        active: formData.active,
        isPopular: formData.isPopular,
      });
    } else {
      await addPackage({
        name: formData.name,
        description: formData.description,
        photoCount: Number(formData.photoCount),
        price: Number(formData.price),
        active: formData.active,
        isPopular: formData.isPopular,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.packagesTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {packages.length} {appLanguage === 'ar' ? 'باقات تصوير سياحية • أسعار ديناميكية قابلة للتعديل من لوحة الإدارة' : 'packages • Dynamic prices editable from admin panel'}
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t.addPackageBtn}</span>
          </button>
        )}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`p-6 rounded-3xl border transition flex flex-col justify-between text-left rtl:text-right ${
              pkg.active
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <PackageCheck className="h-5 w-5" />
                </div>
                {pkg.isPopular && (
                  <span className="rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase shadow">
                    {appLanguage === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-3">
                {pkg.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {pkg.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  {pkg.photoCount === 0
                    ? (appLanguage === 'ar' ? 'جميع الصور (غير محدود)' : 'All Photos (Unlimited)')
                    : `${pkg.photoCount} ${appLanguage === 'ar' ? 'صور عالية الدقة' : 'HD Photos'}`}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(pkg.price)}
                </span>
              </div>
            </div>

            {isOwnerOrAdmin && (
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() =>
                    updatePackage(pkg.id, { active: !pkg.active })
                  }
                  className={`text-xs font-bold ${pkg.active ? 'text-amber-600' : 'text-emerald-600'}`}
                >
                  {pkg.active
                    ? (appLanguage === 'ar' ? 'تعطيل الباقة' : 'Set Inactive')
                    : (appLanguage === 'ar' ? 'تفعيل الباقة' : 'Activate')}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600"
                    title={appLanguage === 'ar' ? 'تعديل الباقة والسعر' : 'Edit Package & Price'}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                    title={appLanguage === 'ar' ? 'حذف الباقة' : 'Delete Package'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {editingPkg
                    ? (appLanguage === 'ar' ? 'تعديل الباقة والسعر' : 'Edit Package & Pricing')
                    : t.addPackageModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'اسم باقة التصوير *' : 'Package Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={appLanguage === 'ar' ? 'مثال: باقة العرسان VIP' : 'e.g. VIP Couple Romantic Shoot'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'الوصف ومحتويات الباقة' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={appLanguage === 'ar' ? 'ما تشمله هذه الباقة...' : 'What is included in this package...'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.packagePriceLabel} *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-black text-sm text-sky-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.packagePhotosLabel} ({appLanguage === 'ar' ? '0 = كل الصور' : '0 = All Photos'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.photoCount}
                    onChange={(e) => setFormData({ ...formData, photoCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <span>{appLanguage === 'ar' ? 'نشطة ومتاحة للبيع' : 'Active & Available for Sale'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded"
                  />
                  <span>{appLanguage === 'ar' ? 'تمييز كـ "الأكثر طلباً"' : 'Mark as "Most Popular"'}</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
