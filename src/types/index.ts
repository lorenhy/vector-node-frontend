// ==========================================
// FILE: src/types/index.ts
// ==========================================

export enum UserRole {
  SHIPPER = 'SHIPPER',
  CARRIER = 'CARRIER',
  DRIVER = 'DRIVER',
  WAREHOUSE = 'WAREHOUSE',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  language: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastLoginAt?: string | Date;
}

export interface Shipment {
  id: string;
  shipperId: string;
  title: string;
  description?: string;
  origin: {
    address: string;
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    address: string;
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  weight: number;
  volume?: number;
  vehicleType: string;
  status: string;
  budget?: number;
  currency?: string;
  pickupDate?: string | Date;
  deliveryDate?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Bid {
  id: string;
  shipmentId: string;
  carrierId: string;
  amount: number;
  currency: string;
  estimatedDeliveryDate?: string | Date;
  notes?: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Carrier {
  id: string;
  userId: string;
  companyName: string;
  vatNumber?: string;
  rating: number;
  totalDeliveries: number;
  successRate: number;
  verified: boolean;
}





