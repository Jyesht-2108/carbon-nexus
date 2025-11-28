import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${formatNumber(kg / 1000, 1)}t`;
  }
  return `${formatNumber(kg, 0)}kg`;
}
