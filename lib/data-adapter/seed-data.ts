// lib/data-adapter/seed-data.ts — Production Seed Dataset: 3 Properties & Exactly 48 Rooms
import {
  Profile,
  Property,
  Room,
  Tenant,
  Lease,
  UtilityRates,
  MeterReading,
  Invoice,
  InvoiceItem,
  Payment,
} from '@/types/models';
import { buildInvoiceCode, buildTransferMemo, getPropertyCode } from '@/lib/vietqr';


export const SEED_PROFILE: Profile = {
  id: 'usr-landlord-001',
  phone: '0908123456',
  fullName: 'Nguyễn Văn Thìn',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  bankName: 'MBBank',
  bankAccountNumber: '999908123456',
  bankAccountHolder: 'NGUYEN VAN THIN',
  vietqrSyntaxTemplate: 'TROLY [ROOM] [MONTH]',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

export const SEED_PROPERTIES: Property[] = [
  {
    id: 'prop-001',
    userId: 'usr-landlord-001',
    name: 'KTX & Phòng trọ 128 Lê Văn Sỹ',
    address: '128 Lê Văn Sỹ, Phường 10, Quận Phú Nhuận, TP. Hồ Chí Minh',
    totalFloors: 4,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prop-002',
    userId: 'usr-landlord-001',
    name: 'Chung cư mini Điện Biên Phủ',
    address: '423 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh',
    totalFloors: 3,
    createdAt: '2025-03-15T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'prop-003',
    userId: 'usr-landlord-001',
    name: 'Căn hộ dịch vụ Him Lam',
    address: 'Số 45 Đường số 7, KDC Him Lam, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh',
    totalFloors: 2,
    createdAt: '2025-06-20T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

export const SEED_UTILITY_RATES: UtilityRates[] = [
  {
    id: 'rate-001',
    propertyId: 'prop-001',
    electricRateType: 'flat',
    electricRate: 3800,
    waterRateType: 'cubic_meter',
    waterRate: 18000,
    internetFee: 100000,
    garbageFee: 50000,
    parkingFeeMotorbike: 100000,
    elevatorFee: 0,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'rate-002',
    propertyId: 'prop-002',
    electricRateType: 'flat',
    electricRate: 4000,
    waterRateType: 'per_head',
    waterRate: 100000,
    internetFee: 120000,
    garbageFee: 60000,
    parkingFeeMotorbike: 120000,
    elevatorFee: 50000,
    createdAt: '2025-03-15T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'rate-003',
    propertyId: 'prop-003',
    electricRateType: 'flat',
    electricRate: 4200,
    waterRateType: 'cubic_meter',
    waterRate: 20000,
    internetFee: 150000,
    garbageFee: 80000,
    parkingFeeMotorbike: 150000,
    elevatorFee: 100000,
    createdAt: '2025-06-20T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

// Helper to generate exactly 48 rooms across 3 properties
function generateRooms(): Room[] {
  const rooms: Room[] = [];

  // Property 1: 24 rooms (Floor 1-4, 6 rooms/floor: 101-106, 201-206, 301-306, 401-406)
  for (let floor = 1; floor <= 4; floor++) {
    for (let r = 1; r <= 6; r++) {
      const roomNum = floor * 100 + r;
      const code = `P.${roomNum}`;
      // P.103 is vacant, P.303 is reserved
      const isVacant = code === 'P.103';
      const isReserved = code === 'P.303';
      const baseRent = floor <= 2 ? 4500000 : 4800000;

      rooms.push({
        id: `room-p1-${roomNum}`,
        propertyId: 'prop-001',
        roomCode: code,
        floor,
        baseRent,
        status: isVacant ? 'vacant' : isReserved ? 'reserved' : 'occupied',
        reservedUntil: isReserved ? '2026-09-30' : undefined,
        areaM2: 22 + (r % 3) * 3,
        maxOccupants: 2,
        notes: isReserved ? `Phòng ${code} - Khách đặt cọc trước` : `Phòng ${code} - KTX Lê Văn Sỹ`,
        createdAt: '2025-01-10T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      });

    }
  }

  // Property 2: 14 rooms (Floor 1: 5 rooms, Floor 2: 5 rooms, Floor 3: 4 rooms)
  const p2Floors = [5, 5, 4];
  p2Floors.forEach((count, fIdx) => {
    const floor = fIdx + 1;
    for (let r = 1; r <= count; r++) {
      const roomNum = floor * 100 + r;
      const code = `P.${roomNum}`;
      // P.304 is vacant
      const isVacant = code === 'P.304';
      rooms.push({
        id: `room-p2-${roomNum}`,
        propertyId: 'prop-002',
        roomCode: code,
        floor,
        baseRent: 5500000 + fIdx * 200000,
        status: isVacant ? 'vacant' : 'occupied',
        areaM2: 28,
        maxOccupants: 2,
        notes: `Phòng ${code} - Chung cư mini Điện Biên Phủ`,
        createdAt: '2025-03-15T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      });
    }
  });

  // Property 3: 10 rooms (Floor 1: 5 rooms, Floor 2: 5 rooms)
  for (let floor = 1; floor <= 2; floor++) {
    for (let r = 1; r <= 5; r++) {
      const roomNum = floor * 100 + r;
      const code = `HL.${roomNum}`;
      // HL.205 is vacant
      const isVacant = code === 'HL.205';
      rooms.push({
        id: `room-p3-${roomNum}`,
        propertyId: 'prop-003',
        roomCode: code,
        floor,
        baseRent: 7500000 + floor * 500000,
        status: isVacant ? 'vacant' : 'occupied',
        areaM2: 35,
        maxOccupants: 2,
        notes: `Căn hộ ${code} - Him Lam Q.7`,
        createdAt: '2025-06-20T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      });
    }
  }

  return rooms;
}

export const SEED_ROOMS: Room[] = generateRooms();

// Realistic Vietnamese Tenants
const VIETNAMESE_NAMES = [
  'Nguyễn Hoàng Nam', 'Trần Thị Mai', 'Lê Văn Bình', 'Phạm Minh Tuấn', 'Vũ Hải Yến',
  'Đặng Thu Thảo', 'Hoàng Quốc Bảo', 'Đỗ Mỹ Linh', 'Bùi Anh Dũng', 'Ngô Thanh Vân',
  'Dương Gia Huy', 'Hồ Bích Trâm', 'Phan Thanh Tùng', 'Võ Hoài An', 'Trịnh Cẩm Nhung',
  'Lý Minh Khang', 'Đoàn Kim Oanh', 'Mai Xuân Trường', 'Chu Thùy Trang', 'Cao Tiến Đạt',
  'Lương Ánh Tuyết', 'Tạ Đình Phong', 'Hà Thúy Kiều', 'Thái Doãn Hùng', 'Lâm Khánh Chi',
  'Huỳnh Vĩnh Phát', 'Bạch Phương Uyên', 'Nghiêm Đức Thắng', 'Phùng Yến Nhi', 'Quách Tuấn Du',
  'Tôn Thất Minh', 'Lục Thảo My', 'Trương Quốc Huy', 'Diệp Bảo Châu', 'La Thành Đạt',
  'Ân Thị Hồng', 'Sầm Văn Hưng', 'Thạch Kim Sang', 'Khưu Tấn Lộc', 'Tiêu Gia Bảo',
  'Lưu Bách Diệp', 'Khang Đình Trí', 'Vương Kiến Hào', 'Cù Thị Nguyệt'
];

function generateTenantsAndLeases(rooms: Room[]): { tenants: Tenant[]; leases: Lease[] } {
  const tenants: Tenant[] = [];
  const leases: Lease[] = [];
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied');

  occupiedRooms.forEach((room, idx) => {
    const fullName = VIETNAMESE_NAMES[idx % VIETNAMESE_NAMES.length];
    const phone = `09${(81000000 + idx * 73921).toString().slice(0, 8)}`;
    const nationalId = `079${(190000000 + idx * 14213).toString().slice(0, 9)}`;
    const tenantId = `ten-${room.id}`;
    const leaseId = `lease-${room.id}`;

    tenants.push({
      id: tenantId,
      userId: 'usr-landlord-001',
      fullName,
      phone,
      nationalId,
      idIssueDate: '2021-04-15',
      idIssuePlace: 'Cục CS QLHC về TTXH',
      avatarUrl: `https://images.unsplash.com/photo-${1535713875002 + idx}?auto=format&fit=crop&w=150&q=80`,
      emergencyContactName: `${fullName.split(' ')[0]} Người Thân`,
      emergencyContactPhone: `0903${(112233 + idx).toString()}`,
      status: 'active',
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    });

    leases.push({
      id: leaseId,
      roomId: room.id,
      tenantId,
      startDate: '2025-10-01',
      endDate: '2026-09-30',
      monthlyRent: room.baseRent,
      depositAmount: room.baseRent,
      depositStatus: 'held',
      status: 'active',
      contractNumber: `HD-2025-${room.roomCode.replace(/[^a-zA-Z0-9]/g, '')}`,
      createdAt: '2025-10-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
  });

  return { tenants, leases };
}

const { tenants: SEED_TENANTS_DATA, leases: SEED_LEASES_DATA } = generateTenantsAndLeases(SEED_ROOMS);
export const SEED_TENANTS: Tenant[] = SEED_TENANTS_DATA;
export const SEED_LEASES: Lease[] = SEED_LEASES_DATA;

// Generate Invoices & Meter Readings for September 2026 and prior months
function generateInvoicesAndReadings(rooms: Room[], tenants: Tenant[], leases: Lease[]): {
  meterReadings: MeterReading[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  payments: Payment[];
} {
  const meterReadings: MeterReading[] = [];
  const invoices: Invoice[] = [];
  const invoiceItems: InvoiceItem[] = [];
  const payments: Payment[] = [];

  const occupiedRooms = rooms.filter((r) => r.status === 'occupied');

  // Months sequence: T04 (2026-04) to T09 (2026-09)
  const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

  months.forEach((month, mIdx) => {
    const isCurrentMonth = month === '2026-09';
    const monthNum = month.split('-')[1];

    occupiedRooms.forEach((room, rIdx) => {
      const tenant = tenants.find((t) => t.id === `ten-${room.id}`);
      const lease = leases.find((l) => l.roomId === room.id);
      const rates = SEED_UTILITY_RATES.find((rt) => rt.propertyId === room.propertyId) || SEED_UTILITY_RATES[0];

      // Meter Readings
      const baseElec = 1000 + mIdx * 120 + rIdx * 45;
      const elecUsage = 60 + (rIdx % 5) * 15;
      const curElec = baseElec + elecUsage;

      const baseWater = 20 + mIdx * 6 + rIdx * 2;
      const waterUsage = 4 + (rIdx % 4);
      const curWater = baseWater + waterUsage;

      const mrId = `mr-${month}-${room.id}`;
      meterReadings.push({
        id: mrId,
        propertyId: room.propertyId,
        roomId: room.id,
        billingMonth: month,
        electricPrevious: baseElec,
        electricCurrent: curElec,
        electricUsage: elecUsage,
        waterPrevious: baseWater,
        waterCurrent: curWater,
        waterUsage,
        recordedAt: `${month}-25T08:00:00.000Z`,
      });

      // Calculate amounts
      const rentCost = room.baseRent;
      const elecCost = elecUsage * rates.electricRate;
      const waterCost = rates.waterRateType === 'per_head'
        ? 2 * rates.waterRate
        : waterUsage * rates.waterRate;
      const internetCost = rates.internetFee;
      const garbageCost = rates.garbageFee;
      const parkingCost = rates.parkingFeeMotorbike;

      const total = rentCost + elecCost + waterCost + internetCost + garbageCost + parkingCost;
      const invId = `inv-${month}-${room.id}`;
      const prop = SEED_PROPERTIES.find((p) => p.id === room.propertyId);
      const propCode = getPropertyCode(prop?.name || room.propertyId);
      const code = buildInvoiceCode(propCode, month, room.roomCode);

      // Payment Status Distribution for September:
      // ~84% paid, 5 unpaid, 3 overdue
      let status: Invoice['paymentStatus'] = 'paid';
      let amountPaid = total;
      let balanceDue = 0;

      if (isCurrentMonth) {
        if (rIdx === 0 || rIdx === 1 || rIdx === 2) {
          // Overdue
          status = 'overdue';
          amountPaid = rIdx === 0 ? 2000000 : 0;
          balanceDue = total - amountPaid;
        } else if (rIdx >= 3 && rIdx <= 7) {
          // Unpaid
          status = 'unpaid';
          amountPaid = 0;
          balanceDue = total;
        } else {
          // Paid
          status = 'paid';
          amountPaid = total;
          balanceDue = 0;
        }
      }

      invoices.push({
        id: invId,
        propertyId: room.propertyId,
        roomId: room.id,
        tenantId: tenant?.id,
        leaseId: lease?.id,
        invoiceCode: code,
        billingMonth: month,
        issueDate: `${month}-25`,
        dueDate: isCurrentMonth ? `${month}-05` : `${month}-05`,
        totalAmount: total,
        amountPaid,
        balanceDue,
        paymentStatus: status,
        vietqrPayload: buildTransferMemo(propCode, room.roomCode, month),
        paidAt: status === 'paid' ? `${month}-28T10:00:00.000Z` : undefined,
        createdAt: `${month}-25T09:00:00.000Z`,
        updatedAt: `${month}-28T10:00:00.000Z`,
      });


      // Invoice Items (Line item breakdown)
      invoiceItems.push(
        { id: `it-1-${invId}`, invoiceId: invId, itemType: 'rent', description: `Tiền thuê phòng ${room.roomCode} (${month})`, quantity: 1, unitPrice: rentCost, amount: rentCost, createdAt: `${month}-25T09:00:00.000Z` },
        { id: `it-2-${invId}`, invoiceId: invId, itemType: 'electricity', description: `Tiền điện (${baseElec} - ${curElec} kWh)`, previousReading: baseElec, currentReading: curElec, quantity: elecUsage, unitPrice: rates.electricRate, amount: elecCost, createdAt: `${month}-25T09:00:00.000Z` },
        { id: `it-3-${invId}`, invoiceId: invId, itemType: 'water', description: `Tiền nước (${baseWater} - ${curWater} m³)`, previousReading: baseWater, currentReading: curWater, quantity: waterUsage, unitPrice: rates.waterRate, amount: waterCost, createdAt: `${month}-25T09:00:00.000Z` },
        { id: `it-4-${invId}`, invoiceId: invId, itemType: 'internet', description: 'Phí mạng Internet / Wifi', quantity: 1, unitPrice: internetCost, amount: internetCost, createdAt: `${month}-25T09:00:00.000Z` },
        { id: `it-5-${invId}`, invoiceId: invId, itemType: 'garbage', description: 'Phí rác & vệ sinh môi trường', quantity: 1, unitPrice: garbageCost, amount: garbageCost, createdAt: `${month}-25T09:00:00.000Z` },
        { id: `it-6-${invId}`, invoiceId: invId, itemType: 'parking', description: 'Phí gửi xe máy', quantity: 1, unitPrice: parkingCost, amount: parkingCost, createdAt: `${month}-25T09:00:00.000Z` }
      );

      if (amountPaid > 0) {
        payments.push({
          id: `pay-${invId}`,
          invoiceId: invId,
          amount: amountPaid,
          paymentMethod: 'vietqr',
          transactionRef: `FT${month.replace('-', '')}${rIdx.toString().padStart(4, '0')}`,
          paymentDate: `${month}-28T10:00:00.000Z`,
          note: `Thanh toán VietQR khớp tự động ${code}`,
          createdAt: `${month}-28T10:00:00.000Z`,
        });
      }
    });
  });

  return { meterReadings, invoices, invoiceItems, payments };
}

const {
  meterReadings: SEED_METER_READINGS_DATA,
  invoices: SEED_INVOICES_DATA,
  invoiceItems: SEED_INVOICE_ITEMS_DATA,
  payments: SEED_PAYMENTS_DATA,
} = generateInvoicesAndReadings(SEED_ROOMS, SEED_TENANTS, SEED_LEASES);

export const SEED_METER_READINGS: MeterReading[] = SEED_METER_READINGS_DATA;
export const SEED_INVOICES: Invoice[] = SEED_INVOICES_DATA;
export const SEED_INVOICE_ITEMS: InvoiceItem[] = SEED_INVOICE_ITEMS_DATA;
export const SEED_PAYMENTS: Payment[] = SEED_PAYMENTS_DATA;
