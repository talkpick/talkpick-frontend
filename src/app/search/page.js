'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { search } from '@/app/api/search/searchApi';
import { useRouter } from 'next/navigation';
import { formatDate, truncateText } from '@/lib/utils';
import parse from 'html-react-parser';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q');
  const pageParam = searchParams.get('page');

  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 10;

  const [fetchedResults, setFetchedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  
  const fetchSearchResults = async () => {
    if (!query) {
      setFetchedResults([]);
      setTotalResults(0);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await search(query, currentPage, itemsPerPage);
      setFetchedResults(data.data.newsSearchResponseList);
      setTotalResults(data.data.total);
    } catch (error) {
      console.error('검색 결과를 가져오는데 실패했습니다:', error);
      setError('검색 중 오류가 발생했습니다.');
      setFetchedResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query, currentPage]);

  // 검색어나 카테고리가 변경되면 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    // URL 업데이트
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0E74F9]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
              <p className="text-gray-400 mt-2">다시 시도해주세요.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {`"`}
                  <span className="text-[#0E74F9]">{query}</span>
                  {`" 검색 결과`}
                </h1>
                <span className="text-gray-500">
                  {totalResults}개의 결과
                </span>
              </div>

              {totalResults > 0 ? (
                <>
                  <div className="space-y-4">
                    {fetchedResults.map((result, index) => (
                      <a 
                        key={index}
                        href={`/news/detail/${result.newsId}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-[#0E74F9] transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-[200px] md:flex-shrink-0">
                            <img 
                              src={result.imageUrl} 
                              alt={result.title}
                              className="w-full h-[150px] object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-grow"> 
                            <h2 className="text-xl font-semibold mb-2 hover:text-[#0E74F9] transition-colors">{parse(result.title)}</h2>
                            <p className="text-gray-600 mb-3">{truncateText(JSON.parse(result.content).join(''), 150)}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{result.category}</span>
                              <span>{formatDate(result.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* 페이지네이션 개선 */}
                  {totalResults > 0 && (
                    <div className="flex justify-center mt-8 mb-4 gap-2">
                      {/* 이전 페이지 버튼 */}
                      {currentPage > 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="px-3 py-1 rounded bg-white text-gray-600 hover:bg-gray-100"
                        >
                          &lt;
                        </button>
                      )}

                      {/* 페이지 번호 버튼 */}
                      {Array.from({ length: Math.min(5, Math.ceil(totalResults / itemsPerPage)) }, (_, i) => {
                        // 현재 페이지를 중심으로 페이지 번호 표시
                        const totalPages = Math.ceil(totalResults / itemsPerPage);
                        let pageNum;

                        if (totalPages <= 5) {
                          // 전체 페이지가 5개 이하면 모든 페이지 표시
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          // 현재 페이지가 1,2,3이면 1~5 표시
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // 현재 페이지가 마지막 3페이지 안에 있으면 마지막 5페이지 표시
                          pageNum = totalPages - 4 + i;
                        } else {
                          // 그 외에는 현재 페이지 중심으로 앞뒤 2페이지씩 표시
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
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
                      {currentPage < Math.ceil(totalResults / itemsPerPage) && (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="px-3 py-1 rounded bg-white text-gray-600 hover:bg-gray-100"
                        >
                          &gt;
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    검색 결과가 없습니다.
                  </p>
                  <p className="text-gray-400 mt-2">
                    다른 검색어로 다시 시도해보세요.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const SearchPage = () => {
  return (
    <>
      <Header />
      <Suspense fallback={
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0E74F9]"></div>
              </div>
            </div>
          </div>
        </main>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </>
  );
};

export default SearchPage; 