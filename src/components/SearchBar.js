'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { CATEGORY_LIST, getCategoryName } from '@/constants/categories';

const SearchBar = ({ placeholder = "뉴스 검색", isVisible = false }) => {
  const router = useRouter();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('search');
    
    if (searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.target.closest('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
      <div className="space-y-2">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <div className="relative">
              <button 
                type="button" 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={handleSearch}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                name="search"
                autoComplete='off'
                placeholder={placeholder}
                className="w-full h-12 pl-12 pr-4 text-lg border-2 border-[#0E74F9] rounded-lg focus:outline-none focus:border-[#0E74F9]"
              />
            </div>
          </div>

          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2 px-3 h-12 text-md border-2 border-[#0E74F9] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>{getCategoryName(selectedCategory)}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white border-2 border-[#0E74F9] rounded-lg shadow-lg z-20">
                {CATEGORY_LIST.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left hover:bg-gray-100 transition-colors text-md ${
                      selectedCategory === category.id ? 'bg-gray-50 text-[#0E74F9]' : ''
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchBar; 