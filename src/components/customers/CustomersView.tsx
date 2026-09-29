import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import {
  Users,
  Plus,
  QrCode,
  ExternalLink,
  ShoppingBag,
  Camera,
  X,
  MapPin,
  Hotel,
} from 'lucide-react';
import { QRModal } from '../common/QRModal';

export const CustomersView: React.FC<{ onSelectCustomerForSale?: (c: Customer) => void }> = ({
  onSelectCustomerForSale,
}) => {
  const {
    customers,
    trips,
    photographers,
    addCustomer,
    openCustomerGallery,
    activeRole,
    activePhotographerId,
    setActiveTab,
    t,
    appLanguage,
  } = useApp();

  const isPhotographer = activeRole === 'photographer';
  const todayStr = new Date().toISOString().slice(0, 10);

  // Quick hotels in Sharm El Sheikh for single-tap selection
  const commonHotels = [
    'Rixos Premium Seagate',
    'Steigenberger Alcazar',
    'Baron Resort',
    'Pickalbatros Aqua Blu',
    'Jaz Fanara Resort',
    'Savoy Sharm',
    'Sunrise Montemare',
    'Four Seasons Sharm',
    'Sultan Gardens',
    'Coral Sea Sensatori',
  ];

  // Quick nationalities
  const commonCountries = [
    'United Kingdom',
    'Italy',
    'Russia',
    'Germany',
    'Poland',
    'France',
    'Ukraine',
    'Egypt',
    'Kazakhstan',
    'Saudi Arabia',
  ];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<{ customer: Customer; url: string } | null>(null);

  // Filter state
  const [selectedTripFilter, setSelectedTripFilter] = useState<string>('all');
  const [guestSearch, setGuestSearch] = useState('');

  // Quick form state
  const [fullName, setFullName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hotel, setHotel] = useState(commonHotels[0]);
  const [country, setCountry] = useState(commonCountries[0]);
  const [phone, setPhone] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [tripId, setTripId] = useState(trips[0]?.id || 'trip-today-1');
  const [photographerId, setPhotographerId] = useState(activePhotographerId || photographers[0]?.id || 'photo-1');
  const [notes, setNotes] = useState('');

  // Filtered customer list
  const displayedCustomers = customers.filter((c) => {
    if (isPhotographer && c.photographerId !== activePhotographerId) {
      return false;
    }
    if (selectedTripFilter !== 'all' && c.tripId !== selectedTripFilter) {
      return false;
    }
    if (guestSearch) {
      const q = guestSearch.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.roomNumber.toLowerCase().includes(q) ||
        c.hotel.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const assignedPhotog = photographers.find((p) => p.id === photographerId);
    const custCode = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    const newId = await addCustomer({
      customerId: custCode,
      fullName: fullName.trim(),
      roomNumber: roomNumber.trim() || 'Pending',
      hotel,
      country,
      phone,
      peopleCount: Number(peopleCount) || 1,
      tripId,
      photographerId,
      photographerName: assignedPhotog?.fullName,
      notes,
    });

    // Reset form and open QR code immediately so photographer can show to tourist on boat!
    const addedCustomer = {
      id: newId,
      customerId: custCode,
      fullName: fullName.trim(),
      roomNumber: roomNumber.trim() || 'Pending',
      hotel,
      country,
      phone,
      peopleCount: Number(peopleCount) || 1,
      tripId,
      photographerId,
      photographerName: assignedPhotog?.fullName,
      galleryCode: `SHARM-${fullName.split(' ')[0].toUpperCase()}`,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsAddOpen(false);
    setSelectedQR({
      customer: addedCustomer,
      url: `${window.location.origin}?gallery=${newId}`,
    });

    setFullName('');
    setRoomNumber('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Register Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.guestManagementTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {displayedCustomers.length} {appLanguage === 'ar' ? 'نزيل مسجل • معارض صور بالباركود الرقمي QR للنزلاء على اليخت' : 'registered guests • QR code galleries for tourists on boats'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/25 transition active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t.registerGuestBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder={t.guestSearchPlaceholder || 'Search by name, room, hotel...'}
            value={guestSearch}
            onChange={(e) => setGuestSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{t.filterTrip}</span>
          <select
            value={selectedTripFilter}
            onChange={(e) => setSelectedTripFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">{t.allTrips || 'All Trips'}</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.date} • {t.destination.slice(0, 25)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCustomers.map((cust) => {
          const photog = photographers.find((p) => p.id === cust.photographerId);

          return (
            <div
              key={cust.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition text-left rtl:text-right"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                    {cust.customerId}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {cust.peopleCount} {appLanguage === 'ar' ? 'أفراد' : (cust.peopleCount === 1 ? 'Guest' : 'People')}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">
                  {cust.fullName}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Hotel className="h-3.5 w-3.5 text-sky-500" />
                    <span className="font-semibold">{cust.hotel} ({appLanguage === 'ar' ? 'غرفة' : 'Room'} {cust.roomNumber})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cust.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-3.5 w-3.5 text-amber-500" />
                    <span>{appLanguage === 'ar' ? 'تصوير:' : 'Photo by'} {photog?.fullName || 'Assigned Specialist'}</span>
                  </div>
                </div>

                {cust.notes && (
                  <p className="mt-2.5 text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    "{cust.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons: Show QR, Open Gallery, Create Sale */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1.5">
                {/* QR Code button */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedQR({
                      customer: cust,
                      url: `${window.location.origin}?gallery=${cust.id}`,
                    })
                  }
                  className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition active:scale-95"
                  title={appLanguage === 'ar' ? 'عرض الباركود للسائح لمسحه على اليخت' : 'Show QR Code on your mobile for the tourist to scan'}
                >
                  <QrCode className="h-3.5 w-3.5 text-sky-500" />
                  <span>{t.showQR}</span>
                </button>

                {/* Open Gallery */}
                <button
                  type="button"
                  onClick={() => openCustomerGallery(cust.id)}
                  className="flex items-center justify-center gap-1 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 py-2 text-[11px] font-bold text-sky-700 dark:text-sky-300 transition active:scale-95"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{t.openGalleryBtn}</span>
                </button>

                {/* New Sale */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCustomerForSale) {
                      onSelectCustomerForSale(cust);
                    } else {
                      setActiveTab('sales');
                    }
                  }}
                  className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-[11px] font-bold text-white transition active:scale-95 shadow-sm"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>{t.recordSaleBtn}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Guest Modal (Mobile Optimized) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-500" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t.registerGuestBtn}</h3>
                  <p className="text-[11px] text-slate-400">{t.guestManagementSub}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.guestName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={appLanguage === 'ar' ? 'مثال: أحمد ومريم مصطفى' : 'e.g. David & Sarah Jenkins'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-semibold"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.roomNumber}
                  </label>
                  <input
                    type="text"
                    placeholder={appLanguage === 'ar' ? 'مثال: 3104' : 'e.g. 3104'}
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.peopleInGroup}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Hotel selector with quick chips */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.resortHotel}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {commonHotels.slice(0, 6).map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setHotel(h)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                        hotel === h
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={hotel}
                  onChange={(e) => setHotel(e.target.value)}
                  placeholder={appLanguage === 'ar' ? 'أو اكتب اسم المنتجع / الفندق...' : 'Or enter resort name...'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 dark:bg-slate-800"
                />
              </div>

              {/* Nationality selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.countryNationality}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  >
                    {commonCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.contactWhatsapp}
                  </label>
                  <input
                    type="text"
                    placeholder="+20 100... / +44 7911..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Trip & Photographer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assignedTrip}
                  </label>
                  <select
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 truncate"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.destination} ({t.date})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assignedPhotographer}
                  </label>
                  <select
                    value={photographerId}
                    onChange={(e) => setPhotographerId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  >
                    {photographers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.commissionPercentage}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'ملاحظات (مثال: رحلة شهر عسل / طلب تصوير سنوركل)' : 'Notes (e.g. Anniversary / Snorkel request)'}
                </label>
                <input
                  type="text"
                  placeholder={appLanguage === 'ar' ? 'أي تفاصيل خاصة بالنزيل' : 'e.g. Honeymoon couple, sunset shoot requested'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  {t.saveAndGenerateQR}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Popup */}
      {selectedQR && (
        <QRModal
          isOpen={true}
          onClose={() => setSelectedQR(null)}
          title={`${appLanguage === 'ar' ? 'بطاقة النزيل الرقمية:' : 'Guest Pass:'} ${selectedQR.customer.fullName}`}
          subtitle={`${appLanguage === 'ar' ? 'غرفة' : 'Room'} ${selectedQR.customer.roomNumber} • ${selectedQR.customer.hotel}`}
          url={selectedQR.url}
          footerText={t.qrTouristNotice}
          onOpenDirect={() => openCustomerGallery(selectedQR.customer.id)}
        />
      )}
    </div>
  );
};
