import { Manrope, Inter } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from '@/lib/auth-context';

const manrope = Manrope({ 
  subsets: ['latin'], 
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'HomeSprint - Find your place. Faster.',
  description: 'A digital sanctuary for finding your next home in Jerusalem.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-cloud text-midnight font-body min-h-screen antialiased selection:bg-mint selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}


