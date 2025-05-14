export const isUnauthorizedError = (status) => status === 401;

export const isAuthRequest = (url) => {
  return url.includes('/auth/signIn') || url.includes('/auth/signup');
};

export const isRefreshRequest = (url) => url.includes('/auth/refresh');

export const isRetriedRequest = (request) => request._retry; 