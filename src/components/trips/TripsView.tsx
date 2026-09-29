import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip, TripStatus } from '../../types';
import {
  Compass,
  Ship,
  Users,
  Clock,
  Plus,
  X,
  Play,
  CheckCircle2,
  Calendar,
  Camera,
} from 'lucide-react';

export const TripsView: React.FC = () => {
  const {
    trips,
    boats,
    photographers,
    addTrip,
    updateTrip,
    activeRole,
    activePhotographerId,
    setActiveTab,
    t,
    appLanguage,
  } = useApp();

  const isPhotographer = activeRole === 'photographer';
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'active' | 'completed'>('today');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New trip form state
  const [formData, setFormData] = useState({
    date: todayStr,
    destination: 'Ras Mohammed National Park & White Island',
    boatId: boats[0]?.id || 'boat-1',
    photographerIds: [activePhotographerId || photographers[0]?.id || 'photo-1'],
    departureTime: '08:30',
    returnTime: '16:30',
    expectedCustomers: 20,
    actualCustomers: 18,
    notes: 'Excursion departing Travco Marina Pier 3.',
    status: 'scheduled' as TripStatus,
  });

  // Find photographer's today assigned trip
  const myTodayTrip = trips.find(
    (t) => t.date === todayStr && (isPhotographer ? t.photographerIds.includes(activePhotographerId || '') : true)
  );

  const displayedTrips = trips.filter((t) => {
    if (isPhotographer && !t.photographerIds.includes(activePhotographerId || '')) {
      return false;
    }
    if (statusFilter === 'today') return t.date === todayStr;
    if (statusFilter === 'active') return t.status === 'active';
    if (statusFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleStatusChange = async (tripId: string, newStatus: TripStatus) => {
    await updateTrip(tripId, { status: newStatus });
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const selBoat = boats.find((b) => b.id === formData.boatId);
    const tripCode = `TR-${formData.date.replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;

    await addTrip({
      tripId: tripCode,
      date: formData.date,
      destination: formData.destination,
      boatId: formData.boatId,
      boatName: selBoat?.boatName || 'Catamaran Cruiser',
      photographerIds: formData.photographerIds,
      departureTime: formData.departureTime,
      returnTime: formData.returnTime,
      expectedCustomers: Number(formData.expectedCustomers) || 0,
      actualCustomers: Number(formData.actualCustomers) || 0,
      status: formData.status,
      notes: formData.notes,
    });

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Photographer's Today Active Trip Banner */}
      {myTodayTrip ? (
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 p-5 sm:p-7 text-white shadow-xl shadow-sky-600/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                  {t.todayAssignedTrip || "Today's Assigned Trip"} • {myTodayTrip.tripId}
                </span>
                <span className="rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[11px] font-black uppercase">
                  {myTodayTrip.status === 'scheduled'
                    ? t.scheduledStatus
                    : myTodayTrip.status === 'active'
                    ? t.activeStatus
                    : myTodayTrip.status === 'completed'
                    ? t.completedStatus
                    : t.cancelledStatus}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2">
                {myTodayTrip.destination}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-sky-100">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Ship className="h-4 w-4" />
                  <span>{myTodayTrip.boatName}</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock className="h-4 w-4" />
                  <span>{myTodayTrip.departureTime} – {myTodayTrip.returnTime}</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users className="h-4 w-4" />
                  <span>{myTodayTrip.actualCustomers} {t.onboardGuests}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {myTodayTrip.status === 'scheduled' && (
                <button
                  onClick={() => handleStatusChange(myTodayTrip.id, 'active')}
                  className="flex items-center gap-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow transition active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{t.startTrip}</span>
                </button>
              )}
              {myTodayTrip.status === 'active' && (
                <button
                  onClick={() => handleStatusChange(myTodayTrip.id, 'completed')}
                  className="flex items-center gap-1.5 rounded-2xl bg-indigo-900/80 hover:bg-indigo-950 px-4 py-2.5 text-xs font-bold text-white shadow transition active:scale-95"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t.markCompleted}</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('customers')}
                className="flex items-center gap-1.5 rounded-2xl bg-white text-sky-900 hover:bg-sky-50 px-4 py-2.5 text-xs font-bold shadow transition active:scale-95"
              >
                <Users className="h-3.5 w-3.5" />
                <span>{t.manageGuests}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
          {appLanguage === 'ar'
            ? `لا توجد رحلة بحرية مسندة إليك اليوم (${todayStr}). يمكنك جدولة أو تصفح الرحلات أدناه.`
            : `No boat excursion is currently assigned to you for today (${todayStr}). You can create or browse trips below.`}
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{t.tripsTitle}</h2>
          <p className="text-xs text-slate-400">{t.tripsSub}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {(['today', 'active', 'completed', 'all'] as const).map((filter) => {
              const filterLabel =
                filter === 'today'
                  ? t.today
                  : filter === 'active'
                  ? t.activeTrips
                  : filter === 'completed'
                  ? t.completedTrips
                  : t.allTrips;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition capitalize ${
                    statusFilter === filter
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {filterLabel}
                </button>
              );
            })}
          </div>

          {/* Add Trip Button */}
          {!isPhotographer && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{t.scheduleTrip}</span>
            </button>
          )}
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTrips.map((trip) => {
          const tripPhotogs = photographers.filter((p) => trip.photographerIds.includes(p.id));
          return (
            <div
              key={trip.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {trip.tripId}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      trip.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : trip.status === 'completed'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {trip.status === 'scheduled'
                      ? t.scheduledStatus
                      : trip.status === 'active'
                      ? t.activeStatus
                      : trip.status === 'completed'
                      ? t.completedStatus
                      : t.cancelledStatus}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">
                  {trip.destination}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Ship className="h-3.5 w-3.5 text-sky-500" />
                    <span className="font-semibold">{trip.boatName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{trip.date} • {trip.departureTime} - {trip.returnTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {appLanguage === 'ar' ? 'النزلاء:' : 'Guests:'}{' '}
                      <strong>{trip.actualCustomers}</strong> ({appLanguage === 'ar' ? 'المتوقع' : 'Expected'} {trip.expectedCustomers})
                    </span>
                  </div>
                </div>

                {/* Photographers Assigned */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {appLanguage === 'ar' ? 'المصورون على متن اليخت' : 'Photographers Onboard'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tripPhotogs.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300"
                      >
                        <Camera className="h-3 w-3" />
                        <span>{p.fullName} ({p.commissionPercentage}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveTab('customers')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  {appLanguage === 'ar' ? 'عرض النزلاء ←' : 'View Guests →'}
                </button>
                <div className="flex items-center gap-1">
                  {trip.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(trip.id, 'completed')}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                    >
                      {appLanguage === 'ar' ? 'إنهاء الرحلة' : 'Complete'}
                    </button>
                  )}
                  {trip.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(trip.id, 'active')}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                    >
                      {appLanguage === 'ar' ? 'بدء الإبحار' : 'Set Active'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Trip Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.createTripModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.destination}</label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder={appLanguage === 'ar' ? 'مثال: رأس محمد والجزيرة البيضاء' : 'e.g. Ras Mohammed & White Island Sandbar'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{appLanguage === 'ar' ? 'التاريخ' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.selectBoat}</label>
                  <select
                    value={formData.boatId}
                    onChange={(e) => setFormData({ ...formData, boatId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  >
                    {boats.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.boatName} ({b.company})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.departureTime}</label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.returnTime}</label>
                  <input
                    type="time"
                    value={formData.returnTime}
                    onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.expectedGuests}</label>
                  <input
                    type="number"
                    value={formData.expectedCustomers}
                    onChange={(e) => setFormData({ ...formData, expectedCustomers: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.actualGuests}</label>
                  <input
                    type="number"
                    value={formData.actualCustomers}
                    onChange={(e) => setFormData({ ...formData, actualCustomers: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.selectPhotographers}</label>
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto">
                  {photographers.map((p) => {
                    const isChecked = formData.photographerIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, photographerIds: [...formData.photographerIds, p.id] });
                            } else {
                              setFormData({
                                ...formData,
                                photographerIds: formData.photographerIds.filter((id) => id !== p.id),
                              });
                            }
                          }}
                        />
                        <span className="truncate">{p.fullName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.tripNotes}</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
