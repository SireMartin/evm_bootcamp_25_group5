import type { AppProps } from 'next/app';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../utils/wagmi';
import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Create a client
const queryClient = new QueryClient();

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  // Use state to track if we're on the client side
  const [mounted, setMounted] = useState(false);
  
  // Only render the app after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return a placeholder during server-side rendering
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Lottery DApp</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Render the full app on the client side
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default MyApp; 