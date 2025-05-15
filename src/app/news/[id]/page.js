'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategorySection from '@/components/CategorySection';
import parse from 'html-react-parser';
import { getCategoryId } from '@/constants/categories';


const NewsDetailPage = () => {
  const params = useParams();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchNewsDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/news/${params.id}`);
      if (!response.ok) {
        throw new Error(response.data.message);
      }
      const { data } = await response.json();
      // API 응답 데이터를 프론트엔드 형식에 맞게 변환
      const newsData = {
        id: data.newsId,
        title: data.title,
        category: data.category,
        content: data.content,
        date: new Date(data.publishDate).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        originLink: data.originLink
      };
      
      setNews(newsData);
      setSelectedCategory(getCategoryId(data.category));
    } catch (error) {
      console.error('뉴스를 가져오는데 실패했습니다:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsDetail();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0E74F9]"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  뉴스를 찾을 수 없습니다.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* <CategorySection 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      /> */}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="prose lg:prose-xl mx-auto">
            {/* 카테고리 및 날짜 */}
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-2 bg-gray-100 rounded-full text-base font-medium text-gray-700">
                {news.category}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-3xl font-bold mb-2">{news.title}</h1>
            
            {/* 날짜 */}
            <p className="text-sm text-gray-500 mb-6">{news.date}</p>

            {/* 본문 */}
            <div className="space-y-6">
              <div className="prose prose-lg">
                {parse(news.content)}
              </div>
            </div>

            {/* 원문 링크 */}
            {news.originLink && (
              <div className="flex justify-end mt-8">
                <a 
                  href={news.originLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#0E74F9] hover:underline flex items-center gap-1"
                >
                  원문 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetailPage; 