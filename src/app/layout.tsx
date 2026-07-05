import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { ToastProvider } from '../components/Toast';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata: Metadata = {
  title: '墨笔 AI · 公众号智能写作助手',
  description: 'AI 赋能公众号创作 · 风格复刻 · 热点追踪 · 爆款标题 · 内容检测',
  keywords: ['公众号', 'AI写作', '风格复刻', '爆款标题', '内容创作'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <ThemeProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ThemeProvider>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
