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
        <html lang="en" data-oid="ap1dryd">
            <body className="" data-oid="-li8:f6">
                <AppProvider data-oid="j5b6:cp">
                    <AuthWrapper data-oid="2mchdar">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
