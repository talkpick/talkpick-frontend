'use client';

import Link from 'next/link';
import { truncateText } from '@/lib/utils';
import parse from 'html-react-parser';

export default function NewsList({ news, hasNext, onLoadMore, isLoading }) {
  return (
    <div className="space-y-4">
      {news.map((item) => (
        <Link 
          key={item.id}
          href={`/news/detail/${item.id}`}
          className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#0E74F9]"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {item.imageUrl && (
              <div className="w-full md:w-[200px] md:flex-shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-[150px] object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-grow">
              <h3 className="text-lg font-semibold mb-2 hover:text-[#0E74F9] transition-colors">
                {parse(item.title)}
              </h3>
              <p className="text-gray-600 mb-2">{truncateText(JSON.parse(item.content).join(''))}</p>
              <p className="text-gray-600 mb-2">{item.category}</p>
              <span className="text-sm text-gray-500">{item.date}</span>
            </div>
          </div>
        </Link>
      ))}
      
      {hasNext && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-[#0E74F9] text-white rounded-full hover:bg-[#0B5BC4] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
} 