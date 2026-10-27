/**
 * Formatea un valor numérico al formato oficial de Soles Peruanos (PEN).
 * Símbolo: S/
 * Separador de miles: coma (,)
 * Separador decimal: punto (.) con 2 decimales
 * Ejemplo: formatCurrencyPEN(120) => "S/ 120.00"
 * Ejemplo: formatCurrencyPEN(1314.5) => "S/ 1,314.50"
 */
export function formatCurrencyPEN(amount: number | string | null | undefined): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount)) {
    return 'S/ 0.00';
  }

  const fixed = numericAmount.toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `S/ ${formattedInteger}.${decimalPart}`;
}

/**
 * Parsea un string o número a float numérico limpio
 */
export function parsePricePEN(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const clean = value.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
