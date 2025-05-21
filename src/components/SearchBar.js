'use client';

import { useRouter } from 'next/navigation';
import SearchIcon from './icons/SearchIcon';

const SearchBar = ({ placeholder = "뉴스 검색", isVisible = false }) => {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('search');
    
    if (searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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
      <div className="w-full">
        <div className="relative">
          <div className="relative">
            <button 
              type="button" 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleSearch}
            >
              <SearchIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              name="search"
              autoComplete='off'
              placeholder={placeholder}
              className="w-full h-12 pl-14 pr-6 text-lg border-2 border-[#0E74F9] rounded-lg focus:outline-none focus:border-[#0E74F9]"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchBar; 