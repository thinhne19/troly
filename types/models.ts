// types/models.ts — Troly Master Domain Models

export type RoomStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';
export type TenantStatus = 'active' | 'moved_out';
export type LeaseStatus = 'active' | 'expired' | 'terminated';
export type DepositStatus = 'held' | 'partially_refunded' | 'refunded' | 'forfeited';
export type ElectricRateType = 'flat' | 'tiered';
export type WaterRateType = 'cubic_meter' | 'per_head' | 'fixed_room';
export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
export type InvoiceItemType = 'rent' | 'electricity' | 'water' | 'internet' | 'garbage' | 'parking' | 'other';
export type PaymentMethod = 'vietqr' | 'bank_transfer' | 'cash' | 'zalo_pay';
export type NotificationChannel = 'zalo' | 'sms' | 'system';
export type NotificationStatus = 'queued' | 'sent' | 'failed';

export interface Profile {
  id: string;
  phone: string;
  fullName: string;
  avatarUrl?: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  vietqrSyntaxTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string;
  totalFloors: number;
  createdAt: string;
  updatedAt: string;
  // Computed aggregations for high-density UI
  totalRooms?: number;
  occupiedRooms?: number;
  monthlyRevenue?: number;
}

export interface Room {
  id: string;
  propertyId: string;
  roomCode: string;
  floor: number;
  baseRent: number; // in VND
  status: RoomStatus;
  reservedUntil?: string; // YYYY-MM-DD for reserved rooms
  areaM2?: number;
  maxOccupants: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Join extensions
  currentTenant?: Tenant;
  currentLease?: Lease;
  latestMeterReading?: MeterReading;
}

export interface Tenant {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  nationalId: string; // CCCD
  idIssueDate?: string;
  idIssuePlace?: string;
  avatarUrl?: string;
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  // Join extensions
  currentRoom?: Room;
}

export interface Lease {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  depositStatus: DepositStatus;
  status: LeaseStatus;
  contractNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Join extensions
  room?: Room;
  tenant?: Tenant;
}

export interface UtilityRates {
  id: string;
  propertyId: string;
  electricRateType: ElectricRateType;
  electricRate: number; // VND per kWh
  waterRateType: WaterRateType;
  waterRate: number; // VND per m3 or per head
  internetFee: number; // VND per room
  garbageFee: number; // VND per room
  parkingFeeMotorbike: number; // VND per bike
  elevatorFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface MeterReading {
  id: string;
  propertyId: string;
  roomId: string;
  billingMonth: string; // 'YYYY-MM'
  electricPrevious: number;
  electricCurrent: number;
  electricUsage: number;
  waterPrevious: number;
  waterCurrent: number;
  waterUsage: number;
  isMeterReset?: boolean;
  resetReason?: string;
  recordedAt: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemType: InvoiceItemType;
  description: string;
  previousReading?: number;
  currentReading?: number;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  propertyId: string;
  roomId: string;
  tenantId?: string;
  leaseId?: string;
  invoiceCode: string;
  billingMonth: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: InvoiceStatus;
  vietqrPayload?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  // Join extensions
  room?: Room;
  tenant?: Tenant;
  lease?: Lease;
  property?: Property;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  paymentDate: string;
  note?: string;
  createdAt: string;
  // Join extensions
  invoice?: Invoice;
}

export interface Notification {
  id: string;
  userId: string;
  tenantId?: string;
  invoiceId?: string;
  channel: NotificationChannel;
  messageContent: string;
  deliveryStatus: NotificationStatus;
  sentAt: string;
  createdAt: string;
}

// Dashboard Summary KPI
export interface DashboardSummary {
  monthlyRevenue: number;
  revenueGrowthPct: number;
  collectedRevenue: number;
  uncollectedRevenue: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  collectionRatePct: number;
}

// Audit Log Model
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'profile' | 'property' | 'room' | 'tenant' | 'lease' | 'meter_reading' | 'invoice' | 'payment' | 'deposit';
  entityId: string;
  details?: unknown;
  ipAddress?: string;
  createdAt: string;
}

