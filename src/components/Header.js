'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SearchIcon from './icons/SearchIcon';
import SearchBar from './SearchBar';
import { CATEGORY_LIST } from '@/constants/categories';
import BaseHeader from './BaseHeader';

const Header = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const categories = [
    { id: 'all', name: '전체', path: '/' },
    { id: 'dashboard', name: '대시보드', path: '/dashboard' },
    { id: 'news', name: '분야별 뉴스', path: '/news' }
  ];

  // 현재 경로에 따라 활성화된 카테고리 설정
  useEffect(() => {
    if (pathname === '/') {
      setSelectedCategory('all');
      setShowSubCategories(false);
    } else if (pathname === '/dashboard') {
      setSelectedCategory('dashboard');
      setShowSubCategories(false);
    } else if (pathname.startsWith('/search')) {
      setIsSearchVisible(true);
      setShowSubCategories(false);
      setSelectedCategory(null);
    } else if (pathname.startsWith('/news/category/')) {
      setSelectedCategory('news');
      setShowSubCategories(true);
      // URL에서 카테고리 ID 추출
      const categoryId = pathname.split('/news/category/')[1];
      setSelectedSubCategory(categoryId);
    }
  }, [pathname]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === 'all') {
      router.push('/');
      setShowSubCategories(false);
      setIsSearchVisible(false);
    } else if (categoryId === 'dashboard') {
      router.push('/dashboard');
      setShowSubCategories(false);
      setIsSearchVisible(false);
    } else if (categoryId === 'news') {
      setShowSubCategories(true);
      setIsSearchVisible(false);
    }
  };

  const handleSubCategoryClick = (categoryId) => {
    setSelectedSubCategory(categoryId);
    router.push(`/news/category/${categoryId}`);
  };

  const handleSearchClick = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setShowSubCategories(false);
      setSelectedCategory(null);
    }
  };

  return (
    <BaseHeader>
      {/* 카테고리 섹션 */}
      <div>
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto py-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`relative pb-1 font-semibold text-base transition-all duration-300 whitespace-nowrap
                  ${selectedCategory === category.id
                    ? 'text-[#0E74F9]'
                    : 'text-gray-800 hover:text-[#0E74F9]'}
                `}
                style={{ background: 'none' }}
              >
                {category.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#0E74F9] transform transition-transform duration-300
                  ${selectedCategory === category.id ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            ))}
            <button
              onClick={handleSearchClick}
              className={`relative pb-1 font-semibold text-base transition-all duration-300 whitespace-nowrap flex items-center gap-1
                ${isSearchVisible
                  ? 'text-[#0E74F9]'
                  : 'text-gray-800 hover:text-[#0E74F9]'}
              `}
              style={{ background: 'none' }}
            >
              <SearchIcon className="w-4 h-4" />
              검색
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#0E74F9] transform transition-transform duration-300
                ${isSearchVisible ? 'scale-x-100' : 'scale-x-0'}`}
              />
            </button>
          </div>

          {/* 하위 카테고리 섹션 */}
          {showSubCategories && (
            <div className="py-2 bg-gray-50">
              <div className="flex gap-6 overflow-x-auto">
                {CATEGORY_LIST.filter(category => category.id !== 'all').map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleSubCategoryClick(category.id)}
                    className={`relative pb-1 font-medium text-sm transition-all duration-300 whitespace-nowrap
                      ${selectedSubCategory === category.id
                        ? 'text-[#0E74F9]'
                        : 'text-gray-600 hover:text-[#0E74F9]'}
                    `}
                    style={{ background: 'none' }}
                  >
                    {category.name}
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#0E74F9] transform transition-transform duration-300
                      ${selectedSubCategory === category.id ? 'scale-x-100' : 'scale-x-0'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 검색 섹션 */}
          <div className={`transition-all duration-300 ${isSearchVisible ? 'py-4' : 'h-0 overflow-hidden'}`}>
            <div className="w-full mx-auto">
              <SearchBar 
                onSearch={(query) => console.log('Search:', query)}
                isVisible={isSearchVisible}
              />
            </div>
          </div>
        </div>
      </div>
    </BaseHeader>
  );
};

export default Header; 