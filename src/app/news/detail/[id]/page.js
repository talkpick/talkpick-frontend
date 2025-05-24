'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import parse from 'html-react-parser';
import { getCategoryId } from '@/constants/categories';
import { getNewsDetail } from '@/app/api/news/detail/[id]/newsDetailApi';

// 이미지 URL에서 사이즈 정보 제거하는 함수
const removeImageSize = (url) => {
  if (!url) return url;
  // /i/숫자/숫자/숫자 패턴을 찾아서 제거
  return url.replace(/\/i\/\d+\/\d+\/\d+/, '');
};

const NewsDetailPage = () => {
  const params = useParams();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const fetchNewsDetail = async () => {
    setIsLoading(true);
    try {
      const response = await getNewsDetail(params.id);

      console.log(response);
      const data = response.data;
      // API 응답 데이터를 프론트엔드 형식에 맞게 변환
      const newsData = {
        id: data.newsId,
        title: data.title,
        category: data.category,
        summary: data.summary,
        content: data.content,
        imageUrl: removeImageSize(data.imageUrl),
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

  // content를 문단별로 나누는 함수
  const parseContent = (content) => {
    try {
      // 문자열을 파싱하여 배열로 변환
      const paragraphs = JSON.parse(content);
      
      // 각 문단을 p 태그로 감싸서 반환
      return paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 leading-relaxed text-lg">
          {parse(paragraph)}
        </p>
      ));
    } catch (error) {
      console.error('Content 파싱 중 오류 발생:', error);
      // 파싱 실패 시 원본 content를 그대로 반환
      return <p className="mb-4 leading-relaxed text-lg">{parse(content)}</p>;
    }
  };
  
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
            <h1 className="text-3xl font-bold mb-2">{parse(news.title)}</h1>
            
            {/* 날짜 및 요약보기 버튼 */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">{news.date}</p>
              <button
                onClick={() => setIsSummaryOpen(true)}
                className="px-4 py-2 bg-white text-[#0E74F9] border border-[#0E74F9] rounded-lg hover:bg-[#0E74F9] hover:text-white transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                요약보기
              </button>
            </div>

            {/* 이미지 */}
            {news.imageUrl && (
              <div className="mb-8 flex justify-center">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* 본문 */}
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                {parseContent(news.content)}
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

      {/* 요약 팝업 */}
      {isSummaryOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 rounded-lg p-6 max-w-2xl w-full mx-4 relative shadow-xl">
            <button
              onClick={() => setIsSummaryOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-[#0E74F9]">요약</h2>
            <div className="prose prose-lg">
              <p className="text-gray-700 leading-relaxed">{news.summary}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default NewsDetailPage; 