/**
 * Mock API layer — simulates network requests using local data + AsyncStorage.
 * All methods return Promises with artificial delay to mimic real API behavior.
 */

import { mockProperties } from '../data/mockProperties';
import { mockGuests, mockOwners, DEMO_USERS } from '../data/mockUsers';
import { mockBookings, mockAlerts, mockNotifications, mockIncidents } from '../data/mockBookings';
import { appStorage, secureStorage } from './storage';
import type {
  User, GuestProfile, OwnerProfile, Property, Room, Booking,
  Alert, Notification, Incident, KYCDocument, CoGuest, SavedTraveler, CoGuestStatus
} from '../types';

const delay = (ms = 600) => new Promise(res => setTimeout(res, ms));

const generateToken = (userId: string) => `mock_token_${userId}_${Date.now()}`;

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: async (phone: string): Promise<{ success: boolean; message: string }> => {
    await delay(800);
    const allUsers = [...mockGuests, ...mockOwners];
    const user = allUsers.find(u => u.phone === phone);
    if (!user) {
      // New user — still send OTP for registration
      return { success: true, message: 'OTP sent to ' + phone };
    }
    return { success: true, message: 'OTP sent to ' + phone };
  },

  verifyOtp: async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; user?: User; token?: string; isNewUser?: boolean }> => {
    await delay(1000);
    // Accept 123456 as valid OTP for all numbers in demo
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Use 123456 for demo.');
    }

    const allGuests = mockGuests as User[];
    const allOwners = mockOwners as User[];
    const allUsers = [...allGuests, ...allOwners];
    const user = allUsers.find(u => u.phone === phone);

    if (!user) {
      return { success: true, isNewUser: true };
    }

    const token = generateToken(user.id);
    await secureStorage.setToken(token);
    await appStorage.setUserId(user.id);
    await appStorage.setUserRole(user.role);

    return { success: true, user, token, isNewUser: false };
  },

  logout: async (): Promise<void> => {
    await delay(300);
    await secureStorage.deleteToken();
    await appStorage.remove('user_id');
    await appStorage.remove('user_role');
  },

  getMe: async (userId: string): Promise<User | null> => {
    await delay(400);
    const allUsers = [...mockGuests as User[], ...mockOwners as User[]];
    return allUsers.find(u => u.id === userId) || null;
  },
};

// ─── Properties API ───────────────────────────────────────────────────────────

