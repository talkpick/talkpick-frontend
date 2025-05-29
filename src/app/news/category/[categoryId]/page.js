'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLatestNewsByCategory, getTopViewedNews, getSimilarNews } from '@/app/api/news/newsListApi';
import NewsList from '@/components/news/NewsList';
import NewsCarousel from '@/components/news/NewsCarousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function CategoryNewsPage() {
  const params = useParams();
  const categoryId = params.categoryId;
  
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [carouselNews, setCarouselNews] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const PAGE_SIZE = 5;

  const fetchCarouselNews = async () => {
    try {
      setCarouselLoading(true);
      
      // 해당 카테고리의 Top Viewed News 가져오기
      const topNews = await getTopViewedNews(categoryId);
      const carouselGroups = [];

      if (topNews.data?.items) {
        const mainNews = topNews.data.items;
        const similarNewsData = await getSimilarNews(mainNews.guid);
        
        carouselGroups.push({
          mainNews,
          relatedNews: similarNewsData.data?.items || []
        });
      }

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
      
      const data = await getLatestNewsByCategory(categoryId, lastId, PAGE_SIZE);
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
    // fetchCarouselNews();
  }, [categoryId]);

  const handleLoadMore = () => {
    fetchNews(true);
  };

  useInfiniteScroll(handleLoadMore, hasNext, isLoadingMore);

  return (
    <>
      <Header selectedCategory={categoryId} />
      <div className="container mx-auto px-4 py-8">
        {/* <NewsCarousel 
          carouselGroups={carouselNews}
          loading={carouselLoading}
        /> */}
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E74F9] mx-auto mb-4"></div>
              <p className="text-gray-600">뉴스를 불러오는 중입니다...</p>
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
