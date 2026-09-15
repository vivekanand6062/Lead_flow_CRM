import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/store/AuthContext';
import { ThemeProvider } from '@/store/ThemeContext';

export const metadata: Metadata = {
  title: 'LeadFlow — B2B Sales Operations & Revenue Execution CRM',
  description: 'Production-style B2B CRM SaaS for managing organizations, managers, sales agents, leads, pipelines, deals, and AI sales insights.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark selection:bg-copper-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
