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
        <html lang="en" data-oid="9g.1dg6">
            <body className="" data-oid="-8nh_zo">
                <AppProvider data-oid="pxv_9dy">
                    <AuthWrapper data-oid="0q.nbp6">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
