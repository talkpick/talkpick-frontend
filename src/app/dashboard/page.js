'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getScrapList } from '@/app/api/dashboard/scrapListApi';
import SelectableText from '@/components/SelectableText';
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
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">내 스크랩</h1>

        <div className="grid grid-cols-2 gap-4">
          {visibleScraps.map(item => (
            <article key={item.newsId} className="rounded-lg overflow-hidden hover:shadow-lg hover:border-1 hover:border-[#0E74F9]">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
              )}
              <div className="p-3">
                <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(item.publishDate).toLocaleDateString()} · {item.category}
                </p>
                <p className="text-sm line-clamp-3 mb-2">{item.summary}</p>
                <button
                  onClick={() => setSelectedNews(item)}
                  className="text-[#0E74F9] text-sm hover:underline"
                >
                  상세보기 →
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
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