export const propertiesApi = {
  getAll: async (filters?: {
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Property[]> => {
    await delay(700);
    let results = [...mockProperties];
    if (filters?.city) {
      results = results.filter(p =>
        p.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters?.type) {
      results = results.filter(p => p.type === filters.type);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }
    if (filters?.minPrice !== undefined) {
      results = results.filter(p => p.priceRange.min >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      results = results.filter(p => p.priceRange.max <= filters.maxPrice!);
    }
    return results;
  },

  getById: async (id: string): Promise<Property | null> => {
    await delay(500);
    return mockProperties.find(p => p.id === id) || null;
  },

  getByOwner: async (ownerId: string): Promise<Property[]> => {
    await delay(500);
    return mockProperties.filter(p => p.ownerId === ownerId);
  },

  getRooms: async (propertyId: string): Promise<Room[]> => {
    await delay(600);
    const prop = mockProperties.find(p => p.id === propertyId);
    if (!prop) return [];
    return Array.from({ length: Math.min(prop.totalRooms, 10) }, (_, i) => ({
      id: `room_${propertyId}_${i}`,
      propertyId,
      roomNumber: `${(Math.floor(i / 4) + 1) * 100 + (i % 4) + 1}`,
      type: (['single', 'double', 'triple', 'dormitory'] as const)[i % 4],
      floor: Math.floor(i / 4) + 1,
      capacity: [1, 2, 3, 6][i % 4],
      currentOccupancy: i % 3 === 0 ? [1, 2, 3, 4][i % 4] : 0,
      pricePerMonth: prop.priceRange.min + (i * 500),
      pricePerDay: Math.round((prop.priceRange.min + i * 500) / 30),
      status: (['available', 'occupied', 'available', 'maintenance'] as const)[i % 4],
      amenities: prop.amenities.slice(0, 4),
      images: prop.images,
      currentGuestIds: [],
    }));
  },

  create: async (data: Partial<Property>): Promise<Property> => {
    await delay(1000);
    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      ownerId: data.ownerId || 'owner_001',
      name: data.name || '',
      type: data.type || 'pg',
      description: data.description || 'Verified accommodation in Andhra Pradesh.',
      address: data.address || '',
      city: data.city || '',
      state: data.state || 'Andhra Pradesh',
      pincode: data.pincode || '',
      latitude: data.latitude || 16.5062,
      longitude: data.longitude || 80.6480,
      totalRooms: data.totalRooms || 0,
      availableRooms: data.totalRooms || 0,
      priceRange: data.priceRange || { min: 0, max: 0 },
      rating: 0,
      reviewCount: 0,
      amenities: data.amenities || [],
      rules: data.rules || ['No smoking', 'Maintain silence after 10 PM'],
      images: data.images || ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5'],
      status: 'active',
      verificationStatus: 'pending',
      contactPhone: data.contactPhone || '9999999999',
      createdAt: new Date().toISOString(),
    };
    mockProperties.unshift(newProperty);
    return newProperty;
  },
};

// ─── Bookings API ─────────────────────────────────────────────────────────────

export const bookingsApi = {
  getByGuest: async (guestId: string): Promise<Booking[]> => {
    await delay(600);
    return mockBookings.filter(b => b.guestId === guestId);
  },

  getByProperty: async (propertyId: string): Promise<Booking[]> => {
    await delay(600);
    return mockBookings.filter(b => b.propertyId === propertyId);
  },

  getById: async (id: string): Promise<Booking | null> => {
    await delay(400);
    return mockBookings.find(b => b.id === id) || null;
  },

  create: async (data: Partial<Booking>): Promise<Booking> => {
    await delay(1000);
    const booking: Booking = {
      id: `booking_${Date.now()}`,
      guestId: data.guestId!,
      propertyId: data.propertyId!,
      roomId: data.roomId!,
      propertyName: data.propertyName!,
      roomNumber: data.roomNumber!,
      checkIn: data.checkIn!,
      checkOut: data.checkOut!,
      status: 'pending',
      totalAmount: data.totalAmount!,
      paidAmount: 0,
      guestCount: data.guestCount || 1,
      specialRequests: data.specialRequests,
      qrCode: `QR_${Date.now()}_SAFESTAY`,
      createdAt: new Date().toISOString(),
    };
    mockBookings.push(booking);
    return booking;
  },

  approve: async (bookingId: string): Promise<Booking> => {
    await delay(800);
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    booking.status = 'confirmed';
    booking.approvedAt = new Date().toISOString();
    return booking;
  },

  cancel: async (bookingId: string): Promise<Booking> => {
    await delay(800);
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    booking.status = 'cancelled';
    return booking;
  },

  checkIn: async (bookingId: string): Promise<Booking> => {
    await delay(800);
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    booking.status = 'checked_in';
    booking.checkedInAt = new Date().toISOString();
    return booking;
  },

  checkOut: async (bookingId: string): Promise<Booking> => {
    await delay(800);
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    booking.status = 'checked_out';
    booking.checkedOutAt = new Date().toISOString();
    return booking;
  },
};

// ─── Guests API ───────────────────────────────────────────────────────────────

export const guestsApi = {
  getAll: async (): Promise<GuestProfile[]> => {
    await delay(700);
    return mockGuests;
  },

  getById: async (id: string): Promise<GuestProfile | null> => {
    await delay(400);
    return mockGuests.find(g => g.id === id) || null;
  },

  updateProfile: async (id: string, data: Partial<GuestProfile>): Promise<GuestProfile> => {
    await delay(800);
    const idx = mockGuests.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Guest not found');
    Object.assign(mockGuests[idx], data);
    return mockGuests[idx];
  },

  submitKYC: async (userId: string, _doc: Partial<KYCDocument>): Promise<KYCDocument> => {
    await delay(1200);
    const doc: KYCDocument = {
      id: `kyc_${Date.now()}`,
      userId,
      type: _doc.type || 'aadhaar',
      documentNumber: _doc.documentNumber || '',
      frontImage: _doc.frontImage || '',
      backImage: _doc.backImage,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    // Update guest KYC status
    const guest = mockGuests.find(g => g.id === userId);
    if (guest) guest.kycStatus = 'submitted';
    return doc;
  },
};

// ─── Alerts API ───────────────────────────────────────────────────────────────

export const alertsApi = {
  getByProperty: async (propertyId: string): Promise<Alert[]> => {
    await delay(500);
    return mockAlerts.filter(a => a.propertyId === propertyId);
  },

  triggerSOS: async (guestId: string, propertyId: string, isSilent = false): Promise<Alert> => {
    await delay(500);
    const alert: Alert = {
      id: `alert_sos_${Date.now()}`,
      propertyId,
      guestId,
      title: isSilent ? 'Silent SOS Triggered' : 'SOS Alert',
      description: isSilent
        ? 'Guest has triggered a silent SOS. Discreet assistance required.'
        : 'Guest has triggered an emergency SOS. Immediate attention required!',
      severity: 'sos',
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    mockAlerts.unshift(alert);
    return alert;
  },

  resolve: async (alertId: string): Promise<Alert> => {
    await delay(600);
    const alert = mockAlerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    alert.isResolved = true;
    alert.resolvedAt = new Date().toISOString();
    return alert;
  },
};

// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationsApi = {
  getByUser: async (userId: string): Promise<Notification[]> => {
    await delay(500);
    return mockNotifications.filter(n => n.userId === userId);
  },

  markRead: async (notifId: string): Promise<void> => {
    await delay(300);
    const notif = mockNotifications.find(n => n.id === notifId);
    if (notif) notif.isRead = true;
  },

  markAllRead: async (userId: string): Promise<void> => {
    await delay(400);
    mockNotifications
      .filter(n => n.userId === userId)
      .forEach(n => (n.isRead = true));
  },
};

// ─── Incidents API ────────────────────────────────────────────────────────────

export const incidentsApi = {
  getByProperty: async (propertyId: string): Promise<Incident[]> => {
    await delay(500);
    return mockIncidents.filter(i => i.propertyId === propertyId);
  },

  getByGuest: async (guestId: string): Promise<Incident[]> => {
    await delay(500);
    return mockIncidents.filter(i => i.reportedBy === guestId);
  },

  report: async (data: Partial<Incident>): Promise<Incident> => {
    await delay(1000);
    const incident: Incident = {
      id: `incident_${Date.now()}`,
      reportedBy: data.reportedBy!,
      propertyId: data.propertyId!,
      title: data.title!,
      description: data.description!,
      category: data.category || 'other',
      status: 'open',
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
    };
    mockIncidents.unshift(incident);
    return incident;
  },
};

// ─── Analytics API ────────────────────────────────────────────────────────────

export const analyticsApi = {
  getOccupancy: async (propertyId: string) => {
    await delay(600);
    const prop = mockProperties.find(p => p.id === propertyId);
    const rate = prop ? Math.round((prop.totalRooms - prop.availableRooms) / prop.totalRooms * 100) : 75;
    return {
      totalRooms: prop?.totalRooms || 20,
      occupiedRooms: prop ? prop.totalRooms - prop.availableRooms : 15,
      occupancyRate: rate,
      trend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
        rate: Math.max(60, Math.min(100, rate + (Math.random() * 20 - 10))),
      })),
    };
  },

  getRevenue: async (propertyId: string) => {
    await delay(600);
    const prop = mockProperties.find(p => p.id === propertyId);
    const baseRevenue = (prop?.priceRange.min || 8000) * (prop?.totalRooms || 20) * 0.75;
    return {
      thisMonth: Math.round(baseRevenue),
      lastMonth: Math.round(baseRevenue * 0.92),
      growth: 8.7,
      monthlyTrend: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        revenue: Math.round(baseRevenue * (0.85 + i * 0.03)),
        bookings: Math.floor(10 + i * 2),
      })),
    };
  },
};

