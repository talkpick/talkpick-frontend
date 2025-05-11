import { NextResponse } from 'next/server';

// 임시 뉴스 데이터
const dummyNews = {
  id: 1,
  title: '정치 관련 최신 뉴스 1',
  summary: '이 뉴스는 정치 관련 최신 소식을 다루고 있습니다. 주요 내용은 다음과 같습니다...',
  content: `
    <p>정치 관련 최신 뉴스의 상세 내용입니다. 이 뉴스는 정치적 이슈와 관련된 중요한 내용을 다루고 있습니다.</p>
    <p>주요 내용은 다음과 같습니다:</p>
    <ul>
      <li>첫 번째 주요 내용</li>
      <li>두 번째 주요 내용</li>
      <li>세 번째 주요 내용</li>
    </ul>
    <p>이러한 내용들은 정치적 상황에 큰 영향을 미칠 것으로 예상됩니다.</p>
  `,
  category: 'politics',
  date: '2025-05-11',
  image: 'https://picsum.photos/800/400',
  relatedNews: [
    {
      id: 2,
      title: '관련 뉴스 1',
      date: '2025-05-11',
      image: 'https://picsum.photos/200/150'
    },
    {
      id: 3,
      title: '관련 뉴스 2',
      date: '2025-05-11',
      image: 'https://picsum.photos/200/150'
    }
  ]
};

export async function GET(request, { params }) {
  // TODO: 실제 데이터베이스에서 뉴스 데이터를 가져오도록 수정
  return NextResponse.json(dummyNews);
} 