'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getScrapList } from '@/app/api/dashboard/scrapListApi';
import HighlightedText from '@/components/HighlightedText';

const ITEMS_PER_PAGE = 6;

export default function DashboardPage() {
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState(null);
  const [highlights, setHighlights] = useState({});

  useEffect(() => {
    getScrapList()
      .then(data => {
        setScraps(data.data || []);

        const highlightMap = {};
        data.data?.forEach(item => {
          if (item.highlights && item.highlights.length > 0) {
            highlightMap[item.newsId] = item.highlights;
          }
        });
        setHighlights(highlightMap);
        setLoading(false);
      })
      .catch(() => {
        setScraps([]);
        setLoading(false);
      });
  }, []);


  const parseContent = (content, highlights) => {
    const renderText = (text, key = 0) => {
      const paragraphHighlights = highlights.filter(h => h.paragraphIndex === key)
        .map(h => ({
          start: h.start,
          end: h.end,
          coverCount: h.coverCount
        }));

      return (
        <p key={key} className="mb-4 leading-relaxed text-lg">
          <HighlightedText
            text={text}
            highlights={paragraphHighlights}
            user={true}
          />
        </p>
      );
    };

    try {
      const paragraphs = JSON.parse(content);
      return paragraphs.map((paragraph, index) => renderText(paragraph, index));
    } catch (error) {
      console.error('Content 파싱 중 오류 발생:', error);
      return renderText(content);
    }
  };


  const getHighlightedTexts = (content, newsId) => {
    const itemHighlights = highlights[newsId];
    if (!itemHighlights || itemHighlights.length === 0) return null;

    try {
      const paragraphs = JSON.parse(content);
      const firstHighlight = itemHighlights[0];
      const paragraph = paragraphs[firstHighlight.paragraphIndex];
      
      if (!paragraph) return null;

      // 같은 문단 내의 모든 하이라이트 찾기
      const paragraphHighlights = itemHighlights.filter(h => h.paragraphIndex === firstHighlight.paragraphIndex);
      
      // 하이라이트된 텍스트들을 추출
      return paragraphHighlights
        .map(h => paragraph.slice(h.start, h.end))
        .filter(text => text.length > 0)
        .slice(0, 2); // 최대 2개의 하이라이트만 표시
    } catch (error) {
      console.error('하이라이트 텍스트 추출 중 오류:', error);
      return null;
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(scraps.length / ITEMS_PER_PAGE),
    [scraps.length]
  );

  const visibleScraps = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return scraps.slice(start, start + ITEMS_PER_PAGE);
  }, [scraps, currentPage]);

  if (loading) return (
    <>
      <Header />
      <p className="p-4">로딩 중…</p>
      <Footer />
    </>
  );
  
  if (scraps.length === 0) return (
    <>
      <Header />
      <p className="p-4">아직 스크랩한 뉴스가 없습니다.</p>
      <Footer />
    </>
  );


  return (
    <>
      <Header />
      <div className="container mx-auto px-4">
        <div className="py-12">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-1">
            <span className="text-blue-500 text-3xl"># </span>내가 저장한 뉴스
          </h1>

          <div className="grid grid-cols-2 gap-4">
            {visibleScraps.map(item => (
              <article 
                key={item.newsId} 
                className="rounded-lg overflow-hidden hover:shadow-lg border border-transparent hover:border-[#0E74F9] cursor-pointer"
                onClick={() => setSelectedNews(item)}
              >
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
                )}
                <div className="p-3">
                  <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(item.publishDate).toLocaleDateString()} · {item.category}
                  </p>
                  {getHighlightedTexts(item.content, item.newsId) ? (
                    <div className="space-y-2 mb-2">
                      {getHighlightedTexts(item.content, item.newsId).map((text, index) => (
                        <div key={index} className="relative bg-blue-100 rounded-lg p-2 text-sm">
                          <div className="absolute -top-2 left-4 w-4 h-4 bg-blue-100 transform rotate-45"></div>
                          <p className="text-gray-800 font-medium">{text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm line-clamp-3 text-gray-500">
                      {item.summary}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* 페이지네이션 개선 */}
          {scraps.length > 0 && (
            <div className="flex justify-center mt-8 mb-4 gap-2">
              {/* 이전 페이지 버튼 */}
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1 rounded bg-white text-gray-600 hover:bg-gray-100"
                >
                  &lt;
                </button>
              )}

              {/* 페이지 번호 버튼 */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;

                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === currentPage
                        ? 'bg-[#0E74F9] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* 다음 페이지 버튼 */}
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-3 py-1 rounded bg-white text-gray-600 hover:bg-gray-100"
                >
                  &gt;
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 뉴스 상세 모달 */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedNews.title}</h2>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {selectedNews.imageUrl && (
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{new Date(selectedNews.publishDate).toLocaleDateString()}</span>
                <span className="mx-2">·</span>
                <span>{selectedNews.category}</span>
              </div>
              <div className="prose max-w-none">
                {parseContent(selectedNews.content, selectedNews.highlights)}
                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = `/news/detail/${selectedNews.newsId}`}
                    className="text-[#0E74F9] hover:underline"
                  >
                    뉴스 상세페이지로 이동 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}