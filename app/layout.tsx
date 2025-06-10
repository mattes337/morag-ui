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
        <html lang="en" data-oid="b.mq9et">
            <body className="" data-oid="gwe0vpy">
                <AppProvider data-oid="82e12ny">
                    <AuthWrapper data-oid="o-f7yjx">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