// ─── Multi-Guest & Co-Guest Verification databases ───────────────────────────

export const mockSavedTravelers: SavedTraveler[] = [
  {
    id: 'st_001',
    userId: 'guest_001',
    name: 'Suhasini Reddy',
    phone: '+91 9000000002',
    relationship: 'Spouse',
    idType: 'aadhaar',
    idNumber: '5432-8765-4321',
    photoUrl: 'https://picsum.photos/seed/traveler1/120/120',
  },
  {
    id: 'st_002',
    userId: 'guest_001',
    name: 'Anil Kumar',
    phone: '+91 9000000003',
    relationship: 'Brother',
    idType: 'pan',
    idNumber: 'ABCDE1234F',
    photoUrl: 'https://picsum.photos/seed/traveler2/120/120',
  },
  {
    id: 'st_003',
    userId: 'guest_001',
    name: 'Venkat Raju', // This will flag as criminal/watchlist for testing
    phone: '+91 9000000004',
    relationship: 'Friend',
    idType: 'aadhaar',
    idNumber: '9876-5432-1098',
    photoUrl: 'https://picsum.photos/seed/traveler3/120/120',
  },
];

export const mockCoGuests: CoGuest[] = [
  {
    id: 'cg_001',
    bookingId: 'booking_001',
    name: 'Suhasini Reddy',
    phone: '+91 9000000002',
    relationship: 'Spouse',
    idType: 'aadhaar',
    idNumber: '5432-8765-4321',
    status: 'accepted',
    invitedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    invitationExpiry: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resendCount: 0,
    isManualUpload: false,
    watchlistStatus: 'clear',
  }
];

