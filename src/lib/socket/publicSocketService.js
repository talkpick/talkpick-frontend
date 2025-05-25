'use client';

import BaseSocketService from './baseSocketService';

class PublicSocketService extends BaseSocketService {
  async connectToArticle(articleId, onUserCountUpdate) {
    await this.connect();
    
    // 채팅방 인원수 구독 (/topic: public messages for broadcasting)
    this.subscribe(`/topic/chat.${articleId}.count`, (data) => {
      console.log('Received user count:', data);
      onUserCountUpdate(data.count);
    });
  }
}

export default new PublicSocketService(); 