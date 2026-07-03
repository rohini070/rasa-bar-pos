import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  type: string;
}

interface SearchableDropdownProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  placeholder?: string;
  value?: string;
}

export default function SearchableDropdown({ items, onSelect, placeholder = "Search item...", value = "" }: SearchableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fuzzy search function
  const fuzzyMatch = (text: string, query: string): boolean => {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    let queryIndex = 0;
    let textIndex = 0;

    while (queryIndex < queryLower.length && textIndex < textLower.length) {
      if (queryLower[queryIndex] === textLower[textIndex]) {
        queryIndex++;
      }
      textIndex++;
    }

    return queryIndex === queryLower.length;
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(items.slice(0, 10));
    } else {
      const filtered = items.filter(item => 
        fuzzyMatch(item.name, searchTerm) || 
        fuzzyMatch(item.category, searchTerm)
      );
      setFilteredItems(filtered.slice(0, 10));
    }
    setSelectedIndex(-1);
  }, [searchTerm, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
          handleSelect(filteredItems[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (item: MenuItem) => {
    setSearchTerm(item.name);
    setIsOpen(false);
    onSelect(item);
  };

  const clearSelection = () => {
    setSearchTerm("");
    setIsOpen(true);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border p-2 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
          <Search size={18} className="text-gray-400" />
        </div>
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <p className="font-bold text-green-600">₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredItems.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No items found
        </div>
      )}
    </div>
  );
}
