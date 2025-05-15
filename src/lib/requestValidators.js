export const isUnauthorizedError = (status) => status === 401;

export const isAuthRequest = (url) => {
  return url.includes('/api/auth/signIn') || url.includes('/api/auth/signup');
};

export const isRefreshRequest = (url) => url.includes('/api/auth/refresh');

export const isRetriedRequest = (request) => request._retry; 