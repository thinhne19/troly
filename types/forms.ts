// types/forms.ts — Zod Validation Schemas for Troly Forms
import { z } from 'zod';

// Phone Login & OTP Schema
export const phoneLoginSchema = z.object({
  phone: z
    .string()
    .min(9, 'Số điện thoại phải có ít nhất 9 số')
    .max(12, 'Số điện thoại không hợp lệ')
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại Việt Nam không đúng định dạng'),
  rememberSession: z.boolean().default(true),
});

export const otpVerifySchema = z.object({
  otp: z.string().length(6, 'Mã xác thực OTP gồm đúng 6 số'),
});

// Property Schema
export const propertySchema = z.object({
  name: z.string().min(3, 'Tên tòa nhà/nhà trọ tối thiểu 3 ký tự'),
  address: z.string().min(5, 'Địa chỉ chi tiết tối thiểu 5 ký tự'),
  totalFloors: z.coerce.number().min(1, 'Số tầng tối thiểu là 1').max(50),
  electricRate: z.coerce.number().min(1000, 'Đơn giá điện tối thiểu 1.000 ₫/kWh'),
  waterRate: z.coerce.number().min(1000, 'Đơn giá nước tối thiểu 1.000 ₫'),
  waterRateType: z.enum(['cubic_meter', 'per_head', 'fixed_room']).default('cubic_meter'),
  internetFee: z.coerce.number().min(0).default(100000),
  garbageFee: z.coerce.number().min(0).default(50000),
  parkingFeeMotorbike: z.coerce.number().min(0).default(100000),
});

// Room Schema
export const roomSchema = z.object({
  propertyId: z.string().min(1, 'Vui lòng chọn tòa nhà'),
  roomCode: z.string().min(1, 'Số/Tên phòng không được trống (VD: P.101)'),
  floor: z.coerce.number().min(0, 'Tầng không hợp lệ'),
  baseRent: z.coerce.number().min(500000, 'Giá thuê phòng tối thiểu 500.000 ₫'),
  maxOccupants: z.coerce.number().min(1).default(2),
  areaM2: z.coerce.number().optional(),
  reservedUntil: z.string().optional(),
  notes: z.string().optional(),
});

// Tenant Schema
export const tenantSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
  phone: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại Việt Nam không đúng định dạng'),
  nationalId: z.string().min(9, 'Số CCCD/CMND tối thiểu 9 số').max(12),
  idIssueDate: z.string().optional(),
  idIssuePlace: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  // Lease on create
  roomId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  depositAmount: z.coerce.number().min(0).default(0),
  monthlyRent: z.coerce.number().min(0).optional(),
});

// Meter Reading Entry Row Schema
export const meterEntryRowSchema = z.object({
  roomId: z.string(),
  electricPrevious: z.coerce.number().min(0),
  electricCurrent: z.coerce.number().min(0),
  waterPrevious: z.coerce.number().min(0),
  waterCurrent: z.coerce.number().min(0),
  isMeterReset: z.boolean().optional(),
  resetReason: z.string().optional(),
  notes: z.string().optional(),
});


// Payment Recording Schema
export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().min(1000, 'Số tiền thanh toán tối thiểu 1.000 ₫'),
  paymentMethod: z.enum(['vietqr', 'bank_transfer', 'cash', 'zalo_pay']),
  transactionRef: z.string().optional(),
  note: z.string().optional(),
});

// Lease Schemas
export const leaseSchema = z.object({
  roomId: z.string().min(1, 'Vui lòng chọn phòng thuê'),
  tenantId: z.string().min(1, 'Vui lòng chọn khách thuê'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu hợp đồng'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc hợp đồng'),
  monthlyRent: z.coerce.number().min(500000, 'Giá thuê phòng tối thiểu 500.000 ₫'),
  depositAmount: z.coerce.number().min(0, 'Tiền cọc không được âm').default(0),
  contractNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const terminateLeaseSchema = z.object({
  leaseId: z.string().min(1),
  depositStatus: z.enum(['refunded', 'partially_refunded', 'forfeited']).default('refunded'),
  refundAmount: z.coerce.number().min(0).default(0),
  deductionReason: z.string().optional(),
  moveOutDate: z.string().min(1, 'Vui lòng chọn ngày trả phòng'),
  notes: z.string().optional(),
});

export const extendLeaseSchema = z.object({
  leaseId: z.string().min(1),
  newEndDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc mới'),
  newRent: z.coerce.number().min(500000, 'Giá thuê mới tối thiểu 500.000 ₫'),
  notes: z.string().optional(),
});

export type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>;
export type OtpVerifyFormValues = z.infer<typeof otpVerifySchema>;
export type PropertyFormValues = z.infer<typeof propertySchema>;
export type RoomFormValues = z.infer<typeof roomSchema>;
export type TenantFormValues = z.infer<typeof tenantSchema>;
export type MeterEntryRowValues = z.infer<typeof meterEntryRowSchema>;
export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
export type LeaseFormValues = z.infer<typeof leaseSchema>;
export type TerminateLeaseFormValues = z.infer<typeof terminateLeaseSchema>;
export type ExtendLeaseFormValues = z.infer<typeof extendLeaseSchema>;

