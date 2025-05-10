'use client';

import { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = "검색어를 입력하세요...", isVisible = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('search');
    onSearch(searchQuery);
    // 검색어를 최근 검색어에 추가
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev].slice(0, 10));
    }
  };

  const handleSearchClick = (searchTerm) => {
    onSearch(searchTerm);
    setIsDropdownOpen(false);
  };

  const handleDeleteSearch = (index, e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setRecentSearches(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setRecentSearches([]);
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
      <div className="relative">
        <input
          type="text"
          name="search"
          placeholder={placeholder}
          className="w-full px-4 py-4 text-lg border-4 border-[#0E74F9] rounded-lg focus:outline-none focus:border-[#0E74F9]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-[#0E74F9] hover:text-[#0B5CD6] transition-colors cursor-pointer"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <button
            type="submit"
            className="text-[#0E74F9] hover:text-[#0B5CD6] transition-colors cursor-pointer"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
        </div>
        
        {/* 최근 검색어 드롭다운 */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#0E74F9] rounded-lg shadow-lg z-10">
            <div className="p-2">
              <div className="flex justify-between items-center px-2 py-1">
                <div className="text-sm text-gray-500">최근 검색어</div>
                {recentSearches.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-[#0E74F9] hover:text-[#0B5CD6] transition-colors"
                  >
                    전체 삭제
                  </button>
                )}
              </div>
              {recentSearches.length > 0 ? (
                recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between px-2 py-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <button
                      onClick={() => handleSearchClick(search)}
                      className="flex-1 text-left"
                    >
                      {search}
                    </button>
                    <button
                      onClick={(e) => handleDeleteSearch(index, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  최근 검색어가 없습니다
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar; 