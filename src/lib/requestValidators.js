export const isUnauthorizedError = (status) => status === 401;

export const isAuthRequest = (url) => {
  return url.includes('/api/auth/signIn') || url.includes('/api/auth/signUp') || url.includes('/api/auth/signOut');
};

export const isRetriedRequest = (request) => request._retry; 