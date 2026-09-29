import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile } from '../../types';
import {
  Users,
  Plus,
  ShieldCheck,
  Camera,
  Trash2,
  Edit2,
  Mail,
  CheckCircle2,
  X,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const UsersPermissionsView: React.FC = () => {
  const {
    systemUsers,
    photographers,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser,
    activeRole,
    t,
    appLanguage,
  } = useApp();

  const isOwner = activeRole === 'owner';
  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    email: string;
    displayName: string;
    role: UserRole;
    photographerId: string;
    phone: string;
  }>({
    email: '',
    displayName: '',
    role: 'photographer',
    photographerId: photographers[0]?.id || '',
    phone: '',
  });

  const [editFormData, setEditFormData] = useState<{
    displayName: string;
    role: UserRole;
    photographerId: string;
    phone: string;
    status: 'active' | 'suspended';
  }>({
    displayName: '',
    role: 'photographer',
    photographerId: '',
    phone: '',
    status: 'active',
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selPhotog = photographers.find((p) => p.id === formData.photographerId);

    await addSystemUser({
      email: formData.email.trim().toLowerCase(),
      displayName: formData.displayName.trim() || formData.email.split('@')[0],
      role: formData.role,
      photographerId: formData.role === 'photographer' ? formData.photographerId : undefined,
      photographerName: formData.role === 'photographer' ? selPhotog?.fullName : undefined,
      phone: formData.phone.trim(),
      googleLinked: true,
      status: 'active',
    });

    setIsAddOpen(false);
    setFormData({
      email: '',
      displayName: '',
      role: 'photographer',
      photographerId: photographers[0]?.id || '',
      phone: '',
    });
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFormData({
      displayName: user.displayName,
      role: user.role,
      photographerId: user.photographerId || photographers[0]?.id || '',
      phone: user.phone || '',
      status: user.status || 'active',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const selPhotog = photographers.find((p) => p.id === editFormData.photographerId);

    await updateSystemUser(editingUser.userId, {
      displayName: editFormData.displayName.trim(),
      role: editFormData.role,
      photographerId: editFormData.role === 'photographer' ? editFormData.photographerId : undefined,
      photographerName: editFormData.role === 'photographer' ? selPhotog?.fullName : undefined,
      phone: editFormData.phone.trim(),
      status: editFormData.status,
    });

    setEditingUser(null);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (window.confirm(appLanguage === 'ar' ? `هل أنت متأكد من حذف صلاحية الدخول للمستخدم ${email}؟` : `Remove access for ${email}?`)) {
      await deleteSystemUser(userId);
    }
  };

  return (
    <div className="space-y-5 text-left rtl:text-right">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-500" />
            <span>{t.userManagementTitle}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.userManagementSub}
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t.addUserBtn}</span>
          </button>
        )}
      </div>

      {/* Info notice about Google linking */}
      <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          {appLanguage === 'ar'
            ? 'عند قيام المصور أو المشرف بتسجيل الدخول بحساب Google، يتعرف النظام تلقائياً على بريده المسجل هنا ويوجهه لبوابته المخصصة ومصوره المرتبط به وصلاحياته بدقة.'
            : 'When staff or photographers sign in with Google, SharmLens detects their registered email address below, unlocking their exact role, assigned vessel, and personal commission dashboard.'}
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">{appLanguage === 'ar' ? 'المستخدم والاسم' : 'User & Name'}</th>
                <th className="py-3 px-4">{t.googleEmailLabel}</th>
                <th className="py-3 px-4">{t.roleLabel}</th>
                <th className="py-3 px-4">{t.linkedPhotographerLabel}</th>
                <th className="py-3 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {systemUsers.map((user) => {
                const isPhotog = user.role === 'photographer';
                const isUserOwner = user.role === 'owner';

                return (
                  <tr key={user.userId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                          isUserOwner
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : isPhotog
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {user.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white font-bold block">
                            {user.displayName}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {user.phone || '–'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{user.email}</span>
                        {user.googleLinked && (
                          <span className="rounded px-1.5 py-0.2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 text-[9px] font-bold">
                            Google
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase inline-block ${
                        user.role === 'owner'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : user.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : user.role === 'accountant'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {user.role === 'owner'
                          ? t.roleOwner
                          : user.role === 'admin'
                          ? t.roleAdmin
                          : user.role === 'accountant'
                          ? t.roleAccountant
                          : t.rolePhotographer}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                      {isPhotog ? (
                        <div className="flex items-center gap-1 text-sky-700 dark:text-sky-300">
                          <Camera className="h-3.5 w-3.5 text-sky-500" />
                          <span>{user.photographerName || user.photographerId || (appLanguage === 'ar' ? 'غير محدد' : 'Not linked')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{appLanguage === 'ar' ? 'صلاحية إدارية عامة' : 'General Administrative'}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                          title={t.edit}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {user.role !== 'owner' && (
                          <button
                            onClick={() => handleDeleteUser(user.userId, user.email)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 transition"
                            title={t.delete}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.addUserBtn}
                </h3>
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.googleEmailLabel} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'الاسم الظاهر' : 'Display Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={appLanguage === 'ar' ? 'مثال: أحمد علاء (مصور)' : 'e.g. Ahmed Alaa'}
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.roleLabel} *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
                >
                  <option value="photographer">{t.rolePhotographer}</option>
                  <option value="admin">{t.roleAdmin}</option>
                  <option value="accountant">{t.roleAccountant}</option>
                  {isOwner && <option value="owner">{t.roleOwner}</option>}
                </select>
              </div>

              {formData.role === 'photographer' && (
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40">
                  <label className="block font-bold text-sky-900 dark:text-sky-300 mb-1">
                    {t.linkedPhotographerLabel} *
                  </label>
                  <select
                    required
                    value={formData.photographerId}
                    onChange={(e) => setFormData({ ...formData, photographerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
                  >
                    <option value="">{appLanguage === 'ar' ? 'اختر المصور المرتبط...' : 'Select Photographer...'}</option>
                    {photographers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.commissionPercentage}% عمولة - {p.assignedBoatName || 'لنش'})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {appLanguage === 'ar'
                      ? 'عند دخول هذا المستخدم بجوجل سيتم ربطه ببيانات هذا المصور وعمولاته تلقائياً.'
                      : 'Connecting this email directly links them to this photographer profile upon Google sign-in.'}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  placeholder="+20 100..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {appLanguage === 'ar' ? 'تعديل الصلاحيات والمصور المرتبط' : 'Edit User Permissions'}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 block">{t.googleEmailLabel}</span>
                <strong className="text-sm font-mono text-slate-900 dark:text-white">{editingUser.email}</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'الاسم الظاهر' : 'Display Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.roleLabel} *
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
                >
                  <option value="photographer">{t.rolePhotographer}</option>
                  <option value="admin">{t.roleAdmin}</option>
                  <option value="accountant">{t.roleAccountant}</option>
                  {isOwner && <option value="owner">{t.roleOwner}</option>}
                </select>
              </div>

              {editFormData.role === 'photographer' && (
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40">
                  <label className="block font-bold text-sky-900 dark:text-sky-300 mb-1">
                    {t.linkedPhotographerLabel} *
                  </label>
                  <select
                    required
                    value={editFormData.photographerId}
                    onChange={(e) => setEditFormData({ ...editFormData, photographerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
                  >
                    <option value="">{appLanguage === 'ar' ? 'اختر المصور المرتبط...' : 'Select Photographer...'}</option>
                    {photographers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.commissionPercentage}% عمولة - {p.assignedBoatName || 'لنش'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'حالة الحساب' : 'Account Status'}
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
                >
                  <option value="active">{appLanguage === 'ar' ? 'مفعل (نشط)' : 'Active'}</option>
                  <option value="suspended">{appLanguage === 'ar' ? 'معلق / موقوف' : 'Suspended'}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
