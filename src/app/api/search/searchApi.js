import instance from '@/lib/axios';

export const search = async (query, category, page, size) => {
  const response = await instance.get(`/api/public/news/search?q=${query}&page=${page-1}&size=${size}`);
  // TODO: API에 카테고리 항목 추가되면 아래로 수정
  // const response = await instance.get(`/api/search?q=${query}&category=${category}&page=${page}&size=${size}`);
  return response.data;
};



