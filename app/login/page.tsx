'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b3b60] via-[#0a3352] to-[#08263b] p-4">
      <LoginForm onSuccess={() => router.push('/exito')} />
    </div>
  );
}