// ─── Travelers API ────────────────────────────────────────────────────────────

export const travelersApi = {
  getByUser: async (userId: string): Promise<SavedTraveler[]> => {
    await delay(500);
    return mockSavedTravelers.filter(t => t.userId === userId);
  },

  save: async (traveler: Partial<SavedTraveler> & { userId: string }): Promise<SavedTraveler> => {
    await delay(700);
    const existingIdx = mockSavedTravelers.findIndex(t => t.id === traveler.id);
    if (existingIdx > -1) {
      mockSavedTravelers[existingIdx] = {
        ...mockSavedTravelers[existingIdx],
        ...traveler,
      } as SavedTraveler;
      return mockSavedTravelers[existingIdx];
    } else {
      const newTraveler: SavedTraveler = {
        id: `st_${Date.now()}`,
        userId: traveler.userId,
        name: traveler.name || '',
        phone: traveler.phone || '',
        relationship: traveler.relationship || 'Friend',
        idType: traveler.idType || 'aadhaar',
        idNumber: traveler.idNumber || '',
        photoUrl: traveler.photoUrl || `https://picsum.photos/seed/traveler_${Date.now()}/120/120`,
      };
      mockSavedTravelers.push(newTraveler);
      return newTraveler;
    }
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    const idx = mockSavedTravelers.findIndex(t => t.id === id);
    if (idx > -1) {
      mockSavedTravelers.splice(idx, 1);
    }
  },

  mockOcr: async (imageUri: string): Promise<{ name: string; idNumber: string; idType: 'aadhaar' | 'pan' | 'passport'; dateOfBirth: string }> => {
    await delay(1500); // Simulate network lag + scanning
    // Extract mock data from image seed
    return {
      name: "Sandeep Chowdary",
      idNumber: "3845-9271-8402",
      idType: "aadhaar",
      dateOfBirth: "1994-08-15"
    };
  }
};

// ─── Co-Guests API ────────────────────────────────────────────────────────────

