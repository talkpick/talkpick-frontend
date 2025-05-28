import refreshAxios from '@/lib/axios';

export async function getLatestNews(page, size) {
  const response = await instance.get(`/api/public/news/latest?page=${page}&size=${size}`);
  return response.data;
}

export async function getNewsByCategory(categoryId) {
  const response = await instance.get(`/api/public/news/${categoryId}`);
  return response.data;
} 