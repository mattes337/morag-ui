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
        <html lang="en" data-oid="e_31zvh">
            <body className="" data-oid="rz86sfp">
                <AppProvider data-oid="re_cbx9">
                    <AuthWrapper data-oid="i:14p8k">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
