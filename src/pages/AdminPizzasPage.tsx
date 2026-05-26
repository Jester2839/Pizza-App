import React, { useState, useEffect } from 'react';
import type { Pizza, PizzaCategory, Base } from '../types';
import { fetchPizzas, createPizza, updatePizza, deletePizza, fetchPizzaOptions } from '../services/api';
import { useAlert } from '../hooks/useAlert';

interface PizzaFormState extends Omit<Pizza, 'id' | 'code' | 'category'> {
  category: string[]; // For form handling as string array
  default_base_code?: string; // Explicitně definujeme nový payload parametr
}

const AdminPizzasPage: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [editingPizzaId, setEditingPizzaId] = useState<number | null>(null);
  const [newPizzaModalOpen, setNewPizzaModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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

  const validatePizzaForm = (pizza: any) => {
    const errors: Record<string, string> = {};
    if (!pizza.name?.trim()) errors.name = 'Název je povinný.';
    if (!pizza.description?.trim()) errors.description = 'Složení je povinné.';
    if (pizza.price <= 0) errors.price = 'Cena musí být kladné číslo.';
    if (!pizza.image?.trim()) errors.image = 'Odkaz na obrázek je povinný.';
    if (!pizza.default_base_code && !pizza.defaultBaseId) errors.default_base_code = 'Výchozí základ je povinný.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePizza = async (pizza: Pizza) => {
    if (!validatePizzaForm(pizza)) return;
    try {
      const updatedPizza = await updatePizza(pizza);
      setPizzas(pizzas.map(p => (p.id === updatedPizza.id ? updatedPizza : p)));
      setEditingPizzaId(null);
      showAlert('Pizza úspěšně aktualizována!', 'success');
    } catch (error) {
      console.error('Failed to update pizza:', error);
      showAlert('Nepodařilo se aktualizovat pizzu.', 'error');
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

  const handleCreatePizza = async (newPizzaData: Omit<PizzaFormState, 'id' | 'code'>) => {
    if (!validatePizzaForm(newPizzaData)) return;
    try {
      const generatedCode = newPizzaData.name
        .normalize('NFD') // Odstraní diakritiku (rozdělí znaky a háčky/čárky)
        .replace(/[\u0300-\u036f]/g, '') // Smaže oddělené háčky a čárky
        .toLowerCase() // Převede na malá písmena
        .trim() // Ořízne mezery na začátku a konci
        .replace(/[^a-z0-9]+/g, '-'); // Mezery a speciální znaky nahradí pomlčkou

      const pizzaToCreate: any = {
        ...newPizzaData,
        code: generatedCode,
        category: newPizzaData.category as PizzaCategory[],
      };
      const createdPizza = await createPizza(pizzaToCreate as Omit<Pizza, 'id'>);
      setPizzas([...pizzas, createdPizza]);
      setNewPizzaModalOpen(false);
      showAlert('Pizza úspěšně přidána!', 'success');
    } catch (error) {
      console.error('Failed to create pizza:', error);
      showAlert('Nepodařilo se přidat pizzu.', 'error');
    }
  };

  const PizzaCard: React.FC<{ pizza: Pizza }> = ({ pizza }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPizza, setEditedPizza] = useState<Pizza>(pizza);

    useEffect(() => {
      setEditedPizza(pizza);
    }, [pizza]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditedPizza(prev => ({
        ...prev,
        [name]: name === 'price' ? Number(value) : value,
      }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      setEditedPizza(prev => ({
        ...prev,
        category: value ? [value as PizzaCategory] : [],
      }));
    };

    return (
      <div className="pizza-card admin-pizza-card">
        <img src={editedPizza.image} alt={editedPizza.name} className="pizza-image" />
        <div className="pizza-details">
          <div className="detail-row">
            <strong>Název:</strong>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedPizza.name}
                onChange={handleEditChange}
                className={formErrors.name ? 'input-error' : ''}
              />
            ) : (
              <span>{editedPizza.name}</span>
            )}
            <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Zrušit' : 'Upravit'}</button>
          </div>
          <div className="detail-row">
            <strong>Složení:</strong>
            {isEditing ? (
              <textarea
                name="description"
                value={editedPizza.description}
                onChange={handleEditChange}
                className={formErrors.description ? 'input-error' : ''}
              />
            ) : (
              <span>{editedPizza.description}</span>
            )}
            <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Zrušit' : 'Upravit'}</button>
          </div>
          <div className="detail-row">
            <strong>Cena:</strong>
            {isEditing ? (
              <input
                type="number"
                name="price"
                value={editedPizza.price}
                onChange={handleEditChange}
                className={formErrors.price ? 'input-error' : ''}
              />
            ) : (
              <span>{editedPizza.price} Kč</span>
            )}
            <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Zrušit' : 'Upravit'}</button>
          </div>
          <div className="detail-row">
            <strong>Obrázek:</strong>
            {isEditing ? (
              <input
                type="text"
                name="image"
                value={editedPizza.image}
                onChange={handleEditChange}
                className={formErrors.image ? 'input-error' : ''}
              />
            ) : (
              <span>{editedPizza.image}</span>
            )}
            <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Zrušit' : 'Upravit'}</button>
          </div>
          <div className="detail-row">
            <strong>Výchozí základ:</strong>
            {isEditing ? (
              <select
                name="default_base_code"
                value={(editedPizza as any).default_base_code ?? bases.find(b => b.id === editedPizza.defaultBaseId)?.code ?? ''}
                onChange={handleEditChange}
                className={formErrors.default_base_code ? 'input-error' : ''}
              >
                <option value="">Vyberte základ</option>
                {bases.map(base => (
                  <option key={base.code} value={base.code}>{base.name}</option>
                ))}
              </select>
            ) : (
              <span>{bases.find(b => b.code === (editedPizza as any).default_base_code || b.id === editedPizza.defaultBaseId)?.name || 'Neznámý'}</span>
            )}
            <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Zrušit' : 'Upravit'}</button>
          </div>
          <div className="detail-row">
            <strong>Kategorie:</strong>
            {isEditing ? (
              <select
                name="category"
                value={editedPizza.category?.[0] || ''}
                onChange={handleCategoryChange}
              >
                <option value="">Vyberte kategorii</option>
                <option value="favorite">Oblíbené</option>
                <option value="meat">Masové</option>
                <option value="spicy">Pikantní</option>
                <option value="vegetarian">Vegetariánské</option>
              </select>
            ) : (
              <span>{(editedPizza.category && editedPizza.category.length > 0) ? editedPizza.category.join(', ') : 'Žádná'}</span>
            )}
            <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Zrušit' : 'Upravit'}</button>
          </div>
          {isEditing && ( // Only show Save and Delete buttons when editing
            <div className="pizza-actions">
              <button className="btn btn-primary" onClick={() => handleUpdatePizza(editedPizza)}>Uložit změny</button>
              <button className="btn btn-danger" onClick={() => handleDeletePizza(pizza.id)}>Smazat</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const NewPizzaForm: React.FC = () => {
    const [newPizza, setNewPizza] = useState<Omit<PizzaFormState, 'id' | 'code'>>({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: [],
      default_base_code: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewPizza(prev => ({
        ...prev,
        [name]: name === 'price' ? Number(value) : value,
      }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      setNewPizza(prev => ({
        ...prev,
        category: value ? [value as PizzaCategory] : [],
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreatePizza(newPizza);
    };

    return (
      <form onSubmit={handleSubmit} className="admin-pizza-form">
        <h2>Přidat novou pizzu</h2>
        <div className="form-group">
          <label htmlFor="name">Název:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newPizza.name}
            onChange={handleInputChange}
            className={formErrors.name ? 'input-error' : ''}
          />
          {formErrors.name && <p className="error-message">{formErrors.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Složení:</label>
          <textarea
            id="description"
            name="description"
            value={newPizza.description}
            onChange={handleInputChange}
            className={formErrors.description ? 'input-error' : ''}
          />
          {formErrors.description && <p className="error-message">{formErrors.description}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="price">Cena:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={newPizza.price}
            onChange={handleInputChange}
            className={formErrors.price ? 'input-error' : ''}
          />
          {formErrors.price && <p className="error-message">{formErrors.price}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="image">Odkaz na obrázek:</label>
          <input
            type="text"
            id="image"
            name="image"
            value={newPizza.image}
            onChange={handleInputChange}
            className={formErrors.image ? 'input-error' : ''}
          />
          {formErrors.image && <p className="error-message">{formErrors.image}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="default_base_code">Výchozí základ:</label>
          <select
            id="default_base_code"
            name="default_base_code"
            value={newPizza.default_base_code ?? ''}
            onChange={handleInputChange}
            className={formErrors.default_base_code ? 'input-error' : ''}
          >
            <option value="">Vyberte základ</option>
            {bases.map(base => (
              <option key={base.code} value={base.code}>{base.name}</option>
            ))}
          </select>
          {formErrors.default_base_code && <p className="error-message">{formErrors.default_base_code}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="category">Kategorie:</label>
          <select
            id="category"
            name="category"
            value={newPizza.category?.[0] || ''}
            onChange={handleCategoryChange}
          >
            <option value="">Vyberte kategorii</option>
            <option value="favorite">Oblíbené</option>
            <option value="meat">Masové</option>
            <option value="spicy">Pikantní</option>
            <option value="vegetarian">Vegetariánské</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Přidat pizzu</button>
        <button type="button" className="btn btn-secondary" onClick={() => setNewPizzaModalOpen(false)}>Zrušit</button>
      </form>
    );
  };

  return (
    <div className="admin-pizzas-page">
      <h1>Správa Pizz</h1>
      <button className="btn btn-primary" onClick={() => setNewPizzaModalOpen(true)}>Přidat pizzu</button>
      <div className="pizza-list">
        {pizzas.map(pizza => (
          <PizzaCard key={pizza.id} pizza={pizza} />
        ))}
      </div>
      {newPizzaModalOpen && (
        <div className="modal-overlay" onClick={() => setNewPizzaModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Přidat novou pizzu</h3>
              <button className="modal-close-icon" onClick={() => setNewPizzaModalOpen(false)}>
                <i className="ph ph-x"></i>
              </button>
            </div>
            <div className="modal-body">
               <NewPizzaForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPizzasPage;
