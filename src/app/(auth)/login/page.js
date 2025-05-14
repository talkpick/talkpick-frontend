'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { signIn } from '@/app/api/auth/auth';

const LoginForm = () => {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 페이지 로드 시 rememberedUserId 확인
  useEffect(() => {
    const rememberedUserId = localStorage.getItem('rememberedUserId');
    if (rememberedUserId) {
      setUserId(rememberedUserId);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await signIn(userId, password);
      login(data); // AuthContext에 데이터 전달
      
      if (rememberMe) {
        localStorage.setItem('rememberedUserId', userId);
      } else {
        localStorage.removeItem('rememberedUserId');
      }
    } catch (error) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* main 영역: flex-1 + px-4 */}
      <main className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="flex flex-col" onSubmit={handleSubmit}>
            <input
              id="userId"
              type="text"
              placeholder="아이디"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="
                bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150
              "
              disabled={isLoading}
            />

            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150
              "
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="text-sm text-gray-900 cursor-pointer flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(prev => !prev)}
                  className="mr-2"
                  disabled={isLoading}
                />
                아이디 기억하기
              </label>

              <div className="flex space-x-4">
                <a href="/signup" className="text-sm text-blue-500 hover:underline">
                  회원가입
                </a>
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  비밀번호 찾기
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="
                bg-[#0E74F9] text-white font-bold py-2 px-4 rounded-md mt-4
                hover:bg-[#0D6EFD] transition ease-in-out duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginForm;
