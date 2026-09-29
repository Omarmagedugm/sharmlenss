import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Photo, PhotoStatus } from '../../types';
import {
  Camera,
  Upload,
  Check,
  Trash2,
  Users,
  Maximize2,
  X,
  BadgeCheck,
} from 'lucide-react';

export const PhotosView: React.FC = () => {
  const {
    photos,
    trips,
    customers,
    photographers,
    addPhoto,
    updatePhotoStatus,
    deletePhoto,
    activeRole,
    activePhotographerId,
    openCustomerGallery,
    t,
    appLanguage,
  } = useApp();

  const isPhotographer = activeRole === 'photographer';

  // Filters
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCustId, setUploadCustId] = useState(customers[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreviewUrls, setUploadPreviewUrls] = useState<string[]>([]);

  // Filtered photos
  const displayedPhotos = photos.filter((p) => {
    if (isPhotographer && p.photographerId !== activePhotographerId) {
      return false;
    }
    if (selectedCustomerId !== 'all' && p.customerId !== selectedCustomerId) {
      return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          urls.push(event.target.result as string);
          if (urls.length === files.length) {
            setUploadPreviewUrls((prev) => [...prev, ...urls]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCustId || uploadPreviewUrls.length === 0) return;

    setIsUploading(true);
    const targetCustomer = customers.find((c) => c.id === uploadCustId);

    try {
      for (const url of uploadPreviewUrls) {
        await addPhoto({
          tripId: targetCustomer?.tripId || trips[0]?.id || 'trip-1',
          customerId: uploadCustId,
          photographerId: targetCustomer?.photographerId || activePhotographerId || 'photo-1',
          url,
          previewUrl: url,
          status: 'preview',
          caption: `Red Sea Excursion Photo for ${targetCustomer?.fullName}`,
        });
      }

      setUploadPreviewUrls([]);
      setIsUploadOpen(false);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.photosTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {appLanguage === 'ar'
              ? `${displayedPhotos.length} صورة معالجة بدقة عالية من الرحلات البحرية`
              : `${displayedPhotos.length} marine excursion photos • high-resolution digital processing`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/25 transition active:scale-95"
          >
            <Upload className="h-4 w-4" />
            <span>{t.uploadPhotos}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {appLanguage === 'ar' ? 'تصفية حسب العميل:' : 'Filter Guest:'}
          </span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium max-w-[200px]"
          >
            <option value="all">
              {appLanguage === 'ar'
                ? `جميع العملاء (${customers.length})`
                : `All Guests (${customers.length})`}
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({t.roomNumber} {c.roomNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'preview', 'selected', 'sold'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition capitalize ${
                statusFilter === st
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'all'
                ? t.all
                : st === 'preview'
                ? t.previewStatus
                : st === 'selected'
                ? t.selectedStatus
                : t.soldStatus}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      {displayedPhotos.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <Camera className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="font-bold text-sm">
            {appLanguage === 'ar' ? 'لا توجد صور مطابقة للتصفية.' : 'No photos found for the selected filter.'}
          </p>
          <p className="text-xs mt-1">
            {appLanguage === 'ar'
              ? 'اضغط على "رفع صور الضيوف" لإضافة لقطات جديدة من هاتفك أو الكاميرا.'
              : 'Tap "Upload Guest Photos" to add shots from your device or camera.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {displayedPhotos.map((photo) => {
            const cust = customers.find((c) => c.id === photo.customerId);
            return (
              <div
                key={photo.id}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <img
                  src={photo.url}
                  alt="Marine shoot"
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />

                {/* Status Badge */}
                <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase shadow-md ${
                      photo.status === 'sold'
                        ? 'bg-emerald-500 text-white'
                        : photo.status === 'selected'
                        ? 'bg-sky-500 text-white'
                        : 'bg-black/60 text-white'
                    }`}
                  >
                    {photo.status === 'sold'
                      ? t.soldStatus
                      : photo.status === 'selected'
                      ? t.selectedStatus
                      : t.previewStatus}
                  </span>
                </div>

                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-between">
                  <div className="flex justify-end rtl:justify-start gap-1">
                    <button
                      onClick={() => setLightboxUrl(photo.url)}
                      className="p-1 rounded-lg bg-black/60 text-white hover:bg-black"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-1 rounded-lg bg-rose-600/80 text-white hover:bg-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-white truncate">
                      {cust?.fullName || (appLanguage === 'ar' ? 'العميل' : 'Guest')}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {t.roomNumber} {cust?.roomNumber || '–'}
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      {photo.status !== 'sold' && (
                        <button
                          onClick={() => updatePhotoStatus(photo.id, 'sold')}
                          className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold flex items-center justify-center gap-0.5"
                        >
                          <BadgeCheck className="h-3 w-3" />
                          <span>{t.soldStatus}</span>
                        </button>
                      )}
                      {photo.status !== 'selected' && (
                        <button
                          onClick={() => updatePhotoStatus(photo.id, 'selected')}
                          className="flex-1 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[9px] font-bold flex items-center justify-center gap-0.5"
                        >
                          <Check className="h-3 w-3" />
                          <span>{t.selectedStatus}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto text-left rtl:text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.uploadPhotos}
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar' ? 'تعيين للعميل *' : 'Assign to Guest *'}
                </label>
                <select
                  required
                  value={uploadCustId}
                  onChange={(e) => setUploadCustId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 dark:bg-slate-800 text-sm font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({t.roomNumber} {c.roomNumber} • {c.hotel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag/Drop & File Input */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {appLanguage === 'ar'
                    ? 'اختر الصور (كاميرا الهاتف أو الألبوم)'
                    : 'Select Photos (Mobile Camera or Files)'}
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-sky-500 transition cursor-pointer relative bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Camera className="h-8 w-8 mx-auto text-sky-500 mb-2" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {appLanguage === 'ar'
                      ? 'اضغط لالتقاط صورة أو اختيارها من المعرض'
                      : 'Tap to take photo or choose from gallery'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {appLanguage === 'ar'
                      ? 'يمكن رفع عدة صور دفعة واحدة'
                      : 'Multiple photos can be uploaded together'}
                  </p>
                </div>
              </div>

              {/* Previews */}
              {uploadPreviewUrls.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>
                      {appLanguage === 'ar'
                        ? `تم تحديد (${uploadPreviewUrls.length}) للرفع`
                        : `Selected for upload (${uploadPreviewUrls.length})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadPreviewUrls([])}
                      className="text-rose-500 text-[10px]"
                    >
                      {appLanguage === 'ar' ? 'مسح الكل' : 'Clear All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                    {uploadPreviewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isUploading || uploadPreviewUrls.length === 0}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 disabled:opacity-50"
                >
                  {isUploading
                    ? (appLanguage === 'ar' ? 'جارٍ الرفع...' : 'Uploading...')
                    : (appLanguage === 'ar'
                        ? `رفع ${uploadPreviewUrls.length} صورة`
                        : `Upload ${uploadPreviewUrls.length} Photos`)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4 animate-fadeIn">
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Fullscreen view"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};
