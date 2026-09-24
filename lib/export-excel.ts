// lib/export-excel.ts — Production-Grade UTF-8 BOM CSV / Excel Exporter for Vietnamese Landlords
import { Invoice, MeterReading, Tenant, Room } from '@/types/models';
import { formatVND } from '@/lib/utils';

/**
 * Downloads text/csv content with UTF-8 BOM so Microsoft Excel opens it with full Vietnamese diacritics
 */
export function downloadCsvWithBom(filename: string, csvContent: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(cell: string | number | undefined | null): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function toCsvRow(cells: (string | number | undefined | null)[]): string {
  return cells.map(escapeCsvCell).join(',');
}

/**
 * 1. Báo cáo Doanh thu & Thu tiền Tháng
 */
export function exportMonthlyRevenueCsv(
  invoices: Invoice[],
  propertyName: string,
  billingMonth: string
): void {
  const headers = [
    'Mã hóa đơn',
    'Tòa nhà / Nhà trọ',
    'Mã phòng',
    'Khách thuê',
    'Kỳ thanh toán',
    'Ngày lập',
    'Hạn thanh toán',
    'Tổng tiền (VNĐ)',
    'Đã thu (VNĐ)',
    'Còn nợ (VNĐ)',
    'Trạng thái',
    'Cú pháp VietQR',
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceCode,
    inv.property?.name || propertyName,
    inv.room?.roomCode || '—',
    inv.tenant?.fullName || '—',
    inv.billingMonth,
    inv.issueDate,
    inv.dueDate,
    inv.totalAmount,
    inv.amountPaid,
    inv.balanceDue,
    inv.paymentStatus === 'paid'
      ? 'Đã thanh toán'
      : inv.paymentStatus === 'partially_paid'
      ? 'Thanh toán một phần'
      : inv.paymentStatus === 'overdue'
      ? 'Quá hạn'
      : 'Chưa thanh toán',
    inv.vietqrPayload || '',
  ]);

  const totalRev = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalDue = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const summaryRow = [
    'TỔNG CỘNG',
    '',
    `${invoices.length} phòng`,
    '',
    billingMonth,
    '',
    '',
    totalRev,
    totalPaid,
    totalDue,
    '',
    '',
  ];

  const content = [
    toCsvRow([`BÁO CÁO DOANH THU & THU TIỀN — ${propertyName.toUpperCase()}`]),
    toCsvRow([`Kỳ hóa đơn: Tháng ${billingMonth} | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`]),
    '',
    toCsvRow(headers),
    ...rows.map(toCsvRow),
    toCsvRow(summaryRow),
  ].join('\r\n');

  const filename = `Bao_cao_doanh_thu_${propertyName.replace(/\s+/g, '_')}_${billingMonth}.csv`;
  downloadCsvWithBom(filename, content);
}

/**
 * 2. Bảng kê Chỉ số Điện Nước Chi tiết
 */
export function exportUtilityReadingsCsv(
  readings: MeterReading[],
  rooms: Room[],
  propertyName: string,
  billingMonth: string,
  electricRate = 3800,
  waterRate = 18000
): void {
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const headers = [
    'Mã phòng',
    'Tên khách thuê',
    'Kỳ chốt',
    'Điện cũ (kWh)',
    'Điện mới (kWh)',
    'Điện tiêu thụ (kWh)',
    'Đơn giá điện (đ/kWh)',
    'Thành tiền điện (VNĐ)',
    'Nước cũ (m³)',
    'Nước mới (m³)',
    'Nước tiêu thụ (m³)',
    'Đơn giá nước (đ/m³)',
    'Thành tiền nước (VNĐ)',
    'Đổi công tơ?',
    'Lý do đổi',
  ];

  const rows = readings.map((r) => {
    const room = roomMap.get(r.roomId);
    const elecCost = r.electricUsage * electricRate;
    const waterCost = r.waterUsage * waterRate;

    return [
      room?.roomCode || '—',
      room?.currentTenant?.fullName || '—',
      r.billingMonth,
      r.electricPrevious,
      r.electricCurrent,
      r.electricUsage,
      electricRate,
      elecCost,
      r.waterPrevious,
      r.waterCurrent,
      r.waterUsage,
      waterRate,
      waterCost,
      r.isMeterReset ? 'Có' : 'Không',
      r.resetReason || '',
    ];
  });

  const totalElecUsage = readings.reduce((acc, r) => acc + r.electricUsage, 0);
  const totalWaterUsage = readings.reduce((acc, r) => acc + r.waterUsage, 0);
  const totalElecCost = totalElecUsage * electricRate;
  const totalWaterCost = totalWaterUsage * waterRate;

  const summaryRow = [
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    totalElecUsage,
    '',
    totalElecCost,
    '',
    '',
    totalWaterUsage,
    '',
    totalWaterCost,
    '',
    '',
  ];

  const content = [
    toCsvRow([`BẢNG KÊ CHỈ SỐ ĐIỆN NƯỚC — ${propertyName.toUpperCase()}`]),
    toCsvRow([`Kỳ ghi chỉ số: Tháng ${billingMonth} | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`]),
    '',
    toCsvRow(headers),
    ...rows.map(toCsvRow),
    toCsvRow(summaryRow),
  ].join('\r\n');

  const filename = `Bang_ke_dien_nuoc_${propertyName.replace(/\s+/g, '_')}_${billingMonth}.csv`;
  downloadCsvWithBom(filename, content);
}

