import { describe, it, expect } from 'vitest';
import { formatPrice } from './CartPage';

describe('CartPage Utils', () => {
  describe('formatPrice', () => {
    it('should format whole numbers correctly', () => {
      expect(formatPrice(100)).toBe('100,00 Kč');
    });

    it('should format decimal numbers with two digits and a comma', () => {
      expect(formatPrice(125.5)).toBe('125,50 Kč');
    });

    it('should handle zero correctly', () => {
      expect(formatPrice(0)).toBe('0,00 Kč');
    });
  });
});