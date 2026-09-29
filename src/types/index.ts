export type UserRole = 'owner' | 'admin' | 'accountant' | 'photographer';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  photographerId?: string;
  photographerName?: string;
  phone?: string;
  photoURL?: string;
  googleLinked?: boolean;
  status?: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Photographer {
  id: string;
  fullName: string;
  profilePhoto?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  idNumber?: string;
  commissionPercentage: number; // e.g. 30 for 30%
  status: 'active' | 'inactive';
  dateJoined: string;
  assignedBoatId?: string;
  assignedBoatName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Boat {
  id: string;
  boatName: string;
  boatNumber: string;
  company: string;
  contactPerson: string;
  phone: string;
  status: 'active' | 'maintenance' | 'inactive';
  notes?: string;
  assignedPhotographerIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  tripId: string; // Friendly code e.g. TR-20260929-01
  date: string; // YYYY-MM-DD
  destination: string; // e.g. Ras Mohammed, Tiran Island, White Island
  boatId: string;
  boatName: string;
  photographerIds: string[];
  departureTime: string; // e.g. 08:30
  returnTime: string; // e.g. 16:30
  expectedCustomers: number;
  actualCustomers: number;
  status: TripStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. CUST-8492
  fullName: string;
  roomNumber: string;
  hotel: string;
  country: string;
  phone?: string;
  peopleCount: number;
  tripId: string;
  photographerId: string;
  photographerName?: string;
  galleryCode: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PhotoStatus = 'preview' | 'selected' | 'sold' | 'not_sold' | 'deleted';

export interface Photo {
  id: string;
  tripId: string;
  customerId: string;
  photographerId: string;
  url: string;
  previewUrl?: string;
  caption?: string;
  status: PhotoStatus;
  selectedByCustomer?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoPackage {
  id: string;
  name: string;
  description: string;
  photoCount: number; // 0 for unlimited / all photos
  price: number;
  active: boolean;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'online' | 'bank_transfer' | 'other';
export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid' | 'refunded';

export interface Sale {
  id: string;
  saleId: string; // e.g. SL-10293
  customerId: string;
  customerName: string;
  customerHotel?: string;
  customerRoom?: string;
  photographerId: string;
  photographerName: string;
  tripId: string;
  tripDate: string;
  date: string; // YYYY-MM-DD
  selectedPhotoIds: string[];
  packageId?: string;
  packageName?: string;
  quantity: number;
  grossAmount: number;
  discount: number;
  netAmount: number; // Gross - Discount
  commissionPercentage: number; // Locked historical rate at sale time
  commissionAmount: number; // Net * (Rate / 100)
  centerPercentage: number; // 100 - commissionPercentage
  centerRevenue: number; // Net - commissionAmount
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhotographerPayment {
  id: string;
  photographerId: string;
  photographerName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyClosing {
  id: string;
  date: string; // YYYY-MM-DD
  closedBy: string;
  closedByName: string;
  totalTrips: number;
  totalPhotographers: number;
  totalCustomers: number;
  totalBuyers: number;
  totalNonBuyers: number;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  onlineSales: number;
  otherSales: number;
  totalCommissions: number;
  centerRevenue: number;
  notes?: string;
  status: 'closed' | 'reopened';
  closedAt: string;
  updatedAt: string;
}

export interface CenterSettings {
  centerName: string;
  tagline?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  currency: string; // Default EGP
  currencySymbol: string; // ج.م or EGP
  defaultPhotographerCommission: number; // e.g. 30
  defaultCenterPercentage: number; // e.g. 70
  taxPercentage: number; // e.g. 0 or 14
  languages: string[];
  paymentMethods: string[];
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_customer' | 'new_sale' | 'new_payment' | 'trip_assigned' | 'commission_updated' | 'daily_closing' | 'general';
  targetUserId?: string;
  targetRole?: UserRole;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface PhotographerStats {
  photographer: Photographer;
  totalTrips: number;
  totalCustomers: number;
  totalPhotos: number;
  totalSalesCount: number;
  buyersCount: number;
  nonBuyersCount: number;
  conversionRate: number; // %
  grossSales: number;
  netSales: number;
  averageSale: number;
  totalCommission: number;
  totalPaid: number;
  remainingBalance: number;
  centerRevenue: number;
}
