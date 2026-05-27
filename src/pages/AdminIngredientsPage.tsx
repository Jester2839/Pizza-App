import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchIngredients, createIngredient, updateIngredient, deleteIngredient,
  fetchPizzaOptions, updatePizzaOption, deletePizzaOption
} from '../services/api';
import type { Ingredient, IngredientCategory, Dough, Base, Edge, PizzaOption, IngredientCategoryGroup } from '../types';

interface PizzaOptionGroup<T extends PizzaOption> {
  type: string;
  items: T[];
}

type AnyPizzaOption = Dough | Base | Edge;

const AdminIngredientsPage: React.FC = () => {
  const [ingredientGroups, setIngredientGroups] = useState<IngredientCategoryGroup[]>([]);
  const [pizzaOptionDoughs, setPizzaOptionDoughs] = useState<PizzaOptionGroup<Dough>>({ type: 'Dough', items: [] });
  const [pizzaOptionBases, setPizzaOptionBases] = useState<PizzaOptionGroup<Base>>({ type: 'Base', items: [] });
  const [pizzaOptionEdges, setPizzaOptionEdges] = useState<PizzaOptionGroup<Edge>>({ type: 'Edge', items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Ingredient | AnyPizzaOption | null>(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState<'ingredient' | 'option' | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Ingredient | AnyPizzaOption | null>(null);
  const [itemTypeToEdit, setItemTypeToEdit] = useState<'ingredient' | 'option' | null>(null);
  const [optionCategory, setOptionCategory] = useState<'dough' | 'base' | 'edge' | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ingredients = await fetchIngredients();
      setIngredientGroups(ingredients);

      const options = await fetchPizzaOptions();
      setPizzaOptionDoughs({ type: 'Doughs', items: options.doughs });
      setPizzaOptionBases({ type: 'Bases', items: options.bases });
      setPizzaOptionEdges({ type: 'Edges', items: options.edges });

    } catch (err) {
      setError('Nepodařilo se načíst data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Delete
  const handleDeleteClick = (item: Ingredient | AnyPizzaOption, type: 'ingredient' | 'option') => {
    setItemToDelete(item);
    setItemTypeToDelete(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !itemTypeToDelete) return;

    try {
      if (itemTypeToDelete === 'ingredient' && 'id' in itemToDelete) {
        await deleteIngredient(itemToDelete.id);
      } else if (itemTypeToDelete === 'option' && 'id' in itemToDelete) {
        await deletePizzaOption(itemToDelete.id);
      }
      fetchData(); // Refresh data
      setShowDeleteModal(false);
      setItemToDelete(null);
      setItemTypeToDelete(null);
    } catch (err) {
      setError('Nepodařilo se smazat položku.');
      console.error(err);
    }
  };

  // Handle Edit
  const handleEditClick = (item: Ingredient | AnyPizzaOption, type: 'ingredient' | 'option') => {
    setItemToEdit(item);
    setItemTypeToEdit(type);
    setShowEditModal(true);
  };

  const handleAddClick = (type: 'ingredient' | 'option', category?: 'dough' | 'base' | 'edge') => {
    setItemToEdit(null);
    setItemTypeToEdit(type);
    setOptionCategory(category || null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedItem: Ingredient | AnyPizzaOption) => {
    if (!itemTypeToEdit) return;

    try {
      if (itemTypeToEdit === 'ingredient') {
        if ('id' in updatedItem && updatedItem.id) {
          await updateIngredient(updatedItem as Ingredient);
        } else {
          const { id, ...newIngredient } = updatedItem as any;
          await createIngredient(newIngredient);
        }
      } else if (itemTypeToEdit === 'option') {
        if ('id' in updatedItem && updatedItem.id) {
          await updatePizzaOption(updatedItem as AnyPizzaOption);
        } else {
          // createPizzaOption zatím není v api.ts exportováno
          console.error('Vytváření variací zatím není v API implementováno.');
          setError('Vytváření nových variací (těsto, základ, okraj) není zatím v API podporováno.');
          return;
        }
      }
      fetchData(); // Refresh data
      setShowEditModal(false);
      setItemToEdit(null);
      setItemTypeToEdit(null);
      setOptionCategory(null);
    } catch (err) {
      setError('Nepodařilo se aktualizovat položku.');
      console.error(err);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setItemToEdit(null);
    setItemTypeToEdit(null);
    setOptionCategory(null);
  };

  // Helper for rendering list items
  const renderListItem = (item: Ingredient | AnyPizzaOption, type: 'ingredient' | 'option') => (
    <li key={item.id} className="admin-list__item">
      <div className="admin-list__info">
        <span className="admin-list__name">{item.name}</span>
        <span className="admin-list__price">{item.price} Kč</span>
        {'code' in item && <span className="admin-list__code">(kód: {item.code})</span>}
      </div>
      <div className="admin-list__actions">
        <button onClick={() => handleEditClick(item, type)} className="btn-icon btn-edit" title="Upravit">
          <i className="ph ph-pencil-simple"></i>
        </button>
        <button onClick={() => handleDeleteClick(item, type)} className="btn-icon btn-delete" title="Smazat">
          <i className="ph ph-trash"></i>
        </button>
      </div>
    </li>
  );

  if (loading) {
    return <div className="admin-loading"><p>Načítám data...</p></div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <>
      <div className="admin-ingredients-page">
        <div className="admin-header">
           <h1>Správa Ingrediencí a Variací</h1>
           <button className="btn btn-secondary" onClick={() => fetchData()}>
             <i className="ph ph-arrows-clockwise"></i> Aktualizovat
           </button>
        </div>

        <section className="admin-section">
          <h2 className="admin-section__title"><i className="ph ph-sliders"></i> Variace Pizz</h2>
          <div className="pizza-options-grid">
            <div className="pizza-option-group">
              <div className="group-header">
                <h3>Těsta</h3>
                <button onClick={() => handleAddClick('option', 'dough')} className="btn-add-item"><i className="ph ph-plus"></i></button>
              </div>
              <ul className="admin-list">
                {pizzaOptionDoughs.items.map(dough => renderListItem(dough, 'option'))}
              </ul>
            </div>
            <div className="pizza-option-group">
              <div className="group-header">
                <h3>Základy</h3>
                <button onClick={() => handleAddClick('option', 'base')} className="btn-add-item"><i className="ph ph-plus"></i></button>
              </div>
              <ul className="admin-list">
                {pizzaOptionBases.items.map(base => renderListItem(base, 'option'))}
              </ul>
            </div>
            <div className="pizza-option-group">
              <div className="group-header">
                <h3>Okraje</h3>
                <button onClick={() => handleAddClick('option', 'edge')} className="btn-add-item"><i className="ph ph-plus"></i></button>
              </div>
              <ul className="admin-list">
                {pizzaOptionEdges.items.map(edge => renderListItem(edge, 'option'))}
              </ul>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-header">
            <h2 className="admin-section__title"><i className="ph ph-plus-circle"></i> Extra Ingredience</h2>
            <button onClick={() => handleAddClick('ingredient')} className="btn btn-primary"><i className="ph ph-plus"></i> Přidat ingredienci</button>
          </div>
          <div className="ingredients-grid">
            {ingredientGroups.map(group => (
              <div key={group.category} className="ingredient-category-group">
                <h3>{group.category}</h3>
                <ul className="admin-list">
                  {group.items.map(ingredient => renderListItem(ingredient, 'ingredient'))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Potvrzení smazání</h3>
              <p>Opravdu chcete smazat položku <strong>{itemToDelete ? itemToDelete.name : ''}</strong>?</p>
              <div className="modal-actions">
                <button onClick={confirmDelete} className="btn btn-danger">Smazat</button>
                <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Zrušit</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Create Modal */}
        {showEditModal && (
          <EditItemModal
            item={itemToEdit}
            itemType={itemTypeToEdit!}
            onSave={handleSaveEdit}
            onClose={handleCloseEditModal}
          />
        )}

      </div>
    </>
  );
};

interface EditItemModalProps {
  item: Ingredient | AnyPizzaOption | null;
  itemType: 'ingredient' | 'option';
  onSave: (item: Ingredient | AnyPizzaOption) => void;
  onClose: () => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, itemType, onSave, onClose }) => {
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price.toString() || '0');
  const [code, setCode] = useState(itemType === 'option' ? (item as AnyPizzaOption)?.code || '' : '');
  const [category, setCategory] = useState(itemType === 'ingredient' ? (item as Ingredient)?.category || 'cheese' : 'cheese');

  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  const allIngredientCategories: IngredientCategory[] = ['cheese', 'meat', 'vegetable', 'dip', 'other'];

  const validateAndSave = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Název nesmí být prázdný.');
      isValid = false;
    } else {
      setNameError('');
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setPriceError('Cena musí být nezáporné číslo.');
      isValid = false;
    } else {
      setPriceError('');
    }

    if (!isValid) return;

    const updatedItem = {
      ...(item || {}),
      name,
      price: parsedPrice,
      ...(itemType === 'ingredient' 
        ? { category: category as IngredientCategory } 
        : { code: code }
      )
    } as Ingredient | AnyPizzaOption;

    onSave(updatedItem);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Upravit' : 'Přidat'} {itemType === 'ingredient' ? 'Ingredienci' : 'Variaci'}</h3>
          <button className="modal-close-icon" onClick={onClose}><i className="ph ph-x"></i></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Název:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={nameError ? 'input-error' : ''}
            />
            {nameError && <p className="error-text">{nameError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="price">Cena (Kč):</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={priceError ? 'input-error' : ''}
              step="0.01"
            />
            {priceError && <p className="error-text">{priceError}</p>}
          </div>

          {itemType === 'ingredient' && (
            <div className="form-group">
              <label htmlFor="category">Kategorie:</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as IngredientCategory)}
              >
                {allIngredientCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {itemType === 'option' && (
            <div className="form-group">
              <label htmlFor="code">Kód:</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={validateAndSave} className="btn btn-primary">Uložit</button>
          <button onClick={onClose} className="btn btn-secondary">Zrušit</button>
        </div>
      </div>
    </div>
  );
};

export default AdminIngredientsPage;
