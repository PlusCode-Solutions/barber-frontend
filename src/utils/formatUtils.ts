/**
 * Format a number as Costa Rican Colones (CRC)
 * Example: 1000 -> ₡1.000
 */
export function formatCurrency(amount: number | string): string {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return String(amount);
    
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericAmount);
}
