import { describe, it, expect } from '@jest/globals';
import {
  secondsToTime,
  formatDuration,
  formatDurationLong,
  getStartOfDay,
  getEndOfDay,
  getDayName,
  getRepositoryName,
  validateRepositoryPath
} from '../lib/utils';

describe('Utils', () => {
  describe('secondsToTime', () => {
    it('should convert seconds to hours, minutes, seconds', () => {
      const result = secondsToTime(3661); // 1 hour, 1 minute, 1 second
      expect(result).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    });

    it('should handle 0 seconds', () => {
      const result = secondsToTime(0);
      expect(result).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });

    it('should handle large numbers', () => {
      const result = secondsToTime(86400); // 24 hours
      expect(result).toEqual({ hours: 24, minutes: 0, seconds: 0 });
    });
  });

  describe('formatDuration', () => {
    it('should format hours and minutes', () => {
      const result = formatDuration(3600); // 1 hour
      expect(result).toBe('1시간 0분');
    });

    it('should format minutes only', () => {
      const result = formatDuration(900); // 15 minutes
      expect(result).toBe('15분');
    });

    it('should format less than a minute', () => {
      const result = formatDuration(30);
      expect(result).toBe('1분 미만');
    });
  });

  describe('formatDurationLong', () => {
    it('should format full duration', () => {
      const result = formatDurationLong(3661); // 1 hour, 1 minute, 1 second
      expect(result).toContain('1시간');
      expect(result).toContain('1분');
      expect(result).toContain('1초');
    });
  });

  describe('getStartOfDay', () => {
    it('should return start of day timestamp', () => {
      const date = new Date('2024-01-15T14:30:00');
      const start = getStartOfDay(date);
      const startDate = new Date(start * 1000);

      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day timestamp', () => {
      const date = new Date('2024-01-15T14:30:00');
      const end = getEndOfDay(date);
      const endDate = new Date(end * 1000);

      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);
    });
  });

  describe('getDayName', () => {
    it('should return Korean day names', () => {
      const mon = new Date('2024-01-15'); // Monday
      expect(getDayName(mon)).toBe('월');

      const sun = new Date('2024-01-21'); // Sunday
      expect(getDayName(sun)).toBe('일');
    });
  });

  describe('getRepositoryName', () => {
    it('should extract repo name from path', () => {
      const name = getRepositoryName('/home/user/projects/my-repo');
      expect(name).toBe('my-repo');
    });

    it('should handle simple paths', () => {
      const name = getRepositoryName('/repo');
      expect(name).toBe('repo');
    });
  });

  describe('validateRepositoryPath', () => {
    it('should validate absolute paths', () => {
      expect(validateRepositoryPath('/home/user/repo')).toBe(true);
    });

    it('should reject relative paths', () => {
      expect(validateRepositoryPath('repo')).toBe(false);
    });

    it('should reject empty paths', () => {
      expect(validateRepositoryPath('')).toBe(false);
    });
  });
});
