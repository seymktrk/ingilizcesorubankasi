import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İngilizce Soru Bankası | Lise Modülü',
  description: '9, 10, 11 ve 12. Sınıflar için B1-B2 seviyesi İngilizce test platformu. Present Perfect ve Past Perfect odaklı.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <main className="container flex-center" style={{ minHeight: '100vh', padding: '2rem 0' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
