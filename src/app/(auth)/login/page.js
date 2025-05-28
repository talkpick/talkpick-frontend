'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signIn } from '@/app/api/auth/auth';
import PasswordToggleIcon from '@/components/icons/PasswordToggleIcon';

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center flex-1">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E74F9]"></div>
  </div>
);

// useSearchParams를 사용하는 컴포넌트
const LoginFormContent = () => {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 페이지 로드 시 rememberedUserId 확인
  useEffect(() => {
    const rememberedUserId = localStorage.getItem('rememberedUserId');
    if (rememberedUserId) {
      setUserId(rememberedUserId);
      setRememberMe(true);
    }
  }, []);

  // 회원가입 성공 메시지 표시
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // 에러 메시지 토스트 표시
  useEffect(() => {
    if (error) {
      setShowErrorToast(true);
      const timer = setTimeout(() => {
        setShowErrorToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-black-500 border border-green-500 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} flex items-center`}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="#22c55e" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        회원가입이 완료되었습니다. 로그인해주세요.
      </div>

      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-black-500 border border-red-500 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${showErrorToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} flex items-center`}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="#ef4444" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {error}
      </div>

      <main className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인</h2>

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

            <div className="relative mb-4">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                  focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                  transition ease-in-out duration-150
                "
                disabled={isLoading}
              />
              <PasswordToggleIcon 
                showPassword={showPassword} 
                toggleShowPassword={toggleShowPassword} 
              />
            </div>

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
                <a href="/recovery/account" className="text-sm text-blue-500 hover:underline">
                  아이디 찾기
                </a>
                <a href="/recovery/password" className="text-sm text-blue-500 hover:underline">
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
    </>
  );
};

const LoginForm = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Suspense fallback={<LoadingSpinner />}>
        <LoginFormContent />
      </Suspense>
      <Footer />
    </div>
  );
};

export default LoginForm;
