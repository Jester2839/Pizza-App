import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) && 
        searchQuery.trim() === ''
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, searchQuery]);

  return (
    <div 
      className={`search-bar-container ${isOpen ? 'open' : ''}`} 
      ref={containerRef}
    >
      <i 
        className="ph ph-magnifying-glass search-icon" 
        onClick={handleToggle}
        title="Vyhledat"
      />
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder="Hledat pizzu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <i 
            className="ph ph-x clear-search" 
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
          />
        )}
      </div>
    </div>
  );
}
