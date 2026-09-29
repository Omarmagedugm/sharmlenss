import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  url: string;
  footerText?: string;
  onOpenDirect?: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  url,
  footerText,
  onOpenDirect,
}) => {
  const { appLanguage } = useApp();
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then(uri => setDataUrl(uri))
        .catch(err => console.error('QR generation error:', err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <QrCode className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate text-left">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {subtitle && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}

        {/* QR Display */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200/80 inline-block">
            {dataUrl ? (
              <img src={dataUrl} alt="QR Code" className="w-56 h-56 mx-auto object-contain rounded-lg" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-sm">
                {appLanguage === 'ar' ? 'جارٍ إنشاء الباركود...' : 'Generating QR...'}
              </div>
            )}
          </div>
          <span className="mt-3 inline-block rounded-full bg-sky-50 dark:bg-sky-950/60 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
            {appLanguage === 'ar' ? 'امسح الباركود بكاميرا الهاتف المحمول' : 'Scan with smartphone camera'}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>
              {copied
                ? (appLanguage === 'ar' ? 'تم نسخ الرابط!' : 'Copied URL!')
                : (appLanguage === 'ar' ? 'نسخ الرابط' : 'Copy Link')}
            </span>
          </button>

          {onOpenDirect ? (
            <button
              onClick={() => {
                onClose();
                onOpenDirect();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition active:scale-95 shadow-md shadow-sky-600/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{appLanguage === 'ar' ? 'معاينة المعرض' : 'Preview Gallery'}</span>
            </button>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition active:scale-95 shadow-md shadow-sky-600/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{appLanguage === 'ar' ? 'فتح الرابط' : 'Open Link'}</span>
            </a>
          )}
        </div>

        {footerText && (
          <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );
};
