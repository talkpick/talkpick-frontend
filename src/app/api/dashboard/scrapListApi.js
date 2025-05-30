import instance from '@/lib/axios';

export const getScrapList = async () => {
    try {
        const response = await instance.get('/api/user/profile/scrap');
        return response.data;
    } catch (error) {
        throw error.response?.data.message || { message: '스크랩 목록 조회 중 오류가 발생했습니다.' };
    }
}
