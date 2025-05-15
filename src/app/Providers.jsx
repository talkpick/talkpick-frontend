'use client';
import { AuthProvider } from '@/contexts/AuthContext';
export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}