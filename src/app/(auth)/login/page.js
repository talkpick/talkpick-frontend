'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React, { useState } from 'react';

const LoginForm = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 로그인 처리 로직 추가
    console.log({ userId, password, rememberMe });
  };

  return (
    <div className="flex flex-col min-h-screen">
    <Header />

    {/* main 영역: flex-1 + px-4 */}
    <main className="flex flex-col items-center justify-center flex-1 px-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
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
          />

          <div className="flex items-center justify-between">
            <label htmlFor="remember-me" className="text-sm text-gray-900 cursor-pointer flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(prev => !prev)}
                className="mr-2"
              />
              아이디 기억하기
            </label>

            <div className="flex space-x-4">
              <a href="#" className="text-sm text-blue-500 hover:underline">
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
            "
          >
            로그인
          </button>
        </form>
      </div>
    </main>

    <Footer />
  </div>
  );
};

export default LoginForm;
