/**
 * Currency utilities cho Vietnamese Dong (VND)
 */

export function formatVND(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
  }

  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
}

export function parseVND(formatted: string): number {
  return Number(formatted.replace(/[^\d-]/g, ''));
}
