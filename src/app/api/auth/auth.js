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

export const sendAccountRecoveryCode = async (name, email) => {
  try {
    const response = await instance.post('/api/auth/account/recovery/code', {
      name,
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '계정 찾기 중 오류가 발생했습니다.' };
  }
};

export const verifyAccountRecoveryCode = async (email, code) => {
  try {
    const response = await instance.post('/api/auth/account/recovery/result', {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '인증 코드 확인 중 오류가 발생했습니다.' };
  }
};

export const sendPasswordRecoveryCode = async (name, email, account) => {
  try {
    const response = await instance.post('/api/auth/password/recovery/code', {
      name,
      email,
      account,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '비밀번호 찾기 중 오류가 발생했습니다.' };
  }
};

export const verifyPasswordRecoveryCode = async (email, code) => {
  try {
    const response = await instance.post('/api/auth/password/recovery/result', {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '인증 코드 확인 중 오류가 발생했습니다.' };
  }
};

export const resetPassword = async (email, tempToken, password) => {
  try {
    const response = await instance.put('/api/auth/password/recovery/result', {
      email,
      tempToken,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data.message || { message: '비밀번호 재설정 중 오류가 발생했습니다.' };
  }
};

export const checkDuplicateAccount = async (account) => {
  try {
    const response = await instance.post('/api/auth/checkDuplicate/account', { account });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '아이디 중복 확인에 실패했습니다.');
  }
};

export const checkDuplicateEmail = async (email) => {
  try {
    const response = await instance.post('/api/auth/checkDuplicate/email', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '이메일 중복 확인에 실패했습니다.');
  }
};

export const checkDuplicateNickname = async (nickName) => {
  try {
    const response = await instance.post('/api/auth/checkDuplicate/nickname', { nickName });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '닉네임 중복 확인에 실패했습니다.');
  }
};

export const verifyEmailCode = async (email, code) => {
  try {
    const response = await instance.post('/api/auth/checkDuplicate/email/result', { email, code });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '이메일 인증에 실패했습니다.');
  }
};
