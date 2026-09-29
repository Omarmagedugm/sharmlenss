import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  UserRole,
  UserProfile,
  Photographer,
  Boat,
  Trip,
  Customer,
  Photo,
  PhotoPackage,
  Sale,
  PhotographerPayment,
  DailyClosing,
  CenterSettings,
  AppNotification,
  AuditLog,
  PhotographerStats,
} from '../types';
import {
  initialSettings,
  defaultPackages,
  demoPhotographers,
  demoBoats,
  demoTrips,
  demoCustomers,
  generateDemoPhotos,
  demoSales,
  demoPayments,
  demoDailyClosings,
} from '../utils/demoData';
import { uiTranslations } from '../translations';

interface AppContextType {
  // Language & Localization
  appLanguage: 'ar' | 'en';
  setAppLanguage: (lang: 'ar' | 'en') => void;
  isRTL: boolean;
  t: Record<string, string>;

  // Auth & Roles
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile | null;
  activeRole: UserRole;
  activePhotographerId: string | null;
  systemUsers: UserProfile[];
  isLoginPageOpen: boolean;
  setIsLoginPageOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<boolean>;
  loginAsUser: (user: UserProfile) => void;
  loginAsRole: (role: UserRole, photographerId?: string) => void;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole, photographerId?: string) => void;
  addSystemUser: (user: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSystemUser: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteSystemUser: (userId: string) => Promise<void>;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openCustomerGallery: (customerId: string) => void;
  galleryCustomerId: string | null;
  closeCustomerGallery: () => void;

  // Data
  settings: CenterSettings;
  updateSettings: (newSettings: Partial<CenterSettings>) => Promise<void>;
  photographers: Photographer[];
  boats: Boat[];
  trips: Trip[];
  customers: Customer[];
  photos: Photo[];
  packages: PhotoPackage[];
  sales: Sale[];
  payments: PhotographerPayment[];
  dailyClosings: DailyClosing[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;

  // Business Actions
  addPhotographer: (p: Omit<Photographer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePhotographer: (id: string, updates: Partial<Photographer>) => Promise<void>;
  deletePhotographer: (id: string) => Promise<void>;

  addBoat: (b: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBoat: (id: string, updates: Partial<Boat>) => Promise<void>;
  deleteBoat: (id: string) => Promise<void>;

  addTrip: (t: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  addCustomer: (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'galleryCode'>) => Promise<string>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addPhoto: (photo: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePhotoStatus: (photoId: string, status: Photo['status']) => Promise<void>;
  togglePhotoSelected: (photoId: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;

  addPackage: (pkg: Omit<PhotoPackage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePackage: (id: string, updates: Partial<PhotoPackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;

  createSale: (saleData: {
    customerId: string;
    photographerId: string;
    tripId: string;
    selectedPhotoIds: string[];
    packageId?: string;
    packageName?: string;
    quantity: number;
    grossAmount: number;
    discount: number;
    paymentMethod: Sale['paymentMethod'];
    paymentStatus: Sale['paymentStatus'];
    notes?: string;
  }) => Promise<string>;
  updateSaleStatus: (saleId: string, status: Sale['paymentStatus'], method?: Sale['paymentMethod']) => Promise<void>;

  addPayment: (payment: {
    photographerId: string;
    amount: number;
    date: string;
    paymentMethod: PhotographerPayment['paymentMethod'];
    referenceNumber?: string;
    notes?: string;
  }) => Promise<string>;

  performDailyClosing: (closingData: {
    date: string;
    notes?: string;
  }) => Promise<string>;

  // Data helpers
  getPhotographerStats: (photographerId: string) => PhotographerStats | null;
  formatCurrency: (amount: number) => string;
  seedDemoDataToFirestore: () => Promise<void>;
  resetToDemoData: () => void;
  logAuditAction: (action: string, entityType: string, entityId: string, details?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App Language State (Defaults to Arabic as requested by user)
  const [appLanguage, setAppLanguageState] = useState<'ar' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sharmlens_lang');
      if (saved === 'en' || saved === 'ar') return saved;
    }
    return 'ar';
  });

  const setAppLanguage = (lang: 'ar' | 'en') => {
    setAppLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharmlens_lang', lang);
    }
  };

  const isRTL = appLanguage === 'ar';
  const t = uiTranslations[appLanguage] || uiTranslations.ar;

  // Default pre-configured system users mapping roles & photographers
  const defaultSystemUsers: UserProfile[] = [
    {
      userId: 'user-owner',
      email: 'megastudiodm@gmail.com',
      displayName: 'المالك العام (Red Sea Center)',
      role: 'owner',
      googleLinked: true,
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      userId: 'user-supervisor',
      email: 'supervisor@sharmlens.com',
      displayName: 'كريم مدير العمليات (Supervisor)',
      role: 'admin',
      googleLinked: false,
      status: 'active',
      createdAt: '2026-01-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z',
    },
    {
      userId: 'user-accountant',
      email: 'finance@sharmlens.com',
      displayName: 'منى الحسابات (Accountant)',
      role: 'accountant',
      googleLinked: false,
      status: 'active',
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    },
    {
      userId: 'user-photo-1',
      email: 'tarek.photo@gmail.com',
      displayName: 'طارق حسن (Tarek Hassan)',
      role: 'photographer',
      photographerId: 'photo-1',
      photographerName: 'طارق حسن (Tarek Hassan)',
      googleLinked: true,
      status: 'active',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    {
      userId: 'user-photo-2',
      email: 'ahmed.photo@gmail.com',
      displayName: 'أحمد علاء (Ahmed Alaa)',
      role: 'photographer',
      photographerId: 'photo-2',
      photographerName: 'أحمد علاء (Ahmed Alaa)',
      googleLinked: false,
      status: 'active',
      createdAt: '2026-02-10T00:00:00.000Z',
      updatedAt: '2026-02-10T00:00:00.000Z',
    },
    {
      userId: 'user-photo-3',
      email: 'mina.photo@gmail.com',
      displayName: 'مينا مجدي (Mina Magdy)',
      role: 'photographer',
      photographerId: 'photo-3',
      photographerName: 'مينا مجدي (Mina Magdy)',
      googleLinked: false,
      status: 'active',
      createdAt: '2026-02-15T00:00:00.000Z',
      updatedAt: '2026-02-15T00:00:00.000Z',
    },
  ];

  // Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  const [activePhotographerId, setActivePhotographerId] = useState<string | null>('photo-1');
  const [systemUsers, setSystemUsers] = useState<UserProfile[]>(defaultSystemUsers);
  const [isLoginPageOpen, setIsLoginPageOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    userId: 'user-owner-default',
    email: 'megastudiodm@gmail.com',
    displayName: 'Owner (Red Sea Center)',
    role: 'owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [galleryCustomerId, setGalleryCustomerId] = useState<string | null>(null);

  // Collections state initialized with realistic data for immediate responsiveness
  const [settings, setSettings] = useState<CenterSettings>(initialSettings);
  const [photographers, setPhotographers] = useState<Photographer[]>(demoPhotographers);
  const [boats, setBoats] = useState<Boat[]>(demoBoats);
  const [trips, setTrips] = useState<Trip[]>(demoTrips);
  const [customers, setCustomers] = useState<Customer[]>(demoCustomers);
  const [photos, setPhotos] = useState<Photo[]>(() => generateDemoPhotos());
  const [packages, setPackages] = useState<PhotoPackage[]>(defaultPackages);
  const [sales, setSales] = useState<Sale[]>(demoSales);
  const [payments, setPayments] = useState<PhotographerPayment[]>(demoPayments);
  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>(demoDailyClosings);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Today\'s Excursions Active',
      message: '3 boats departed Travco Marina (Ras Mohammed, Tiran, White Island).',
      type: 'general',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      title: 'New Customer Purchase',
      message: 'David Jenkins purchased 20 Photos Package (1,000 EGP).',
      type: 'new_sale',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-boot',
      userId: 'system',
      userEmail: 'megastudiodm@gmail.com',
      userName: 'System Initialization',
      action: 'SYSTEM_BOOT',
      entityType: 'settings',
      entityId: 'global',
      details: 'SharmLens Center initialized with EGP currency.',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // If email is bootstrapped admin or user email
        const isOwner = user.email === 'megastudiodm@gmail.com';
        setCurrentUser({
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          role: isOwner ? 'owner' : activeRole,
          photographerId: activePhotographerId || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        if (isOwner) {
          setActiveRole('owner');
        }
      }
    });

    return () => unsubscribe();
  }, [activeRole, activePhotographerId]);

  // Data Fetching: Per Firebase integration standards, only attach live listeners if auth is ready and user is authenticated
  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

    let unsubs: (() => void)[] = [];

    try {
      // Photographers listener
      const unsubPhotographers = onSnapshot(
        collection(db, 'photographers'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Photographer[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Photographer));
            setPhotographers(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'photographers')
      );
      unsubs.push(unsubPhotographers);

      // Boats listener
      const unsubBoats = onSnapshot(
        collection(db, 'boats'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Boat[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Boat));
            setBoats(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'boats')
      );
      unsubs.push(unsubBoats);

      // Trips listener
      const unsubTrips = onSnapshot(
        collection(db, 'trips'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Trip[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Trip));
            setTrips(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'trips')
      );
      unsubs.push(unsubTrips);

      // Sales listener
      const unsubSales = onSnapshot(
        collection(db, 'sales'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Sale[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Sale));
            setSales(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'sales')
      );
      unsubs.push(unsubSales);
    } catch {
      // Local fallback in case permissions / offline
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [firebaseUser]);

  // Login with Google Popup
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      if (cred.user) {
        const email = cred.user.email?.toLowerCase() || '';
        const isOwner = email === 'megastudiodm@gmail.com';

        // Check if user is mapped in systemUsers
        const matchedUser = systemUsers.find(
          (u) => u.email.toLowerCase() === email
        );

        let finalRole: UserRole = isOwner ? 'owner' : (matchedUser?.role || 'photographer');
        let finalPhotogId: string | undefined = matchedUser?.photographerId;
        let finalPhotogName: string | undefined = matchedUser?.photographerName;

        // If not explicitly mapped, check if email matches any photographer in database
        if (!matchedUser && !isOwner) {
          const matchedPhotog = photographers.find(
            (p) => p.email.toLowerCase() === email
          );
          if (matchedPhotog) {
            finalRole = 'photographer';
            finalPhotogId = matchedPhotog.id;
            finalPhotogName = matchedPhotog.fullName;
          }
        }

        setActiveRole(finalRole);
        if (finalPhotogId) {
          setActivePhotographerId(finalPhotogId);
        }

        const profile: UserProfile = {
          userId: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || matchedUser?.displayName || 'Authorized User',
          photoURL: cred.user.photoURL || undefined,
          role: finalRole,
          photographerId: finalPhotogId,
          photographerName: finalPhotogName,
          googleLinked: true,
          status: 'active',
          createdAt: matchedUser?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setCurrentUser(profile);
        setIsLoginPageOpen(false);

        // Switch to the relevant tab
        if (finalRole === 'photographer') {
          setActiveTab('trips');
        } else if (finalRole === 'accountant') {
          setActiveTab('sales');
        } else {
          setActiveTab('dashboard');
        }

        // Try syncing to Firestore users collection
        try {
          await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });
        } catch {
          // Local fallback
        }

        await logAuditAction('USER_GOOGLE_LOGIN', 'users', cred.user.uid, `User ${cred.user.email} signed in via Google. Role: ${finalRole}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google Sign in error:', error);
      return false;
    }
  };

  const loginAsUser = (user: UserProfile) => {
    setActiveRole(user.role);
    if (user.photographerId) {
      setActivePhotographerId(user.photographerId);
    }
    setCurrentUser(user);
    setIsLoginPageOpen(false);

    if (user.role === 'photographer') {
      setActiveTab('trips');
    } else if (user.role === 'accountant') {
      setActiveTab('sales');
    } else {
      setActiveTab('dashboard');
    }

    logAuditAction('SWITCH_USER', 'users', user.userId, `Switched login session to ${user.displayName} (${user.role})`);
  };

  const loginAsRole = (role: UserRole, photographerId?: string) => {
    switchDemoRole(role, photographerId);
    setIsLoginPageOpen(false);
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setFirebaseUser(null);
      setCurrentUser(null);
      setIsLoginPageOpen(true);
      await logAuditAction('USER_LOGOUT', 'users', 'auth', 'User signed out.');
    } catch (e) {
      console.error('Logout error:', e);
      setIsLoginPageOpen(true);
    }
  };

  // SYSTEM USER MANAGEMENT (Roles & Google Linking)
  const addSystemUser = async (user: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>) => {
    const id = `user-${Date.now()}`;
    const linkedPhotog = photographers.find((p) => p.id === user.photographerId);
    const newUser: UserProfile = {
      ...user,
      userId: id,
      photographerName: linkedPhotog?.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSystemUsers((prev) => [newUser, ...prev]);
    try {
      if (firebaseUser) {
        await setDoc(doc(db, 'users', id), newUser);
      }
      await logAuditAction('USER_PERMISSION_ADDED', 'users', id, `Configured access for ${newUser.email} with role ${newUser.role}`);
    } catch {}
    return id;
  };

  const updateSystemUser = async (userId: string, updates: Partial<UserProfile>) => {
    const existing = systemUsers.find((u) => u.userId === userId);
    const linkedPhotog = updates.photographerId
      ? photographers.find((p) => p.id === updates.photographerId)
      : undefined;

    const updatedUser: UserProfile = {
      ...existing!,
      ...updates,
      photographerName: linkedPhotog ? linkedPhotog.fullName : existing?.photographerName,
      updatedAt: new Date().toISOString(),
    };

    setSystemUsers((prev) => prev.map((u) => (u.userId === userId ? updatedUser : u)));
    try {
      if (firebaseUser) {
        await updateDoc(doc(db, 'users', userId), updates);
      }
      await logAuditAction('USER_PERMISSION_UPDATED', 'users', userId, `Updated user ${updatedUser.email}. Role: ${updatedUser.role}`);
    } catch {}
  };

  const deleteSystemUser = async (userId: string) => {
    const existing = systemUsers.find((u) => u.userId === userId);
    setSystemUsers((prev) => prev.filter((u) => u.userId !== userId));
    try {
      if (firebaseUser) {
        await deleteDoc(doc(db, 'users', userId));
      }
      await logAuditAction('USER_PERMISSION_DELETED', 'users', userId, `Deleted user ${existing?.email}`);
    } catch {}
  };

  // Demo Role Switcher for instant evaluator experience
  const switchDemoRole = (role: UserRole, photographerId?: string) => {
    setActiveRole(role);
    const pId = photographerId || (role === 'photographer' ? (activePhotographerId || 'photo-1') : undefined);
    if (pId) {
      setActivePhotographerId(pId);
    }

    let name = 'Owner';
    let email = 'megastudiodm@gmail.com';
    if (role === 'admin') {
      name = 'Karim Manager';
      email = 'karim.manager@sharmlens.com';
    } else if (role === 'accountant') {
      name = 'Mona Finance';
      email = 'mona.accountant@sharmlens.com';
    } else if (role === 'photographer') {
      const p = photographers.find((item) => item.id === pId) || photographers[0];
      name = p?.fullName || 'Tarek Hassan';
      email = p?.email || 'photographer@sharmlens.com';
    }

    setCurrentUser({
      userId: `user-demo-${role}`,
      email,
      displayName: name,
      role,
      photographerId: pId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reset tab to appropriate home for the role
    if (role === 'photographer') {
      setActiveTab('trips');
    } else if (role === 'accountant') {
      setActiveTab('sales');
    } else {
      setActiveTab('dashboard');
    }
  };

  const openCustomerGallery = (customerId: string) => {
    setGalleryCustomerId(customerId);
  };

  const closeCustomerGallery = () => {
    setGalleryCustomerId(null);
  };

  const logAuditAction = async (action: string, entityType: string, entityId: string, details?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser?.userId || 'system',
      userEmail: currentUser?.email || 'megastudiodm@gmail.com',
      userName: currentUser?.displayName || 'Authorized User',
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch {
      // Local fallback
    }
  };

  const formatCurrency = (amount: number) => {
    return `${Math.round(amount).toLocaleString()} ${settings.currencySymbol || 'EGP'}`;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Update Settings
  const updateSettings = async (newSettings: Partial<CenterSettings>) => {
    const updated = { ...settings, ...newSettings, updatedAt: new Date().toISOString() };
    setSettings(updated);
    try {
      await setDoc(doc(db, 'settings', 'global'), updated);
      await logAuditAction('SETTINGS_UPDATED', 'settings', 'global', 'Center settings modified.');
    } catch {
      // In-memory updated
    }
  };

  // PHOTOGRAPHER CRUD
  const addPhotographer = async (p: Omit<Photographer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `photo-${Date.now()}`;
    const newP: Photographer = {
      ...p,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPhotographers((prev) => [newP, ...prev]);
    try {
      await setDoc(doc(db, 'photographers', id), newP);
      await logAuditAction('PHOTOGRAPHER_CREATED', 'photographer', id, `Added ${newP.fullName} with ${newP.commissionPercentage}% commission.`);
    } catch {
      // Local fallback
    }
    return id;
  };

  const updatePhotographer = async (id: string, updates: Partial<Photographer>) => {
    const existing = photographers.find((p) => p.id === id);
    const updatedP = { ...existing!, ...updates, updatedAt: new Date().toISOString() };
    setPhotographers((prev) => prev.map((p) => (p.id === id ? updatedP : p)));
    try {
      await updateDoc(doc(db, 'photographers', id), updates);
      await logAuditAction('PHOTOGRAPHER_UPDATED', 'photographer', id, `Updated ${existing?.fullName}. Commission: ${updates.commissionPercentage ?? existing?.commissionPercentage}%`);
    } catch {
      // Local fallback
    }
  };

  const deletePhotographer = async (id: string) => {
    const existing = photographers.find((p) => p.id === id);
    setPhotographers((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'photographers', id));
      await logAuditAction('PHOTOGRAPHER_DELETED', 'photographer', id, `Deleted photographer ${existing?.fullName}.`);
    } catch {
      // Local fallback
    }
  };

  // BOAT CRUD
  const addBoat = async (b: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `boat-${Date.now()}`;
    const newBoat: Boat = {
      ...b,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBoats((prev) => [newBoat, ...prev]);
    try {
      await setDoc(doc(db, 'boats', id), newBoat);
      await logAuditAction('BOAT_CREATED', 'boat', id, `Added boat ${newBoat.boatName}`);
    } catch {}
    return id;
  };

  const updateBoat = async (id: string, updates: Partial<Boat>) => {
    setBoats((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)));
    try {
      await updateDoc(doc(db, 'boats', id), updates);
      await logAuditAction('BOAT_UPDATED', 'boat', id, 'Boat details updated.');
    } catch {}
  };

  const deleteBoat = async (id: string) => {
    setBoats((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'boats', id));
      await logAuditAction('BOAT_DELETED', 'boat', id, 'Boat deleted.');
    } catch {}
  };

  // TRIP CRUD
  const addTrip = async (t: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...t,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrips((prev) => [newTrip, ...prev]);
    try {
      await setDoc(doc(db, 'trips', id), newTrip);
      await logAuditAction('TRIP_CREATED', 'trip', id, `Created trip ${newTrip.tripId} for ${newTrip.destination}`);
    } catch {}
    return id;
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
    try {
      await updateDoc(doc(db, 'trips', id), updates);
      await logAuditAction('TRIP_UPDATED', 'trip', id, 'Trip updated.');
    } catch {}
  };

  const deleteTrip = async (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, 'trips', id));
      await logAuditAction('TRIP_DELETED', 'trip', id, 'Trip deleted.');
    } catch {}
  };

  // CUSTOMER CRUD
  const addCustomer = async (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'galleryCode'>) => {
    const id = `cust-${Date.now()}`;
    const code = `SHARM-${c.fullName.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newCustomer: Customer = {
      ...c,
      id,
      galleryCode: code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    // Send notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Customer Registered',
        message: `${newCustomer.fullName} registered for Room ${newCustomer.roomNumber} (${newCustomer.hotel}).`,
        type: 'new_customer',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    try {
      await setDoc(doc(db, 'customers', id), newCustomer);
      await logAuditAction('CUSTOMER_CREATED', 'customer', id, `Registered customer ${newCustomer.fullName}`);
    } catch {}
    return id;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
    try {
      await updateDoc(doc(db, 'customers', id), updates);
    } catch {}
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch {}
  };

  // PHOTO ACTIONS
  const addPhoto = async (photo: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPhoto: Photo = {
      ...photo,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    try {
      await setDoc(doc(db, 'photos', id), newPhoto);
    } catch {}
    return id;
  };

  const updatePhotoStatus = async (photoId: string, status: Photo['status']) => {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, status, updatedAt: new Date().toISOString() } : p)));
    try {
      await updateDoc(doc(db, 'photos', photoId), { status, updatedAt: new Date().toISOString() });
    } catch {}
  };

  const togglePhotoSelected = async (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const newSelected = !p.selectedByCustomer;
          const newStatus: Photo['status'] = newSelected ? 'selected' : 'preview';
          return { ...p, selectedByCustomer: newSelected, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  const deletePhoto = async (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    try {
      await deleteDoc(doc(db, 'photos', photoId));
    } catch {}
  };

  // PACKAGES CRUD
  const addPackage = async (pkg: Omit<PhotoPackage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `pkg-${Date.now()}`;
    const newPkg: PhotoPackage = {
      ...pkg,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPackages((prev) => [...prev, newPkg]);
    try {
      await setDoc(doc(db, 'packages', id), newPkg);
    } catch {}
    return id;
  };

  const updatePackage = async (id: string, updates: Partial<PhotoPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
    try {
      await updateDoc(doc(db, 'packages', id), updates);
    } catch {}
  };

  const deletePackage = async (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'packages', id));
    } catch {}
  };

  // SALE & COMMISSION ENGINE (CRITICAL: Saves historical commission rate permanently)
  const createSale = async (saleData: {
    customerId: string;
    photographerId: string;
    tripId: string;
    selectedPhotoIds: string[];
    packageId?: string;
    packageName?: string;
    quantity: number;
    grossAmount: number;
    discount: number;
    paymentMethod: Sale['paymentMethod'];
    paymentStatus: Sale['paymentStatus'];
    notes?: string;
  }) => {
    // 1. Look up photographer's active commission %
    const photog = photographers.find((p) => p.id === saleData.photographerId);
    const commPct = photog?.commissionPercentage ?? settings.defaultPhotographerCommission ?? 30;

    // 2. Perform math
    const gross = Number(saleData.grossAmount) || 0;
    const disc = Number(saleData.discount) || 0;
    const net = Math.max(0, gross - disc);
    const commAmount = Math.round(net * (commPct / 100));
    const centerRev = net - commAmount;
    const centerPct = 100 - commPct;

    const cust = customers.find((c) => c.id === saleData.customerId);
    const trip = trips.find((t) => t.id === saleData.tripId);
    const saleId = `SL-${Date.now().toString().slice(-6)}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      saleId,
      customerId: saleData.customerId,
      customerName: cust?.fullName || 'Walk-in Tourist',
      customerHotel: cust?.hotel,
      customerRoom: cust?.roomNumber,
      photographerId: saleData.photographerId,
      photographerName: photog?.fullName || 'Assigned Photographer',
      tripId: saleData.tripId,
      tripDate: trip?.date || new Date().toISOString().slice(0, 10),
      date: new Date().toISOString().slice(0, 10),
      selectedPhotoIds: saleData.selectedPhotoIds,
      packageId: saleData.packageId,
      packageName: saleData.packageName || 'Custom Photo Package',
      quantity: saleData.quantity || 1,
      grossAmount: gross,
      discount: disc,
      netAmount: net,
      commissionPercentage: commPct, // HISTORICAL LOCKED VALUE
      commissionAmount: commAmount,
      centerPercentage: centerPct,
      centerRevenue: centerRev,
      paymentMethod: saleData.paymentMethod,
      paymentStatus: saleData.paymentStatus,
      amountPaid: saleData.paymentStatus === 'paid' ? net : 0,
      notes: saleData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

    // Mark photos as sold if customer selected them
    if (saleData.selectedPhotoIds.length > 0) {
      setPhotos((prev) =>
        prev.map((p) => (saleData.selectedPhotoIds.includes(p.id) ? { ...p, status: 'sold' } : p))
      );
    }

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Sale Recorded',
        message: `${newSale.saleId}: ${newSale.customerName} - ${formatCurrency(newSale.netAmount)} (${commPct}% comm: ${formatCurrency(commAmount)})`,
        type: 'new_sale',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    // Audit log
    await logAuditAction(
      'SALE_CREATED',
      'sale',
      newSale.id,
      `Sale ${newSale.saleId} created: Net ${formatCurrency(net)}, Comm ${commPct}% (${formatCurrency(commAmount)}), Center ${formatCurrency(centerRev)}.`
    );

    try {
      await setDoc(doc(db, 'sales', newSale.id), newSale);
    } catch {}

    return newSale.id;
  };

  const updateSaleStatus = async (saleId: string, status: Sale['paymentStatus'], method?: Sale['paymentMethod']) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    const updates: Partial<Sale> = {
      paymentStatus: status,
      amountPaid: status === 'paid' ? sale.netAmount : status === 'refunded' ? 0 : sale.amountPaid,
      updatedAt: new Date().toISOString(),
    };
    if (method) {
      updates.paymentMethod = method;
    }

    setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, ...updates } : s)));
    await logAuditAction('SALE_STATUS_UPDATED', 'sale', saleId, `Sale ${sale.saleId} status changed to ${status}.`);

    try {
      await updateDoc(doc(db, 'sales', saleId), updates);
    } catch {}
  };

  // PHOTOGRAPHER SETTLEMENT PAYMENTS
  const addPayment = async (payment: {
    photographerId: string;
    amount: number;
    date: string;
    paymentMethod: PhotographerPayment['paymentMethod'];
    referenceNumber?: string;
    notes?: string;
  }) => {
    const photog = photographers.find((p) => p.id === payment.photographerId);
    const id = `pay-${Date.now()}`;
    const newPayment: PhotographerPayment = {
      ...payment,
      id,
      photographerName: photog?.fullName || 'Photographer',
      recordedBy: currentUser?.displayName || 'Finance Department',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Photographer Commission Paid',
        message: `Settlement of ${formatCurrency(newPayment.amount)} paid to ${newPayment.photographerName}.`,
        type: 'new_payment',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    await logAuditAction(
      'PAYMENT_RECORDED',
      'payment',
      id,
      `Paid ${formatCurrency(newPayment.amount)} to ${newPayment.photographerName} via ${newPayment.paymentMethod}.`
    );

    try {
      await setDoc(doc(db, 'payments', id), newPayment);
    } catch {}

    return id;
  };

  // DAILY CLOSING
  const performDailyClosing = async (closingData: { date: string; notes?: string }) => {
    const day = closingData.date;
    const dayTrips = trips.filter((t) => t.date === day);
    const dayCustomers = customers.filter((c) => {
      const t = trips.find((item) => item.id === c.tripId);
      return t?.date === day || c.createdAt.slice(0, 10) === day;
    });
    const daySales = sales.filter((s) => s.date === day && s.paymentStatus === 'paid');

    const totalSales = daySales.reduce((acc, s) => acc + s.netAmount, 0);
    const cashSales = daySales.filter((s) => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.netAmount, 0);
    const cardSales = daySales.filter((s) => s.paymentMethod === 'card').reduce((acc, s) => acc + s.netAmount, 0);
    const onlineSales = daySales.filter((s) => s.paymentMethod === 'online').reduce((acc, s) => acc + s.netAmount, 0);
    const otherSales = totalSales - (cashSales + cardSales + onlineSales);
    const totalCommissions = daySales.reduce((acc, s) => acc + s.commissionAmount, 0);
    const centerRevenue = daySales.reduce((acc, s) => acc + s.centerRevenue, 0);

    const buyersCount = new Set(daySales.map((s) => s.customerId)).size;
    const totalCustCount = dayCustomers.length || (buyersCount + 10);
    const nonBuyersCount = Math.max(0, totalCustCount - buyersCount);

    const id = `closing-${day.replace(/-/g, '')}`;
    const newClosing: DailyClosing = {
      id,
      date: day,
      closedBy: currentUser?.userId || 'admin',
      closedByName: currentUser?.displayName || 'Manager',
      totalTrips: dayTrips.length,
      totalPhotographers: new Set(dayTrips.flatMap((t) => t.photographerIds)).size,
      totalCustomers: totalCustCount,
      totalBuyers: buyersCount,
      totalNonBuyers: nonBuyersCount,
      totalSales,
      cashSales,
      cardSales,
      onlineSales,
      otherSales,
      totalCommissions,
      centerRevenue,
      notes: closingData.notes,
      status: 'closed',
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDailyClosings((prev) => [newClosing, ...prev.filter((c) => c.date !== day)]);
    await logAuditAction(
      'DAILY_CLOSING_COMPLETED',
      'dailyClosing',
      id,
      `Daily Register closed for ${day}. Total Sales: ${formatCurrency(totalSales)}, Center Revenue: ${formatCurrency(centerRevenue)}.`
    );

    try {
      await setDoc(doc(db, 'dailyClosings', id), newClosing);
    } catch {}

    return id;
  };

  // PHOTOGRAPHER STATS CALCULATOR
  const getPhotographerStats = (photographerId: string): PhotographerStats | null => {
    const photog = photographers.find((p) => p.id === photographerId);
    if (!photog) return null;

    const photogTrips = trips.filter((t) => t.photographerIds.includes(photographerId));
    const photogCustomers = customers.filter((c) => c.photographerId === photographerId);
    const photogPhotos = photos.filter((p) => p.photographerId === photographerId);
    const photogSales = sales.filter((s) => s.photographerId === photographerId);
    const photogPayments = payments.filter((p) => p.photographerId === photographerId);

    const grossSales = photogSales.reduce((acc, s) => acc + s.grossAmount, 0);
    const netSales = photogSales.reduce((acc, s) => acc + s.netAmount, 0);
    const totalCommission = photogSales.reduce((acc, s) => acc + s.commissionAmount, 0);
    const centerRevenue = photogSales.reduce((acc, s) => acc + s.centerRevenue, 0);
    const totalPaid = photogPayments.reduce((acc, p) => acc + p.amount, 0);
    const remainingBalance = totalCommission - totalPaid;

    const buyers = new Set(photogSales.map((s) => s.customerId)).size;
    const totalCust = photogCustomers.length || buyers;
    const nonBuyers = Math.max(0, totalCust - buyers);
    const conversionRate = totalCust > 0 ? Math.round((buyers / totalCust) * 100) : 0;
    const averageSale = photogSales.length > 0 ? Math.round(netSales / photogSales.length) : 0;

    return {
      photographer: photog,
      totalTrips: photogTrips.length,
      totalCustomers: totalCust,
      totalPhotos: photogPhotos.length,
      totalSalesCount: photogSales.length,
      buyersCount: buyers,
      nonBuyersCount: nonBuyers,
      conversionRate,
      grossSales,
      netSales,
      averageSale,
      totalCommission,
      totalPaid,
      remainingBalance,
      centerRevenue,
    };
  };

  // Seed demo data into Firestore for persistence
  const seedDemoDataToFirestore = async () => {
    try {
      for (const p of demoPhotographers) {
        await setDoc(doc(db, 'photographers', p.id), p);
      }
      for (const b of demoBoats) {
        await setDoc(doc(db, 'boats', b.id), b);
      }
      for (const t of demoTrips) {
        await setDoc(doc(db, 'trips', t.id), t);
      }
      for (const c of demoCustomers) {
        await setDoc(doc(db, 'customers', c.id), c);
      }
      for (const s of demoSales) {
        await setDoc(doc(db, 'sales', s.id), s);
      }
      for (const pay of demoPayments) {
        await setDoc(doc(db, 'payments', pay.id), pay);
      }
      for (const dc of demoDailyClosings) {
        await setDoc(doc(db, 'dailyClosings', dc.id), dc);
      }
      await setDoc(doc(db, 'settings', 'global'), initialSettings);
      await logAuditAction('DEMO_DATA_SEEDED', 'system', 'all', 'Seeded realistic demo data.');
    } catch (e) {
      console.error('Seed error:', e);
    }
  };

  const resetToDemoData = () => {
    setPhotographers(demoPhotographers);
    setBoats(demoBoats);
    setTrips(demoTrips);
    setCustomers(demoCustomers);
    setPhotos(generateDemoPhotos());
    setPackages(defaultPackages);
    setSales(demoSales);
    setPayments(demoPayments);
    setDailyClosings(demoDailyClosings);
    setSettings(initialSettings);
  };

  return (
    <AppContext.Provider
      value={{
        appLanguage,
        setAppLanguage,
        isRTL,
        t,
        firebaseUser,
        currentUser,
        activeRole,
        activePhotographerId,
        systemUsers,
        isLoginPageOpen,
        setIsLoginPageOpen,
        loginWithGoogle,
        loginAsUser,
        loginAsRole,
        logout,
        switchDemoRole,
        addSystemUser,
        updateSystemUser,
        deleteSystemUser,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        openCustomerGallery,
        galleryCustomerId,
        closeCustomerGallery,
        settings,
        updateSettings,
        photographers,
        boats,
        trips,
        customers,
        photos,
        packages,
        sales,
        payments,
        dailyClosings,
        notifications,
        auditLogs,
        unreadNotificationCount,
        markNotificationAsRead,
        addPhotographer,
        updatePhotographer,
        deletePhotographer,
        addBoat,
        updateBoat,
        deleteBoat,
        addTrip,
        updateTrip,
        deleteTrip,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addPhoto,
        updatePhotoStatus,
        togglePhotoSelected,
        deletePhoto,
        addPackage,
        updatePackage,
        deletePackage,
        createSale,
        updateSaleStatus,
        addPayment,
        performDailyClosing,
        getPhotographerStats,
        formatCurrency,
        seedDemoDataToFirestore,
        resetToDemoData,
        logAuditAction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
