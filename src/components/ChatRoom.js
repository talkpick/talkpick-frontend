'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { CHAT_MESSAGE_TYPE } from '@/constants/socketConstants';
import { AuthContext } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { scrapQuote } from '@/app/api/chat/quote';

/**
 * ChatRoom 컴포넌트
 * - 페이지 진입 시 숨겨진 채팅 UI
 * - 버튼 클릭 시 WebSocket 연결 후 채팅방 표시
 * - 퇴장 버튼으로 연결 해제
 */
function ChatRoom({ articleId, onError, isPcVersion, isChatOpen, setIsChatOpen, selectedQuote, setSelectedQuote, onQuoteClick }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { nickname } = useContext(AuthContext);
  const clientRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  
  const scrollToBottom = () => {
    if (isPcVersion) {
      // PC 버전에서는 채팅 컨테이너가 가득 찼을 때만 스크롤
      const container = chatContainerRef.current;
      if (container) {
        const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 150;
        if (isScrolledToBottom) {
          container.scrollTop = container.scrollHeight;
        }
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
    console.log("onMessage", msg);
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

  // 채팅방 열기
  const openChat = async () => {
    if (clientRef.current) {
      return;
    }
    const socket = new SockJS('/api/ws-chat');
    const stompClient = Stomp.over(socket);
    stompClient.connect({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, () => {
      clientRef.current = stompClient;
      setIsChatOpen(true);
      setVisible(true);
      setMessages([]);
      stompClient.subscribe(`/topic/chat.${articleId}`, ({ body }) => {
        try {
          onMessage(JSON.parse(body));
        } catch (error) {
          console.error("메시지 파싱 오류:", error);
        }
      });

      // 연결 직후 입장 메시지 전송
      clientRef.current.send(`/app/chat.send`, {}, JSON.stringify({
        articleId,
        sender: "SYSTEM",
        content: `${nickname}님이 입장하였습니다.`,
        timestamp: new Date().toISOString(),
        messageType: CHAT_MESSAGE_TYPE.JOIN
      }));
    }, (error) => {
      console.error("채팅방 연결 실패:", error);
      onError(error);
    });
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
      clientRef.current = null;
    }
    setIsChatOpen(false);
    setVisible(false);
    setMessages([]);
  };

  // 인용구 클릭 핸들러
  const handleQuoteClick = (paragraphIndex, startOffset, endOffset) => {
    if (onQuoteClick) {
      onQuoteClick(paragraphIndex, startOffset, endOffset);
    }
  };

  // 채팅방 연결관리
  useEffect(() => {
    return () => {
      // 연결 해제
      if (clientRef.current) clientRef.current.disconnect();
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
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          채팅방 참여
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
                        "{msg.content.snippetText}"
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
                    <span className="text-2xl font-serif text-black leading-none mr-1">"</span>
                    {selectedQuote.snippetText}
                    <span className="text-2xl font-serif text-black leading-none ml-1">"</span>
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
