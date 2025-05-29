'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLatestNews, getTopViewedNews, getSimilarNews } from '@/app/api/news/newsListApi';
import NewsList from '@/components/news/NewsList';
import NewsCarousel from '@/components/news/NewsCarousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [carouselNews, setCarouselNews] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const PAGE_SIZE = 5;
  const router = useRouter();

  const fetchCarouselNews = async () => {
    try {
      setCarouselLoading(true);
      
      // 1. Top Viewed News 가져오기 (나중에는 Hot News도 추가)
      const topNews = await getTopViewedNews("all");
      // console.log(topNews);
      const carouselGroups = [];

      if (topNews.data) {
        const mainNews = topNews.data;
        console.log(mainNews);
        const similarNewsData = await getSimilarNews(mainNews.guid);
        console.log(similarNewsData);
        
        carouselGroups.push({
          mainNews,
          relatedNews: similarNewsData.data?.newsSearchResponseList.slice(1, 4) || []
        });
      }
      console.log(carouselGroups);

      setCarouselNews(carouselGroups);
    } catch (err) {
      setError(err.message);
    } finally {
      setCarouselLoading(false);
    }
  };

  const fetchNews = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const data = await getLatestNews(lastId, PAGE_SIZE);
      setHasNext(data.data.hasNext);
      
      if (isLoadMore) {
        setNews(prev => [...prev, ...data.data.items]);
      } else {
        setNews(data.data.items);
      }
      setLastId(prev => data.data.items[data.data.items.length - 1].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCarouselNews();
  }, []);

  const handleLoadMore = () => {
    fetchNews(true);
  };

  useInfiniteScroll(handleLoadMore, hasNext, isLoadingMore);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <NewsCarousel 
          carouselGroups={carouselNews}
          loading={carouselLoading}
        />
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
          <>
            <hr className="my-8 border-gray-500" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-1">
              <span className="text-blue-500 text-3xl"># </span>최신뉴스
            </h2>
            <NewsList 
              news={news} 
              hasNext={hasNext}
              onLoadMore={handleLoadMore}
              isLoading={isLoadingMore}
            />
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
