/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    // 개발 환경에서만 baseURL 설정
    API_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8078'
      : ''
  }
}

module.exports = nextConfig 