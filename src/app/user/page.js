'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import instance from '@/lib/axios';
import { checkDuplicateEmail, checkDuplicateNickname, verifyEmailCode } from '@/app/api/auth/auth';
import { validateName, validateNickname, validateEmail, validateGender } from '../(auth)/signup/signUpValidator';
import { useRouter } from 'next/navigation';

const styles = {
  inputBase: "bg-gray-100 text-gray-900 border-0 rounded-md p-2 h-10 min-w-0 focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] transition ease-in-out duration-150",
  flexInput: "flex-1",
  flexNone: "flex-none",
  errorBorder: "border-red-500",
  button: "bg-[#0E74F9] text-white font-bold px-3 rounded-md h-10 flex-none hover:bg-[#0D6EFD] transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
};

const ProfilePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    nickName: '',
    birthDay: '',
    gender: '',
    email: '',
    emailLocal: '',
    emailDomain: 'naver.com',
    customEmailDomain: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateChecks, setDuplicateChecks] = useState({
    email: true,
    nickName: true
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    if (showEmailVerification && timeLeft > 0) {
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
  }, [showEmailVerification, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 프로필 정보 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await instance.get('/api/user/profile');
        const data = res.data.data;
        // 이메일 분리
        let emailLocal = '', emailDomain = '', customEmailDomain = '';
        if (data.email) {
          const [local, domain] = data.email.split('@');
          emailLocal = local;
          if ([
            'naver.com', 'gmail.com', 'daum.net', 'hanmail.net', 'nate.com', 'kakao.com'
          ].includes(domain)) {
            emailDomain = domain;
          } else {
            emailDomain = '';
            customEmailDomain = domain;
          }
        }
        const profile = {
          name: data.name || '',
          nickName: data.nickName || '',
          birthDay: data.birthday || '',
          gender: data.gender || '',
          email: data.email || '',
          emailLocal,
          emailDomain,
          customEmailDomain
        };
        setFormData(profile);
        setOriginalData(profile);
      } catch (e) {
        setErrors({ submit: '프로필 정보를 불러오지 못했습니다.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    if (!editMode) return;
    const { name, value } = e.target;
    if (name === 'emailLocal') {
      const domain = formData.emailDomain === '' ? formData.customEmailDomain : formData.emailDomain;
      setFormData(prev => ({
        ...prev,
        emailLocal: value,
        email: domain ? `${value}@${domain}` : '',
        emailCode: ''
      }));
      setDuplicateChecks(prev => ({ ...prev, email: false }));
      setEmailVerified(false);
      setShowEmailVerification(false);
    } else if (name === 'emailDomain') {
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          emailDomain: '',
          email: formData.customEmailDomain ? `${formData.emailLocal}@${formData.customEmailDomain}` : '',
          emailCode: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          emailDomain: value,
          customEmailDomain: '',
          email: formData.emailLocal ? `${formData.emailLocal}@${value}` : '',
          emailCode: ''
        }));
      }
      setDuplicateChecks(prev => ({ ...prev, email: false }));
      setEmailVerified(false);
      setShowEmailVerification(false);
    } else if (name === 'customEmailDomain') {
      setFormData(prev => ({
        ...prev,
        customEmailDomain: value,
        email: formData.emailLocal ? `${formData.emailLocal}@${value}` : '',
        emailCode: ''
      }));
      setDuplicateChecks(prev => ({ ...prev, email: false }));
      setEmailVerified(false);
      setShowEmailVerification(false);
    } else if (name === 'nickName') {
      setFormData(prev => ({ ...prev, nickName: value }));
      setDuplicateChecks(prev => ({ ...prev, nickName: false }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // 실시간 유효성 검사
    let error = null;
    if (name === 'name') error = validateName(value);
    if (name === 'nickName') error = validateNickname(value);
    if (name === 'emailLocal' || name === 'emailDomain' || name === 'customEmailDomain') error = validateEmail(name === 'emailLocal' ? `${value}@${formData.emailDomain || formData.customEmailDomain}` : formData.email);
    if (name === 'gender') error = validateGender(value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // 중복확인
  const handleCheckDuplicate = async (type) => {
    if (!editMode) return;
    const value = formData[type === 'email' ? 'email' : 'nickName'];
    if (!value) {
      setErrors(prev => ({ ...prev, [type]: `${type === 'email' ? '이메일' : '닉네임'}을 입력해주세요.` }));
      return;
    }
    try {
      setIsLoading(true);
      if (type === 'email') {
        await checkDuplicateEmail(value);
        setShowEmailVerification(true);
        setTimeLeft(180);
      } else {
        await checkDuplicateNickname(value);
      }
      setDuplicateChecks(prev => ({ ...prev, [type]: true }));
      setErrors(prev => ({ ...prev, [type]: null }));
    } catch (e) {
      setErrors(prev => ({ ...prev, [type]: e.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!formData.emailCode) {
      setErrors(prev => ({ ...prev, emailCode: '인증 코드를 입력해주세요.' }));
      return;
    }
    try {
      setIsLoading(true);
      await verifyEmailCode(formData.email, formData.emailCode);
      setEmailVerified(true);
      setShowEmailVerification(false);
      setErrors(prev => ({ ...prev, emailCode: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, emailCode: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  // 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editMode) return;
    // 검증
    const nameError = validateName(formData.name);
    const nickNameError = validateNickname(formData.nickName);
    const emailError = validateEmail(formData.email);
    const genderError = validateGender(formData.gender);
    if (nameError || nickNameError || emailError || genderError) {
      setErrors({ name: nameError, nickName: nickNameError, email: emailError, gender: genderError });
      return;
    }
    if (!duplicateChecks.nickName) {
      setErrors(prev => ({ ...prev, nickName: '닉네임 중복 확인이 필요합니다.' }));
      return;
    }
    if (!duplicateChecks.email) {
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인이 필요합니다.' }));
      return;
    }
    if (!emailVerified) {
      setErrors(prev => ({ ...prev, email: '이메일 인증이 필요합니다.' }));
      return;
    }
    setIsLoading(true);
    try {
      await instance.patch('/api/user/profile', {
        name: formData.name,
        nickName: formData.nickName,
        birthDay: formData.birthDay,
        gender: formData.gender,
        email: formData.email
      });
      setSuccessMsg('프로필이 성공적으로 수정되었습니다.');
      setEditMode(false);
      setOriginalData(formData);
    } catch (e) {
      setErrors(prev => ({ ...prev, submit: e.message || '프로필 수정에 실패했습니다.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
    setEditMode(false);
    setSuccessMsg('');
    setDuplicateChecks({ email: true, nickName: true });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 탈퇴하시겠습니까? 탈퇴한 계정은 복구할 수 없습니다.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await instance.delete('/api/user/delete');
      // 로컬 스토리지에서 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert('회원 탈퇴가 완료되었습니다.');
      router.push('/login');
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message || '회원 탈퇴에 실패했습니다.' }));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{editMode ? '프로필 수정' : '내 프로필'}</h2>
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errors.submit}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{successMsg}</span>
            </div>
          )}
          {!editMode ? (
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-700 mb-1">이름</div>
                <div className="font-medium text-gray-900 bg-gray-50 rounded-md p-2">{formData.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">닉네임</div>
                <div className="font-medium text-gray-900 bg-gray-50 rounded-md p-2">{formData.nickName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">생년월일</div>
                <div className="font-medium text-gray-900 bg-gray-50 rounded-md p-2">{formData.birthDay}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">성별</div>
                <div className="font-medium text-gray-900 bg-gray-50 rounded-md p-2">{formData.gender === 'MALE' ? '남자' : formData.gender === 'FEMALE' ? '여자' : ''}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">이메일</div>
                <div className="font-medium text-gray-900 bg-gray-50 rounded-md p-2">{formData.email}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="bg-[#0E74F9] text-white font-bold py-2 px-4 rounded-md hover:bg-[#0D6EFD] transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  onClick={() => {
                    setEditMode(true);
                    setDuplicateChecks({ email: false, nickName: false });
                    setEmailVerified(false);
                    setShowEmailVerification(false);
                  }}
                >
                  프로필 수정
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  onClick={() => setShowDeleteModal(true)}
                >
                  회원 탈퇴
                </button>
              </div>
            </div>
          ) : (
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">이름</label>
                <input
                  name="name"
                  type="text"
                  placeholder="이름"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${styles.inputBase} w-full ${errors.name ? styles.errorBorder : ''}`}
                  disabled={isLoading}
                />
                <div className="h-5 mt-1">
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">닉네임</label>
                <div className="flex space-x-2">
                  <input
                    name="nickName"
                    type="text"
                    placeholder="닉네임"
                    value={formData.nickName}
                    onChange={handleChange}
                    className={`${styles.inputBase} ${styles.flexInput} ${errors.nickName ? styles.errorBorder : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => handleCheckDuplicate('nickName')}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || duplicateChecks.nickName || !formData.nickName}
                  >
                    {duplicateChecks.nickName ? '확인완료' : '중복확인'}
                  </button>
                </div>
                <div className="h-5 mt-1">
                  {errors.nickName && <p className="text-sm text-red-500">{errors.nickName}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">생년월일</label>
                <input
                  name="birthDay"
                  type="date"
                  value={formData.birthDay}
                  onChange={handleChange}
                  className={`${styles.inputBase} w-full ${errors.birthDay ? styles.errorBorder : ''}`}
                  disabled={isLoading}
                />
                <div className="h-5 mt-1">
                  {errors.birthDay && <p className="text-sm text-red-500">{errors.birthDay}</p>}
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
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                </div>
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
                    className={`${styles.inputBase} ${styles.flexInput} ${errors.email ? styles.errorBorder : ''}`}
                    disabled={isLoading || emailVerified}
                  />
                  <span className="flex items-center text-gray-500">@</span>
                  <select
                    name="emailDomain"
                    value={formData.emailDomain}
                    onChange={handleChange}
                    className={`${styles.inputBase} ${styles.flexNone} ${errors.email ? styles.errorBorder : ''}`}
                    disabled={isLoading || emailVerified}
                  >
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="hanmail.net">hanmail.net</option>
                    <option value="nate.com">nate.com</option>
                    <option value="kakao.com">kakao.com</option>
                    <option value="">직접입력</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleCheckDuplicate('email')}
                    className={`${styles.button}`}
                    disabled={isLoading || emailVerified || !formData.email}
                  >
                    {emailVerified ? '인증완료' : '인증하기'}
                  </button>
                </div>
                {formData.emailDomain === '' && (
                  <div className="mt-2">
                    <input
                      name="customEmailDomain"
                      type="text"
                      placeholder="도메인 입력 (예: gmail.com)"
                      value={formData.customEmailDomain}
                      onChange={handleChange}
                      className={`${styles.inputBase} ${styles.flexInput} ${errors.email ? styles.errorBorder : ''}`}
                      disabled={isLoading || emailVerified}
                    />
                  </div>
                )}
                {showEmailVerification && (
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
                    <div className="flex space-x-2">
                      <input
                        name="emailCode"
                        type="text"
                        placeholder="이메일로 전송된 인증 코드"
                        value={formData.emailCode || ''}
                        onChange={handleChange}
                        className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 flex-1 focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] transition ease-in-out duration-150"
                        disabled={isLoading || timeLeft === 0}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || timeLeft === 0}
                      >
                        {isLoading ? '확인 중...' : timeLeft === 0 ? '시간 만료' : '확인'}
                      </button>
                    </div>
                    <div className="h-5 mt-1">
                      {errors.emailCode && (
                        <p className="text-sm text-red-500">{errors.emailCode}</p>
                      )}
                    </div>
                    {timeLeft === 0 && (
                      <button
                        type="button"
                        onClick={() => handleCheckDuplicate('email')}
                        className="text-[#0E74F9] font-bold py-2 px-4 rounded-md mt-2 hover:text-[#0D6EFD] transition ease-in-out duration-150"
                      >
                        인증 코드 다시 받기
                      </button>
                    )}
                  </div>
                )}
                <div className="h-5 mt-1">
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-[#0E74F9] text-white font-bold py-2 px-4 rounded-md hover:bg-[#0D6EFD] transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">회원 탈퇴</h3>
            <p className="text-gray-700 mb-6">
              정말로 탈퇴하시겠습니까?<br />
              탈퇴한 계정은 복구할 수 없으며, 모든 데이터는 30일 보관 후 삭제됩니다.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition ease-in-out duration-150 flex-1"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                type="button"
                className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition ease-in-out duration-150 flex-1"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProfilePage; 