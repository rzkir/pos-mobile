/**
 * Format number to Indonesian Rupiah (IDR) currency format
 * @param amount - The number to format
 * @param showSymbol - Whether to show the "Rp" symbol (default: true)
 * @returns Formatted string with IDR currency format
 */
export const formatIdr = (
  amount: number | string,
  showSymbol: boolean = true
): string => {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) || 0 : amount;

  if (isNaN(numericAmount)) {
    return showSymbol ? "Rp 0" : "0";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);

  return showSymbol ? `Rp ${formatted}` : formatted;
};

/**
 * Parse IDR formatted string back to number
 * @param idrString - The IDR formatted string (e.g., "Rp 1.000.000" or "1.000.000")
 * @returns Parsed number
 */
export const parseIdr = (idrString: string): number => {
  if (!idrString) return 0;

  // Remove "Rp" and spaces, then remove dots (thousand separators)
  const cleanString = idrString
    .replace(/Rp\s?/gi, "")
    .replace(/\./g, "")
    .trim();

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format input value as user types (for TextInput)
 * @param value - The input value
 * @returns Formatted string for display
 */
export const formatIdrInput = (value: string): string => {
  if (!value) return "";

  // Remove all non-numeric characters
  const numericValue = value.replace(/[^\d]/g, "");

  if (!numericValue) return "";

  // Add thousand separators
  const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return formatted;
};

/**
 * Parse formatted input back to numeric string for storage
 * @param formattedValue - The formatted input value
 * @returns Numeric string
 */
export const parseIdrInput = (formattedValue: string): string => {
  if (!formattedValue) return "";

  // Remove dots (thousand separators) and return numeric string
  return formattedValue.replace(/\./g, "");
};
