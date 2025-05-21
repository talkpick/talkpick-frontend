/**
 * 날짜 문자열을 yyyy-MM-dd HH:mm:ss 형식으로 포맷합니다.
 * @param {string} dateString - 포맷할 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // 날짜가 유효하지 않으면 원래 문자열 반환
  if (isNaN(date.getTime())) return dateString;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 텍스트의 길이를 제한하여 반환합니다.
 * @param {string} text - 제한할 텍스트
 * @param {number} maxLength - 최대 길이 (기본값: 150)
 * @returns {string} 제한된 텍스트
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}; 