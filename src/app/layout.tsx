import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SANATANA — The 3D Knowledge Universe',
  description: 'An interactive 3D knowledge universe of Hindu scriptures',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ overflow: 'hidden', height: '100dvh', margin: 0, background: '#050510' }}>
        {children}
      </body>
    </html>
  );
}
