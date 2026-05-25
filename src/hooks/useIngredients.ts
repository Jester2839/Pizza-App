// =========================================
// HOOK PRO NAČÍTÁNÍ INGREDIENCÍ Z API
// =========================================

import { useState, useEffect } from 'react';
import { fetchIngredients } from '../services/api';
import type { IngredientCategoryGroup } from '../types';

interface UseIngredientsResult {
  ingredients: IngredientCategoryGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIngredients(): UseIngredientsResult {
  const [ingredients, setIngredients] = useState<IngredientCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIngredients();
      setIngredients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredients');
      console.error('Error loading ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  return {
    ingredients,
    loading,
    error,
    refetch: loadIngredients,
  };
}
