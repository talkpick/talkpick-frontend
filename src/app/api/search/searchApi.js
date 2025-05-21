import instance from '@/lib/axios';

export const search = async (query, page, size) => {
  const response = await instance.get(`/api/public/news/search?q=${query}&page=${page-1}&size=${size}`);
  return response.data;
};



