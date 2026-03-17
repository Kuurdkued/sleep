import type {Metadata} from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic'], 
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'حیسابکەری کاتی خەوتن',
  description: 'باشترین کات بۆ خەوتن و هەستان بزانە',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ku" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased bg-slate-900 text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
