import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Photographer } from '../../types';
import { PhotographerProfileModal } from './PhotographerProfileModal';
import {
  Camera,
  Plus,
  Ship,
  Phone,
  Percent,
  CheckCircle2,
  X,
  CreditCard,
  UserCheck,
  Building,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const PhotographersView: React.FC<{ onOpenPayout?: (photographerId: string) => void }> = ({
  onOpenPayout,
}) => {
  const {
    photographers,
    boats,
    addPhotographer,
    updatePhotographer,
    deletePhotographer,
    getPhotographerStats,
    formatCurrency,
    activeRole,
    settings,
    t,
    appLanguage,
  } = useApp();

  const isOwnerOrAdmin = activeRole === 'owner' || activeRole === 'admin';

  // Modals & Selection State
  const [selectedPhotogId, setSelectedPhotogId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);
  const [deletingPhotographer, setDeletingPhotographer] = useState<Photographer | null>(null);
  const [quickCommPhotographer, setQuickCommPhotographer] = useState<Photographer | null>(null);
  const [quickCommValue, setQuickCommValue] = useState<number>(30);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoatFilter, setSelectedBoatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'commission' | 'balance'>('name');

  // Add Form State
  const [formData, setFormData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    whatsapp: string;
    idNumber: string;
    commissionPercentage: number;
    status: 'active' | 'inactive';
    dateJoined: string;
    assignedBoatId: string;
    notes: string;
  }>({
    fullName: '',
    phone: '',
    email: '',
    whatsapp: '',
    idNumber: '',
    commissionPercentage: settings.defaultPhotographerCommission || 30,
    status: 'active',
    dateJoined: new Date().toISOString().slice(0, 10),
    assignedBoatId: boats[0]?.id || '',
    notes: '',
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    whatsapp: string;
    idNumber: string;
    commissionPercentage: number;
    status: 'active' | 'inactive';
    assignedBoatId: string;
    notes: string;
  }>({
    fullName: '',
    phone: '',
    email: '',
    whatsapp: '',
    idNumber: '',
    commissionPercentage: 30,
    status: 'active',
    assignedBoatId: '',
    notes: '',
  });

  // Computed KPI Metrics
  const totalPhotographers = photographers.length;
  const activeCount = photographers.filter((p) => p.status === 'active').length;
  const avgCommission = totalPhotographers > 0
    ? Math.round(photographers.reduce((acc, p) => acc + p.commissionPercentage, 0) / totalPhotographers)
    : 30;

  const totalUnpaidBalance = photographers.reduce((acc, p) => {
    const st = getPhotographerStats(p.id);
    return acc + (st?.remainingBalance ?? 0);
  }, 0);

  // Filtered & Sorted Photographers
  const filteredPhotographers = photographers
    .filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.fullName.toLowerCase().includes(q);
        const matchesPhone = p.phone.toLowerCase().includes(q);
        const matchesId = p.idNumber?.toLowerCase().includes(q);
        const matchesBoat = p.assignedBoatName?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesId && !matchesBoat) return false;
      }
      // Boat filter
      if (selectedBoatFilter !== 'all') {
        if (selectedBoatFilter === 'unassigned') {
          if (p.assignedBoatId) return false;
        } else if (p.assignedBoatId !== selectedBoatFilter) {
          return false;
        }
      }
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'commission') {
        return b.commissionPercentage - a.commissionPercentage;
      }
      if (sortBy === 'balance') {
        const balA = getPhotographerStats(a.id)?.remainingBalance ?? 0;
        const balB = getPhotographerStats(b.id)?.remainingBalance ?? 0;
        return balB - balA;
      }
      return a.fullName.localeCompare(b.fullName);
    });

  // Handle Add Photographer Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selBoat = boats.find((b) => b.id === formData.assignedBoatId);

    await addPhotographer({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
      idNumber: formData.idNumber.trim() || `EGY-PH-${Math.floor(100 + Math.random() * 900)}`,
      commissionPercentage: Number(formData.commissionPercentage) || 30,
      status: formData.status,
      dateJoined: formData.dateJoined,
      assignedBoatId: formData.assignedBoatId,
      assignedBoatName: selBoat?.boatName,
      notes: formData.notes.trim(),
    });

    setIsAddOpen(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      whatsapp: '',
      idNumber: '',
      commissionPercentage: settings.defaultPhotographerCommission || 30,
      status: 'active',
      dateJoined: new Date().toISOString().slice(0, 10),
      assignedBoatId: boats[0]?.id || '',
      notes: '',
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (p: Photographer) => {
    setEditingPhotographer(p);
    setEditFormData({
      fullName: p.fullName,
      phone: p.phone,
      email: p.email,
      whatsapp: p.whatsapp || p.phone,
      idNumber: p.idNumber || '',
      commissionPercentage: p.commissionPercentage,
      status: p.status,
      assignedBoatId: p.assignedBoatId || '',
      notes: p.notes || '',
    });
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhotographer) return;

    const selBoat = boats.find((b) => b.id === editFormData.assignedBoatId);

    await updatePhotographer(editingPhotographer.id, {
      fullName: editFormData.fullName.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim(),
      whatsapp: editFormData.whatsapp.trim(),
      idNumber: editFormData.idNumber.trim(),
      commissionPercentage: Number(editFormData.commissionPercentage),
      status: editFormData.status,
      assignedBoatId: editFormData.assignedBoatId,
      assignedBoatName: selBoat ? selBoat.boatName : undefined,
      notes: editFormData.notes.trim(),
    });

    setEditingPhotographer(null);
  };

  // Submit Fast Commission Update
  const handleQuickCommSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCommPhotographer) return;

    await updatePhotographer(quickCommPhotographer.id, {
      commissionPercentage: Number(quickCommValue),
    });

    setQuickCommPhotographer(null);
  };

  // Fast Boat Linking on Card
  const handleQuickBoatAssign = async (photographerId: string, boatId: string) => {
    const selBoat = boats.find((b) => b.id === boatId);
    await updatePhotographer(photographerId, {
      assignedBoatId: boatId,
      assignedBoatName: selBoat ? selBoat.boatName : undefined,
    });
  };

  // Delete Photographer
  const handleConfirmDelete = async () => {
    if (!deletingPhotographer) return;
    await deletePhotographer(deletingPhotographer.id);
    setDeletingPhotographer(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Camera className="h-6 w-6 text-sky-500" />
            <span>{t.photographersTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {appLanguage === 'ar'
              ? 'إدارة شاملة لطاقم المصورين، تحديد وتعديل نسب العمولات، ربط المصورين بالمراكب، ومتابعة الأداء المالي'
              : 'Comprehensive photographer management: add, edit, delete, configure commission rates, and assign to boats'}
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/25 transition active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t.addPhotographerBtn}</span>
          </button>
        )}
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {appLanguage === 'ar' ? 'إجمالي المصورين' : 'Total Team'}
            </span>
            <span className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Camera className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalPhotographers}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
            {activeCount} {appLanguage === 'ar' ? 'مصورين في الخدمة' : 'active on duty'}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {appLanguage === 'ar' ? 'متوسط نسبة العمولة' : 'Avg Commission'}
            </span>
            <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Percent className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {avgCommission}%
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
            {appLanguage === 'ar' ? 'نسب مخصصة لكل مصور' : 'Customizable per member'}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {appLanguage === 'ar' ? 'مربوطين بالمراكب' : 'Assigned to Boats'}
            </span>
            <span className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Ship className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {photographers.filter((p) => p.assignedBoatId).length} / {totalPhotographers}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
            {boats.length} {appLanguage === 'ar' ? 'يخت متاح في المارينا' : 'fleet boats active'}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left rtl:text-right">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {appLanguage === 'ar' ? 'إجمالي المستحقات المتبقية' : 'Total Due Balances'}
            </span>
            <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalUnpaidBalance)}
          </div>
          <span className="text-[10px] text-amber-600/80 font-semibold mt-0.5 block">
            {appLanguage === 'ar' ? 'جاهزة للصرف والتسوية' : 'Ready for settlement'}
          </span>
        </div>
      </div>

      {/* Search, Filter & Quick Options Toolbar */}
      <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={appLanguage === 'ar' ? 'بحث بالاسم، رقم الهاتف، أو كود المصور...' : 'Search by name, phone, employee code...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Boat Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <Ship className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedBoatFilter}
              onChange={(e) => setSelectedBoatFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">{appLanguage === 'ar' ? 'جميع المراكب واليخوت' : 'All Boats'}</option>
              <option value="unassigned">{appLanguage === 'ar' ? 'غير مربوط بمركب' : 'Unassigned to Boat'}</option>
              {boats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.boatName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">{appLanguage === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="active">{appLanguage === 'ar' ? 'نشط بالخدمة' : 'Active'}</option>
              <option value="inactive">{appLanguage === 'ar' ? 'متوقف / إجازة' : 'Inactive'}</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="name">{appLanguage === 'ar' ? 'ترتيب بالاسم' : 'Sort by Name'}</option>
              <option value="commission">{appLanguage === 'ar' ? 'الأعلى نسبة عمولة' : 'Highest Commission'}</option>
              <option value="balance">{appLanguage === 'ar' ? 'الأعلى رصيد مستحق' : 'Highest Balance'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Photographers Cards Grid */}
      {filteredPhotographers.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <Camera className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="font-bold text-sm">
            {appLanguage === 'ar' ? 'لا يوجد مصورين مطابقين للبحث.' : 'No photographers found matching your filters.'}
          </p>
          <p className="text-xs mt-1">
            {appLanguage === 'ar' ? 'يمكنك إضافة مصور جديد أو تغيير خيارات التصفية.' : 'You can add a new photographer or reset filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotographers.map((p) => {
            const stats = getPhotographerStats(p.id);
            const due = stats?.remainingBalance ?? 0;
            const currentBoat = boats.find((b) => b.id === p.assignedBoatId);

            return (
              <div
                key={p.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between text-left rtl:text-right relative overflow-hidden"
              >
                <div>
                  {/* Card Header: Avatar, Name, Status, Quick Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-base shadow shrink-0">
                        {p.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                            {p.fullName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {p.idNumber || 'PH-00'}
                          </span>
                          <span>•</span>
                          <span>{appLanguage === 'ar' ? 'انضم' : 'Joined'} {p.dateJoined}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (isOwnerOrAdmin) {
                            updatePhotographer(p.id, {
                              status: p.status === 'active' ? 'inactive' : 'active',
                            });
                          }
                        }}
                        disabled={!isOwnerOrAdmin}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase transition ${
                          p.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title={isOwnerOrAdmin ? (appLanguage === 'ar' ? 'اضغط للتبديل بين نشط وغير نشط' : 'Click to toggle status') : undefined}
                      >
                        {p.status === 'active' ? t.activePhotographer : t.inactivePhotographer}
                      </button>
                    </div>
                  </div>

                  {/* Commission Rate & Boat Assignment Row */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {/* Commission Rate Box */}
                    <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-sky-800 dark:text-sky-300 font-bold">
                        <span className="text-[10px] uppercase">{t.commissionRateLabel}</span>
                        <Percent className="h-3 w-3 text-sky-600" />
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <strong className="text-xl font-black text-sky-600 dark:text-sky-300">
                          {p.commissionPercentage}%
                        </strong>
                        {isOwnerOrAdmin && (
                          <button
                            onClick={() => {
                              setQuickCommPhotographer(p);
                              setQuickCommValue(p.commissionPercentage);
                            }}
                            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 underline"
                          >
                            {appLanguage === 'ar' ? 'تعديل النسبة' : 'Change'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Boat Assignment Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold">
                        <span className="text-[10px] uppercase">{t.assignedBoatLabel}</span>
                        <Ship className="h-3 w-3 text-teal-600" />
                      </div>
                      <div className="mt-1">
                        {isOwnerOrAdmin ? (
                          <select
                            value={p.assignedBoatId || ''}
                            onChange={(e) => handleQuickBoatAssign(p.id, e.target.value)}
                            className="w-full text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-700 pb-0.5 focus:outline-none cursor-pointer"
                          >
                            <option value="">{appLanguage === 'ar' ? 'غير مسند لمركب' : 'Unassigned'}</option>
                            {boats.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.boatName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                            {currentBoat ? currentBoat.boatName : (appLanguage === 'ar' ? 'غير مربوط بمركب' : 'Unassigned')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <a href={`tel:${p.phone}`} className="hover:underline font-medium">
                        {p.phone}
                      </a>
                    </div>
                    {p.whatsapp && (
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Financial & Performance Stats Strip */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          {t.totalTrips}
                        </span>
                        <strong className="text-sm font-black text-slate-900 dark:text-white">
                          {stats?.totalTrips ?? 0}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          {t.conversionRate}
                        </span>
                        <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {stats?.conversionRate ?? 0}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          {t.totalSales}
                        </span>
                        <strong className="text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(stats?.netSales ?? 0)}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">
                        {t.remainingCommission}:
                      </span>
                      <strong className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {formatCurrency(due)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer: View Profile, Edit, Delete, Pay */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPhotogId(p.id)}
                      className="flex-1 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>{t.viewPhotogProfile}</span>
                    </button>

                    {onOpenPayout && due > 0 && !isOwnerOrAdmin && (
                      <button
                        onClick={() => onOpenPayout(p.id)}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                        title="Record Commission Payment"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {isOwnerOrAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-sky-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          title={t.editPhotographerBtn}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingPhotographer(p)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition"
                          title={t.deletePhotographerBtn}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD PHOTOGRAPHER MODAL                                    */}
      {/* ======================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.addPhotographerModalTitle}
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
                  {t.photographerName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={appLanguage === 'ar' ? 'مثال: حسام الدين محمود' : 'e.g. Hossam El-Din'}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerPhone} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+20 100..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerWhatsapp}
                  </label>
                  <input
                    type="text"
                    placeholder="+20 100..."
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerEmail} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="photog@sharmlens.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerEmpId}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EGY-PH-105"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Commission Percentage & Boat Assignment */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {t.commissionRateLabel} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      max={90}
                      required
                      value={formData.commissionPercentage}
                      onChange={(e) => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-black text-sky-600"
                    />
                    <Percent className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {appLanguage === 'ar' ? 'نسبة المصور من كل بيع' : 'Share per sale'}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {t.assignedBoatLabel}
                  </label>
                  <select
                    value={formData.assignedBoatId}
                    onChange={(e) => setFormData({ ...formData, assignedBoatId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="">{appLanguage === 'ar' ? 'غير مسند لمركب' : 'Unassigned'}</option>
                    {boats.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.boatName} ({b.boatNumber})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {appLanguage === 'ar' ? 'المركب المعين عليه اليوم' : 'Assigned excursion vessel'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.dateJoinedLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.dateJoined}
                    onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {appLanguage === 'ar' ? 'حالة العمل' : 'Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                  >
                    <option value="active">{t.activePhotographer}</option>
                    <option value="inactive">{t.inactivePhotographer}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'ملاحظات وتخصصات المصور' : 'Notes & Certifications'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={appLanguage === 'ar' ? 'التصوير تحت الماء، الغطس، اللغات (روسي، إنجليزي، إيطالي)...' : 'Underwater camera, dive certifications, languages...'}
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
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT PHOTOGRAPHER MODAL                                   */}
      {/* ======================================================== */}
      {editingPhotographer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.editPhotographerModalTitle}: {editingPhotographer.fullName}
                </h3>
              </div>
              <button
                onClick={() => setEditingPhotographer(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.photographerName} *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerPhone} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerWhatsapp}
                  </label>
                  <input
                    type="text"
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerEmail} *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.photographerEmpId}
                  </label>
                  <input
                    type="text"
                    value={editFormData.idNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, idNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Commission & Boat Linking Edit Section */}
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      {t.commissionRateLabel} *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={5}
                        max={90}
                        required
                        value={editFormData.commissionPercentage}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            commissionPercentage: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-black text-sky-600"
                      />
                      <Percent className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-1">
                      {t.assignedBoatLabel}
                    </label>
                    <select
                      value={editFormData.assignedBoatId}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, assignedBoatId: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-xs font-semibold"
                    >
                      <option value="">{appLanguage === 'ar' ? 'غير مسند لمركب' : 'Unassigned'}</option>
                      {boats.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.boatName} ({b.boatNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    {t.editCommissionNotice}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {appLanguage === 'ar' ? 'حالة العمل' : 'Status'}
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                  >
                    <option value="active">{t.activePhotographer}</option>
                    <option value="inactive">{t.inactivePhotographer}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPhotographer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
                >
                  {t.saveChangesBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK COMMISSION PERCENTAGE MODAL                         */}
      {/* ======================================================== */}
      {quickCommPhotographer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.editCommissionBtn}
                </h3>
              </div>
              <button
                onClick={() => setQuickCommPhotographer(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCommSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {quickCommPhotographer.fullName}
                </div>
                <div className="text-[11px] text-slate-400">
                  {appLanguage === 'ar' ? 'النسبة الحالية:' : 'Current Rate:'}{' '}
                  <strong className="text-sky-600 font-bold">{quickCommPhotographer.commissionPercentage}%</strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'النسبة الجديدة (%)' : 'New Commission Rate (%)'} *
                </label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  required
                  value={quickCommValue}
                  onChange={(e) => setQuickCommValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-black text-lg text-sky-600"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
                <p>
                  <strong>{appLanguage === 'ar' ? 'تنبيه نظام العمولات:' : 'Rule Invariant:'}</strong>{' '}
                  {t.editCommissionNotice}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickCommPhotographer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {t.saveChangesBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL                                 */}
      {/* ======================================================== */}
      {deletingPhotographer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.confirmDeletePhotographerTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t.confirmDeletePhotographerMsg}
            </p>

            <div className="my-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-left rtl:text-right">
              <strong className="block text-slate-900 dark:text-white font-bold">
                {deletingPhotographer.fullName}
              </strong>
              <span className="text-slate-400 text-[11px]">
                {deletingPhotographer.idNumber} • {deletingPhotographer.commissionPercentage}% Commission
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingPhotographer(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {appLanguage === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photographer Profile Statement Modal */}
      {selectedPhotogId && (
        <PhotographerProfileModal
          photographerId={selectedPhotogId}
          onClose={() => setSelectedPhotogId(null)}
          onOpenPayout={onOpenPayout}
        />
      )}
    </div>
  );
};
