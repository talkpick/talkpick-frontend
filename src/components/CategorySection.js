'use client';

import { useState } from 'react';
import { CATEGORY_LIST } from '@/constants/categories';
import SearchIcon from './icons/SearchIcon';
import SearchBar from './SearchBar';

const CategorySection = ({ 
  selectedCategory, 
  setSelectedCategory
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query, category) => {
    console.log('Searching for:', query, 'in category:', category);
    setSearchQuery(query);
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-6 overflow-x-auto py-2 border-b border-gray-200">
          {CATEGORY_LIST.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`pb-1 font-semibold text-base border-b-2 transition-all duration-150 whitespace-nowrap
                ${selectedCategory === category.id
                  ? 'text-[#0E74F9] border-[#0E74F9]'
                  : 'text-gray-800 border-transparent hover:text-[#0E74F9]'}
              `}
              style={{ background: 'none' }}
            >
              {category.name}
            </button>
          ))}
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="pb-1 font-semibold text-base border-b-2 transition-all duration-150 whitespace-nowrap text-gray-800 border-transparent hover:text-[#0E74F9] flex items-center gap-1"
            style={{ background: 'none' }}
          >
            <SearchIcon className="w-4 h-4" />
            검색
          </button>
        </div>

        {/* 검색 섹션 */}
        <div className={`transition-all duration-300 ${isSearchVisible ? 'py-4' : 'h-0 overflow-hidden'}`}>
          <div className="max-w-2xl mx-auto">
            <SearchBar 
              onSearch={handleSearch}
              isVisible={isSearchVisible}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection; 