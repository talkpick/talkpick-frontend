'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import parse from 'html-react-parser';
import { getCategoryId } from '@/constants/categories';
import { getNewsDetail } from '@/app/api/news/detail/[id]/newsDetailApi';
import ChatRoom from '@/components/ChatRoom';
import ViewCountIcon from '@/components/icons/ViewCountIcon';
import SummaryIcon from '@/components/icons/SummaryIcon';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { SOCKET_CONFIG, SOCKET_CONNECTION_TYPE } from '@/constants/socketConstants';
import SelectableText from '@/components/SelectableText';
import HighlightedText from '@/components/HighlightedText';


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
  const [userCount, setUserCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const chatRoomRef = useRef(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const socketRef = useRef(null);
  const [highlightSegments, setHighlightSegments] = useState([]);

  // 인용구 클릭 시 해당 문단으로 스크롤 이동하는 함수
  const handleQuoteScroll = (paragraphIndex) => {
    const newsContent = document.getElementById('news-content');
    if (newsContent) {
      const paragraphs = newsContent.getElementsByTagName('p');
      if (paragraphs[paragraphIndex]) {
        paragraphs[paragraphIndex].scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  const scrollToChatRoom = () => {
    chatRoomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        originLink: data.originLink,
        viewCount: data.viewCount
      };
      
      setNews(newsData);
      setSelectedCategory(getCategoryId(data.category));
      setHighlightSegments(data.highlightSegments || []);
    } catch (error) {
      console.error('뉴스를 가져오는데 실패했습니다:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(!params.id) return;
    fetchNewsDetail();
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    if (socketRef.current) return;
    // SockJS + STOMP 클라이언트 생성
    const socket = new SockJS(SOCKET_CONFIG.ENDPOINT);
    const client = Stomp.over(socket);

    client.connect({type: SOCKET_CONNECTION_TYPE.PUBLIC}, () => {
      // 인원 수 토픽 구독
      client.subscribe(`/topic/chat.${params.id}.count`, ({ body }) => {
        const { count } = JSON.parse(body);
        setUserCount(count);
      });
    }, console.error);

    socketRef.current = client;

    return () => {
      // cleanup: 모든 구독 해제하고 연결 종료
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [params.id]);

  // 채팅 에러 핸들러 추가
  const handleChatError = (error) => {
    console.log(error);
    setErrorMessage('채팅 서비스 연결에 실패했습니다.');
    setShowErrorToast(true);
    setIsChatOpen(false);
    setIsChatLoading(false);
    
    // 3초 후 토스트 메시지 숨기기
    setTimeout(() => {
      setShowErrorToast(false);
    }, 3000);
  };

  // 문단별 하이라이트 분리
  const getHighlightsForParagraph = (idx) =>
    highlightSegments.filter(seg => seg.paragraphIndex === idx);

  // // 스크랩 후 하이라이트 정보 갱신
  // const handleSendScrap = async ({ snippetText, startOffset, endOffset, paragraphIndex }) => {
  //   await fetch(`api/public/news/${params.id}/scrap`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ snippetText, startOffset, endOffset, paragraphIndex })
  //   });
  //   // 스크랩 저장 후, 다시 하이라이트 정보 갱신
  //   const res2 = await getNewsDetail(params.id);
  //   setHighlightSegments(res2.data.highlightSegments || []);
  // };

  // content를 문단별로 나누는 함수
  const parseContent = (content) => {
    // 일반 텍스트 렌더링 함수
    const renderText = (text, key = 0) => (
      <p key={key} className="mb-4 leading-relaxed text-lg">
        <HighlightedText
          text={text}
          highlights={getHighlightsForParagraph(key)}
        />
      </p>
    );

    // SelectableText로 감싸서 렌더링하는 함수
    const renderSelectableText = (text, index = 0) => (
      <p key={index} className="mb-4 leading-relaxed text-lg">
        <SelectableText 
          text={text}
          paragraphIndex={index}
          onSend={(selectionInfo) => {
            console.log('Selected text info:', selectionInfo);
            setSelectedQuote(selectionInfo);
          }}
        >
          <HighlightedText
            text={text}
            highlights={getHighlightsForParagraph(index)}
          />
        </SelectableText>
      </p>
    );

    try {
      // 문자열을 파싱하여 배열로 변환
      const paragraphs = JSON.parse(content);
      
      // 각 문단을 렌더링
      return paragraphs.map((paragraph, index) => 
        isChatOpen ? renderSelectableText(paragraph, index) : renderText(paragraph, index)
      );
    } catch (error) {
      console.error('Content 파싱 중 오류 발생:', error);
      // 문자열 파싱 실패 시 원본 content를 그대로 반환
      return isChatOpen ? renderSelectableText(content) : renderText(content);
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* 에러 토스트 */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-black-500 border border-red-500 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${showErrorToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} flex items-center`}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="#ef4444" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {errorMessage}
      </div>

      <div className="flex flex-col items-center">
        {/* PC 버전 */}
        <main className="hidden md:block w-full">
          <div className="max-w-[1440px] mx-auto p-8">
            <div className="flex gap-8">
              {/* 뉴스 본문 영역 */}
              <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
                {/* 뉴스 헤더 영역 */}
                <div className="mb-8">
                  {/* 카테고리 */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-base font-medium text-gray-700">
                      {news.category}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h1 className="text-3xl font-bold mb-4">{parse(news.title)}</h1>

                  {/* 날짜 및 요약보기 버튼 */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <p>{news.date}</p>
                      <div className="flex items-center gap-1">
                        <ViewCountIcon />
                        <span>{news.viewCount.toLocaleString()}회</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                      className="px-4 py-2 bg-white text-[#0E74F9] border border-[#0E74F9] rounded-lg hover:bg-[#0E74F9] hover:text-white transition-colors flex items-center gap-2"
                    >
                      <SummaryIcon />
                      {isSummaryOpen ? '요약접기' : '요약보기'}
                    </button>
                  </div>
                </div>

                {/* 요약 섹션 */}
                <div className={`mb-8 transition-all duration-300 ease-in-out ${isSummaryOpen ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  <div className="pt-2">
                    <h2 className="text-2xl font-bold mb-4 text-[#0E74F9]">뉴스 요약</h2>
                    <div className="prose prose-lg">
                      <p className="text-gray-700 leading-relaxed">{news.summary}</p>
                    </div>
                  </div>
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
                  <div id="news-content" className="prose prose-lg max-w-none">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* PC 버전 채팅방 - 우측 고정 */}
              <div className="w-[400px]">
                <div className="sticky top-8">
                  <div className="bg-black rounded-[3rem] shadow-xl overflow-hidden">
                    {/* 노치 디자인 */}
                    <div className="relative w-full h-7 mb-1">
                      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-36 h-7 bg-black rounded-b-3xl flex items-center justify-center">
                        <div className="w-20 h-4 bg-black rounded-lg relative flex items-center">
                          <div className="absolute left-3 w-2 h-2 rounded-full bg-gray-800"></div>
                          <div className="absolute right-3 w-2 h-2 rounded-full bg-gray-800"></div>
                        </div>
                      </div>
                    </div>

                    {/* 채팅방 컨테이너 */}
                    <div className="bg-white rounded-[2rem] shadow-inner flex flex-col h-[calc(100vh-200px)] overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">실시간 채팅</p>
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-sm text-gray-500">
                              {userCount}명 참여중
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <ChatRoom 
                          articleId={params.id} 
                          onError={handleChatError} 
                          isPcVersion={true}
                          isChatOpen={isChatOpen}
                          setIsChatOpen={setIsChatOpen}
                          selectedQuote={selectedQuote}
                          setSelectedQuote={setSelectedQuote}
                          onQuoteClick={handleQuoteScroll}
                          isChatLoading={isChatLoading}
                          setIsChatLoading={setIsChatLoading}
                        />
                      </div>
                    </div>

                    {/* 하단 홈 버튼 */}
                    <div className="mt-4 mb-4 flex justify-center">
                      <div className="w-32 h-1 bg-gray-800 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 모바일 버전 */}
        <main className="md:hidden w-full">
          <div className="w-full max-w-[100vw] mx-auto">
            <div className="bg-black rounded-[3rem] shadow-xl mx-2">
              {/* 노치 디자인 */}
              <div className="relative w-full h-7 mb-1">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-36 h-7 bg-black rounded-b-3xl flex items-center justify-center">
                  <div className="w-20 h-4 bg-black rounded-lg relative flex items-center">
                    <div className="absolute left-3 w-2 h-2 rounded-full bg-gray-800"></div>
                    <div className="absolute right-3 w-2 h-2 rounded-full bg-gray-800"></div>
                  </div>
                </div>
              </div>

              {/* 뉴스 컨테이너 - 카드 스타일 */}
              <div className="bg-white rounded-[2rem] shadow-inner">
                <div className="p-6 sm:p-4">
                  {/* 카테고리 */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-base font-medium text-gray-700">
                      {news.category}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h1 className="text-2xl font-bold mb-2">{parse(news.title)}</h1>

                  {/* 채팅 참여자 수 */}
                  <div 
                    className="mb-4 py-2 px-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={scrollToChatRoom}
                  >
                    <p className="text-[#0E74F9] font-medium flex items-center gap-2 text-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                      {userCount === 0 ? (
                        <>지금 바로 채팅에 참여해보세요!</>
                      ) : (
                        <>현재 <span className="font-bold text-[#0E74F9]">{userCount}명</span>의 유저들이 채팅중이에요!</>
                      )}
                    </p>
                  </div>

                  {/* 날짜 및 요약보기 버튼 */}
                  <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <p>{news.date}</p>
                      <div className="flex items-center gap-1">
                        <ViewCountIcon />
                        <span>{news.viewCount.toLocaleString()}회</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                      className="px-4 py-2 bg-white text-[#0E74F9] border border-[#0E74F9] rounded-lg hover:bg-[#0E74F9] hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                      <SummaryIcon />
                      {isSummaryOpen ? '요약접기' : '요약보기'}
                    </button>
                  </div>
                </div>

                {/* 뉴스 본문 영역 */}
                <div className="px-6 sm:px-4">
                  {/* 요약 섹션 */}
                  <div className={`mb-6 transition-all duration-300 ease-in-out ${isSummaryOpen ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div className="pt-2">
                      <h2 className="text-2xl font-bold mb-4 text-[#0E74F9]">뉴스 요약</h2>
                      <div className="prose prose-lg">
                        <p className="text-gray-700 leading-relaxed">{news.summary}</p>
                      </div>
                    </div>
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
                    <div id="news-content" className="prose prose-lg max-w-none">
                      {parseContent(news.content)}
                    </div>
                  </div>

                  {/* 원문 링크 */}
                  {news.originLink && (
                    <div className="flex justify-end mt-8 mb-6">
                      <a 
                        href={news.originLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#0E74F9] hover:underline flex items-center gap-1"
                      >
                        원문 보기
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* 채팅방 영역 */}
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50" ref={chatRoomRef}>
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    disabled={isChatLoading}
                    className={`w-full py-3 px-4 flex items-center justify-between transition-colors ${
                      isChatLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm text-gray-500">현재 {userCount}명이 참여 중</span>
                    <div className="flex items-center gap-2 text-[#0E74F9]">
                      {isChatLoading ? (
                        <span className="font-medium">연결 중...</span>
                      ) : (
                        <>
                          <span className="font-medium">채팅방 {isChatOpen ? '닫기' : '열기'}</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 transform transition-transform ${isChatOpen ? '' : 'rotate-180'}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isChatOpen ? 'h-[300px]' : 'h-0'
                    } bg-white`}
                  >
                    <div className="h-full pb-safe">
                      <ChatRoom 
                        articleId={params.id} 
                        onError={handleChatError} 
                        isPcVersion={false}
                        isChatOpen={isChatOpen}
                        setIsChatOpen={setIsChatOpen}
                        selectedQuote={selectedQuote}
                        setSelectedQuote={setSelectedQuote}
                        onQuoteClick={handleQuoteScroll}
                        isChatLoading={isChatLoading}
                        setIsChatLoading={setIsChatLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 홈 버튼 */}
              <div className="mt-4 flex justify-center">
                <div className="w-32 h-1 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default NewsDetailPage; 