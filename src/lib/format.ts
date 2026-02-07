export function formatDurationFromSeconds(seconds: number): string {
  // Handle edge cases
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSats(sats: number): string {
  // Handle edge cases
  if (!Number.isFinite(sats)) {
    return "0 sats";
  }
  const absSats = Math.abs(sats);
  const sign = sats < 0 ? "-" : "";
  if (absSats >= 1_000_000) return `${sign}${(absSats / 1_000_000).toFixed(1)}M sats`;
  if (absSats >= 1_000) return `${sign}${(absSats / 1_000).toFixed(1)}k sats`;
  return `${sign}${absSats} sats`;
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return "Unknown";
  }

  const diff = now.getTime() - date.getTime();

  // Handle future dates
  if (diff < 0) {
    return "Upcoming";
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(dateString);
}
