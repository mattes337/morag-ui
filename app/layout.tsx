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
        <html lang="en" data-oid="f0p1z40">
            <body className="" data-oid=".3h7yrr">
                <AppProvider data-oid="24o..hg">
                    <AuthWrapper data-oid="cw1f3jn">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
