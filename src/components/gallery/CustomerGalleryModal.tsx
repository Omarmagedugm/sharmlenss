import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations, supportedLanguages, Language } from '../../translations';
import {
  X,
  Check,
  Sparkles,
  Camera,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRModal } from '../common/QRModal';

interface CustomerGalleryModalProps {
  customerId: string;
  onClose: () => void;
}

export const CustomerGalleryModal: React.FC<CustomerGalleryModalProps> = ({ customerId, onClose }) => {
  const {
    customers,
    photos,
    packages,
    trips,
    photographers,
    formatCurrency,
    createSale,
    togglePhotoSelected,
  } = useApp();

  const customer = customers.find((c) => c.id === customerId);
  const trip = trips.find((t) => t.id === customer?.tripId);
  const photographer = photographers.find((p) => p.id === customer?.photographerId);
  const customerPhotos = photos.filter((p) => p.customerId === customerId);

  // Gallery language state (defaults to English or customer language preference)
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang] || translations.en;
  const isRTL = supportedLanguages.find((l) => l.code === lang)?.dir === 'rtl';

  // Lightbox fullscreen state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Package & purchase state
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const selectedCount = customerPhotos.filter((p) => p.selectedByCustomer).length;
  const activePackage = packages.find((p) => p.id === selectedPkgId) || packages[0];

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPkgId(pkgId);
  };

  const handleConfirmPurchase = async () => {
    if (!customer || !photographer) return;
    setIsSubmitting(true);

    try {
      const selectedPhotoIds = customerPhotos
        .filter((p) => p.selectedByCustomer)
        .map((p) => p.id);

      await createSale({
        customerId: customer.id,
        photographerId: photographer.id,
        tripId: customer.tripId,
        selectedPhotoIds,
        packageId: activePackage.id,
        packageName: activePackage.name,
        quantity: 1,
        grossAmount: activePackage.price,
        discount: 0,
        paymentMethod: 'cash',
        paymentStatus: 'unpaid', // Tourist submitted order, photographer/manager collects payment
        notes: `Customer self-ordered from Mobile Gallery (${lang.toUpperCase()}) for Room ${customer.roomNumber} - ${customer.hotel}`,
      });

      // Confetti celebratory burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setOrderComplete(true);
    } catch (e) {
      console.error('Purchase error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customer) return null;

  const currentGalleryUrl = `${window.location.origin}?gallery=${customer.id}`;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Floating Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {customer.galleryCode}
            </span>
          </div>

          {/* Language Switcher Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {supportedLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition ${
                  lang === l.code
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
                title={l.name}
              >
                <span>{l.flag}</span>
                <span className="text-[11px] hidden sm:inline">{l.nativeName}</span>
              </button>
            ))}
          </div>

          {/* Close & QR Code */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Show QR Code for Tourist"
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Gallery Scroll Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-5 sm:p-7 border border-sky-800/40 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-400/30">
                <Camera className="h-3.5 w-3.5" />
                <span>{trip?.boatName || 'Red Sea Excursion Boat'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {t.welcomeGallery}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {t.gallerySub}
              </p>

              {/* Guest Details Pill */}
              <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-300">
                <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700">
                  {t.customerName}: <strong className="text-white">{customer.fullName}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700">
                  {t.hotelRoomLabel}: <strong className="text-white">{customer.hotel} (Room {customer.roomNumber})</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700">
                  {t.photographerLabel}: <strong className="text-white">{photographer?.fullName || 'Assigned Specialist'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Photo Grid Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {lang === 'ar'
                      ? 'ذكريات رحلتك البحرية'
                      : lang === 'ru'
                      ? 'Ваши воспоминания об отпуске'
                      : lang === 'de'
                      ? 'Ihre Urlaubserinnerungen'
                      : lang === 'it'
                      ? 'I ricordi delle tue vacanze'
                      : lang === 'fr'
                      ? 'Vos souvenirs de vacances'
                      : 'Your Vacation Memories'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
                    {customerPhotos.length} {lang === 'ar' ? 'صورة' : 'photos'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.selectPhotosToBuy} ({selectedCount} {t.photosSelectedCount} {customerPhotos.length})
                </p>
              </div>
            </div>

            {customerPhotos.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-400 text-sm">
                <Camera className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                <p>{t.noPhotosYet}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {customerPhotos.map((photo, idx) => {
                  const isSelected = photo.selectedByCustomer;
                  return (
                    <div
                      key={photo.id}
                      className={`group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border-2 transition cursor-pointer ${
                        isSelected ? 'border-sky-400 ring-2 ring-sky-500/30' : 'border-transparent hover:border-slate-600'
                      }`}
                      onClick={() => togglePhotoSelected(photo.id)}
                    >
                      <img
                        src={photo.url}
                        alt="Tourist Vacation"
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />

                      {/* Selection Badge */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelected(photo.id);
                        }}
                        className={`absolute top-2.5 right-2.5 h-7 w-7 rounded-xl flex items-center justify-center transition shadow-md ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : 'bg-black/60 text-white/80 hover:bg-black/80'
                        }`}
                      >
                        {isSelected ? <Check className="h-4 w-4 stroke-[3px]" /> : <div className="h-3 w-3 rounded-full border border-white/60" />}
                      </button>

                      {/* Fullscreen view button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(idx);
                        }}
                        className="absolute bottom-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 text-white/90 hover:bg-black/90 opacity-0 group-hover:opacity-100 transition shadow"
                        title="View Fullscreen"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Watermark overlay on preview */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 select-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white rotate-[-25deg]">
                          SHARM LENS PREVIEW
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Package Selection Section */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-400" />
              <span>{t.choosePackage}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ar'
                ? 'جميع الباقات تشمل ملفات رقمية أصلية فائقة الدقة تُسلَّم مباشرة إلى واتساب أو بريدك الإلكتروني.'
                : 'All packages include maximum high-resolution digital download files delivered directly to your WhatsApp/Email.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {packages.filter((p) => p.active).map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`relative rounded-2xl p-4 transition cursor-pointer border-2 ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 ring-2 ring-sky-500/20'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-950 shadow">
                        {t.popularBadge}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">{pkg.name}</h4>
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {pkg.description}
                    </p>

                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-sky-400 font-semibold">
                        {pkg.photoCount === 0 ? t.unlimitedPhotos : `${pkg.photoCount} ${t.photosIncluded}`}
                      </span>
                      <span className="text-base font-black text-white">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Checkout Bar */}
          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">
                {lang === 'ar' ? 'الباقة المختارة: ' : 'Selected Package: '}
                <strong className="text-white">{activePackage?.name}</strong>
              </div>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {activePackage ? formatCurrency(activePackage.price) : '0 EGP'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t.qualityPromise}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isSubmitting || orderComplete}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 font-bold text-sm text-white shadow-lg shadow-sky-600/30 hover:from-sky-600 hover:to-blue-700 transition active:scale-95 disabled:opacity-50"
              >
                {orderComplete ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{t.orderSubmittedTitle}</span>
                  </>
                ) : isSubmitting ? (
                  <span>{lang === 'ar' ? 'جارٍ إرسال الطلب...' : 'Processing...'}</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>{t.submitOrder}</span>
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </div>

          {orderComplete && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs text-center animate-fadeIn">
              <p className="font-bold text-sm">{t.orderSubmittedTitle}</p>
              <p className="mt-1">{t.orderSubmittedMsg}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4 animate-fadeIn">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={customerPhotos[lightboxIndex]?.url}
            alt="Fullscreen view"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
          />
        </div>
      )}

      {/* QR Code sharing popup */}
      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title={`Gallery: ${customer.fullName}`}
        subtitle={`Room ${customer.roomNumber} • ${customer.hotel}`}
        url={currentGalleryUrl}
        footerText="Show this QR code to the tourist so they can view and order photos directly on their phone."
      />
    </div>
  );
};
