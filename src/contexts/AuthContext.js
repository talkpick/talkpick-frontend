'use client';
import React, {
    createContext,
    useState,
    useCallback,
    useEffect,
} from 'react';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext();
  
export function AuthProvider({ children }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);

  // 초기 토큰 로드
  useEffect(() => {
    setAccessToken(localStorage.getItem('accessToken'));
  }, []);

  // login / logout 액션
  const login = useCallback(({ message, data }) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setAccessToken(data.accessToken);
    router.push('/'); // 로그인 후 홈으로 이동
  }, [router]);
  
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    router.push('/'); // 로그아웃 후 홈으로 이동
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
  