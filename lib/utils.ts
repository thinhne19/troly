// lib/utils.ts — General Utilities & Vietnamese Formatters
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format raw number into Vietnamese currency format: 4.500.000 ₫
 */
export function formatVND(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 ₫';
  }
  const numeric = Math.round(Number(amount));
  return new Intl.NumberFormat('vi-VN').format(numeric) + ' ₫';
}

/**
 * Format raw number without currency symbol: 4.500.000
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN').format(Number(value));
}

/**
 * Format ISO date string into DD/MM/YYYY
 */
export function formatDateVN(dateStr: string | null | undefined): string {
  if (!dateStr) return '--/--/----';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format billing month YYYY-MM into 'Tháng MM/YYYY'
 */
export function formatBillingMonth(monthStr: string | null | undefined): string {
  if (!monthStr || !monthStr.includes('-')) return 'Tháng hiện tại';
  const [year, month] = monthStr.split('-');
  return `Tháng ${month}/${year}`;
}

/**
 * Converts numbers into Vietnamese spoken words (e.g. 5.480.000 -> Năm triệu bốn trăm tám mươi nghìn đồng chẵn)
 */
export function numberToVietnameseWords(amount: number): string {
  if (amount === 0) return 'Không đồng';
  const units = ['', 'nghìn', 'triệu', 'tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readGroup(n: number): string {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let res = '';
    if (h > 0) res += digits[h] + ' trăm ';
    if (t > 1) {
      res += digits[t] + ' mươi ';
      if (u === 1) res += 'mốt';
      else if (u === 5) res += 'lăm';
      else if (u > 0) res += digits[u];
    } else if (t === 1) {
      res += 'mười ';
      if (u === 5) res += 'lăm';
      else if (u > 0) res += digits[u];
    } else if (u > 0) {
      if (h > 0) res += 'lẻ ' + digits[u];
      else res += digits[u];
    }
    return res.trim();
  }

  const groups: number[] = [];
  let temp = Math.abs(amount);
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const gWords = readGroup(g);
      words += gWords + ' ' + units[i] + ' ';
    }
  }

  const result = words.trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng chẵn';
}
