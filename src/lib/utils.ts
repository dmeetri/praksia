import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "d MMMM yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt, { locale: ru });
}

export function formatDateShort(date: string | Date) {
  return formatDate(date, "dd.MM.yyyy");
}

/** Apply field values to template content, replacing {{placeholder}} */
export function applyFields(
  content: string,
  fieldValues: Record<string, string>
): string {
  let result = content;

  // First compute derived fields
  const computed: Record<string, string> = {};

  // end_date = start_date + days_count
  if (fieldValues.start_date && fieldValues.days_count) {
    try {
      const start = parseISO(fieldValues.start_date);
      const days = parseInt(fieldValues.days_count, 10);
      if (!isNaN(days)) {
        computed.end_date = format(addDays(start, days - 1), "yyyy-MM-dd");
      }
    } catch {}
  }

  const allValues = { ...fieldValues, ...computed };

  // Date fields — format nicely for display
  const dateFieldPatterns = ["_date", "date_"];
  for (const [key, value] of Object.entries(allValues)) {
    if (dateFieldPatterns.some((p) => key.includes(p)) && value) {
      try {
        allValues[key] = formatDateShort(value);
      } catch {}
    }
  }

  // Extract sign_date parts if sign_date exists
  if (allValues.sign_date || fieldValues.doc_date || fieldValues.order_date) {
    const dateStr = allValues.sign_date || allValues.doc_date || allValues.order_date;
    if (dateStr) {
      try {
        const d = parseISO(dateStr.includes(".")
          ? dateStr.split(".").reverse().join("-")
          : dateStr);
        allValues.sign_day = format(d, "d");
        allValues.sign_month = format(d, "MMMM", { locale: ru });
        allValues.sign_year = format(d, "yyyy");
      } catch {}
    }
  }

  // Replace all {{field}} placeholders
  for (const [key, value] of Object.entries(allValues)) {
    const re = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(re, value || `{{${key}}}`);
  }

  return result;
}

/** Extract field values from rendered content (reverse of applyFields) */
export function extractFieldValues(
  content: string,
  fields: { id: string }[]
): Record<string, string> {
  const values: Record<string, string> = {};
  // We can't reliably reverse HTML parsing, so just return empty
  // The sidebar keeps its own state
  return values;
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
