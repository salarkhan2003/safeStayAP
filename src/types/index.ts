// ─── Core Types ──────────────────────────────────────────────────────────────

export type UserRole = 'guest' | 'owner';

export type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PropertyStatus = 'active' | 'inactive' | 'pending_verification' | 'verified';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'sos';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  kycStatus: KYCStatus;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface GuestProfile extends User {
  role: 'guest';
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  emergencyContacts: EmergencyContact[];
  currentBookingId?: string;
  bookingHistory: string[];
}

export interface OwnerProfile extends User {
  role: 'owner';
  businessName?: string;
  businessAddress?: string;
  gstNumber?: string;
  properties: string[];
  verificationStatus: VerificationStatus;
}

// ─── Emergency Contact ───────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

// ─── Property ────────────────────────────────────────────────────────────────

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  type: 'pg' | 'hotel' | 'hostel' | 'guesthouse';
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  images: string[];
  amenities: string[];
  rules: string[];
  priceRange: { min: number; max: number };
  rating: number;
  reviewCount: number;
  status: PropertyStatus;
  verificationStatus: VerificationStatus;
  totalRooms: number;
  availableRooms: number;
  contactPhone: string;
  createdAt: string;
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple' | 'dormitory' | 'suite';
  floor: number;
  capacity: number;
  currentOccupancy: number;
  pricePerMonth: number;
  pricePerDay: number;
  status: RoomStatus;
  amenities: string[];
  images: string[];
  currentGuestIds: string[];
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  guestId: string;
  propertyId: string;
  roomId: string;
  propertyName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  guestCount: number;
  specialRequests?: string;
  qrCode: string;
  createdAt: string;
  approvedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'booking' | 'alert' | 'kyc' | 'payment' | 'system' | 'sos';
  isRead: boolean;
  data?: Record<string, string>;
  createdAt: string;
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  propertyId: string;
  guestId?: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  isResolved: boolean;
  location?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── Incident ────────────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  reportedBy: string;
  propertyId: string;
  title: string;
  description: string;
  category: 'safety' | 'maintenance' | 'noise' | 'theft' | 'other';
  status: 'open' | 'investigating' | 'resolved';
  attachments: string[];
  createdAt: string;
  resolvedAt?: string;
}

// ─── KYC Document ────────────────────────────────────────────────────────────

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'aadhaar' | 'pan' | 'passport' | 'voter_id' | 'driving_license';
  documentNumber: string;
  frontImage: string;
  backImage?: string;
  status: KYCStatus;
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export interface Staff {
  id: string;
  propertyId: string;
  name: string;
  role: 'manager' | 'security' | 'housekeeping' | 'receptionist';
  phone: string;
  email?: string;
  isActive: boolean;
  joinedAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface OccupancyData {
  date: string;
  total: number;
  occupied: number;
  rate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    white: string;
    black: string;
    overlay: string;
  };
  isDark: boolean;
}
