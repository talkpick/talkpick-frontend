import { NextResponse } from 'next/server';
import { CATEGORIES, getCategoryName } from '@/constants/categories';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
  }

  try {
    // TODO: 실제 데이터베이스 검색 로직으로 대체
    // 현재는 임시 데이터를 반환
    const mockResults = [
      {
        title: '검색 결과 예시 1',
        description: '이것은 검색 결과의 설명입니다. 실제 데이터베이스에서 가져온 결과가 여기에 표시됩니다.',
        category: '정치',
        date: '2024-03-20'
      },
      {
        title: '검색 결과 예시 2',
        description: '다른 검색 결과의 설명입니다. 검색어와 관련된 내용이 여기에 표시됩니다.',
        category: '경제',
        date: '2024-03-19'
      }
    ];

    // 카테고리 필터링 (한글 이름으로 비교)
    const categoryName = getCategoryName(category);
    const filteredResults = category === 'all' 
      ? mockResults 
      : mockResults.filter(result => result.category === categoryName);

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error('검색 중 오류 발생:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 