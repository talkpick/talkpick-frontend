import instance from '@/lib/axios';

export const scrapQuote = async (articleId, quote) => {
    try {
      const response = await instance.post(`/api/public/news/${articleId}/scrap`, 
        quote
      );
      return response.data;
    } catch (error) {
      throw error.response?.data.message || { message: '회원가입 중 오류가 발생했습니다.' };
    }
  };