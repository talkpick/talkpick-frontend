import { useEffect, useCallback } from 'react';

export function useInfiniteScroll(onLoadMore, hasNext, isLoading) {
  const handleScroll = useCallback(() => {
    if (!hasNext || isLoading) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    // 스크롤이 하단에서 100px 이상 떨어져 있을 때 로드
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore();
    }
  }, [hasNext, isLoading, onLoadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
} 