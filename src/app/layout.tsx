import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { AtmosphereProvider } from './context/atmosphere-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BoardGame Beats - Generate Spotify Playlists for Board Games',
  description: 'Create the perfect soundtrack for your board game sessions with AI-powered music recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AtmosphereProvider>
            {children}
          </AtmosphereProvider>
        </Providers>
      </body>
    </html>
  );
}
