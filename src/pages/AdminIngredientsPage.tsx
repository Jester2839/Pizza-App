import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchIngredients, createIngredient, updateIngredient, deleteIngredient, createPizzaOption,
  fetchPizzaOptions, updatePizzaOption, deletePizzaOption
} from '../services/api';
import type { Ingredient, IngredientCategory, Dough, Base, Edge, PizzaOption, IngredientCategoryGroup } from '../types';
import { useAlert } from '../hooks/useAlert';
import { AdminModal } from '../components/AdminModal';

interface PizzaOptionGroup<T extends PizzaOption> {
  type: string;
  items: T[];
}

type AnyPizzaOption = Dough | Base | Edge;

const INGREDIENT_CATEGORIES: { value: IngredientCategory; label: string }[] = [
  { value: 'MASO', label: 'Maso' },
  { value: 'SÝRY', label: 'Sýry' },
  { value: 'ZELNINA, OVOCE', label: 'Zelenina a ovoce' },
  { value: 'DIPY', label: 'Dipy' },
];

const AdminIngredientsPage: React.FC = () => {
  const [ingredientGroups, setIngredientGroups] = useState<IngredientCategoryGroup[]>([]);
  const [pizzaOptionDoughs, setPizzaOptionDoughs] = useState<PizzaOptionGroup<Dough>>({ type: 'Dough', items: [] });
  const [pizzaOptionBases, setPizzaOptionBases] = useState<PizzaOptionGroup<Base>>({ type: 'Base', items: [] });
  const [pizzaOptionEdges, setPizzaOptionEdges] = useState<PizzaOptionGroup<Edge>>({ type: 'Edge', items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showAlert } = useAlert();

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
  const handleDeleteClick = (item: Ingredient | AnyPizzaOption, type: 'ingredient' | 'option', category?: 'dough' | 'base' | 'edge') => {
    setItemToDelete(item);
    setItemTypeToDelete(type);
    if (category) setOptionCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !itemTypeToDelete) return;
    const apiTypeMap = { dough: 'doughs', base: 'bases', edge: 'edges' };

    try {
      if (itemTypeToDelete === 'ingredient' && 'id' in itemToDelete) {
        await deleteIngredient(itemToDelete.id);
      } else if (itemTypeToDelete === 'option' && 'id' in itemToDelete && optionCategory) {
        const apiType = apiTypeMap[optionCategory];
        await deletePizzaOption({ type: apiType, id: itemToDelete.id } as any);
      }
      fetchData(); // Refresh data
      setShowDeleteModal(false);
      setItemToDelete(null);
      setItemTypeToDelete(null);
    } catch (err: any) {
      const errorMsg = err.message || '';
      if (errorMsg.includes('1451')) {
        showAlert('Tuto ingredienci nelze smazat, protože je součástí existujících objednávek. Nejdříve smažte dané objednávky nebo ingredienci jen přejmenujte.', 'Nelze smazat');
      } else {
        showAlert('Nepodařilo se smazat položku. Zkuste to prosím znovu.', 'Chyba');
      }
      console.error(err);
    }
  };

  // Handle Edit
  const handleEditClick = (item: Ingredient | AnyPizzaOption, type: 'ingredient' | 'option', category?: 'dough' | 'base' | 'edge') => {
    setItemToEdit(item);
    setItemTypeToEdit(type);
    if (category) setOptionCategory(category);
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
    const apiTypeMap = { dough: 'doughs', base: 'bases', edge: 'edges' };

    try {
      if (itemTypeToEdit === 'ingredient') {
        if ('id' in updatedItem && updatedItem.id) {
          await updateIngredient(updatedItem as Ingredient);
        } else {
          const { id, ...newIngredient } = updatedItem as any;
          await createIngredient(newIngredient);
        }
      } else if (itemTypeToEdit === 'option' && optionCategory) {
        const apiType = apiTypeMap[optionCategory];
        
        // Sestavení payloadu podle tvých příkladů
        const payload: any = {
          type: apiType,
          code: (updatedItem as AnyPizzaOption).code,
          name: (updatedItem as any).name || (updatedItem as any).displayName,
          price: updatedItem.price,
        };

        // Pokud jde o okraj, přidáme displayName
        if (optionCategory === 'edge') {
          payload.displayName = (updatedItem as any).displayName || payload.name;
        }

        if ('id' in updatedItem && updatedItem.id) {
          payload.id = updatedItem.id;
          await updatePizzaOption(payload);
        } else {
          await createPizzaOption(payload);
        }
      }
      fetchData(); // Refresh data
      setShowEditModal(false);
      setItemToEdit(null);
      setItemTypeToEdit(null);
      setOptionCategory(null);
    } catch (err) {
      showAlert('Nepodařilo se aktualizovat položku. Zkontrolujte konzoli.', 'Chyba');
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
  const renderListItem = (item: Ingredient | AnyPizzaOption, type: 'ingredient' | 'option', category?: 'dough' | 'base' | 'edge') => (
    <li key={item.id} className="ingredient-card">
      <div className="ingredient-card__info">
        <span className="ingredient-card__name">{(item as any).name || (item as any).displayName}</span>
        <span className="ingredient-card__price">{item.price} Kč</span>
        {'code' in item && <span className="ingredient-card__code">(kód: {item.code})</span>}
      </div>
      <div className="ingredient-card__actions">
        <button onClick={() => handleEditClick(item, type, category)} className="btn btn-secondary" title="Upravit">
          <i className="ph ph-pencil-simple"></i>
        </button>
        <button onClick={() => handleDeleteClick(item, type, category)} className="btn btn-danger" title="Smazat">
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
      <div className="admin-page">
        <div className="admin-page__header">
           <h1>Správa Ingrediencí a Variací</h1>
           <button className="btn btn-primary" onClick={() => fetchData()}>
             <i className="ph ph-arrows-clockwise"></i> Aktualizovat
           </button>
        </div>

        <section className="admin-section">
          <h2 className="admin-section__title"><i className="ph ph-sliders"></i> Variace Pizz</h2>
          <div className="pizza-options-grid">
            <div className="pizza-option-group">
              <div className="group-header">
                <h3>Těsta</h3>
                <button onClick={() => handleAddClick('option', 'dough')} className="btn btn-primary"><i className="ph ph-plus"></i></button>
              </div>
              <ul className="admin-list">
                {pizzaOptionDoughs.items.map(dough => renderListItem(dough, 'option', 'dough'))}
              </ul>
            </div>
            <div className="pizza-option-group">
              <div className="group-header">
                <h3>Základy</h3>
                <button onClick={() => handleAddClick('option', 'base')} className="btn btn-primary"><i className="ph ph-plus"></i></button>
              </div>
              <ul className="admin-list">
                {pizzaOptionBases.items.map(base => renderListItem(base, 'option', 'base'))}
              </ul>
            </div>
            <div className="pizza-option-group">
              <div className="group-header">
                <h3>Okraje</h3>
                <button onClick={() => handleAddClick('option', 'edge')} className="btn btn-primary"><i className="ph ph-plus"></i></button>
              </div>
              <ul className="admin-list">
                {pizzaOptionEdges.items.map(edge => renderListItem(edge, 'option', 'edge'))}
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
                <h3>{INGREDIENT_CATEGORIES.find(c => c.value === group.category)?.label || group.category}</h3>
                <ul className="admin-list">
                  {group.items.map(ingredient => renderListItem(ingredient, 'ingredient'))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        <AdminModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Potvrzení smazání"
          footer={
            <>
              <button onClick={confirmDelete} className="btn btn-danger">Smazat</button>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Zrušit</button>
            </>
          }
        >
          <p>
            Opravdu chcete smazat položku <strong>{(itemToDelete as any)?.name || (itemToDelete as any)?.displayName}</strong>?
          </p>
        </AdminModal>

        {/* Edit/Create Modal */}
        {showEditModal && (
          <EditItemModal
            item={itemToEdit}
            itemType={itemTypeToEdit!}
            onSave={handleSaveEdit}
            onClose={handleCloseEditModal}
            optionCategory={optionCategory}
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
  optionCategory?: 'dough' | 'base' | 'edge' | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, itemType, onSave, onClose, optionCategory }) => {
  // Podpora pro name i displayName (u okrajů)
  const initialName = (item as any)?.displayName || (item as any)?.name || '';
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(item?.price.toString() || '0');
  const [category, setCategory] = useState(itemType === 'ingredient' ? (item as Ingredient)?.category || 'MASO' : 'MASO');

  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

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

    // Automaticky generujeme kód z názvu (slug) pro zajištění integrity DB
    const finalCode = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const updatedItem = {
      ...(item || {}),
      // Pokud je to okraj a má displayName, aktualizujeme ten, jinak name
      ...((item as any)?.displayName !== undefined || optionCategory === 'edge'
        ? { displayName: name } 
        : { name: name }
      ),
      price: parsedPrice,
      code: finalCode,
      ...(itemType === 'ingredient' && { category: category as IngredientCategory })
    } as Ingredient | AnyPizzaOption;

    onSave(updatedItem);
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title={`${item ? 'Upravit' : 'Přidat'} ${itemType === 'ingredient' ? 'Ingredienci' : 'Variaci'}`}
      footer={
        <>
          <button onClick={validateAndSave} className="btn btn-primary">Uložit</button>
          <button onClick={onClose} className="btn btn-secondary">Zrušit</button>
        </>
      }
    >
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
            {INGREDIENT_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      )}

    </AdminModal>
  );
};

export default AdminIngredientsPage;
