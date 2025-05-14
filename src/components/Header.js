'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/app/api/auth/auth';
import { useState, useEffect } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  const { accessToken, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut(localStorage.getItem('accessToken'));
      logout();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-[#0E74F9]">
            TALKPICK
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : isLoggedIn ? (
              <>
                <Link href="/mypage" className="text-gray-600 hover:text-[#0E74F9]">
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-[#0E74F9]"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-[#0E74F9]">
                  로그인
                </Link>
                <Link href="/signup" className="text-gray-600 hover:text-[#0E74F9]">
                  회원가입
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-full bg-gray-200 rounded"></div>
                <div className="h-8 w-full bg-gray-200 rounded"></div>
              </div>
            ) : isLoggedIn ? (
              <>
                <Link
                  href="/mypage"
                  className="block py-2 text-gray-600 hover:text-[#0E74F9]"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-600 hover:text-[#0E74F9]"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-gray-600 hover:text-[#0E74F9]"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="block py-2 text-gray-600 hover:text-[#0E74F9]"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 