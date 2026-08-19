import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid, differenceInMinutes, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function generateCorrelationId(): string {
  return `corr_${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
}

export function formatCurrency(amount: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string, formatStr: string = 'MMM dd, yyyy'): string {
  if (!dateString) return '—';
  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return dateString;
    return format(parsed, formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  return formatDate(dateString, 'MMM dd, yyyy · hh:mm a');
}

export function formatTime(timeString?: string): string {
  return formatDate(timeString, 'hh:mm a');
}

export function calculateHoursWorked(clockIn?: string, clockOut?: string, breakMinutes: number = 0): {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
} {
  if (!clockIn || !clockOut) {
    return { totalHours: 0, regularHours: 0, overtimeHours: 0 };
  }

  try {
    const start = parseISO(clockIn);
    const end = parseISO(clockOut);
    const totalMinutes = Math.max(0, differenceInMinutes(end, start) - breakMinutes);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    const regularHours = Math.min(8, totalHours);
    const overtimeHours = Math.max(0, Math.round((totalHours - 8) * 100) / 100);

    return { totalHours, regularHours, overtimeHours };
  } catch {
    return { totalHours: 0, regularHours: 0, overtimeHours: 0 };
  }
}

export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
