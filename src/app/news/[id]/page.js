'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategoryName } from '@/constants/categories';

const NewsDetailPage = () => {
  const params = useParams();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 대체
        const response = await fetch(`/api/news/${params.id}`);
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('뉴스를 가져오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsDetail();
  }, [params.id]);

  if (isLoading) {
    return (
      <>
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
      </>
    );
  }

  if (!news) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <article className="prose lg:prose-xl mx-auto">
              {/* 카테고리 및 날짜 */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  {getCategoryName(news.category)}
                </span>
                <span>{news.date}</span>
              </div>

              {/* 제목 */}
              <h1 className="text-3xl font-bold mb-6">{news.title}</h1>

              {/* 대표 이미지 */}
              {news.image && (
                <div className="mb-8">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-[400px] object-cover rounded-lg"
                  />
                </div>
              )}

              {/* 본문 */}
              <div className="space-y-6">
                <p className="text-lg text-gray-600">{news.summary}</p>
                <div className="prose prose-lg">
                  {news.content}
                </div>
              </div>

              {/* 관련 뉴스 */}
              {news.relatedNews && news.relatedNews.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <h2 className="text-2xl font-bold mb-6">관련 뉴스</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.relatedNews.map((related) => (
                      <a 
                        key={related.id}
                        href={`/news/${related.id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-[#0E74F9] transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-[120px] md:flex-shrink-0">
                            <img 
                              src={related.image} 
                              alt={related.title}
                              className="w-full h-[80px] object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold hover:text-[#0E74F9] transition-colors">
                              {related.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{related.date}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NewsDetailPage; 