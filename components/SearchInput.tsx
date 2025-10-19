import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSuggestions } from '../services/searchService';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  disabled: boolean;
  suggestionsEnabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onSearch, disabled, suggestionsEnabled = true }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim() === '' || !suggestionsEnabled) {
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
  }, [value, suggestionsEnabled]);

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
        onFocus={() => suggestionsEnabled && value.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="Type and press Enter..."
        disabled={disabled}
        className="w-full py-3 px-5 text-base bg-white dark:bg-[#161b22] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-full outline-none focus:border-blue-500 dark:focus:border-[#58a6ff] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 focus:shadow-md transition-all duration-200 disabled:opacity-50"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
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