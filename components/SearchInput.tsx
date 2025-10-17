import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSuggestions } from '../services/searchService';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  disabled: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onSearch, disabled }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handler = setTimeout(async () => {
      const fetchedSuggestions = await fetchSuggestions(value);
      setSuggestions(fetchedSuggestions);
      setShowSuggestions(fetchedSuggestions.length > 0);
      setActiveIndex(-1);
    }, 250); // Debounce delay

    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      onChange(query);
      setShowSuggestions(false);
      onSearch(query.trim());
    }
  }, [onSearch, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const searchQuery = activeIndex >= 0 ? suggestions[activeIndex] : value;
        handleSearch(searchQuery);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Escape') {
        setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        id="searchBox"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="Type and press Enter..."
        disabled={disabled}
        className="w-full p-3 text-base bg-white dark:bg-[#161b22] text-gray-900 dark:text-white border-2 border-gray-300 dark:border-[#444] rounded-full outline-none focus:border-blue-500 dark:focus:border-[#58a6ff] transition-colors disabled:opacity-50"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-[#444] rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`px-4 py-2 cursor-pointer text-left ${activeIndex === index ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-[#1f2937]'}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSearch(suggestion);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchInput;