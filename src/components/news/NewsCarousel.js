import { useState, useEffect } from 'react';
import Link from 'next/link';
import { truncateText } from '@/lib/utils';

// 이미지 URL에서 사이즈 정보 제거하는 함수
const removeImageSize = (url) => {
  if (!url) return url;
  // /i/숫자/숫자/숫자 패턴을 찾아서 제거
  return url.replace(/\/i\/\d+\/\d+\/\d+/, '');
};

export default function NewsCarousel({ carouselGroups = [], loading = false }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = () => {
    if (isTransitioning || carouselGroups.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % carouselGroups.length);
  };

  const prevSlide = () => {
    if (isTransitioning || carouselGroups.length <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + carouselGroups.length) % carouselGroups.length);
  };

  // 자동 전환을 위한 useEffect
  useEffect(() => {
    if (carouselGroups.length <= 1) return;
    
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // 5초마다 전환

    return () => clearInterval(timer);
  }, [carouselGroups.length]);

  // 전환 애니메이션 완료 후 isTransitioning 상태 초기화
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // transition duration과 동일하게 설정

    return () => clearTimeout(timer);
  }, [currentSlide]);

  if (loading) {
    return (
      <div className="relative w-full h-[500px] bg-white mb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E74F9] mx-auto mb-4"></div>
          <p className="text-gray-600">뉴스를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (carouselGroups.length === 0) {
    return (
      <div className="relative w-full h-[500px] bg-white mb-8 flex items-center justify-center">
        <p className="text-gray-600">표시할 뉴스가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-auto md:h-[500px] bg-white mb-8 overflow-hidden group">
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselGroups.map((group, index) => (
          <div key={index} className="flex h-full min-w-full flex-col md:flex-row">
            {/* 메인 뉴스 */}
            <div className="w-full md:w-1/2 p-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-1">
                <span className="text-blue-500 text-3xl"># </span>인기뉴스
              </h2>
              <Link href={`/news/detail/${group.mainNews.guid}`} className="block relative h-[250px] md:h-[calc(100%-3rem)] rounded-lg overflow-hidden hover:ring-2 hover:ring-[#0E74F9] transition-all">
                {group.mainNews.imageUrl ? (
                  <>
                    <img
                      src={removeImageSize(group.mainNews.imageUrl)}
                      alt={group.mainNews.title}
                      className="w-auto h-auto object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                      <h2 className="text-2xl font-bold mb-2">{group.mainNews.title}</h2>
                      <p className="text-sm">{truncateText(JSON.parse(group.mainNews.description).join(''), 80)}</p>
                    </div>
                  </>
                ) : (
                  <div className="h-full bg-gray-50 p-4 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">{group.mainNews.title}</h2>
                    <p className="text-sm text-gray-600">{truncateText(JSON.parse(group.mainNews.description).join(''), 80)}</p>
                  </div>
                )}
              </Link>
            </div>

            {/* 관련 뉴스 */}
            <div className="w-full md:w-1/2 p-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-1">
                <span className="text-blue-500 text-3xl"># </span>연관뉴스
              </h2>
              <div className="flex flex-col gap-3 h-auto md:h-[calc(100%-3rem)]">
                {group.relatedNews.map((news) => (
                  <Link key={news.newsId} href={`/news/detail/${news.newsId}`} className="block h-[120px] md:flex-1">
                    <div className={`flex gap-4 bg-gray-50 rounded-lg overflow-hidden hover:ring-2 hover:ring-[#0E74F9] transition-all h-full ${!news.imageUrl ? 'p-4' : ''}`}>
                      {news.imageUrl && (
                        <div className="relative w-1/3">
                          <img
                            src={removeImageSize(news.imageUrl)}
                            alt={news.title}
                            className="w-auto h-auto object-cover absolute inset-0"
                          />
                        </div>
                      )}
                      <div className={`${news.imageUrl ? 'w-2/3 p-2' : 'w-full'} flex flex-col justify-center`}>
                        <h3 className="text-sm md:text-base font-bold mb-1 md:mb-2 text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">{news.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{truncateText(JSON.parse(news.content).join(''), 80)}</p>
                        <p className="text-xs text-gray-500 mt-1">{news.date}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {carouselGroups.length > 1 && (
        <>
          {/* 네비게이션 버튼 */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              <path 
                d="M15 18L9 12L15 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              <path 
                d="M9 6L15 12L9 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {carouselGroups.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentSlide(index);
                  }
                }}
                disabled={isTransitioning}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 