'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategorySection from '../components/CategorySection';
import { CATEGORY_LIST, getCategoryName } from '@/constants/categories';

// api로 부터 받아올 뉴스데이터
const NewsPreview = ({ category }) => {
  const dummyNews = [
    {
      id: 1,
      title: `${category.name} 관련 최신 뉴스 1`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      category: category.name,
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 2,
      title: `${category.name} 관련 최신 뉴스 2`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      category: category.name,
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 3,
      title: `${category.name} 관련 최신 뉴스 3`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      category: category.name,
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 4,
      title: `${category.name} 관련 최신 뉴스 4`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      category: category.name,
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 5,
      title: `${category.name} 관련 최신 뉴스 5`,
      summary: '뉴스 요약 내용이 들어갈 자리입니다...',
      category: category.name,
      date: '2025-05-10',
      image: 'https://picsum.photos/200/150'
    }
  ];

  return (
    <div className="space-y-4">
      {dummyNews.map(news => (
        <a 
          key={news.id}
          href={`/news/${news.id}`}
          className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#0E74F9]"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[200px] md:flex-shrink-0">
              <img 
                src={news.image} 
                alt={news.title}
                className="w-full h-[150px] object-cover rounded-lg"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold mb-2 hover:text-[#0E74F9] transition-colors">{news.title}</h3>
              <p className="text-gray-600 mb-2">{news.summary}</p>
              <p className="text-gray-600 mb-2">{news.category}</p>
              <span className="text-sm text-gray-500">{news.date}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('politics');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <CategorySection 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main className="container mx-auto px-4 py-8">
        {/* 뉴스 미리보기 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-[#0E74F9]">#</span>
            {getCategoryName(selectedCategory)} 뉴스
          </h2>
          <NewsPreview category={{ id: selectedCategory, name: getCategoryName(selectedCategory) }} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
