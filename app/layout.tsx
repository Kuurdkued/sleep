import type {Metadata, Viewport} from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic'], 
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'خەوتنی زیرەک',
  description: 'باشترین کات بۆ خەوتن و هەستان بزانە',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'خەوتنی زیرەک',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ku" dir="rtl" className={vazirmatn.variable}>
      <head>
        {/* iOS Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        {/* Splash screen color */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased bg-slate-900 text-slate-100" suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
                    .catch(function(err) { console.log('SW failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
