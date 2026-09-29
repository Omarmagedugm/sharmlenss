import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { CustomerGalleryModal } from './components/gallery/CustomerGalleryModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { TripsView } from './components/trips/TripsView';
import { CustomersView } from './components/customers/CustomersView';
import { PhotosView } from './components/photos/PhotosView';
import { SalesView } from './components/sales/SalesView';
import { PhotographersView } from './components/photographers/PhotographersView';
import { BoatsView } from './components/boats/BoatsView';
import { PackagesView } from './components/packages/PackagesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { DailyClosingView } from './components/closing/DailyClosingView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsView } from './components/settings/SettingsView';
import { PhotographerProfileModal } from './components/photographers/PhotographerProfileModal';
import { LoginPage } from './components/auth/LoginPage';

const AppContent: React.FC = () => {
  const {
    activeTab,
    galleryCustomerId,
    closeCustomerGallery,
    openCustomerGallery,
    activePhotographerId,
    setActiveTab,
    isLoginPageOpen,
    setIsLoginPageOpen,
    currentUser,
    isRTL,
  } = useApp();

  // Update HTML tag dir and lang attribute
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = isRTL ? 'ar' : 'en';
  }, [isRTL]);

  // Handle URL deep link on QR code scan: e.g. ?gallery=cust-1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const galleryParam = params.get('gallery');
    if (galleryParam) {
      openCustomerGallery(galleryParam);
    }
  }, [openCustomerGallery]);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans"
    >
      {/* Top Application Header */}
      <Header />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar />

        {/* View Router Main Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-12 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'trips' && <TripsView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'photos' && <PhotosView />}
          {activeTab === 'sales' && <SalesView />}
          {activeTab === 'photographers' && (
            <PhotographersView
              onOpenPayout={(photogId) => {
                setActiveTab('payments');
              }}
            />
          )}
          {activeTab === 'boats' && <BoatsView />}
          {activeTab === 'packages' && <PackagesView />}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'closing' && <DailyClosingView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'audit' && <AuditLogView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'profile' && activePhotographerId && (
            <PhotographerProfileModal
              photographerId={activePhotographerId}
              onClose={() => setActiveTab('trips')}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Boat Photographers */}
      <BottomNav />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Customer Gallery Modal (Tourist QR View in 6 Languages) */}
      {galleryCustomerId && (
        <CustomerGalleryModal
          customerId={galleryCustomerId}
          onClose={closeCustomerGallery}
        />
      )}

      {/* Dedicated Login Portal Modal / Page */}
      {(isLoginPageOpen || !currentUser) && (
        <LoginPage
          onClose={currentUser ? () => setIsLoginPageOpen(false) : undefined}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
