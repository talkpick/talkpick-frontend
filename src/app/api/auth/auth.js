import instance from '@/lib/axios';

export const signIn = async (account, password) => {
  try {
    const response = await instance.post('/auth/signIn', {
      account,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '로그인 중 오류가 발생했습니다.' };
  }
};

export const refresh = async (refreshToken) => {
  try {
    const response = await instance.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '토큰 갱신 중 오류가 발생했습니다.' };
  }
}; 

export const signOut = async () => {
  try {
    await instance.post('/auth/logout');
  } catch (error) {
    throw error.response?.data.message || { message: '로그아웃 중 오류가 발생했습니다.' };
  }
};
