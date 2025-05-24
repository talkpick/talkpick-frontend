export const CATEGORIES = {
  ALL: { id: 'all', name: '전체' },
  POLITICS: { id: 'politics', name: '정치' },
  ECONOMY: { id: 'economy', name: '경제' },
  SOCIETY: { id: 'society', name: '사회' },
  INTERNATIONAL: { id: 'international', name: '국제' },
  ENTERTAINMENT: { id: 'entertainment', name: '연예' },
  SPORTS: { id: 'sports', name: '스포츠' }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const getCategoryName = (categoryId) => {
  return CATEGORIES[categoryId.toUpperCase()]?.name || '전체';
};

export const getCategoryId = (categoryName) => {
  const category = Object.values(CATEGORIES).find(
    cat => cat.name === categoryName
  );
  return category?.id || 'all';
}; 