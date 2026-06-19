import type { Currency } from "../features/services/types";
import { CURRENCY_SYMBOLS } from "../features/services/types";

const LOCALE_MAP: Record<Currency, string> = {
    CRC: 'es-CR',
    NIO: 'es-NI',
    USD: 'en-US',
};

export function formatCurrency(amount: number | string, currency: Currency = 'CRC'): string {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return String(amount);

    return `${CURRENCY_SYMBOLS[currency]}${numericAmount.toLocaleString(LOCALE_MAP[currency])}`;
}
