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
        <html lang="en" data-oid="6ujd0_n">
            <body className="" data-oid="64b63bf">
                <AppProvider data-oid="en_r.y.">
                    <AuthWrapper data-oid="v5l-w8y">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
