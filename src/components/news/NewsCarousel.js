import { useState, useEffect } from 'react';

const mockCarouselData = [
  {
    mainNews: {
      id: 1,
      title: "주요 뉴스 제목 1",
      summary: "주요 뉴스 요약 내용입니다.",
      imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
      date: "2024-03-20"
    },
    relatedNews: [
      {
        id: 2,
        title: "관련 뉴스 1",
        summary: "관련 뉴스 요약 1",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      },
      {
        id: 3,
        title: "관련 뉴스 2",
        summary: "관련 뉴스 요약 2",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      },
      {
        id: 4,
        title: "관련 뉴스 3",
        summary: "관련 뉴스 요약 3",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      }
    ]
  },
  {
    mainNews: {
      id: 5,
      title: "주요 뉴스 제목 2",
      summary: "주요 뉴스 요약 내용입니다.",
      imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
      date: "2024-03-20"
    },
    relatedNews: [
      {
        id: 6,
        title: "관련 뉴스 4",
        summary: "관련 뉴스 요약 4",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      },
      {
        id: 7,
        title: "관련 뉴스 5",
        summary: "관련 뉴스 요약 5",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      },
      {
        id: 8,
        title: "관련 뉴스 6",
        summary: "관련 뉴스 요약 6",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      }
    ]
  },
  {
    mainNews: {
      id: 9,
      title: "주요 뉴스 제목 3",
      summary: "주요 뉴스 요약 내용입니다.",
      imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
      date: "2024-03-20"
    },
    relatedNews: [
      {
        id: 10,
        title: "관련 뉴스 7",
        summary: "관련 뉴스 요약 7",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      },
      {
        id: 11,
        title: "관련 뉴스 8",
        summary: "관련 뉴스 요약 8",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      },
      {
        id: 12,
        title: "관련 뉴스 9",
        summary: "관련 뉴스 요약 9",
        imageUrl: "https://img.imbc.com/broad/radio/fm4u/mbcdate/img/weather.jpg",
        date: "2024-03-20"
      }
    ]
  }
];

export default function NewsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % mockCarouselData.length);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + mockCarouselData.length) % mockCarouselData.length);
  };

  // 자동 전환을 위한 useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // 5초마다 전환

    return () => clearInterval(timer);
  }, []);

  // 전환 애니메이션 완료 후 isTransitioning 상태 초기화
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // transition duration과 동일하게 설정

    return () => clearTimeout(timer);
  }, [currentSlide]);

  return (
    <div className="relative w-full h-[500px] bg-white mb-8 overflow-hidden group">
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {mockCarouselData.map((slide, index) => (
          <div key={index} className="flex h-full min-w-full">
            {/* 메인 뉴스 */}
            <div className="w-1/2 p-4">
              <div className="relative h-full rounded-lg overflow-hidden">
                <img
                  src={slide.mainNews.imageUrl}
                  alt={slide.mainNews.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                  <h2 className="text-2xl font-bold mb-2">{slide.mainNews.title}</h2>
                  <p className="text-sm">{slide.mainNews.summary}</p>
                </div>
              </div>
            </div>

            {/* 관련 뉴스 */}
            <div className="w-1/2 p-4">
              <div className="grid grid-cols-1 gap-4 h-full">
                {slide.relatedNews.map((news) => (
                  <div key={news.id} className="flex gap-4 bg-gray-50 rounded-lg overflow-hidden">
                    <div className="relative w-1/3 h-24">
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-2">
                      <h3 className="font-semibold text-sm mb-1">{news.title}</h3>
                      <p className="text-xs text-gray-600">{news.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {mockCarouselData.map((_, index) => (
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
    </div>
  );
} 