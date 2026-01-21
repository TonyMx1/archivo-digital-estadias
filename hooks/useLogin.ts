import { useCallback, useState } from 'react';

type LoginFormData = {
  curp: string;
  password: string;
};

type UseLoginOptions = {
  onSuccess?: () => void;
};

export function useLogin(options: UseLoginOptions = {}) {
  const [formData, setFormData] = useState<LoginFormData>({
    curp: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
        const curp = formData.curp.trim();
        const password = formData.password;

        if (!curp || !password) {
          setError('Por favor, completa todos los campos');
          return;
        }

        const curpLength = curp.length;
        if (curpLength !== 18) {
          setError(
            `El CURP debe tener exactamente 18 caracteres. Actualmente tiene ${curpLength} ${
              curpLength < 18
                ? `(faltan ${18 - curpLength} caracteres)`
                : `(tiene ${curpLength - 18} caracteres de más)`
            }`
          );
          return;
        }

        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            curp: curp.toUpperCase(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.code === 'SESSION_EXISTS') {
            setError(data.error);
          } else if (data.code === 'INVALID_CREDENTIALS') {
            setError(
              data.error || 'Credenciales incorrectas. Verifica tu CURP y contraseña.'
            );
          } else if (data.code === 'CONNECTION_ERROR' || response.status === 503) {
            setError(
              'No se pudo conectar. Por favor, verifica tu conexión a internet o intenta de nuevo en unos minutos.'
            );
          } else {
            setError(data.error || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
          }
          return;
        }

        if (data.cusToken && typeof window !== 'undefined') {
          sessionStorage.setItem('cusToken', data.cusToken);
        }

        options.onSuccess?.();
      } catch (err) {
        console.error('Login error:', err);
        setError(
          'Error de conexión. Por favor, verifica tu conexión e intenta de nuevo.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData.curp, formData.password, options]
  );

  return {
    formData,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  };
}
