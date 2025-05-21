import instance from '@/lib/axios';

export const getNewsDetail = async (id) => {
  const response = await instance.get(`/api/public/news/${id}`);
  return response.data;
};

