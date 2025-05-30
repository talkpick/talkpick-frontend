'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendAccountRecoveryCode, verifyAccountRecoveryCode } from '@/app/api/auth/auth';

const AccountRecoveryPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    code: '',
    emailLocal: '',
    emailDomain: 'naver.com',
    customEmailDomain: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [recoveredAccount, setRecoveredAccount] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'emailLocal') {
      const domain = formData.emailDomain === '' ? formData.customEmailDomain : formData.emailDomain;
      setFormData(prev => ({
        ...prev,
        emailLocal: value,
        email: domain ? `${value}@${domain}` : '',
      }));
    } else if (name === 'emailDomain') {
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          emailDomain: '',
          email: formData.customEmailDomain ? `${formData.emailLocal}@${formData.customEmailDomain}` : '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          emailDomain: value,
          customEmailDomain: '',
          email: formData.emailLocal ? `${formData.emailLocal}@${value}` : '',
        }));
      }
    } else if (name === 'customEmailDomain') {
      setFormData(prev => ({
        ...prev,
        customEmailDomain: value,
        email: formData.emailLocal ? `${formData.emailLocal}@${value}` : '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await sendAccountRecoveryCode(formData.name, formData.email);
      setStep(2);
      setTimeLeft(180);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setError(error.message || '인증 코드 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setError('인증 시간이 만료되었습니다. 다시 인증 코드를 요청해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await verifyAccountRecoveryCode(formData.email, formData.code);
      if (response.data) {
        setRecoveredAccount(response.data);
        setShowAccountInfo(true);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }, 5000);
      } else {
        setError('인증 코드가 일치하지 않습니다.');
      }
    } catch (error) {
      setError(error.message || '인증 코드 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-white text-black-500 border border-green-500 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} flex items-center`}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="#22c55e" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        {step === 1 ? '계정 확인 이메일이 전송되었습니다. 3분 내로 인증코드를 입력해주세요. 스팸 메시지함도 확인해주세요.' : 
         showAccountInfo ? '회원님의 아이디를 찾았습니다.' : 
         '계정이 확인되었습니다.'}
      </div>

      <main className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">아이디 찾기</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {showAccountInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">회원님의 아이디</h3>
              <div className="bg-white border border-blue-200 rounded-md p-4 mb-4">
                <p className="text-2xl font-bold text-blue-600 text-center">{recoveredAccount}</p>
              </div>
              <p className="text-sm text-blue-600 text-center">잠시 후 로그인 페이지로 이동합니다.</p>
            </div>
          )}

          {step === 1 ? (
            <form className="flex flex-col" onSubmit={handleSendCode}>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">이름</label>
                <input
                  name="name"
                  type="text"
                  placeholder="이름"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                    focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                    transition ease-in-out duration-150"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">이메일</label>
                <div className="flex flex-1 flex-wrap gap-2">
                  <input
                    name="emailLocal"
                    type="text"
                    placeholder="이메일"
                    value={formData.emailLocal}
                    onChange={handleChange}
                    className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 h-10 flex-1 focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] transition ease-in-out duration-150"
                    disabled={isLoading}
                  />
                  <span className="flex items-center text-gray-500">@</span>
                  <select
                    name="emailDomain"
                    value={formData.emailDomain}
                    onChange={handleChange}
                    className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 h-10 flex-none focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] transition ease-in-out duration-150"
                    disabled={isLoading}
                  >
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="hanmail.net">hanmail.net</option>
                    <option value="nate.com">nate.com</option>
                    <option value="kakao.com">kakao.com</option>
                    <option value="">직접입력</option>
                  </select>
                  <input
                    name="customEmailDomain"
                    type="text"
                    placeholder="도메인 입력 (예: gmail.com)"
                    value={formData.emailDomain === '' ? formData.customEmailDomain : ''}
                    onChange={handleChange}
                    className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 h-10 flex-1 focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] transition ease-in-out duration-150 ${formData.emailDomain !== '' ? 'hidden' : ''}`}
                    disabled={isLoading || formData.emailDomain !== ''}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#0E74F9] text-white font-bold py-2 px-4 rounded-md mt-4
                  hover:bg-[#0D6EFD] transition ease-in-out duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '인증 코드 받기'}
              </button>
            </form>
          ) : !showAccountInfo && (
            <form className="flex flex-col" onSubmit={handleVerifyCode}>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-700">인증 코드</label>
                  <div className={`flex items-center space-x-1 ${timeLeft === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <input
                  name="code"
                  type="text"
                  placeholder="이메일로 전송된 인증 코드"
                  value={formData.code}
                  onChange={handleChange}
                  className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                    focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                    transition ease-in-out duration-150"
                  required
                  disabled={isLoading || timeLeft === 0}
                />
              </div>

              <button
                type="submit"
                className="bg-[#0E74F9] text-white font-bold py-2 px-4 rounded-md mt-4
                  hover:bg-[#0D6EFD] transition ease-in-out duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || timeLeft === 0}
              >
                {isLoading ? '처리 중...' : timeLeft === 0 ? '시간 만료' : '인증 코드 확인'}
              </button>

              {timeLeft === 0 && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-[#0E74F9] font-bold py-2 px-4 rounded-md mt-2
                    hover:text-[#0D6EFD] transition ease-in-out duration-150"
                >
                  인증 코드 다시 받기
                </button>
              )}
            </form>
          )}

          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-blue-500 hover:underline">
              로그인으로 돌아가기
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountRecoveryPage; 