export const coGuestsApi = {
  getByBooking: async (bookingId: string): Promise<CoGuest[]> => {
    await delay(400);
    const guests = mockCoGuests.filter(cg => cg.bookingId === bookingId);
    
    // Auto-update expired invitations
    const now = new Date();
    guests.forEach(g => {
      if (g.status === 'invited' && new Date(g.invitationExpiry) < now) {
        g.status = 'expired';
      }
    });

    return guests;
  },

  inviteCoGuest: async (
    bookingId: string,
    data: { name: string; phone: string; relationship: string; idType: any; idNumber: string; primaryGuestName: string }
  ): Promise<CoGuest> => {
    await delay(800);
    const newCoGuest: CoGuest = {
      id: `cg_${Date.now()}`,
      bookingId,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      idType: data.idType,
      idNumber: data.idNumber,
      status: 'invited',
      invitedAt: new Date().toISOString(),
      invitationExpiry: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 24 Hours expiry
      resendCount: 0,
      isManualUpload: false,
      watchlistStatus: 'pending',
    };
    mockCoGuests.push(newCoGuest);

    // If the phone number matches an existing guest user in the system, alert them via in-app notification
    const matchedGuest = mockGuests.find(g => g.phone.replace(/\s+/g, '') === data.phone.replace(/\s+/g, ''));
    if (matchedGuest) {
      mockNotifications.unshift({
        id: `notif_${Date.now()}`,
        userId: matchedGuest.id,
        title: 'SafeStay Co-Guest Booking Invitation',
        body: `You have been invited by ${data.primaryGuestName} as a co-guest. Accept now to link your profile.`,
        type: 'booking',
        isRead: false,
        data: { bookingId, coGuestId: newCoGuest.id },
        createdAt: new Date().toISOString(),
      });
    }

    return newCoGuest;
  },

  resendInvitation: async (coGuestId: string): Promise<CoGuest> => {
    await delay(700);
    const cg = mockCoGuests.find(c => c.id === coGuestId);
    if (!cg) throw new Error('Invitation not found');

    if (cg.resendCount >= 3) {
      throw new Error('Resend limit exceeded (Max 3 times)');
    }

    cg.status = 'invited';
    cg.invitedAt = new Date().toISOString();
    cg.invitationExpiry = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    cg.resendCount += 1;

    return cg;
  },

  respondToInvitation: async (coGuestId: string, accept: boolean): Promise<CoGuest> => {
    await delay(1000);
    const cg = mockCoGuests.find(c => c.id === coGuestId);
    if (!cg) throw new Error('Co-guest record not found');

    cg.status = accept ? 'accepted' : 'declined';
    
    // Find booking to notify the primary guest
    const booking = mockBookings.find(b => b.id === cg.bookingId);
    if (booking) {
      mockNotifications.unshift({
        id: `notif_${Date.now()}`,
        userId: booking.guestId,
        title: accept ? 'Invitation Accepted' : 'Invitation Declined',
        body: accept 
          ? `Co-guest ${cg.name} has accepted your stay invitation.` 
          : `Co-guest ${cg.name} has declined your stay invitation.`,
        type: 'booking',
        isRead: false,
        data: { bookingId: booking.id },
        createdAt: new Date().toISOString(),
      });
    }

    if (accept) {
      // Perform automated background Police Watchlist Match
      const nameLower = cg.name.toLowerCase();
      if (nameLower.includes('wanted') || nameLower.includes('criminal') || nameLower.includes('raju') || nameLower.includes('sunder')) {
        cg.watchlistStatus = 'flagged';
        cg.watchlistMatchNotes = 'Flagged in AP Crime Watchlist: Match ID AP-WATCH-209. Active warrant outstanding for Section 420 IPC.';
      } else {
        cg.watchlistStatus = 'clear';
      }
    }

    return cg;
  },

  addManualCoGuest: async (
    bookingId: string,
    data: { name: string; phone: string; relationship: string; idType: any; idNumber: string; photoUrl?: string; idDocUrl?: string }
  ): Promise<CoGuest> => {
    await delay(1000);
    const nameLower = data.name.toLowerCase();
    let watchlistStatus: 'clear' | 'flagged' = 'clear';
    let watchlistMatchNotes: string | undefined = undefined;

    if (nameLower.includes('wanted') || nameLower.includes('criminal') || nameLower.includes('raju') || nameLower.includes('sunder')) {
      watchlistStatus = 'flagged';
      watchlistMatchNotes = 'Flagged in AP Crime Watchlist: Match ID AP-WATCH-209. Active warrant outstanding for Section 420 IPC.';
    }

    const newCoGuest: CoGuest = {
      id: `cg_${Date.now()}`,
      bookingId,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      idType: data.idType,
      idNumber: data.idNumber,
      photoUrl: data.photoUrl || 'https://picsum.photos/seed/man1/100/100',
      idDocUrl: data.idDocUrl || 'https://picsum.photos/seed/doc1/100/100',
      status: 'accepted', // Auto-accepted since manually verified by host or guest uploads
      invitedAt: new Date().toISOString(),
      invitationExpiry: new Date().toISOString(),
      resendCount: 0,
      isManualUpload: true,
      watchlistStatus,
      watchlistMatchNotes,
    };

    mockCoGuests.push(newCoGuest);
    return newCoGuest;
  },

  getInvitationsByUser: async (phone: string): Promise<CoGuest[]> => {
    await delay(500);
    const normalizedPhone = phone.replace(/\s+/g, '');
    return mockCoGuests.filter(cg => cg.phone.replace(/\s+/g, '') === normalizedPhone);
  }
};

