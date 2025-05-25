'use client';

import BaseSocketService from './baseSocketService';
import { refreshAccessToken } from '@/lib/axios';
import { CHAT_MESSAGE_TYPE } from './constants';

class AuthSocketService extends BaseSocketService {
  constructor() {
    super();
    this.nickname = null;
  }

  async connectWithAuth(articleId, nickname, onMessage) {
    this.nickname = nickname;
    
    // 1) accessToken 로드
    let accessToken = localStorage.getItem('accessToken');

    // 2) 토큰 만료 여부 확인
    const isTokenExpired = (jwt) => {
      try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
      } catch {
        return true;
      }
    };

    // 3) 토큰 갱신 필요시 갱신
    if (!accessToken || isTokenExpired(accessToken)) {
      try {
        accessToken = await refreshAccessToken();
        console.log('[AuthSocketService] AccessToken refreshed');
      } catch (error) {
        console.error('[AuthSocketService] Failed to refresh token:', error);
        throw error;
      }
    }

    // 4) 인증 헤더와 함께 연결
    const headers = { Authorization: `Bearer ${accessToken}` };
    await this.connect(headers);

    // 5) 채팅방 구독
    this.subscribe(`/topic/chat.${articleId}`, onMessage);
    
    // 6) 입장 메시지 전송
    this.sendRoomMessage(articleId, `${nickname}님이 채팅방에 참여했습니다.`, CHAT_MESSAGE_TYPE.JOIN);
  }

  sendMessage(articleId, content, messageType = CHAT_MESSAGE_TYPE.CHAT) {
    const payload = {
      articleId,
      sender: this.nickname,
      content,
      timestamp: new Date().toISOString(),
      messageType
    };

    this.send('/app/chat.send', {}, payload);
  }

  sendRoomMessage(articleId, content, messageType) {
    const payload = {
      articleId,
      sender: 'SYSTEM',
      content,
      timestamp: new Date().toISOString(),
      messageType
    };

    this.send('/app/chat.send', {}, payload);
  }

  disconnectFromRoom(articleId) {
    if (this.isConnected() && this.nickname) {
      this.sendRoomMessage(articleId, `${this.nickname}님이 퇴장하였습니다.`, CHAT_MESSAGE_TYPE.LEAVE);
    }
    this.disconnect();
    this.nickname = null;
  }
}

export default new AuthSocketService(); 