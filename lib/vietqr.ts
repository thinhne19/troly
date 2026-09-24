// lib/vietqr.ts — Napas 24/7 Dynamic VietQR Generator

export interface VietQrOptions {
  bankId: string; // e.g., 'MB', 'VCB', 'TCB', 'ICB', 'ACB'
  accountNo: string; // e.g., '999908123456'
  accountName: string; // e.g., 'NGUYEN VAN THIN'
  amount: number; // e.g., 5480000
  memo: string; // e.g., 'TROLY P202 T09'
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

/**
 * Standard Bank BIN mapping for Vietnamese Banks
 */
export const VIETNAMESE_BANKS = [
  { id: 'MB', name: 'MBBank (Quân Đội)', bin: '970422' },
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương)', bin: '970436' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương)', bin: '970407' },
  { id: 'ICB', name: 'VietinBank (Công Thương)', bin: '970415' },
  { id: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)', bin: '970418' },
  { id: 'ACB', name: 'ACB (Á Châu)', bin: '970416' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', bin: '970432' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)', bin: '970458' },
];

/**
 * Generates an official Napas 24/7 VietQR dynamic image URL
 */
export function generateVietQrUrl(options: VietQrOptions): string {
  const {
    bankId = 'MB',
    accountNo = '999908123456',
    accountName = 'NGUYEN VAN THIN',
    amount = 0,
    memo = 'TROLY PAYMENT',
    template = 'compact2'
  } = options;

  const encodedAccountName = encodeURIComponent(accountName.trim());
  const encodedMemo = encodeURIComponent(memo.trim());
  const cleanAmount = Math.max(0, Math.round(amount));

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${cleanAmount}&addInfo=${encodedMemo}&accountName=${encodedAccountName}`;
}

/**
 * Resolves standard clean property abbreviation (e.g. "Nhà trọ Lê Văn Sỹ" -> "LVS")
 */
export function getPropertyCode(propertyOrName?: { name?: string; id?: string } | string): string {
  if (!propertyOrName) return 'P1';
  const name =
    typeof propertyOrName === 'string'
      ? propertyOrName
      : propertyOrName.name || propertyOrName.id || 'P1';
  if (/Lê Văn Sỹ/i.test(name)) return 'LVS';
  if (/Bạch Đằng/i.test(name)) return 'BD';
  if (/Nguyễn Thị Thập/i.test(name)) return 'NTT';
  const words = name.replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '').trim().split(/\s+/);
  if (words.length >= 2) {
    return words.map((w) => w[0]).join('').toUpperCase().slice(0, 4);
  }
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'P1';
}

/**
 * Standardizes transfer syntax: TROLY-[PROPERTY]-[ROOM]-[YYYYMM]
 */
export function buildTransferMemo(
  propertyCodeOrName: string,
  roomCode: string,
  month: string
): string {
  const cleanProp = getPropertyCode(propertyCodeOrName);
  const cleanRoom = roomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanMonth = month.replace(/[^0-9]/g, '');
  return `TROLY-${cleanProp}-${cleanRoom}-${cleanMonth}`;
}

/**
 * Standardizes invoice code: HD-[PROPERTY]-[YYYYMM]-[ROOM]
 */
export function buildInvoiceCode(
  propertyCodeOrName: string,
  billingMonth: string,
  roomCode: string
): string {
  const cleanProp = getPropertyCode(propertyCodeOrName);
  const cleanMonth = billingMonth.replace(/[^0-9]/g, '');
  const cleanRoom = roomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `HD-${cleanProp}-${cleanMonth}-${cleanRoom}`;
}

