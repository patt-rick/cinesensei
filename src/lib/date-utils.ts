import { formatDistanceToNow, format, fromUnixTime } from "date-fns";

export function formatReleaseDate(dateStr?: string): string {
  if (!dateStr) return "Unknown";
  try {
    const date = new Date(dateStr);
    return format(date, "MMM d, yyyy");
  } catch {
    return "Unknown";
  }
}

export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    if (date > now) {
      return `in ${formatDistanceToNow(date)}`;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "";
  }
}

export function formatUnixDate(unix?: number): string {
  if (!unix) return "Unknown";
  try {
    return format(fromUnixTime(unix), "MMM d, yyyy");
  } catch {
    return "Unknown";
  }
}

export function formatUnixRelative(unix?: number): string {
  if (!unix) return "";
  try {
    const date = fromUnixTime(unix);
    const now = new Date();
    if (date > now) {
      return `in ${formatDistanceToNow(date)}`;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "";
  }
}
