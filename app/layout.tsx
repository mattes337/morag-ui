import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../contexts/AppContext';
import { AuthWrapper } from '../components/layout/AuthWrapper';

export const metadata: Metadata = {
    title: 'Vector Database Manager',
    description: 'Manage your vector databases and documents',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="fc9qifa">
            <body className="" data-oid="50kq9i9">
                <AppProvider data-oid="wh3v553">
                    <AuthWrapper data-oid="irxb.:d">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
