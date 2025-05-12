'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React, { useState } from 'react';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    nickname: '',
    birthDate: '',
    gender: '',
    email: ''
  });

  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password) => {
    // 8자 이상 20자 이하, 영문, 숫자, 특수문자 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    
    if (!passwordRegex.test(password)) {
      setPasswordError('비밀번호는 8자 이상 20자 이하이며, 영문, 숫자, 특수문자를 포함해야 합니다.');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 비밀번호 입력 시 유효성 검사
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 비밀번호 유효성 검사
    if (!validatePassword(formData.password)) {
      return;
    }

    // 비밀번호 확인 검사
    if (formData.password !== formData.passwordConfirm) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const age = calculateAge(formData.birthDate);
    // TODO: 회원가입 처리 로직 추가
    console.log({ ...formData, age });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">회원가입</h2>

          <form className="flex flex-col" onSubmit={handleSubmit}>
            <input
              name="userId"
              type="text"
              placeholder="아이디"
              value={formData.userId}
              onChange={handleChange}
              className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150"
            />

            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-2
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150
                ${passwordError ? 'border-red-500' : ''}`}
            />
            <p className="text-sm text-gray-500 mb-2">
              • 8자 이상 20자 이하<br />
              • 영문, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다
            </p>
            {passwordError && (
              <p className="text-sm text-red-500 mb-4">{passwordError}</p>
            )}

            <input
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호 확인"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150
                ${passwordError ? 'border-red-500' : ''}`}
            />

            <input
              name="name"
              type="text"
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150"
            />

            <input
              name="nickname"
              type="text"
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleChange}
              className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150"
            />

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">생년월일</label>
              <input
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                  focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                  transition ease-in-out duration-150"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">성별</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  남자
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  여자
                </label>
              </div>
            </div>

            <input
              name="email"
              type="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4
                focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                transition ease-in-out duration-150"
            />

            <button
              type="submit"
              className="bg-[#0E74F9] text-white font-bold py-2 px-4 rounded-md mt-4
                hover:bg-[#0D6EFD] transition ease-in-out duration-150"
            >
              회원가입
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupForm; 