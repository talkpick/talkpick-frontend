import { redirect } from 'next/navigation';

export default function NotFound() {
  // 이 함수를 호출하는 즉시 클라이언트에 307 리다이렉트 응답이 나갑니다.
  redirect('/');
}
