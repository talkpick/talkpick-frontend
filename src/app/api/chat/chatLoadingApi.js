import instance from '@/lib/axios';

/**
 * 채팅방의 이전 메시지들을 불러오는 함수
 * 
 * @param {string} articleId - 채팅방 ID
 * @returns {Promise<Object>} 정렬된 채팅 메시지 데이터
 * - 성공 시: { message: "요청 성공", data: { items: [...], hasNext: boolean } }
 * - 실패 시: { message: "채팅 메시지 로딩 실패", data: { items: [], hasNext: false } }
 */
export const fetchChatMessages = async (articleId) => {
  try {
    const response = await instance.get(`/api/chat/${articleId}/messages`);
    // timestamp 기준으로 과거 채팅이 위로오게 정렬
    const sortedData = {
      ...response.data,
      data: {
        ...response.data.data,
        items: response.data.data.items.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        )
      }
    };
    return sortedData;
  } catch (error) {
    console.warn('채팅 메시지 로딩 실패:', error);
    return {
        message: '채팅 메시지 로딩 실패',
        data: {
          items: [],
          hasNext: false
        }
      };
  }
}

export const fetchOlderChatMessages = async (articleId, beforeTimestamp) => {
  try {
    const response = await instance.get(`/api/chat/${articleId}/messages/older?before=${beforeTimestamp}`);
    // timestamp 기준으로 과거 채팅이 위로오게 정렬
    const sortedData = {
      ...response.data,
      data: {
        ...response.data.data,
        items: response.data.data.items.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        )
      }
    };
    return sortedData;
  } catch (error) {
    console.warn('채팅 메시지 로딩 실패:', error);
    return {
        message: '채팅 메시지 로딩 실패',
        data: {
          items: [],
          hasNext: false
        }
      };
  }
}

