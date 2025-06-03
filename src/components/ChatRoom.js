'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { CHAT_MESSAGE_TYPE } from '@/constants/socketConstants';
import { AuthContext } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { scrapQuote } from '@/app/api/chat/quote';
import { fetchChatMessages } from '@/app/api/chat/chatLoadingApi';
import { refreshAccessToken } from '@/lib/axios';

/**
 * ChatRoom 컴포넌트
 * - 페이지 진입 시 숨겨진 채팅 UI
 * - 버튼 클릭 시 WebSocket 연결 후 채팅방 표시
 * - 퇴장 버튼으로 연결 해제
 */
function ChatRoom({ articleId, category, onError, isPcVersion, isChatOpen, setIsChatOpen, selectedQuote, setSelectedQuote, onQuoteClick, isChatLoading, setIsChatLoading }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { nickname } = useContext(AuthContext);
  const clientRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 5000; // 5초
  
  const scrollToBottom = () => {
    if (isPcVersion) {
      // PC 버전에서도 항상 스크롤을 하단으로 이동
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      // 모바일 버전에서는 기존처럼 페이지 스크롤
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const send = () => {
    if (!input.trim() || !clientRef.current) return;

    // 메시지 데이터 구성
    const messageData = {
      articleId,
      sender: nickname,
      timestamp: new Date().toISOString(),
      messageType: selectedQuote ? CHAT_MESSAGE_TYPE.QUOTE : CHAT_MESSAGE_TYPE.CHAT,
      content: selectedQuote 
        ? JSON.stringify({
            message: input.trim(),
            snippetText: selectedQuote.snippetText,
            paragraphIndex: selectedQuote.paragraphIndex,
            startOffset: selectedQuote.startOffset,
            endOffset: selectedQuote.endOffset
          })
        : input.trim()
    };
    clientRef.current.send(`/app/chat.send`, {}, JSON.stringify(messageData));
    if(selectedQuote) {
      scrapQuote(articleId, selectedQuote);
    } 
    setInput('');
    setSelectedQuote(null);
  };

  // 메시지 수신 콜백
  const onMessage = (msg) => {
    // content가 JSON 문자열인 경우 파싱
    if (typeof msg.content === 'string' && msg.content.startsWith('{')) {
      try {
        msg.content = JSON.parse(msg.content);
      } catch (error) {
        console.error("메시지 content 파싱 오류:", error);
      }
    }
    setMessages(prev => [...prev, msg]);
  };

  // WebSocket 연결 설정
  const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('/api/ws-chat');
      const stompClient = Stomp.over(socket);
      
      stompClient.connect(
        { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        () => resolve(stompClient),
        (error) => reject(error)
      );
    });
  };

  // WebSocket 재연결
  const reconnectWebSocket = async () => {
    try {
      const stompClient = await connectWebSocket();
      clientRef.current = stompClient;
      setupConnectionCloseHandler(stompClient);
      await subscribeToChat(stompClient);
      reconnectAttemptsRef.current = 0;
      console.log("WebSocket 재연결 성공");
    } catch (error) {
      console.error("WebSocket 재연결 실패:", error);
      closeChatRoom();
      throw error;
    }
  };

  // 채팅방 닫기
  const closeChatRoom = () => {
    if (clientRef.current) {
      clientRef.current = null;
    }
    setIsChatOpen(false);
    setVisible(false);
    setMessages([]);
  };

  // 연결 종료 핸들러 설정
  const setupConnectionCloseHandler = (stompClient) => {
    stompClient.onWebSocketClose = (event) => {
      console.log("WebSocket 연결이 종료되었습니다.", event);
      
      if (event.code === 1002) {
        // 의도하지 않은 연결 종료 처리
        console.log("의도하지 않은 연결 종료 (code: 1002)");
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          console.log(`재연결 시도 ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
          
          setTimeout(async () => {
            try {
              await reconnectWebSocket();
            } catch (error) {
              console.error("재연결 실패:", error);
              if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                onError(new Error("연결이 불안정합니다. 페이지를 새로고침해주세요."));
                closeChatRoom();
              }
            }
          }, RECONNECT_DELAY);
        } else {
          onError(new Error("연결이 불안정합니다. 페이지를 새로고침해주세요."));
          closeChatRoom();
        }
      } else {
        // 의도적인 연결 종료 처리
        console.log("의도적인 연결 종료 (code:", event.code, ")");
        closeChatRoom();
      }
    };
  };

  // 메시지 구독 설정
  const subscribeToChat = (stompClient) => {
    return new Promise((resolve) => {
      stompClient.subscribe(
        `/topic/chat.${articleId}`,
        ({ body }) => {
          try {
            onMessage(JSON.parse(body));
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        },
        { category: category }  // 헤더에 카테고리 정보 추가
      );
      resolve(stompClient);
    });
  };

  // 과거 메시지 처리
  const processChatHistory = async (stompClient) => {
    try {
      const chatHistory = await fetchChatMessages(articleId);
      if (chatHistory.data.items.length > 0) {
        const processedMessages = chatHistory.data.items.map(message => {
          if (message.content.startsWith('{')) {
            try {
              const parsedContent = JSON.parse(message.content);
              return {
                ...message,
                content: parsedContent
              };
            } catch (error) {
              console.error('Content 파싱 중 오류:', error);
              return message;
            }
          }
          return message;
        });
        setMessages(processedMessages);
      }
      return stompClient;
    } catch (error) {
      console.error("채팅 내역 로딩 실패:", error);
      throw error;
    }
  };

  // 입장 메시지 전송
  const sendJoinMessage = (stompClient) => {
    return new Promise((resolve) => {
      stompClient.send(`/app/chat.send`, {}, JSON.stringify({
        articleId,
        sender: "SYSTEM",
        content: `${nickname}님이 입장하였습니다.`,
        timestamp: new Date().toISOString(),
        messageType: CHAT_MESSAGE_TYPE.JOIN
      }));
      resolve(stompClient);
    });
  };

  // 채팅방 열기
  const openChat = async () => {
    if (clientRef.current) {
      return;
    }
    setIsChatLoading(true);
    
    try {
      // 0. Access Token 갱신
      await refreshAccessToken();
      // 1. WebSocket 연결
      const stompClient = await connectWebSocket();
      clientRef.current = stompClient;
      setIsChatOpen(true);
      setVisible(true);

      // 2. 연결 종료 핸들러 설정
      setupConnectionCloseHandler(stompClient);

      // 3. 채팅 구독
      await subscribeToChat(stompClient);

      // 4. 과거 채팅 내역 로드 및 처리
      await processChatHistory(stompClient);

      // 5. 입장 메시지 전송
      await sendJoinMessage(stompClient);

    } catch (error) {
      console.error("채팅방 초기화 실패:", error);
      onError(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 채팅방 나가기
  const leaveChat = () => {
    if (clientRef.current) {
      clientRef.current.send(`/app/chat.send`, {}, JSON.stringify({
        articleId,
        sender: "SYSTEM",
        content: `${nickname}님이 퇴장하였습니다.`,
        timestamp: new Date().toISOString(),
        messageType: CHAT_MESSAGE_TYPE.LEAVE
      }));
      clientRef.current.disconnect();
      closeChatRoom();
    }
  };

  // 인용구 클릭 핸들러
  const handleQuoteClick = (paragraphIndex, startOffset, endOffset) => {
    if (onQuoteClick) {
      onQuoteClick(paragraphIndex, startOffset, endOffset);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        closeChatRoom();
      }
    };
  }, []);

  // 새 메시지 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {!visible ? (
        <button 
          onClick={openChat}
          disabled={isChatLoading}
          className={`w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
            isChatLoading ? 'opacity-50 cursor-not-allowed' : ''
          } flex items-center justify-center gap-2`}
        >
          {isChatLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>연결 중...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>채팅방 참여</span>
            </>
          )}
        </button>
      ) : (
        <div className="h-full flex flex-col">
          <button 
            onClick={leaveChat}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mb-4"
          >
            채팅방 나가기
          </button>
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 rounded-lg" ref={chatContainerRef}>
            <div className="p-4 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${
                    msg.sender === 'SYSTEM'
                      ? 'text-center'
                      : msg.sender === nickname
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {msg.sender !== 'SYSTEM' && msg.sender !== nickname && (
                    <strong className="block mb-1 text-sm">{msg.sender}</strong>
                  )}
                  {msg.content.snippetText && (
                    <div className={`mb-2 ${
                      msg.sender === nickname ? 'text-right' : 'text-left'
                    }`}>
                      <button
                        onClick={() => handleQuoteClick(
                          msg.content.paragraphIndex,
                          msg.content.startOffset,
                          msg.content.endOffset
                        )}
                        className="inline-block max-w-[80%] border-l-4 border-gray-400 pl-2 text-sm italic bg-gray-50 rounded-r text-black hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        {`\"`}{msg.content.snippetText}{`\"`}
                      </button>
                    </div>
                  )}
                  <div
                    className={`inline-block max-w-[80%] break-words ${
                      msg.sender === 'SYSTEM'
                        ? 'text-gray-500 text-sm'
                        : msg.sender === nickname
                        ? 'bg-blue-500 text-white px-3 py-2 rounded-lg'
                        : 'bg-gray-200 px-3 py-2 rounded-lg'
                    }`}
                  >
                    {msg.content.snippetText ? (
                      <div className="font-medium">{msg.content.message}</div>
                    ) : (
                      <div>{msg.content}</div>
                    )}
                  </div>
                  {msg.sender !== 'SYSTEM' && (
                    <div className={`text-xs text-gray-500 mt-1 ${
                      msg.sender === nickname ? 'text-right' : 'text-left'
                    }`}>
                      {formatDate(msg.timestamp)}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="flex flex-col gap-2 p-2 bg-white">
            {selectedQuote && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm text-black flex items-center bg-sky-100 rounded-lg p-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,3 6,17 18,17" />
                      <polyline points="14,13 18,17 14,21" />
                    </svg>
                    <span className="text-2xl font-serif text-black leading-none mr-1">{`\"`}</span>
                    {selectedQuote.snippetText}
                    <span className="text-2xl font-serif text-black leading-none ml-1">{`\"`}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                className="flex-1 min-w-0 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="메시지를 입력하세요..."
              />
              <button 
                onClick={send}
                className="shrink-0 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
