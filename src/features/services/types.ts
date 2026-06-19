export type Currency = 'CRC' | 'NIO' | 'USD';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    CRC: '₡',
    NIO: 'C$',
    USD: '$',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
    CRC: '🇨🇷 CRC — Colón (₡)',
    NIO: '🇳🇮 NIO — Córdoba (C$)',
    USD: '🇺🇸 USD — Dólar ($)',
};

export interface Service {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    currency: Currency;
    durationMinutes: number;
    createdAt?: string;
    updatedAt?: string;
}

