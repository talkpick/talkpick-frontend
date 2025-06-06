'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/app/api/auth/auth';

const BaseHeader = ({ children }) => {
  const { accessToken, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(accessToken);
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    } finally {
      logout();
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon_new.svg"
              alt="TalkPick Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="text-2xl font-bold text-black">
              TalkPick
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            {accessToken ? (
              <>
                <Link
                  href="/user"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      {children}
    </header>
  );
};

export default BaseHeader; 