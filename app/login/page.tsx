'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    const run = async () => {
      try {
        if (typeof window === 'undefined') return;

        const cusToken = sessionStorage.getItem('cusToken');

        const response = await fetch('/api/user/update-and-redirect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cusToken,
          }),
        });

        if (!response.ok) {
          router.push('/');
          return;
        }

        const data = await response.json();
        const redirectTarget = data.userRole === 9 ? '/visitante' : '/';
        router.push(redirectTarget);
      } catch {
        router.push('/');
      }
    };

    void run();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}
