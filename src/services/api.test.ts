import { describe, it, expect } from 'vitest';
import { filterPizzasByCategory } from './api';
import { Pizza } from '../types';

describe('API Utils', () => {
  const mockPizzas: Partial<Pizza>[] = [
    { id: 1, category: ['meat', 'spicy'] },
    { id: 2, category: ['vegetarian'] },
    { id: 3, category: ['meat'] },
  ];

  describe('filterPizzasByCategory', () => {
    it('should return all pizzas when category is "all"', () => {
      const result = filterPizzasByCategory(mockPizzas as Pizza[], 'all');
      expect(result).toHaveLength(3);
    });

    it('should filter pizzas by specific category', () => {
      const result = filterPizzasByCategory(mockPizzas as Pizza[], 'vegetarian');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });
  });
});