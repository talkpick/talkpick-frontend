'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { authSocketService, CHAT_MESSAGE_TYPE } from '@/lib/socket';
import { AuthContext } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';

/**
 * ChatRoom 컴포넌트
 * - 페이지 진입 시 숨겨진 채팅 UI
 * - 버튼 클릭 시 WebSocket 연결 후 채팅방 표시
 * - 퇴장 버튼으로 연결 해제
 */
function ChatRoom({ articleId }) {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { nickname } = useContext(AuthContext);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const send = () => {
    if (input.trim()) {
      authSocketService.sendMessage(articleId, input.trim(), CHAT_MESSAGE_TYPE.CHAT);
      setInput('');
    }
  };

  // 메시지 수신 콜백
  const onMessage = (msg) => {
    console.log("onMessage", msg);
    setMessages(prev => [...prev, msg]);
  };

  // 채팅방 열기
  const openChat = async () => {
    try {
      await authSocketService.connectWithAuth(articleId, nickname, onMessage);
      setVisible(true);
      setMessages([]);
      console.log("채팅방 연결 성공");
    } catch (error) {
      console.error("채팅방 연결 실패:", error);
    }
  };

  // 채팅방 나가기
  const leaveChat = () => {
    authSocketService.disconnectFromRoom(articleId);
    setVisible(false);
    setMessages([]);
  };

  // 언마운트 시 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (visible) {
        authSocketService.disconnectFromRoom(articleId);
      }
    };

    // beforeunload 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거 및 연결 해제
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (visible) {
        authSocketService.disconnectFromRoom(articleId);
      }
    };
  }, [articleId, visible]);

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
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 rounded-lg">
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
                  <div
                    className={`inline-block max-w-[80%] break-words ${
                      msg.sender === 'SYSTEM'
                        ? 'text-gray-500 text-sm'
                        : msg.sender === nickname
                        ? 'bg-blue-500 text-white px-3 py-2 rounded-lg'
                        : 'bg-gray-200 px-3 py-2 rounded-lg'
                    }`}
                  >
                    {msg.content}
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
          <div className="flex gap-2 p-2 bg-white border-t sticky bottom-0 left-0 right-0">
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
      )}
    </div>
  );
}

export default ChatRoom;
