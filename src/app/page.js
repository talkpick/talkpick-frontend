'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLatestNews } from '@/app/api/news/newsListApi';
import NewsList from '@/components/news/NewsList';
import NewsCarousel from '@/components/news/NewsCarousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 5;
  const router = useRouter();

  const fetchNews = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const data = await getLatestNews(pageNumber, PAGE_SIZE);
      setHasNext(data.data.hasNext);
      
      if (isLoadMore) {
        setNews(prev => [...prev, ...data.data.items]);
      } else {
        setNews(data.data.items);
      }
      
      setPageNumber(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleLoadMore = () => {
    fetchNews(true);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <NewsCarousel />
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E74F9] mx-auto mb-4"></div>
              <p className="text-gray-600">최신 뉴스를 불러오는 중입니다...</p>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">에러가 발생했습니다</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        ) : (
          <NewsList 
            news={news} 
            hasNext={hasNext}
            onLoadMore={handleLoadMore}
            isLoading={isLoadingMore}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
