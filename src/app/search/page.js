'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategoryName } from '@/constants/categories';

const ITEMS_PER_PAGE = 10;

const SearchContent = () => {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const query = searchParams.get('q');
  const category = searchParams.get('category');

  // 페이지네이션 계산
  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = searchResults.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 대체
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${category}`);
        const data = await response.json();
        setSearchResults(data);
        setCurrentPage(1); // 검색어가 변경되면 첫 페이지로 리셋
      } catch (error) {
        console.error('검색 결과를 가져오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <SearchBar 
              isVisible={true}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0E74F9]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {query} 검색 결과
                  {category !== 'all' && (
                    <span className="text-gray-500 text-lg ml-2">
                      ({getCategoryName(category)} 카테고리)
                    </span>
                  )}
                </h1>
                <span className="text-gray-500">
                  {searchResults.length}개의 결과
                </span>
              </div>

              {currentResults.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {currentResults.map((result, index) => (
                      <a 
                        key={index}
                        href={`/news/${result.id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-[#0E74F9] transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-[200px] md:flex-shrink-0">
                            <img 
                              src={result.image || 'https://picsum.photos/200/150'} 
                              alt={result.title}
                              className="w-full h-[150px] object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-grow">
                            <h2 className="text-xl font-semibold mb-2 hover:text-[#0E74F9] transition-colors">{result.title}</h2>
                            <p className="text-gray-600 mb-2">{result.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{result.category}</span>
                              <span>{result.date}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        이전
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          className={`px-3 py-1 rounded-md border ${
                            currentPage === index + 1
                              ? 'bg-[#0E74F9] text-white border-[#0E74F9]'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        다음
                      </button>
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