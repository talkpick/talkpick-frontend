// 정규식 패턴
const EMAIL_PATTERN = /^\S+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,6}$/;
const NAME_PATTERN = /^[A-Za-z가-힣]+$/;
const NICKNAME_PATTERN = /^[A-Za-z가-힣]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

// 에러 메시지
const AUTH_VALIDATION_ERROR = {
  ACCOUNT_EMPTY: '아이디를 입력해주세요.',
  ACCOUNT_WHITESPACE: '아이디에 공백을 포함할 수 없습니다.',
  ACCOUNT_SIZE: '아이디는 4자 이상 20자 이하여야 합니다.',

  PASSWORD_EMPTY: '비밀번호를 입력해주세요.',
  PASSWORD_PATTERN: '비밀번호는 8자 이상 16자 이하이며, 대문자, 소문자, 숫자, 특수문자(!@#$%^&)를 포함해야 합니다.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',

  NAME_EMPTY: '이름을 입력해주세요.',
  NAME_WHITESPACE: '이름에 공백이 포함될 수 없습니다.',
  NAME_SIZE: '이름은 30자를 초과할 수 없습니다.',
  NAME_INVALID_CHAR: '이름은 영문 또는 한글만 사용 가능합니다.',
  
  NICKNAME_EMPTY: '닉네임을 입력해주세요.',
  NICKNAME_WHITESPACE: '닉네임에 공백이 포함될 수 없습니다.',
  NICKNAME_SIZE: '닉네임은 20자를 초과할 수 없습니다.',
  NICKNAME_INVALID_CHAR: '닉네임은 영문 또는 한글만 사용 가능합니다.',
  
  EMAIL_EMPTY: '이메일을 입력해주세요.',
  EMAIL_WHITESPACE: '이메일에 공백이 포함될 수 없습니다.',
  EMAIL_PATTERN: '올바른 이메일 형식이 아닙니다.',
  
  GENDER_EMPTY: '성별을 선택해주세요.',
  
  BIRTHDAY_EMPTY: '생년월일을 입력해주세요.',
  BIRTHDAY_FUTURE: '미래 날짜는 입력할 수 없습니다.'
};

/**
 * 비밀번호 값을 검증합니다.
 * @param {string} password - 사용자의 비밀번호
 * @returns {string|null} - 에러 메시지 또는 null
 */
export const validatePassword = (password) => {
  if (!password?.trim()) {
    return AUTH_VALIDATION_ERROR.PASSWORD_EMPTY;
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return AUTH_VALIDATION_ERROR.PASSWORD_PATTERN;
  }
  return null;
};

/**
 * 비밀번호 확인 값을 검증합니다.
 * @param {string} password - 사용자의 비밀번호
 * @param {string} passwordConfirm - 사용자의 비밀번호 확인
 * @returns {string|null} - 에러 메시지 또는 null
 */
export const validatePasswordConfirm = (password, passwordConfirm) => {
  if (password !== passwordConfirm) {
    return AUTH_VALIDATION_ERROR.PASSWORD_MISMATCH;
  }
  return null;
};

/**
 * 이름 값을 검증합니다.
 * @param {string} name - 사용자의 이름
 * @returns {string|null} - 에러 메시지 또는 null
 */
export const validateName = (name) => {
  if (!name?.trim()) {
    return AUTH_VALIDATION_ERROR.NAME_EMPTY;
  }
  if (name.includes(' ')) {
    return AUTH_VALIDATION_ERROR.NAME_WHITESPACE;
  }
  if (name.length > 30) {
    return AUTH_VALIDATION_ERROR.NAME_SIZE;
  }
  if (!NAME_PATTERN.test(name)) {
    return AUTH_VALIDATION_ERROR.NAME_INVALID_CHAR;
  }
  return null;
};

/**
 * 닉네임 값을 검증합니다.
 * @param {string} nickname - 사용자의 닉네임
 * @returns {string|null} - 에러 메시지 또는 null
 */
export const validateNickname = (nickname) => {
  if (!nickname?.trim()) {
    return AUTH_VALIDATION_ERROR.NICKNAME_EMPTY;
  }
  if (nickname.includes(' ')) {
    return AUTH_VALIDATION_ERROR.NICKNAME_WHITESPACE;
  }
  if (nickname.length > 20) {
    return AUTH_VALIDATION_ERROR.NICKNAME_SIZE;
  }
  if (!NICKNAME_PATTERN.test(nickname)) {
    return AUTH_VALIDATION_ERROR.NICKNAME_INVALID_CHAR;
  }
  return null;
};

/**
 * 이메일 값을 검증합니다.
 * @param {string} email - 사용자의 이메일
 * @returns {string|null} - 에러 메시지 또는 null
 */
export const validateEmail = (email) => {
  if (!email?.trim()) {
    return AUTH_VALIDATION_ERROR.EMAIL_EMPTY;
  }
  if (email.includes(' ')) {
    return AUTH_VALIDATION_ERROR.EMAIL_WHITESPACE;
  }
  if (!EMAIL_PATTERN.test(email)) {
    return AUTH_VALIDATION_ERROR.EMAIL_PATTERN;
  }
  return null;
};

/**
 * 성별 값을 검증합니다.
 * @param {string} gender - 사용자의 성별
 * @returns {string|null} - 에러 메시지 또는 null
 */
export const validateGender = (gender) => {
  if (!gender) {
    return AUTH_VALIDATION_ERROR.GENDER_EMPTY;
  }
  return null;
};

/**
 * 생년월일 값을 검증합니다.
 * @param {string} birthDate - 사용자의 생년월일
 * @returns {string|null} - 에러 메시지 또는 null
 */
export const validateBirthDate = (birthDate) => {
  if (!birthDate) {
    return AUTH_VALIDATION_ERROR.BIRTHDAY_EMPTY;
  }
  const birthDateObj = new Date(birthDate);
  const today = new Date();
  if (birthDateObj > today) {
    return AUTH_VALIDATION_ERROR.BIRTHDAY_FUTURE;
  }
  return null;
};

export const validateAccount = (account) => {
  if (!account?.trim()) {
    return AUTH_VALIDATION_ERROR.ACCOUNT_EMPTY;
  }
  if (account.includes(' ')) {
    return AUTH_VALIDATION_ERROR.ACCOUNT_WHITESPACE;
  }
  if (account.length < 4 || account.length > 20) {
    return AUTH_VALIDATION_ERROR.ACCOUNT_SIZE;
  }
  return null;
};

/**
 * 회원가입 폼의 모든 필드를 검증합니다.
 * @param {Object} formData - 회원가입 폼 데이터
 * @returns {Object} - 각 필드별 에러 메시지
 */
export const validateSignUpForm = (formData) => {
  const errors = {};
  
  const accountError = validateAccount(formData.account);
  if (accountError) {
    errors.account = accountError;
  }
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const passwordConfirmError = validatePasswordConfirm(formData.password, formData.passwordConfirm);
  if (passwordConfirmError) errors.passwordConfirm = passwordConfirmError;
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const nicknameError = validateNickname(formData.nickName);
  if (nicknameError) errors.nickName = nicknameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const genderError = validateGender(formData.gender);
  if (genderError) errors.gender = genderError;
  
  const birthDateError = validateBirthDate(formData.birthDay);
  if (birthDateError) errors.birthDay = birthDateError;
  
  return errors;
}; 