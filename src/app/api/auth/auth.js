import instance from '@/lib/axios';

export const signIn = async (account, password) => {
  try {
    const response = await instance.post('/api/auth/signIn', {
      account,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '로그인 중 오류가 발생했습니다.' };
  }
};

export const signUp = async (signUpData) => {
  try {
    const response = await instance.post('/api/auth/signUp', signUpData);
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '회원가입 중 오류가 발생했습니다.' };
  }
};

export const refresh = async (refreshToken) => {
  try {
    const response = await instance.post('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '토큰 갱신 중 오류가 발생했습니다.' };
  }
};

export const signOut = async () => {
  try {
    await instance.post('/api/auth/signOut');
  } catch (error) {
    throw error.response?.data.message || { message: '로그아웃 중 오류가 발생했습니다.' };
  }
};
