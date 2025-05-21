'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/app/api/auth/auth';
import { validateSignUpForm, validatePassword, validatePasswordConfirm, validateName, validateNickname, validateEmail, validateGender, validateBirthDate, validateAccount } from './signUpValidator';
import PasswordToggleIcon from '@/components/icons/PasswordToggleIcon';

const SignupForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    passwordConfirm: '',
    name: '',
    nickName: '',
    birthDay: '',
    gender: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowPasswordConfirm = () => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'account':
        return validateAccount(value);
      case 'password':
        return validatePassword(value);
      case 'passwordConfirm':
        return validatePasswordConfirm(formData.password, value);
      case 'name':
        return validateName(value);
      case 'nickName':
        return validateNickname(value);
      case 'email':
        return validateEmail(value);
      case 'gender':
        return validateGender(value);
      case 'birthDay':
        return validateBirthDate(value);
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 실시간 유효성 검사
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // 비밀번호 유효성 검사
    if (name === 'password') {
      setPasswordChecks({
        length: value.length >= 8 && value.length <= 16,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*]/.test(value)
      });
    }

    // 비밀번호 확인 필드가 변경될 때 비밀번호와 일치 여부 검사
    if (name === 'passwordConfirm') {
      const error = validatePasswordConfirm(formData.password, value);
      setErrors(prev => ({
        ...prev,
        passwordConfirm: error
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 회원가입 폼 검증
    const validationErrors = validateSignUpForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // API 요청에 필요한 필드만 포함
      const signUpData = {
        account: formData.account,
        password: formData.password,
        name: formData.name,
        nickName: formData.nickName,
        email: formData.email,
        gender: formData.gender,
        birthDay: formData.birthDay
      };

      await signUp(signUpData);
      router.push('/login?signup=success');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || '회원가입에 실패했습니다.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">회원가입</h2>

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errors.submit}</span>
            </div>
          )}

          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">아이디</label>
              <input
                name="account"
                type="text"
                placeholder="아이디"
                value={formData.account}
                onChange={handleChange}
                className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                  focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                  transition ease-in-out duration-150
                  ${errors.account ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <div className="h-5 mt-1">
                {errors.account && (
                  <p className="text-sm text-red-500">{errors.account}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">비밀번호</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                  className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                    focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                    transition ease-in-out duration-150
                    ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <PasswordToggleIcon 
                  showPassword={showPassword} 
                  toggleShowPassword={toggleShowPassword} 
                />
              </div>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div className="flex items-center">
                  <span className={`mr-2 ${passwordChecks.length ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordChecks.length ? '✓' : '✗'}
                  </span>
                  <span>8자 이상 16자 이하</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${passwordChecks.uppercase ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordChecks.uppercase ? '✓' : '✗'}
                  </span>
                  <span>대문자 포함</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${passwordChecks.lowercase ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordChecks.lowercase ? '✓' : '✗'}
                  </span>
                  <span>소문자 포함</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${passwordChecks.number ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordChecks.number ? '✓' : '✗'}
                  </span>
                  <span>숫자 포함</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${passwordChecks.special ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordChecks.special ? '✓' : '✗'}
                  </span>
                  <span>특수문자(!@#$%^&*) 포함</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">비밀번호 확인</label>
              <div className="relative">
                <input
                  name="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="비밀번호 확인"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                    focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                    transition ease-in-out duration-150
                    ${errors.passwordConfirm ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <PasswordToggleIcon 
                  showPassword={showPasswordConfirm} 
                  toggleShowPassword={toggleShowPasswordConfirm} 
                />
              </div>
              <div className="h-5 mt-1">
                {errors.passwordConfirm && (
                  <p className="text-sm text-red-500">{errors.passwordConfirm}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">이름</label>
              <input
                name="name"
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={handleChange}
                className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                  focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                  transition ease-in-out duration-150
                  ${errors.name ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <div className="h-5 mt-1">
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">닉네임</label>
              <input
                name="nickName"
                type="text"
                placeholder="닉네임"
                value={formData.nickName}
                onChange={handleChange}
                className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                  focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                  transition ease-in-out duration-150
                  ${errors.nickName ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <div className="h-5 mt-1">
                {errors.nickName && (
                  <p className="text-sm text-red-500">{errors.nickName}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">생년월일</label>
              <input
                name="birthDay"
                type="date"
                value={formData.birthDay}
                onChange={handleChange}
                className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                  focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                  transition ease-in-out duration-150
                  ${errors.birthDay ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <div className="h-5 mt-1">
                {errors.birthDay && (
                  <p className="text-sm text-red-500">{errors.birthDay}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">성별</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={formData.gender === 'MALE'}
                    onChange={handleChange}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  남자
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={formData.gender === 'FEMALE'}
                    onChange={handleChange}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  여자
                </label>
              </div>
              <div className="h-5 mt-1">
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">이메일</label>
              <input
                name="email"
                type="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                className={`bg-gray-100 text-gray-900 border-0 rounded-md p-2 w-full
                  focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]
                  transition ease-in-out duration-150
                  ${errors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <div className="h-5 mt-1">
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#0E74F9] text-white font-bold py-2 px-4 rounded-md mt-4
                hover:bg-[#0D6EFD] transition ease-in-out duration-150
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupForm; 