import Link from 'next/link';

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary p-4">
      <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="mb-4">{error}</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
