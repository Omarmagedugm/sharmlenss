import React, { useEffect, useState } from 'react';
import { WifiOff, CloudLightning } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const { t } = useApp();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline status banner"
      className="fixed bottom-20 md:bottom-6 left-4 rtl:left-auto rtl:right-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-amber-900/30 border border-amber-400/40 animate-bounce"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <div>
        <span>{t.offlineTitle || 'Offline Mode (Boat Signal)'}</span>
        <span className="block text-[10px] font-normal text-amber-100">
          {t.offlineDesc || 'Working locally. Data will synchronize once docked.'}
        </span>
      </div>
      <CloudLightning className="w-3.5 h-3.5 text-amber-200 ml-1 rtl:mr-1 rtl:ml-0" />
    </aside>
  );
};
