/**
 * Utilidad oficial para formateo de moneda en Soles Peruanos (PEN).
 * Símbolo: 'S/ '
 * Formato peruano: separador de miles con coma y dos decimales.
 * Ejemplo: formatPEN(120) => "S/ 120.00"
 *          formatPEN(1314.5) => "S/ 1,314.50"
 */
export const formatPEN = (amount: number | undefined | null): string => {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `S/ ${val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const parsePEN = (value: string | number): number => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
