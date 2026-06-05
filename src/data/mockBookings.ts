import { Booking, Alert, Notification, Incident } from '../types';

export const mockBookings: Booking[] = Array.from({ length: 50 }, (_, i) => {
  const statuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] as const;
  const propIds = ['prop_001', 'prop_002', 'prop_003', 'prop_004', 'prop_005', 'prop_006', 'prop_007', 'prop_008'];
  const roomNums = ['101', '102', '201', '202', '301', '302', '401'];
  const propNames = [
    'Green Valley PG', 'Sri Sai Residency', 'Hotel Grand Comfort',
    'Sunrise Boys Hostel', 'Lakshmi Nilayam Ladies PG', 'TechHub Co-Living',
    'Royal Guest House', 'Visakha Boys PG',
  ];
  const status = statuses[i % 5];
  const checkIn = new Date(2024, 0, (i % 28) + 1);
  const checkOut = new Date(checkIn);
  checkOut.setMonth(checkOut.getMonth() + 1);

  return {
    id: `booking_${String(i + 1).padStart(3, '0')}`,
    guestId: `guest_${String((i % 50) + 1).padStart(3, '0')}`,
    propertyId: propIds[i % 8],
    roomId: `room_${i % 8}_${i % 7}`,
    propertyName: propNames[i % 8],
    roomNumber: roomNums[i % 7],
    checkIn: checkIn.toISOString(),
    checkOut: checkOut.toISOString(),
    status,
    totalAmount: 8000 + (i * 500),
    paidAmount: status === 'pending' ? 0 : 8000 + (i * 500),
    guestCount: (i % 3) + 1,
    specialRequests: i % 4 === 0 ? 'Early check-in requested' : undefined,
    qrCode: `QR_${String(i + 1).padStart(6, '0')}_SAFESTAY`,
    createdAt: new Date(2024, 0, (i % 28) + 1).toISOString(),
    approvedAt: status !== 'pending' ? new Date(2024, 0, (i % 28) + 2).toISOString() : undefined,
    checkedInAt: ['checked_in', 'checked_out'].includes(status)
      ? new Date(2024, 0, (i % 28) + 3).toISOString()
      : undefined,
    checkedOutAt: status === 'checked_out'
      ? new Date(checkOut.getTime() - 86400000).toISOString()
      : undefined,
  };
});

export const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    propertyId: 'prop_001',
    guestId: 'guest_005',
    title: 'SOS Alert - Room 301',
    description: 'Guest has triggered SOS from room 301. Immediate attention required.',
    severity: 'sos',
    isResolved: false,
    location: 'Room 301, 3rd Floor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert_002',
    propertyId: 'prop_002',
    title: 'Unauthorized Entry Attempt',
    description: 'CCTV detected unauthorized entry attempt at rear gate at 2:15 AM.',
    severity: 'critical',
    isResolved: true,
    location: 'Rear Gate',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'alert_003',
    propertyId: 'prop_001',
    title: 'Fire Alarm Test',
    description: 'Scheduled fire alarm test at 10:00 AM. Please do not panic.',
    severity: 'info',
    isResolved: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    id: 'alert_004',
    propertyId: 'prop_003',
    title: 'Water Supply Disruption',
    description: 'Municipal water supply disrupted. Backup tanks in use. Duration: 4 hours.',
    severity: 'warning',
    isResolved: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'alert_005',
    propertyId: 'prop_001',
    guestId: 'guest_012',
    title: 'Silent SOS Triggered',
    description: 'Guest has triggered silent SOS from mobile app. Location: Room 205.',
    severity: 'sos',
    isResolved: false,
    location: 'Room 205, 2nd Floor',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'alert_006',
    propertyId: 'prop_004',
    title: 'Maintenance Required',
    description: 'Elevator reported not working. Maintenance team notified.',
    severity: 'warning',
    isResolved: false,
    location: 'Main Elevator',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    userId: 'guest_001',
    title: 'Booking Confirmed',
    body: 'Your booking at Green Valley PG has been confirmed. Check-in on Jan 15.',
    type: 'booking',
    isRead: false,
    data: { bookingId: 'booking_001', propertyId: 'prop_001' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif_002',
    userId: 'guest_001',
    title: 'KYC Verification Complete',
    body: 'Your KYC documents have been verified successfully.',
    type: 'kyc',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'notif_003',
    userId: 'guest_001',
    title: 'Check-in Reminder',
    body: 'Your check-in is tomorrow at 12:00 PM. Don\'t forget your QR code!',
    type: 'booking',
    isRead: false,
    data: { bookingId: 'booking_001' },
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'notif_004',
    userId: 'owner_001',
    title: 'New Booking Request',
    body: 'Arjun Sharma has requested a booking for Room 201.',
    type: 'booking',
    isRead: false,
    data: { bookingId: 'booking_045', propertyId: 'prop_001' },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'notif_005',
    userId: 'owner_001',
    title: 'KYC Document Submitted',
    body: 'Priya Reddy has submitted KYC documents for verification.',
    type: 'kyc',
    isRead: false,
    data: { guestId: 'guest_002' },
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'notif_006',
    userId: 'guest_001',
    title: 'Rent Due Reminder',
    body: 'Your rent of ₹10,000 is due on Jan 31. Please pay on time.',
    type: 'payment',
    isRead: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const mockIncidents: Incident[] = [
  {
    id: 'incident_001',
    reportedBy: 'guest_005',
    propertyId: 'prop_001',
    title: 'Theft of laptop from room',
    description: 'My laptop was stolen from room 301 while I was at work. Security footage might help.',
    category: 'theft',
    status: 'investigating',
    attachments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'incident_002',
    reportedBy: 'guest_012',
    propertyId: 'prop_002',
    title: 'Suspicious person loitering',
    description: 'A suspicious person has been loitering near the parking area for the past 2 hours.',
    category: 'safety',
    status: 'resolved',
    attachments: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'incident_003',
    reportedBy: 'guest_023',
    propertyId: 'prop_001',
    title: 'Water leakage in bathroom',
    description: 'Bathroom pipe is leaking and flooding the floor. Room 205.',
    category: 'maintenance',
    status: 'open',
    attachments: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];
