'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { CHAT_MESSAGE_TYPE } from '@/constants/socketConstants';
import { AuthContext } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * ChatRoom 컴포넌트
 * - 페이지 진입 시 숨겨진 채팅 UI
 * - 버튼 클릭 시 WebSocket 연결 후 채팅방 표시
 * - 퇴장 버튼으로 연결 해제
 */
function ChatRoom({ articleId, onError, isPcVersion }) {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { nickname } = useContext(AuthContext);
  const clientRef = useRef(null);
  const chatContainerRef = useRef(null);
  
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
    clientRef.current.send(`/app/chat.send`, {}, JSON.stringify({
      articleId,
      sender: nickname,
      content: input.trim(),
      timestamp: new Date().toISOString(),
      messageType: CHAT_MESSAGE_TYPE.CHAT
    }));
    setInput('');
  };

  // 메시지 수신 콜백
  const onMessage = (msg) => {
    console.log("onMessage", msg);
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
        sender: nickname,
        content: `${nickname}님이 퇴장하였습니다.`,
        timestamp: new Date().toISOString(),
        messageType: CHAT_MESSAGE_TYPE.LEAVE
      }));
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    setVisible(false);
    setMessages([]);
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
          <div className="flex gap-2 p-2 bg-white border-t">
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
