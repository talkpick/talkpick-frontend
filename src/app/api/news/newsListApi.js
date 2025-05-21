import instance from '@/lib/axios';

export async function getLatestNews(lastIndex, size) {
  const response = await instance.get(`/api/public/news/latest?last=${lastIndex}&size=${size}`);
  return response.data;
}

export async function getNewsByCategory(categoryId) {
  const response = await instance.get(`/api/public/news/${categoryId}`);
  return response.data;
} 