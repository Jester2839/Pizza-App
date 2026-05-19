export interface ExtraIngredient {
  id: string;
  name: string;
  price: number;
}

export interface IngredientCategory {
  category: string;
  items: ExtraIngredient[];
}

export const extraIngredients: IngredientCategory[] = [
  {
    category: 'SÝRY',
    items: [
      { id: 'mozzarella', name: 'mozzarella', price: 35 },
      { id: 'hermelin', name: 'hermelín', price: 35 },
      { id: 'niva', name: 'niva', price: 35 },
      { id: 'parmesan', name: 'parmesan', price: 55 },
    ],
  },
  {
    category: 'MASO',
    items: [
      { id: 'sunka', name: 'dušená šunka', price: 35 },
      { id: 'salam', name: 'salám', price: 35 },
      { id: 'slanina', name: 'anglická slanina', price: 35 },
      { id: 'klobasa', name: 'pikantní klobása', price: 55 },
    ],
  },
  {
    category: 'ZELENINA, OVOCE',
    items: [
      { id: 'cibule', name: 'červená cibule', price: 30 },
      { id: 'kukurice', name: 'kukuřice', price: 30 },
      { id: 'zampiony', name: 'čerstvé žampiony', price: 30 },
      { id: 'jalapenos', name: 'jalapeños', price: 30 },
    ],
  },
  {
    category: 'DIPY',
    items: [
      { id: 'tatarka', name: 'tatarská omáčka', price: 25 },
      { id: 'kecup', name: 'kečup', price: 25 },
      { id: 'chipotle', name: 'chipotle BBQ dip', price: 25 },
      { id: 'syrovy-dip', name: 'sýrový dip', price: 25 },
    ],
  },
];
