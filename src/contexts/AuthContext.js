'use client';
import React, {
    createContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { useRouter } from 'next/navigation';

import axios from '../lib/axios';


export const AuthContext = createContext();
  
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // 1) 토큰 복원 (새로고침 시)
  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      setUser(JSON.parse(rawUser));
    }
  }, []);

  // 2) 토큰 갱신 로직 (선택)
  const refreshToken = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) throw new Error('No refresh token');
    const { accessToken: newAt, refreshToken: newRt, user: newUser } =
      (await axios.post('/api/members/refresh', { refreshToken: rt })).data;
    localStorage.setItem('accessToken', newAt);
    localStorage.setItem('refreshToken', newRt);
    localStorage.setItem('user', JSON.stringify(newUser));
    setAccessToken(newAt);
    setUser(newUser);
    return newAt;
  }, []);

  // 3) login / logout 액션
  const login = useCallback(({ accessToken, refreshToken, user }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setAccessToken(accessToken);
    setUser(user);
    router.push('/'); // 로그인 후 홈으로 이동
  }, [router]);
  
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
    router.push('/'); // 로그아웃 후 홈으로 이동
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}
  