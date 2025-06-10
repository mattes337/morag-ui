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
        <html lang="en" data-oid="sqnoojv">
            <body className="" data-oid="h1dwump">
                <AppProvider data-oid="95wr1ri">
                    <AuthWrapper data-oid="v-qlgp5">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
