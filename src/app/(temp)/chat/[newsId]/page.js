'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { socketService } from '@/lib/socket';
import { AuthContext } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { formatDate } from '@/app/search/utils';

/**
 * ChatRoom 컴포넌트
 * - 페이지 진입 시 숨겨진 채팅 UI
 * - 버튼 클릭 시 WebSocket 연결 후 채팅방 표시
 * - 퇴장 버튼으로 연결 해제
 */
function ChatRoom() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const containerRef = useRef(null);
  const { nickname } = useContext(AuthContext);
  const articleId = useParams().newsId;
  
  // 메시지 수신 콜백
  const onMessage = (msg) => {
    console.log("onMessage", msg);
    setMessages(prev => [...prev, msg]);
  };

  // 채팅방 열기
  const openChat = () => {
    setVisible(true);
    setMessages([]);
    console.log(nickname);
    socketService.connect(articleId, nickname, onMessage);
  };

  // 채팅방 나가기
  const leaveChat = () => {
    socketService.disconnect();
    setVisible(false);
    setMessages([]);
  };

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  // 새 메시지 자동 스크롤
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    if (input.trim()) {
      socketService.sendMessage(articleId, input.trim());
      setInput('');
    }
  };

  return (
    <div>
      {!visible ? (
        <button onClick={openChat}>채팅방 참여</button>
      ) : (
        <div className="chat-container">
          <button onClick={leaveChat}>채팅방 나가기</button>
          <div
            className="chat-messages"
            ref={containerRef}
            style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px' }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{ textAlign: msg.sender === nickname ? 'right' : 'left', margin: '4px 0' }}
              >
                <strong>{msg.sender}</strong>: {msg.content}
                <div style={{ fontSize: '0.75em', color: '#888' }}>{formatDate(msg.timestamp)}</div>
              </div>
            ))}
          </div>
          <div className="chat-input" style={{ display: 'flex', marginTop: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              style={{ flexGrow: 1, marginRight: '4px' }}
            />
            <button onClick={send}>전송</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
