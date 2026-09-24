// lib/data-adapter/interface.ts — Unified Troly Repository Interface
import {
  Profile,
  Property,
  Room,
  Tenant,
  Lease,
  UtilityRates,
  MeterReading,
  Invoice,
  Payment,
  DashboardSummary,
  AuditLog,
} from '@/types/models';

export interface RevenueTrendItem {
  month: string; // 'T04', 'T05', ...
  billingMonth: string; // 'YYYY-MM'
  rent: number;
  electric: number;
  water: number;
  service: number;
  total: number;
}

export interface AuthSession {
  isAuthenticated: boolean;
  profile?: Profile;
  token?: string;
}

export interface TrolyRepository {
  // Authentication & Session
  sendOtp(phone: string): Promise<{ success: boolean; message: string; defaultOtp?: string }>;
  verifyOtp(phone: string, otp: string): Promise<{ success: boolean; profile?: Profile; token?: string; error?: string }>;
  getSession(): Promise<AuthSession>;
  logout(): Promise<void>;

  // Profiles
  getProfile(): Promise<Profile>;
  updateProfile(data: Partial<Profile>): Promise<Profile>;

  // Properties
  getProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  createProperty(
    data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
    rates?: Partial<UtilityRates>
  ): Promise<Property>;
  updateProperty(id: string, data: Partial<Property>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;

  // Rooms
  getRooms(propertyId?: string): Promise<Room[]>;
  getRoomById(id: string): Promise<Room | null>;
  createRoom(data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room>;
  updateRoom(id: string, data: Partial<Room>): Promise<Room>;
  deleteRoom(id: string): Promise<void>;

  // Tenants
  getTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | null>;
  createTenant(
    data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>,
    lease?: {
      roomId: string;
      startDate: string;
      endDate: string;
      monthlyRent: number;
      depositAmount: number;
    }
  ): Promise<Tenant>;
  updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;

  // Leases (Core Rental Operations)
  getLeases(propertyId?: string, status?: Lease['status']): Promise<Lease[]>;
  getLeaseById(id: string): Promise<Lease | null>;
  createLease(data: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lease>;
  updateLease(id: string, data: Partial<Lease>): Promise<Lease>;
  terminateLease(id: string, depositStatus?: Lease['depositStatus'], notes?: string): Promise<Lease>;
  extendLease(id: string, newEndDate: string, newRent?: number, notes?: string): Promise<Lease>;

  // Utility Rates
  getUtilityRates(propertyId: string): Promise<UtilityRates | null>;
  updateUtilityRates(propertyId: string, data: Partial<UtilityRates>): Promise<UtilityRates>;

  // Meter Readings
  getMeterReadings(propertyId: string, month: string): Promise<MeterReading[]>;
  saveMeterReadings(readings: Array<Omit<MeterReading, 'id' | 'recordedAt'>>): Promise<MeterReading[]>;

  // Invoices & Payments
  getInvoices(propertyId?: string, month?: string): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | null>;
  generateInvoicesForMonth(propertyId: string, month: string): Promise<Invoice[]>;
  updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;
  getPayments(propertyId?: string, month?: string): Promise<Payment[]>;
  recordPayment(payment: {
    invoiceId: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    transactionRef?: string;
    note?: string;
  }): Promise<Payment>;
  reconcileVietQrPayment(transaction: {
    transactionRef: string;
    memo: string;
    amount: number;
    paymentDate?: string;
  }): Promise<{ matched: boolean; invoice?: Invoice; payment?: Payment; error?: string }>;

  // Audit Logs (Mandatory logging on every mutation)
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  logAudit(
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details?: unknown
  ): Promise<void>;

  // Analytics & Dynamic Aggregates (100% Calculated)
  getDashboardSummary(propertyId?: string, month?: string): Promise<DashboardSummary>;
  getRevenueTrend(propertyId?: string): Promise<RevenueTrendItem[]>;

  // System
  isSupabaseMode(): boolean;
  resetToSeedData(): Promise<void>;
}

