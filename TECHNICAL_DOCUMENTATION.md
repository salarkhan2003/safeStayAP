# 🛡️ SafeStay AP — Mobile App Technical Documentation

This document outlines the core technical architecture, data structures, state management patterns, security protocols, and backend integration schemas for the **SafeStay AP** mobile application. It is intended for developers, database administrators, and security auditors.

---

## 📖 Table of Contents
1. [System Topology](#1-system-topology)
2. [Database Schema & Supabase Configuration](#2-database-schema--supabase-configuration)
3. [State Management & Data Querying](#3-state-management--data-querying)
4. [Authentication & Secure Storage](#4-authentication--secure-storage)
5. [eKYC & Crime Watchlist System](#5-ekyc--crime-watchlist-system)
6. [Emergency SOS Real-time Protocol](#6-emergency-sos-real-time-protocol)
7. [Real-time Notification Architecture](#7-real-time-notification-architecture)

---

## 1. System Topology

SafeStay AP is built on a decoupled, serverless mobile architecture designed to minimize latency and guarantee reliable operation under weak cellular conditions.

```
       +---------------------------------------------+
       |             SafeStay AP Client              |
       |  (Expo SDK 54 / React Native / TypeScript)  |
       +-------+-----------------------------+-------+
               |                             |
  HTTPS / WebSocket Queries & Real-time Alerts
               |                             |
               v
+--------------+---------------+
|     Supabase Cloud Services   |
|  - PostgreSQL Database       |
|  - Storage (KYC ID Buckets)  |
|  - Auth (JWT & SMS OTP)      |
|  - Real-time Subscriptions  |
+--------------+---------------+
               |
        REST Sync Triggers
               |
               v
+--------------+---------------+
|     AP Police Web Gateway    |
|  - Criminal Watchlist DB     |
|  - Emergency Dispatch API    |
+------------------------------+
```

---

## 2. Database Schema & Supabase Configuration

The production database runs on **PostgreSQL** hosted via **Supabase**. The database uses strict relational constraints, Row-Level Security (RLS) tables, and geospatial indices.

### SQL Initialization Script (Table Definitions)

Execute the following script inside the Supabase SQL editor to provision the datastore:

```sql
-- ─── ENUMS AND CUSTOM DOMAINS ──────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('guest', 'owner');
CREATE TYPE verification_status AS ENUM ('pending', 'submitted', 'verified', 'flagged', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'sos');
CREATE TYPE id_type AS ENUM ('aadhaar', 'pan', 'passport');
CREATE TYPE coguest_status AS ENUM ('invited', 'accepted', 'declined', 'expired');

-- ─── 1. USER AUTHENTICATION & CORE REGISTRY ───────────────────────────
CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    role user_role NOT NULL DEFAULT 'guest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 2. GUEST PROFILES ────────────────────────────────────────────────
CREATE TABLE guest_profiles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(15) NOT NULL,
    kyc_status verification_status NOT NULL DEFAULT 'pending',
    photo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 3. HOST / OWNER PROFILES ─────────────────────────────────────────
CREATE TABLE owner_profiles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150),
    is_verified BOOLEAN DEFAULT FALSE,
    bank_account_name VARCHAR(100),
    bank_account_number VARCHAR(30),
    bank_ifsc VARCHAR(15),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 4. PROPERTIES & ROOM INVENTORY ───────────────────────────────────
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES owner_profiles(user_id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) DEFAULT 'pg' NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Andhra Pradesh' NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    total_rooms INTEGER NOT NULL DEFAULT 0,
    available_rooms INTEGER NOT NULL DEFAULT 0,
    price_min NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_max NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    amenities TEXT[] DEFAULT '{}',
    rules TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    contact_phone VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    type VARCHAR(30) NOT NULL, -- single, double, triple, dormitory
    floor INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0 NOT NULL,
    price_per_month NUMERIC(10,2) NOT NULL,
    price_per_day NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}'
);

-- ─── 5. BOOKINGS & PASS MANIFEST ─────────────────────────────────────
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guest_profiles(user_id) NOT NULL,
    property_id UUID REFERENCES properties(id) NOT NULL,
    room_id UUID REFERENCES rooms(id) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10,2) NOT NULL,
    paid_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    guest_count INTEGER DEFAULT 1 NOT NULL,
    special_requests TEXT,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE
);

-- ─── 6. MULTI-GUEST & CO-GUEST RECORDS ────────────────────────────────
CREATE TABLE co_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    id_type id_type NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    status coguest_status NOT NULL DEFAULT 'invited',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    invitation_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    resend_count INTEGER DEFAULT 0 NOT NULL,
    is_manual_upload BOOLEAN DEFAULT FALSE NOT NULL,
    photo_url TEXT,
    id_doc_url TEXT,
    watchlist_status verification_status DEFAULT 'pending' NOT NULL,
    watchlist_notes TEXT
);

CREATE TABLE saved_travelers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES guest_profiles(user_id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    id_type id_type NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 7. COMPLIANCE & SAFETY STANDARDS ─────────────────────────────────
CREATE TABLE compliance_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    fire_safety_expiry DATE NOT NULL,
    police_clearance_number VARCHAR(100) NOT NULL,
    cctv_status BOOLEAN DEFAULT TRUE NOT NULL,
    security_guards_count INTEGER DEFAULT 0 NOT NULL,
    safety_score INTEGER DEFAULT 100 NOT NULL,
    last_audit_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 8. ACTIVE EMERGENCY SOS ALERTS & INCIDENTS ───────────────────────
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES guest_profiles(user_id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    severity severity_level NOT NULL DEFAULT 'sos',
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID REFERENCES guest_profiles(user_id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Row-Level Security (RLS) Policy Configurations

To ensure tenant security, run these commands to enforce Row-Level Security across properties and booking manifests:

```sql
-- Enforce RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ─── POLICY: users ────────────────────────────────────────────────────
CREATE POLICY "Users can view own account" ON users 
    FOR SELECT USING (auth.uid() = id);

-- ─── POLICY: guest_profiles ───────────────────────────────────────────
CREATE POLICY "Guests can manage own profiles" ON guest_profiles 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Owners can view checked-in guest profiles" ON guest_profiles 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.guest_id = guest_profiles.user_id 
            AND bookings.property_id IN (
                SELECT id FROM properties WHERE owner_id = auth.uid()
            )
        )
    );

-- ─── POLICY: properties ───────────────────────────────────────────────
CREATE POLICY "Public read verified properties" ON properties 
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Owners manage own property listings" ON properties 
    FOR ALL USING (owner_id = auth.uid());

-- ─── POLICY: bookings ─────────────────────────────────────────────────
CREATE POLICY "Guests manage own bookings" ON bookings 
    FOR ALL USING (guest_id = auth.uid());

CREATE POLICY "Owners view and edit bookings on properties they own" ON bookings 
    FOR ALL USING (
        property_id IN (
            SELECT id FROM properties WHERE owner_id = auth.uid()
        )
    );
```

---

## 3. State Management & Data Querying

The application splits its client data model into two types of states: **Global UI State** (Zustand) and **Cached Server State** (TanStack Query).

### 3.1 Zustand Stores (`src/store/`)

#### 1. Authentication Store (`authStore.ts`)
Tracks authentication status, active roles, onboarding steps, and user objects:
```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  role: 'guest' | 'owner' | null;
  userId: string | null;
  hasCompletedOnboarding: boolean;
  login: (token: string, userId: string, role: 'guest' | 'owner') => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
}
```

#### 2. Theme Store (`themeStore.ts`)
Manages UI theme configuration, switching styles for Guest (Navy Blue/Gold) and Owner (Teal/Emerald) dashboards:
```typescript
interface ThemeState {
  isDarkMode: boolean;
  isOwnerTheme: boolean;
  setTheme: (isOwner: boolean) => void;
  toggleDarkMode: () => void;
}
```

#### 3. Language Store (`langStore.ts`)
Stores preferences and loads localized UI strings:
```typescript
interface LangState {
  locale: 'en' | 'te' | 'hi';
  setLocale: (lang: 'en' | 'te' | 'hi') => void;
}
```

### 3.2 Server State Cache Configuration (`@tanstack/react-query`)

Data fetches from the backend (or simulated `mockApi.ts` services) route through Query clients to enforce caching parameters.

Example usage hook for fetching local properties:
```typescript
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '../services/mockApi';

export function useProperties(filters?: any) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // Cache clean for 5 minutes
    refetchOnWindowFocus: true,
  });
}
```

---

## 4. Authentication & Secure Storage

### Local Session Encryption Flow

1.  **JWT Verification**: Upon successful phone OTP verification, the backend returns a JSON Web Token (JWT).
2.  **Hardware Storage**: The client writes the JWT payload into the device's secure enclave using `expo-secure-store`.
    *   **Android**: Uses AES encryption wrapped inside the Android Keystore system.
    *   **iOS**: Writes directly to Keychains using the `kSecClassGenericPassword` descriptor.
3.  **Automatic Login**: During app startup, `app/index.tsx` checks for stored tokens before routing.

```typescript
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  setToken: async (token: string) => {
    await SecureStore.setItemAsync('user_session_token', token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  getToken: async () => {
    return await SecureStore.getItemAsync('user_session_token');
  },
  deleteToken: async () => {
    await SecureStore.deleteItemAsync('user_session_token');
  },
};
```

---

## 5. eKYC & Crime Watchlist System

SafeStay AP matches occupant records against police watchlist databases during profile updates and booking confirmations.

```
+------------------+     OCR scan payload     +--------------------+
|  Guest ID Photo  +------------------------->+  travelersApi.ocr  |
+------------------+                          +---------+----------+
                                                        |
                                                        v Extracted JSON
                                              +---------+----------+
                                              | Name, DOB, ID No   |
                                              +---------+----------+
                                                        |
                                                        v Watchlist Check
+------------------+    Triggered Threat      +---------+----------+
|  AP Command Room <--------------------------+ Watchlist Match?   |
|  (Threat Alert)  |                          +----+----+----------+
+------------------+                               |     |
                                          Flagged  |     | Clear
                                                   v     v
                                              +----+--+  +----+---+
                                              |Flagged|  |Verified|
                                              +-------+  +--------+
```

### Match Checking Logic (`coGuestsApi.respondToInvitation`)
When a co-guest accepts an invitation, a database trigger or backend service executes a match check against a designated lookup pattern (e.g. watchlist database indexes):

```typescript
// Background watchlist checking logic
const nameLower = candidateName.toLowerCase();
if (
  nameLower.includes('wanted') || 
  nameLower.includes('criminal') || 
  nameLower.includes('raju') || 
  nameLower.includes('sunder')
) {
  watchlistStatus = 'flagged';
  watchlistMatchNotes = 'Flagged in AP Crime Watchlist: Match ID AP-WATCH-209. Active warrant outstanding for Section 420 IPC.';
} else {
  watchlistStatus = 'clear';
}
```

---

## 6. Emergency SOS Real-time Protocol

The SOS system operates via two distinct modes: **Audible SOS** and **Silent SOS**.

| Property | Standard Audible SOS | Silent SOS |
| :--- | :--- | :--- |
| **Siren Output** | Plays a high-decibel siren through mobile speakers | Muteds audio output (device screen shows normal home state) |
| **Haptic Feedback** | Constant rhythmic vibration warning | Single confirmation vibration pulse |
| **Trigger Action** | Dispatches coordinates to host and local police | Dispatches coordinates to host and local police |
| **UI State** | Displays a warning screen with a countdown | Maintains normal dashboard display to avoid detection |

### Coordinate Resolution & Payload
SOS events capture location coordinates using background device tasks, dispatching the following payload via real-time WebSocket subscriptions:

```json
{
  "alert_id": "alert_sos_1717672533000",
  "property_id": "prop_99b0c201-3829-450a",
  "guest_id": "guest_0092301",
  "coordinates": {
    "latitude": 16.506174,
    "longitude": 80.648015,
    "accuracy_meters": 4.5
  },
  "silent_mode": true,
  "timestamp": "2026-06-06T11:15:48Z"
}
```

---

## 7. Real-time Notification Architecture

The application handles notifications using Supabase Realtime Channels. The notification service processes payloads based on the defined `type` field.

### Notification Schema Definition

#### 1. Co-Guest Invite Notification
Sent when a primary guest invites another user as a companion on a booking:
```json
{
  "to": "REALTIME_CHANNEL_ID",
  "priority": "high",
  "notification": {
    "title": "SafeStay Co-Guest Stay Invitation",
    "body": "You have been invited by Sandeep Chowdary as a co-guest. Accept now to verify your stay."
  },
  "data": {
    "type": "booking_invite",
    "bookingId": "booking_001",
    "coGuestId": "cg_001"
  }
}
```

#### 2. Watchlist Threat Notification
Dispatched immediately to local police coordinators and host devices when a watchlist match occurs:
```json
{
  "to": "REALTIME_CHANNEL_TOPIC",
  "priority": "high",
  "notification": {
    "title": "🚨 Watchlist Threat Flagged",
    "body": "A check-in match occurred at Green View Residency. Immediate inspection recommended."
  },
  "data": {
    "type": "watchlist_alert",
    "propertyId": "prop_001",
    "watchlistStatus": "flagged",
    "notes": "Match ID AP-WATCH-209: Section 420 IPC"
  }
}
```

#### 3. SOS Alert Notification
Dispatched to local patrol networks and PG managers when an SOS is activated:
```json
{
  "to": "district_vijayawada_channel",
  "priority": "high",
  "notification": {
    "title": "🆘 EMERGENCY SOS TRIGGERED",
    "body": "A guest has triggered a panic SOS from Room 204 at Lotus Girls PG."
  },
  "data": {
    "type": "sos_alert",
    "alertId": "alert_sos_1717672533",
    "propertyId": "prop_vja_002",
    "latitude": "16.5062",
    "longitude": "80.6480"
  }
}
```
