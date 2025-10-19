export function formatDate(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "id-ID"
): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat(
    locale,
    options ?? { day: "2-digit", month: "short", year: "numeric" }
  );

  return formatter.format(date);
}

export default formatDate;