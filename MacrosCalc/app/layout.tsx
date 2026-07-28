import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CalorieProvider } from '@/components/CalorieProvider';
import { AuthProvider } from '@/components/AuthProvider';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Macros Calc — Calorie Tracker for Indian Diets',
  description:
    'Track your calories effortlessly with Macros Calc. Built for Indian diets — dal, roti, biryani and more. Fast, bold, and simple.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
      >
        <AuthProvider>
          <CalorieProvider>
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
            <footer className="w-full text-center py-6 font-bold uppercase tracking-wide opacity-60 text-sm border-t-4 border-black mt-auto bg-[#FFD600]">
              &copy; {new Date().getFullYear()} Soumyadeep Ghosh
            </footer>
          </CalorieProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
