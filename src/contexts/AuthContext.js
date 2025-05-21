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
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem('accessToken'));
    setNickname(localStorage.getItem('nickname'));
  }, []);

  // login / logout 액션
  const login = useCallback(({ message, data }) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('nickname', data.nickname);
    setAccessToken(data.accessToken);
    setNickname(data.nickname);
    router.push('/'); // 로그인 후 홈으로 이동
  }, [router]);
  
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('nickname');
    setAccessToken(null);
    setNickname(null);
    router.push('/'); // 로그아웃 후 홈으로 이동
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ accessToken, nickname, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
  