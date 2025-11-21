/**
 * Date Utilities
 * Provides functions for formatting date strings to relative or absolute formats for UI display.
 */

/**
 * Formats a date string to a relative or absolute format (e.g., Today, Tomorrow, 3 days ago).
 * @param dateStr The date string to format.
 * @returns Formatted date string for display.
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  // Accept either date-only strings (YYYY-MM-DD) or full ISO datetimes.
  let d: Date;
  try {
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      d = new Date(dateStr);
    } else {
      d = new Date(dateStr + 'T00:00:00');
    }
  } catch {
    return '';
  }
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
