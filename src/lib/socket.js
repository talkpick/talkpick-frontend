'use client';
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { refreshAccessToken } from '@/lib/axios';

class SocketService {
  stompClient = null;
  subscription = null;
  nickname = null;

  async connect(articleId, nickname, onMessage) {
    console.log('[SocketService] 채팅 연결 시도');
    this.stompClient = Stomp.over(new SockJS('/api/ws-chat'));
    this.nickname = nickname;
    console.log('[SocketService] 채팅 연결 시도 완료');

    // 1) accessToken, refreshToken 로드
    let accessToken = localStorage.getItem('accessToken');

    // 2) 토큰 만료 여부 확인 (JWT payload에서 exp 추출)
    const isTokenExpired = (jwt) => {
      try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
      } catch {
        return true;
      }
    };

    // 3) 만료되었거나 없으면 refreshAccessToken() 호출
    if (!accessToken || isTokenExpired(accessToken)) {
      try {
        accessToken = await refreshAccessToken();
        console.log('[SocketService] accessToken 갱신 성공');
      } catch (e) {
        console.error('[SocketService] accessToken 갱신 실패', e);
      }
    }

    // 4) STOMP CONNECT 요청, 헤더에 JWT 토큰 포함
    const headers = accessToken ? { Authorization: 'Bearer ' + accessToken } : {};
    console.log('[SocketService] 헤더 설정:', headers);

    return new Promise((resolve, reject) => {
      this.stompClient.connect(
        headers,
        frame => {
          console.log('[STOMP] 연결 성공:', frame);
          this.subscription = this.stompClient.subscribe(
            `/topic/chat.${articleId}`,
            msg => {
              try {
                const chat = JSON.parse(msg.body);
                onMessage && onMessage(chat);
              } catch (e) {
                console.error('[SocketService] 메시지 파싱 오류', e);
              }
            }
          );
          resolve(); // 연결 완료
        },
        error => {
          console.error('[STOMP] 연결 오류:', error);
          reject(error); // 연결 실패
        }
      );
    });
  }

  /**
     * 채팅 메시지를 서버에 전송합니다.
     * @param {string} articleId - 채팅방 ID
     * @param {string} content - 메시지 내용
     * @param {string} messageType - 메시지 타입 (CHAT, JOIN, LEAVE)
     */
  sendMessage(articleId, content, messageType= 'CHAT') {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('[SocketService] STOMP 연결이 없습니다.');
      return;
    }
    const payload = {
      articleId,
      sender: this.nickname,
      content,
      timestamp: new Date().toISOString().slice(0,16),
      messageType: messageType
    };
    console.log('[SocketService] 메시지 전송:', payload);
    this.stompClient.send('/app/chat.send', {}, JSON.stringify(payload));
  }

  sendRoomMessage(articleId, content, messageType) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('[SocketService] STOMP 연결이 없습니다.');
      return;
    }
    const payload = {
      articleId,
      sender: "SYSTEM",
      content,
      timestamp: new Date().toISOString().slice(0,16),
      messageType: messageType
    };
    console.log('[SocketService] 메시지 전송:', payload);
    this.stompClient.send('/app/chat.send', {}, JSON.stringify(payload));
  }

  /**
   * 구독을 취소하고 WebSocket 연결을 종료합니다.
   */
  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.stompClient) {
      this.stompClient.disconnect(() => console.log('[STOMP] Disconnected'));
      this.stompClient = null;
    }
  }

}

export const socketService = new SocketService();
