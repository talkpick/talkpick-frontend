'use client';
import axios from 'axios';

// Axios 인스턴스 생성
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Request 인터셉터: AccessToken 헤더 자동 추가
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터: 401 에러 발생 시 토큰 재갱신 시도
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 토큰 만료로 인한 401 에러 시 한 번만 재시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const rt = localStorage.getItem('refreshToken');
        const { accessToken: newAt, refreshToken: newRt, user: newUser } =
          (await instance.post('/api/members/refresh', { refreshToken: rt })).data;

        // 새로운 토큰 저장
        localStorage.setItem('accessToken', newAt);
        localStorage.setItem('refreshToken', newRt);
        localStorage.setItem('user', JSON.stringify(newUser));

        // 갱신된 토큰으로 원래 요청 헤더 업데이트 후 재전송
        originalRequest.headers['Authorization'] = `Bearer ${newAt}`;
        return instance.request(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 모든 인증 정보 제거 및 로그인 페이지 이동
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
