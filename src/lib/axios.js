'use client';
import axios from 'axios';
import {
  isUnauthorizedError,
  isAuthRequest,
  isRefreshRequest,
  isRetriedRequest,
} from './requestValidators';

// Axios 인스턴스 생성
const instance = axios.create({
  ...(process.env.API_URL && {
    baseURL: process.env.API_URL
  })
});

// 토큰 갱신을 위한 순수 axios 인스턴스
const refreshAxios = axios.create({
  ...(process.env.API_URL && {
    baseURL: process.env.API_URL
  })
});

// 토큰 갱신 함수
const refreshAccessToken = async () => {
  const rt = localStorage.getItem('refreshToken');
  if (!rt) throw new Error('No refresh token');

  const { data } = await refreshAxios.post('/auth/refresh', { refreshToken: rt });

  const { accessToken, refreshToken } = data.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  return accessToken;
};

// 토큰 갱신 실패 시 처리
const handleRefreshFailure = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

// 토큰 갱신 처리
const handleTokenRefresh = async (request) => {
  request._retry = true;
  try {
    const newAccessToken = await refreshAccessToken();
    request.headers['Authorization'] = `Bearer ${newAccessToken}`;
    return instance.request(request);
  } catch (refreshError) {
    handleRefreshFailure();
    return Promise.reject(refreshError);
  }
};

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
  response => response,
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 401 에러가 아닌 경우 바로 에러 반환
    if (!isUnauthorizedError(status)) {
      return Promise.reject(error);
    }

    // 로그인/회원가입 요청은 토큰 갱신 시도하지 않음
    if (isAuthRequest(originalRequest.url)) {
      return Promise.reject(error);
    }

    // 토큰 갱신 요청이 실패한 경우 로그아웃
    if (isRefreshRequest(originalRequest.url)) {
      handleRefreshFailure();
      return Promise.reject(error);
    }

    // 이미 재시도한 요청은 에러 반환
    if (isRetriedRequest(originalRequest)) {
      return Promise.reject(error);
    }

    // 토큰 갱신 시도
    return handleTokenRefresh(originalRequest);
  }
);

export default instance;
