import { refreshAxios } from '@/lib/axios';

export async function getLatestNews(lastId, size) {
  let response = null;
  if(lastId === null) {
    response = await refreshAxios.get(`/api/public/news/latest?size=${size}`);
  } else {
    response = await refreshAxios.get(`/api/public/news/latest?lastId=${lastId}&size=${size}`);
  }
  
  return response.data;
}

export async function getLatestNewsByCategory(category,lastId, size) {
  let response = null;
  if(lastId === null) {
    response = await refreshAxios.get(`/api/public/news/latest/category?category=${category}&size=${size}`);
  } else {
    response = await refreshAxios.get(`/api/public/news/latest/category?category=${category}&lastId=${lastId}&size=${size}`);
  }
  return response.data;
} 

export async function getTopViewedNews(categoryId) {
  const response = await refreshAxios.get(`/api/public/news/top-viewed/${categoryId}`);
  return response.data;
}

export async function getSimilarNews(newsId) {
  const response = await refreshAxios.get(`/api/public/news/similar?newsId=${newsId}&page=0&size=4`);
  return response.data;
}
