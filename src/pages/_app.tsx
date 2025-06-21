import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Component {...pageProps} />
      </ProtectedRoute>
    </AuthProvider>
  )
}
