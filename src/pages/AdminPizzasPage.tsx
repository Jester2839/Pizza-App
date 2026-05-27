import React, { useState, useEffect } from 'react';
import type { Pizza, PizzaCategory, Base } from '../types';
import { fetchPizzas, createPizza, updatePizza, deletePizza, fetchPizzaOptions } from '../services/api';
import { useAlert } from '../hooks/useAlert';

interface PizzaFormState extends Omit<Pizza, 'id' | 'code' | 'category'> {
  category: string[]; // For form handling as string array
  default_base_code?: string; // Explicitně definujeme nový payload parametr
}

interface PizzaCardProps {
  pizza: Pizza;
  onEdit: (pizza: Pizza) => void;
  onDelete: (id: number) => void;
}

const PizzaCard: React.FC<PizzaCardProps> = ({ pizza, onEdit, onDelete }) => {
  return (
    <div className="admin-pizza-card">
      <div className="admin-pizza-card__image">
        <img src={pizza.image} alt={pizza.name} />
      </div>
      <div className="admin-pizza-card__content">
        <div className="admin-pizza-card__info">
          <h3>{pizza.name}</h3>
          <p className="description">{pizza.description}</p>
          <p className="price">{pizza.price} Kč</p>
        </div>
        <div className="admin-pizza-card__actions">
          <button className="btn btn-primary" onClick={() => onEdit(pizza)}>
            <i className="ph ph-pencil-simple"></i> Upravit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(pizza.id)}>
            <i className="ph ph-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

interface PizzaModalProps {
  pizza?: Pizza | null;
  bases: Base[];
  onSave: (pizzaData: any) => void;
  onClose: () => void;
}

const PizzaModal: React.FC<PizzaModalProps> = ({ pizza, bases, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<PizzaFormState, 'id' | 'code'>>({
    name: pizza?.name || '',
    description: pizza?.description || '',
    price: pizza?.price || 0,
    image: pizza?.image || '',
    category: pizza?.category || [],
    default_base_code: (pizza as any)?.default_base_code || bases.find(b => b.id === pizza?.defaultBaseId)?.code || '',
  });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validate = (pizzaData: any) => {
    const errors: Record<string, string> = {};
    if (!pizzaData.name?.trim()) errors.name = 'Název je povinný.';
    if (!pizzaData.description?.trim()) errors.description = 'Složení je povinné.';
    if (pizzaData.price <= 0) errors.price = 'Cena musí být kladné číslo.';
    if (!pizza && !pizzaData.image?.trim()) errors.image = 'Odkaz na obrázek je povinný.';
    if (!pizzaData.default_base_code) errors.default_base_code = 'Výchozí základ je povinný.';
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      category: value ? [value as PizzaCategory] : [],
    }));
  };

  const handleSave = () => {
    if (validate(formData)) {
      onSave(pizza ? { ...pizza, ...formData } : formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{pizza ? 'Upravit pizzu' : 'Přidat novou pizzu'}</h3>
          <button className="modal-close-icon" onClick={onClose}>
            <i className="ph ph-x"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Název:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={localErrors.name ? 'input-error' : ''}
            />
            {localErrors.name && <p className="error-message">{localErrors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Složení:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={localErrors.description ? 'input-error' : ''}
            />
            {localErrors.description && <p className="error-message">{localErrors.description}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="price">Cena (Kč):</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={localErrors.price ? 'input-error' : ''}
            />
            {localErrors.price && <p className="error-message">{localErrors.price}</p>}
          </div>
          {!pizza && (
            <div className="form-group">
              <label htmlFor="image">Odkaz na obrázek:</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className={localErrors.image ? 'input-error' : ''}
              />
              {localErrors.image && <p className="error-message">{localErrors.image}</p>}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="default_base_code">Výchozí základ:</label>
            <select
              id="default_base_code"
              name="default_base_code"
              value={formData.default_base_code ?? ''}
              onChange={handleInputChange}
              className={localErrors.default_base_code ? 'input-error' : ''}
            >
              <option value="">Vyberte základ</option>
              {bases.map(base => (
                <option key={base.code} value={base.code}>{base.name}</option>
              ))}
            </select>
            {localErrors.default_base_code && <p className="error-message">{localErrors.default_base_code}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="category">Kategorie:</label>
            <select
              id="category"
              name="category"
              value={formData.category?.[0] || ''}
              onChange={handleCategoryChange}
            >
              <option value="">Vyberte kategorii</option>
              <option value="favorite">Oblíbené</option>
              <option value="meat">Masové</option>
              <option value="spicy">Pikantní</option>
              <option value="vegetarian">Vegetariánské</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>Uložit</button>
          <button className="btn btn-secondary" onClick={onClose}>Zrušit</button>
        </div>
      </div>
    </div>
  );
};

const AdminPizzasPage: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPizza, setCurrentPizza] = useState<Pizza | null>(null);
  const [bases, setBases] = useState<Base[]>([]);

  const { showAlert } = useAlert();

  useEffect(() => {
    const loadPizzasAndOptions = async () => {
      try {
        const fetchedPizzas = await fetchPizzas();
        setPizzas(fetchedPizzas);
        const options = await fetchPizzaOptions();
        setBases(options.bases);
      } catch (error) {
        console.error('Failed to fetch pizzas or options:', error);
        showAlert('Nepodařilo se načíst data.', 'error');
      }
    };
    loadPizzasAndOptions();
  }, []);

  const handleSavePizza = async (pizzaData: any) => {
    if (currentPizza) {
      // Update
      try {
        const updatedPizza = await updatePizza(pizzaData);
        setPizzas(pizzas.map(p => (p.id === updatedPizza.id ? updatedPizza : p)));
        setIsModalOpen(false);
        showAlert('Pizza úspěšně aktualizována!', 'success');
      } catch (error) {
        showAlert('Nepodařilo se aktualizovat pizzu.', 'error');
      }
    } else {
      // Create
      await handleCreatePizza(pizzaData);
    }
  };

  const handleDeletePizza = async (id: number) => {
    if (window.confirm('Opravdu chcete smazat tuto pizzu?')) {
      try {
        await deletePizza(id);
        setPizzas(pizzas.filter(p => p.id !== id));
        showAlert('Pizza úspěšně smazána!', 'success');
      } catch (error) {
        console.error('Failed to delete pizza:', error);
        showAlert('Nepodařilo se smazat pizzu.', 'error');
      }
    }
  };

  const handleCreatePizza = async (newPizzaData: any) => {
    try {
      const generatedCode = newPizzaData.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-');

      const pizzaToCreate: any = {
        ...newPizzaData,
        code: generatedCode,
      };
      const createdPizza = await createPizza(pizzaToCreate as Omit<Pizza, 'id'>);
      setPizzas([...pizzas, createdPizza]);
      setIsModalOpen(false);
      showAlert('Pizza úspěšně přidána!', 'success');
    } catch (error) {
      showAlert('Nepodařilo se přidat pizzu.', 'error');
    }
  };

  const openEditModal = (pizza: Pizza) => {
    setCurrentPizza(pizza);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentPizza(null);
    setIsModalOpen(true);
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Správa Pizz</h1>
        <button 
          className="btn btn-primary" 
          onClick={openAddModal}>
          <i className="ph ph-plus"></i> Přidat pizzu
        </button>
      </div>
      <div className="pizza-list">
        {pizzas.map(pizza => (
          <PizzaCard 
            key={pizza.id} 
            pizza={pizza}
            onEdit={openEditModal}
            onDelete={handleDeletePizza}
          />
        ))}
      </div>
      {isModalOpen && (
        <PizzaModal 
          pizza={currentPizza}
          bases={bases}
          onSave={handleSavePizza}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPizzasPage;
