import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            duration: 5000,
            style: {
              background: '#ffffff',
              color: '#363636',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'white',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'red',
                secondary: 'white',
              },
            },
          }}
        />
        <Component {...pageProps} />
      </ProtectedRoute>
    </AuthProvider>
  )
}