/**
 * 3. Danh sách Đăng ký Tạm trú Công An Phường / Xã
 */
export function exportPoliceTenantRegistryCsv(
  tenants: Tenant[],
  propertyName: string
): void {
  const headers = [
    'STT',
    'Họ và tên',
    'Số CCCD / CMND',
    'Ngày cấp',
    'Nơi cấp',
    'Ngày sinh / Năm sinh',
    'Số điện thoại',
    'Liên hệ khẩn cấp',
    'SĐT khẩn cấp',
    'Phòng lưu trú',
    'Ngày bắt đầu thuê',
    'Ngày kết thúc HĐ',
    'Trạng thái',
  ];

  const rows = tenants.map((t, idx) => [
    idx + 1,
    t.fullName,
    t.nationalId,
    t.idIssueDate || '—',
    t.idIssuePlace || 'Cục CSQLHC về TTXH',
    t.phone,
    t.emergencyContactName || '—',
    t.emergencyContactPhone || '—',
    t.currentRoom?.roomCode || '—',
    t.currentRoom?.currentLease?.startDate || '—',
    t.currentRoom?.currentLease?.endDate || '—',
    t.status === 'active' ? 'Đang thuê' : 'Đã chuyển đi',
  ]);

  const content = [
    toCsvRow(['DANH SÁCH KHÁCH THUÊ ĐĂNG KÝ TẠM TRÚ VỚI CÔNG AN ĐỊA PHƯƠNG']),
    toCsvRow([`Cơ sở cho thuê: ${propertyName.toUpperCase()}`]),
    toCsvRow([`Ngày lập danh sách: ${new Date().toLocaleDateString('vi-VN')}`]),
    '',
    toCsvRow(headers),
    ...rows.map(toCsvRow),
  ].join('\r\n');

  const filename = `Danh_sach_tam_tru_cong_an_${propertyName.replace(/\s+/g, '_')}.csv`;
  downloadCsvWithBom(filename, content);
}

/**
 * 4. Sổ Theo dõi Công Nợ Chưa Thu
 */
export function exportDebtLedgerCsv(
  invoices: Invoice[],
  propertyName: string,
  billingMonth: string
): void {
  const unpaidInvoices = invoices.filter((i) => i.balanceDue > 0);

  const headers = [
    'Mã hóa đơn',
    'Phòng',
    'Khách thuê',
    'Số điện thoại',
    'Kỳ hóa đơn',
    'Hạn đóng',
    'Số ngày quá hạn',
    'Tổng tiền (VNĐ)',
    'Đã trả (VNĐ)',
    'Còn nợ lại (VNĐ)',
    'Cú pháp VietQR',
  ];

  const today = new Date();

  const rows = unpaidInvoices.map((inv) => {
    const due = new Date(inv.dueDate);
    const diffDays = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));

    return [
      inv.invoiceCode,
      inv.room?.roomCode || '—',
      inv.tenant?.fullName || '—',
      inv.tenant?.phone || '—',
      inv.billingMonth,
      inv.dueDate,
      diffDays > 0 ? `${diffDays} ngày` : 'Trong hạn',
      inv.totalAmount,
      inv.amountPaid,
      inv.balanceDue,
      inv.vietqrPayload || '',
    ];
  });

  const totalOutstanding = unpaidInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  const summaryRow = [
    'TỔNG CÔNG NỢ',
    `${unpaidInvoices.length} phòng nợ`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalOutstanding,
    '',
  ];

  const content = [
    toCsvRow([`SỔ THEO DÕI CÔNG NỢ TIỀN PHÒNG — ${propertyName.toUpperCase()}`]),
    toCsvRow([`Thời điểm chốt nợ: ${new Date().toLocaleDateString('vi-VN')} | Kỳ ${billingMonth}`]),
    '',
    toCsvRow(headers),
    ...rows.map(toCsvRow),
    toCsvRow(summaryRow),
  ].join('\r\n');

  const filename = `So_theo_doi_cong_no_${propertyName.replace(/\s+/g, '_')}_${billingMonth}.csv`;
  downloadCsvWithBom(filename, content);
}
