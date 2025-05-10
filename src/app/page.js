'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';

const categories = [
  { id: 'politics', name: '정치' },
  { id: 'economy', name: '경제' },
  { id: 'society', name: '사회' },
  { id: 'international', name: '국제' },
  { id: 'entertainment', name: '연예' },
  { id: 'sports', name: '스포츠' }  
];

// api로 부터 받아올 뉴스데이터
const NewsPreview = ({ category }) => {
  const dummyNews = [
    {
      id: 1,
      title: `${category.name} 관련 최신 뉴스 1`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 2,
      title: `${category.name} 관련 최신 뉴스 2`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 3,
      title: `${category.name} 관련 최신 뉴스 3`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 4,
      title: `${category.name} 관련 최신 뉴스 4`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 5,
      title: `${category.name} 관련 최신 뉴스 5`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    }
  ];

  return (
    <div className="space-y-4">
      {dummyNews.map(news => (
        <div key={news.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex gap-4">
          <div className="flex-shrink-0">
            <img 
              src={news.image} 
              alt={news.title}
              className="w-[200px] h-[150px] object-cover rounded-lg"
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold mb-2">{news.title}</h3>
            <p className="text-gray-600 mb-2">{news.summary}</p>
            <span className="text-sm text-gray-500">{news.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('politics');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* 카테고리 섹션 */}
      <section className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto py-2 border-b border-gray-200">
            {categories.map(category => (
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
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              검색
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        {/* 검색 섹션 */}
        <section className={`transition-all duration-300 ${isSearchVisible ? 'mb-8' : 'mb-0 h-0 overflow-hidden'}`}>
          <div className="max-w-2xl mx-auto">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="뉴스 검색..."
              isVisible={isSearchVisible}
            />
          </div>
        </section>

        {/* 뉴스 미리보기 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-[#0E74F9]">#</span>
            {categories.find(cat => cat.id === selectedCategory)?.name} 뉴스
          </h2>
          <NewsPreview category={categories.find(cat => cat.id === selectedCategory)} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
