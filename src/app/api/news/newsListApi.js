import instance from '@/lib/axios';

export async function getLatestNews(page, size) {
  const response = await instance.get(`/api/public/news/latest?page=${page}&size=${size}`);
  return response.data;
}

export async function getNewsByCategory(categoryId) {
  const response = await 
  instance.get(`/api/public/news/${categoryId}`);
  return response.data;
} 

export async function getTopViewedNews(categoryId) {
  const response = await instance.get(`/api/public/news/top-viewed/${categoryId}`);
  return response.data;
}

export async function getSimilarNews(newsId) {
  const response = await instance.get(`/api/public/news/similar?newsId=${newsId}&page=0&size=4`);
  return response.data;
}
