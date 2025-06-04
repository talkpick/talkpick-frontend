import instance from '@/lib/axios';

export const scrapQuote = async (articleId, quote) => {
    try {
      const response = await instance.post(`/api/scrap/${articleId}`, 
        quote
      );
      return response.data;
    } catch (error) {
      throw error.response?.data.message || { message: '인용구 저장 중 오류가 발생했습니다.' };
    }
  };