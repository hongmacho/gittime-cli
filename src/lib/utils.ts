export interface TimeFormatted {
  hours: number;
  minutes: number;
  seconds: number;
}

export function secondsToTime(totalSeconds: number): TimeFormatted {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
}

export function formatDuration(seconds: number): string {
  const { hours, minutes } = secondsToTime(seconds);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (minutes > 0) {
    return `${minutes}분`;
  }

  return '1분 미만';
}

export function formatDurationLong(seconds: number): string {
  const { hours, minutes, seconds: secs } = secondsToTime(seconds);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}시간`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}분`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}초`);
  }

  return parts.join(' ');
}

export function getStartOfDay(date: Date = new Date()): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function getEndOfDay(date: Date = new Date()): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

export function getStartOfWeek(date: Date = new Date()): number {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function getEndOfWeek(date: Date = new Date()): number {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Sunday of same week
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

export function getStartOfMonth(date: Date = new Date()): number {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function getEndOfMonth(date: Date = new Date()): number {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getDayName(date: Date = new Date()): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

export function getWeekNumber(date: Date = new Date()): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function validateRepositoryPath(path: string): boolean {
  return path.length > 0 && path.startsWith('/');
}

export function getRepositoryName(path: string): string {
  return path.split('/').pop() || 'Unknown';
}
